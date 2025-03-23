const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth.middleware');
const {
  getMeetingTypes,
  createMeetingType,
  updateMeetingType,
  deleteMeetingType,
  getUsers,
  deleteUser,
  updateUserRole,
  deleteUserData,
} = require('../controllers/admin.controller');

/**
 * @swagger
 * /api/admin/meeting-types:
 *   get:
 *     tags: [Admin]
 *     summary: Get all meeting types
 *     description: Retrieve all meeting types (requires admin role)
 *     security:
 *       - bearerAuth: []
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
 *       403:
 *         description: Not authorized (admin role required)
 */
router.get('/meeting-types', protect, admin, getMeetingTypes);

/**
 * @swagger
 * /api/admin/meeting-types:
 *   post:
 *     tags: [Admin]
 *     summary: Create meeting type
 *     description: Create a new meeting type (requires admin role)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the meeting type
 *               description:
 *                 type: string
 *                 description: Description of the meeting type
 *     responses:
 *       201:
 *         description: Meeting type created successfully
 *       403:
 *         description: Not authorized (admin role required)
 */
router.post('/meeting-types', protect, admin, createMeetingType);

/**
 * @swagger
 * /api/admin/meeting-types/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update meeting type
 *     description: Update an existing meeting type (requires admin role)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meeting type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Meeting type updated successfully
 *       403:
 *         description: Not authorized (admin role required)
 *       404:
 *         description: Meeting type not found
 */
router.put('/meeting-types/:id', protect, admin, updateMeetingType);

/**
 * @swagger
 * /api/admin/meeting-types/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete meeting type
 *     description: Delete a meeting type (requires admin role)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meeting type ID
 *     responses:
 *       200:
 *         description: Meeting type deleted successfully
 *       403:
 *         description: Not authorized (admin role required)
 *       404:
 *         description: Meeting type not found
 */
router.delete('/meeting-types/:id', protect, admin, deleteMeetingType);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users
 *     description: Retrieve all users (requires admin role)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Not authorized (admin role required)
 */
router.get('/users', protect, admin, getUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete user
 *     description: Delete a user account (requires admin role)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       403:
 *         description: Not authorized (admin role required)
 *       404:
 *         description: User not found
 */
router.delete('/users/:id', protect, admin, deleteUser);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   patch:
 *     tags: [Admin]
 *     summary: Update user role
 *     description: Update a user's role (requires admin role)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [student, mentor, admin]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       403:
 *         description: Not authorized (admin role required)
 *       404:
 *         description: User not found
 */
router.patch('/users/:id/role', protect, admin, updateUserRole);

/**
 * @swagger
 * /api/admin/users/{id}/data:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete user data
 *     description: Delete all data associated with a user (requires admin role)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User data deleted successfully
 *       403:
 *         description: Not authorized (admin role required)
 *       404:
 *         description: User not found
 */
router.delete('/users/:id/data', protect, admin, deleteUserData);

module.exports = router;
