const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getCurrentSession,
  getHistory,
  getStats,
  getMentorDashboardStats,
} = require('../controllers/attendance.controller');
const { protect } = require('../middleware/auth.middleware');

// Middleware to check if user is a mentor
const mentorAdminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'mentor' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Mentor role required.' });
  }
};

/**
 * @swagger
 * /api/attendance/check-in:
 *   post:
 *     tags: [Attendance]
 *     summary: Student check-in
 *     description: Check in a student to a meeting
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - meetingId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: Student's ID
 *               meetingId:
 *                 type: string
 *                 description: Meeting ID to check into
 *     responses:
 *       201:
 *         description: Check-in successful
 *       400:
 *         description: Invalid input or student already checked in
 *       404:
 *         description: Meeting not found
 */
router.post('/check-in', checkIn);

/**
 * @swagger
 * /api/attendance/check-out/{id}:
 *   post:
 *     tags: [Attendance]
 *     summary: Student check-out
 *     description: Check out a student from their current session
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attendance session ID
 *     responses:
 *       200:
 *         description: Check-out successful
 *       404:
 *         description: Session not found
 */
router.post('/check-out/:id', checkOut);

/**
 * @swagger
 * /api/attendance/current/{userId}:
 *   get:
 *     tags: [Attendance]
 *     summary: Get current session
 *     description: Get a student's current active session
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student's ID
 *     responses:
 *       200:
 *         description: Current session details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 student:
 *                   $ref: '#/components/schemas/User'
 *                 meeting:
 *                   type: object
 *                 checkInTime:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: No active session found
 */
router.get('/current/:userId', getCurrentSession);

/**
 * @swagger
 * /api/attendance/stats/{userId}:
 *   get:
 *     tags: [Attendance]
 *     summary: Get student stats
 *     description: Get attendance statistics for a student
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student's ID
 *     responses:
 *       200:
 *         description: Student's attendance statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalHours:
 *                   type: number
 *                 totalSessions:
 *                   type: number
 *                 averageSessionLength:
 *                   type: number
 */
router.get('/stats/:userId', getStats);

// Protected routes (authentication required)
router.use(protect);

/**
 * @swagger
 * /api/attendance/history:
 *   get:
 *     tags: [Attendance]
 *     summary: Get attendance history
 *     description: Get attendance history for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of attendance sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   checkInTime:
 *                     type: string
 *                     format: date-time
 *                   checkOutTime:
 *                     type: string
 *                     format: date-time
 *                   meeting:
 *                     type: object
 */
router.get('/history', getHistory);

/**
 * @swagger
 * /api/attendance/mentor-stats:
 *   get:
 *     tags: [Attendance]
 *     summary: Get mentor dashboard stats
 *     description: Get attendance statistics for mentor dashboard (requires mentor role)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mentor dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalStudents:
 *                   type: number
 *                 activeStudents:
 *                   type: number
 *                 totalHours:
 *                   type: number
 *                 activeSessions:
 *                   type: number
 *                 meetingTypeBreakdown:
 *                   type: object
 *                 recentSessions:
 *                   type: array
 *       403:
 *         description: Not authorized (mentor role required)
 */
router.get('/mentor-stats', mentorAdminOnly, getMentorDashboardStats);

module.exports = router;
