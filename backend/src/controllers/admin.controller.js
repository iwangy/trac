const MeetingType = require('../models/meeting-type.model');
const User = require('../models/user.model');
const Attendance = require('../models/attendance.model');
const Meeting = require('../models/meeting.model');

// Meeting Types Management
const getMeetingTypes = async (req, res) => {
  try {
    const meetingTypes = await MeetingType.find().sort('name');
    res.json(meetingTypes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createMeetingType = async (req, res) => {
  try {
    const { name, description } = req.body;
    const meetingType = await MeetingType.create({
      name,
      description,
      createdBy: req.user._id,
    });
    res.status(201).json(meetingType);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateMeetingType = async (req, res) => {
  try {
    const { name, description } = req.body;
    const meetingType = await MeetingType.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );
    if (!meetingType) {
      return res.status(404).json({ message: 'Meeting type not found' });
    }
    res.json(meetingType);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteMeetingType = async (req, res) => {
  try {
    const meetingType = await MeetingType.findByIdAndDelete(req.params.id);
    if (!meetingType) {
      return res.status(404).json({ message: 'Meeting type not found' });
    }
    res.json({ message: 'Meeting type deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// User Management
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('name');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin user' });
      }
    }

    // Delete user's data
    await Promise.all([
      Attendance.deleteMany({ student: user._id }),
      Meeting.deleteMany({ createdBy: user._id }),
      User.findByIdAndDelete(user._id),
    ]);

    res.json({ message: 'User and associated data deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow changing role of the last admin
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot change role of the last admin' });
      }
    }

    user.role = role;
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: +error.message });
  }
};

const deleteUserData = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's data but keep the user account
    await Promise.all([
      Attendance.deleteMany({ student: user._id }),
      Meeting.deleteMany({ createdBy: user._id }),
    ]);

    res.json({ message: 'User data deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getMeetingTypes,
  createMeetingType,
  updateMeetingType,
  deleteMeetingType,
  getUsers,
  deleteUser,
  updateUserRole,
  deleteUserData,
};
