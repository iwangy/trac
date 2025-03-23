require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const logger = require('../utils/logger');

async function createTestUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/trc-attendance');
    logger.info('MongoDB Connected');

    // Create test student
    const testStudent = await User.create({
      name: 'Test Student',
      email: 'student@test.com',
      password: 'password123',
      role: 'student'
    });
    logger.info('Test student created', { student: testStudent });

    // Create test mentor
    const testMentor = await User.create({
      name: 'Test Mentor',
      email: 'mentor@test.com',
      password: 'password123',
      role: 'mentor'
    });
    logger.info('Test mentor created', { mentor: testMentor });

    await mongoose.connection.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error creating test users:', error);
    await mongoose.connection.close();
    throw error;
  }
}

createTestUsers().catch((error) => {
  logger.error('Script failed:', error);
  // Let the process exit naturally with non-zero code
  throw error;
});
