require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

const port = process.env.PORT || 3000;

connectDB();

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
