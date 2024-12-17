/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: API for managing rooms
 */

const express = require('express');
const roomRoute = express.Router();
const authMiddleware = require('../middleware/auth');
const roomController = require('../controllers/roomController');
const upload = require('../middleware/upload');

/**
 * @swagger
 * /api/room:
 *   get:
 *     summary: Get all rooms
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Room'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
roomRoute.get('/room', roomController.getAllRooms)
roomRoute.get('/room/search', authMiddleware, roomController.searchByName);

/**
 * @swagger
 * /api/room/{id}:
 *   get:
 *     summary: Get room by ID
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Details of the room
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Room'
 *       404:
 *         description: Room not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
roomRoute.get('/room/:id', roomController.getEachRooms)

/**
 * @swagger
 * /api/room/add:
 *   post:
 *     summary: Create a new room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price_perhour:
 *                 type: number
 *               photo:
 *                 type: string
 *                 format: binary
 *               facilities:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     facilities[0][facility_id]:
 *                       type: string
 *     responses:
 *       201:
 *         description: Room created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Room'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
roomRoute.post('/room/add', authMiddleware, upload('rooms'), roomController.createRoom)

/**
 * @swagger
 * /api/room/{id}:
 *   put:
 *     summary: Update a room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Room ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price_perhour:
 *                 type: number
 *               photo:
 *                 type: string
 *                 format: binary
 *               facilities:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     facility_id:
 *                       type: string
 *     responses:
 *       200:
 *         description: Room updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Room'
 *       404:
 *         description: Room not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
roomRoute.put('/room/:id', authMiddleware, upload('rooms'), roomController.updateRoom)

/**
 * @swagger
 * /api/room/{id}:
 *   delete:
 *     summary: Delete a room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room deleted successfully
 *       404:
 *         description: Room not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
roomRoute.delete('/room/:id', authMiddleware, roomController.deleteRoomById)

/**
 * @swagger
 * components:
 *   schemas:
 *     Room:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         price_perhour:
 *           type: number
 *         photo:
 *           type: string
 *         facilities:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               facility_id:
 *                 type: string
 *                 description: Facility ID
 *       required:
 *         - name
 *         - price_perhour
 */
module.exports = roomRoute