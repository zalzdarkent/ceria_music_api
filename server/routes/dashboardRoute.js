/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard management API
 */

/**
 * @swagger
 * /api/dashboard/total-rooms:
 *   get:
 *     summary: Get total available rooms
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total available rooms retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful
 *                   example: true
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     totalAvailableRooms:
 *                       type: integer
 *                       description: Total number of available rooms
 *                       example: 15
 *                 message:
 *                   type: string
 *                   description: Response message
 *                   example: Total available rooms fetched successfully
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/dashboard/total-bookings:
 *   get:
 *     summary: Get total non-cancelled bookings
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total non-cancelled bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalBookings:
 *                       type: integer
 *                       description: Total number of bookings not cancelled
 *                       example: 42
 *                 message:
 *                   type: string
 *                   description: Response message
 *                   example: Total bookings fetched successfully
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/dashboard/total-revenue:
 *   get:
 *     summary: Get total revenue
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total revenue retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRevenue:
 *                       type: number
 *                       format: float
 *                       description: Total revenue generated
 *                       example: 12500.50
 *                 message:
 *                   type: string
 *                   description: Response message
 *                   example: Total revenue fetched successfully
 *       500:
 *         description: Server error
 */

const express = require('express');
const dashboardRoute = express.Router();
const authMiddleware = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

// Route untuk mendapatkan total ruangan yang tersedia
dashboardRoute.get('/total-rooms', authMiddleware, dashboardController.getTotalRooms);

// Route untuk mendapatkan total booking yang belum dibatalkan
dashboardRoute.get('/total-bookings', authMiddleware, dashboardController.getTotalBookings);

// Route untuk mendapatkan total pendapatan
dashboardRoute.get('/total-revenue', authMiddleware, dashboardController.getTotalRevenue);
dashboardRoute.get('/monthly-revenue', authMiddleware, dashboardController.getMonthlyRevenue);

module.exports = dashboardRoute;