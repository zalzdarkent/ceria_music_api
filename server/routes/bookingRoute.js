/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management API
 */

/**
 * @swagger
 * /api/booking:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               room_id:
 *                 type: string
 *                 description: The ID of the room to book
 *                 example: 63f7c0b2a6e5b4a26c889b5a
 *               name:
 *                 type: string
 *                 description: The name of the customer
 *                 example: John Doe
 *               phoneNumber:
 *                 type: string
 *                 description: The phone number of the customer
 *                 example: +1234567890
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The date of the booking
 *                 example: 2024-12-01
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: The start time of the booking
 *                 example: 2024-12-01T10:00:00Z
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: The end time of the booking
 *                 example: 2024-12-01T12:00:00Z
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Booking created successfully
 *                 booking:
 *                   $ref: '#/components/schemas/Booking'
 *                 payment:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     total_amount:
 *                       type: number
 *                     payment_status:
 *                       type: string
 *                       example: Pending
 *       400:
 *         description: Validation error or booking conflict
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/booking/{id}:
 *   get:
 *     summary: Get booking details
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Booking ID
 *         example: 63f7c1b9a1b3a1a14d7698c3
 *     responses:
 *       200:
 *         description: Booking details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 booking:
 *                   $ref: '#/components/schemas/Booking'
 *                 payment:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     total_amount:
 *                       type: number
 *                     payment_status:
 *                       type: string
 *                       example: Pending
 *       404:
 *         description: Booking not found or expired
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/booking:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: List of bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/booking/search:
 *   get:
 *     summary: Search bookings by customer name
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the customer
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/booking/{id}:
 *   delete:
 *     summary: Delete a booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 *       404:
 *         description: Booking not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/booking:
 *   delete:
 *     summary: Delete all bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All bookings deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

const express = require('express');
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/auth');
const bookingRoute = express.Router();

bookingRoute.post('/booking', bookingController.createBooking);
bookingRoute.get('/booking', bookingController.getAllBookings);
bookingRoute.get('/booking/search', authMiddleware, bookingController.searchByName);
bookingRoute.get('/booking/:id', bookingController.getBookingDetails);
bookingRoute.delete('/booking/:id', authMiddleware, bookingController.deleteBooking);
bookingRoute.delete('/booking', authMiddleware, bookingController.deleteAllBookings);

module.exports = bookingRoute;