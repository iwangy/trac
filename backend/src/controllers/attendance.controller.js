const Attendance = require('../models/attendance.model');
const User = require('../models/user.model');
const Meeting = require('../models/meeting.model');
const logger = require('../utils/logger');

// Check in
const checkIn = async (req, res) => {
  try {
    const { userId, meetingId, notes } = req.body;

    logger.info('Check-in request received', { userId, meetingId, notes });

    // Check if student already has an active session
    const activeSession = await Attendance.findOne({
      student: userId,
      checkOut: { $exists: false },
    });

    if (activeSession) {
      return res.status(400).json({ message: 'Student already has an active session' });
    }

    // Verify the meeting exists and is active
    const meeting = await Meeting.findOne({
      _id: meetingId,
      endTime: { $exists: false },
    });

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found or has ended' });
    }

    // Create attendance record
    const attendance = await Attendance.create({
      student: userId,
      meeting: meetingId,
      checkIn: new Date(),
      meetingType: meeting.meetingType,
      customMeetingType: meeting.customMeetingType,
      location: meeting.location,
      notes,
    });

    // Add student to meeting's present list if not already there
    if (!meeting.studentsPresent.includes(userId)) {
      meeting.studentsPresent.push(userId);
      await meeting.save();
    }

    res.status(201).json(attendance);
  } catch (error) {
    logger.error('Error in check-in:', error);
    res.status(500).json({
      message: 'Error checking in',
      error: error.message,
      details: error.errors, // Include mongoose validation errors if any
    });
  }
};

// Check out
const checkOut = async (req, res) => {
  try {
    const { notes } = req.body;

    // First find the attendance record to get the checkIn time
    const attendance = await Attendance.findOne({
      _id: req.params.id,
      checkOut: { $exists: false },
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No active session found' });
    }

    // Calculate duration
    const checkOutTime = new Date();
    const duration = Math.round((checkOutTime - attendance.checkIn) / 1000 / 60);

    // Update the record with the calculated values
    const updatedAttendance = await Attendance.findByIdAndUpdate(
      attendance._id,
      {
        $set: {
          checkOut: checkOutTime,
          duration: duration,
          ...(notes && { notes }),
        },
      },
      {
        new: true,
        runValidators: false,
      }
    ).populate({
      path: 'meeting',
      select: 'meetingType customMeetingType location startTime endTime notes',
    });

    res.json(updatedAttendance);
  } catch (error) {
    logger.error('Error in checkOut:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current session
const getCurrentSession = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    const session = await Attendance.findOne({
      student: userId,
      checkOut: { $exists: false },
    }).populate({
      path: 'meeting',
      select: 'meetingType customMeetingType location startTime endTime notes',
    });

    res.json(session);
  } catch (error) {
    logger.error('Error in getCurrentSession:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get attendance history
const getHistory = async (req, res) => {
  try {
    const { startDate, endDate, meetingType } = req.query;
    const query = { student: req.query.userId || req.user._id };

    if (startDate) {
      query.checkIn = { $gte: new Date(startDate) };
    }
    if (endDate) {
      query.checkIn = { ...query.checkIn, $lte: new Date(endDate) };
    }
    if (meetingType) {
      query.meetingType = meetingType;
    }

    const history = await Attendance.find(query)
      .sort({ checkIn: -1 })
      .populate('meeting')
      .limit(50);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get student stats
const getStats = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Get completed sessions for total hours and breakdown
    const completedSessions = await Attendance.find({
      student: userId,
      checkOut: { $exists: true },
    }).populate({
      path: 'meeting',
      select: 'meetingType customMeetingType location startTime endTime notes',
    });

    const totalMinutes = completedSessions.reduce(
      (acc, session) => acc + (session.duration || 0),
      0
    );
    const totalHours = totalMinutes / 60;

    const meetingTypeBreakdown = completedSessions.reduce((acc, session) => {
      const type = session.meetingType;
      const hours = (session.duration || 0) / 60;
      acc[type] = (acc[type] || 0) + hours;
      return acc;
    }, {});

    // Get recent sessions including both completed and in-progress
    const recentSessions = await Attendance.find({ student: userId })
      .sort({ checkIn: -1 })
      .limit(5)
      .populate({
        path: 'meeting',
        select: 'meetingType customMeetingType location startTime endTime notes',
      })
      .lean();

    // Calculate duration for in-progress sessions
    const processedSessions = recentSessions.map((session) => {
      if (!session.checkOut) {
        return {
          ...session,
          duration: 0,
        };
      }
      return session;
    });

    res.json({
      totalHours,
      meetingTypeBreakdown,
      recentSessions: processedSessions,
    });
  } catch (error) {
    logger.error('Error in getStats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get mentor dashboard stats
const getMentorDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate, meetingType } = req.query;

    // Get all students (users)
    const totalStudents = await User.countDocuments({ role: 'student' });

    // Base query for sessions
    const sessionQuery = {};

    // Apply date filters if provided
    if (startDate || endDate) {
      sessionQuery.checkIn = {};
      if (startDate) {
        sessionQuery.checkIn.$gte = new Date(startDate);
      }
      if (endDate) {
        sessionQuery.checkIn.$lte = new Date(endDate);
      }
    }

    // Apply meeting type filter if provided
    if (meetingType) {
      sessionQuery.meetingType = meetingType;
    }

    // Get active students (those who have checked in within the filtered period)
    const activeStudents = await Attendance.distinct('student', sessionQuery).then(
      (students) => students.length
    );

    // Get completed sessions with filters
    const completedSessions = await Attendance.find({
      ...sessionQuery,
      checkOut: { $exists: true },
    });

    // Calculate total hours
    const totalMinutes = completedSessions.reduce((acc, session) => acc + session.duration, 0);
    const totalHours = totalMinutes / 60;

    // Calculate meeting type breakdown
    const meetingTypeBreakdown = completedSessions.reduce((acc, session) => {
      const type = session.meetingType;
      const hours = session.duration / 60;
      acc[type] = (acc[type] || 0) + hours;
      return acc;
    }, {});

    // Get recent sessions with filters
    const recentSessions = await Attendance.find(sessionQuery)
      .sort({ checkIn: -1 })
      .limit(50)
      .populate('student', 'name')
      .lean();

    // Get active sessions count (only current, not filtered)
    const activeSessions = await Attendance.countDocuments({
      checkOut: { $exists: false },
    });

    res.json({
      totalStudents,
      activeStudents,
      totalHours,
      activeSessions,
      meetingTypeBreakdown,
      recentSessions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getCurrentSession,
  getHistory,
  getStats,
  getMentorDashboardStats,
};
