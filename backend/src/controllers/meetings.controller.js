const Meeting = require('../models/meeting.model');
const MeetingType = require('../models/meeting-type.model');
const logger = require('../utils/logger');

// Create a new meeting
const createMeeting = async (req, res) => {
  try {
    const { meetingType, customMeetingType, location, notes } = req.body;

    logger.info('Creating new meeting', {
      meetingType,
      customMeetingType,
      location,
      notes,
    });

    const meeting = await Meeting.create({
      meetingType,
      customMeetingType,
      location,
      notes,
      startTime: new Date(),
      createdBy: req.user._id,
    });

    res.status(201).json(meeting);
  } catch (error) {
    logger.error('Error creating meeting:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
      details: error.errors, // Include mongoose validation errors if any
    });
  }
};

// Get active meetings
const getActiveMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      endTime: { $exists: false },
    }).sort({ startTime: -1 });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// End a meeting
const endMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      endTime: { $exists: false },
    });

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found or already ended' });
    }

    meeting.endTime = new Date();
    await meeting.save();

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get meeting types (public access)
const getMeetingTypes = async (req, res) => {
  try {
    const meetingTypes = await MeetingType.find().sort('name');
    res.json(meetingTypes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createMeeting,
  getActiveMeetings,
  endMeeting,
  getMeetingTypes,
};
