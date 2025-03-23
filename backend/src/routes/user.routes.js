const express = require('express');
const router = express.Router();
const { getStudents } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.get('/students', getStudents);

// Protected routes below this middleware
router.use(protect);

module.exports = router;
