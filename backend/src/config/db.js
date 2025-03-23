const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  // Set up connection event handlers before attempting to connect
  mongoose.connection.once('open', () => {
    logger.info('MongoDB Connected:', { host: mongoose.connection.host });
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
  });

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/trc-attendance');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error;
  }
};

module.exports = connectDB;
