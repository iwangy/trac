const User = require('../models/user.model');

// Get all students
const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('name').sort({ name: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getStudents,
};
