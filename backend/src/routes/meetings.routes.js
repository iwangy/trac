const express = require('express');
const router = express.Router();
const {
  createMeeting,
  getActiveMeetings,
  endMeeting,
  getMeetingTypes,
} = require('../controllers/meetings.controller');
const { protect } = require('../middleware/auth.middleware');

// Middleware to check if user is a mentor
const mentorOnly = (req, res, next) => {
  if (req.user && req.user.role === 'mentor') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Mentor role required.' });
  }
};

/**
 * @swagger
 * /api/meetings/active:
 *   get:
 *     tags: [Meetings]
 *     summary: Get active meetings
 *     description: Retrieve all currently active meetings
 *     responses:
 *       200:
 *         description: List of active meetings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   type:
 *                     type: string
 *                   location:
 *                     type: string
 *                   mentor:
 *                     $ref: '#/components/schemas/User'
 *                   startTime:
 *                     type: string
 *                     format: date-time
 */
router.get('/active', getActiveMeetings);

/**
 * @swagger
 * /api/meetings/types:
 *   get:
 *     tags: [Meetings]
 *     summary: Get meeting types
 *     description: Retrieve all available meeting types
 *     responses:
 *       200:
 *         description: List of meeting types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 */
router.get('/types', getMeetingTypes);

// All routes below this require authentication
router.use(protect);

/**
 * @swagger
 * /api/meetings:
 *   post:
 *     tags: [Meetings]
 *     summary: Create a new meeting
 *     description: Create a new meeting (requires mentor role)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - location
 *             properties:
 *               type:
 *                 type: string
 *                 description: Type of meeting
 *               location:
 *                 type: string
 *                 description: Meeting location
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       201:
 *         description: Meeting created successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (mentor role required)
 */
router.post('/', mentorOnly, createMeeting);

/**
 * @swagger
 * /api/meetings/{id}/end:
 *   patch:
 *     tags: [Meetings]
 *     summary: End a meeting
 *     description: End an active meeting (requires mentor role)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meeting ID
 *     responses:
 *       200:
 *         description: Meeting ended successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (mentor role required)
 *       404:
 *         description: Meeting not found
 */
router.patch('/:id/end', mentorOnly, endMeeting);

module.exports = router;
