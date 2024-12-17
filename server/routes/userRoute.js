/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Endpoints untuk autentikasi admin
 */

const express = require('express');
const userRoute = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     tags: [Users]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: admin@example.com
 *               password:
 *                 type: string
 *                 description: admin12345
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Success
 *               data:
 *                 token: "jwt_token_here"
 *                 user:
 *                   id: "user_id"
 *                   name: "admin"
 *                   email: "admin@example.com"
 *                   photo: ""
 */
userRoute.post('/user/login', userController.login);

/**
 * @swagger
 * /api/user/update:
 *   put:
 *     summary: Perbarui profil pengguna
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username baru
 *               email:
 *                 type: string
 *                 description: Email baru
 *               password:
 *                 type: string
 *                 description: Password baru
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Foto baru
 *     responses:
 *       200:
 *         description: Profil berhasil diperbarui
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Success
 *               data:
 *                 token: "jwt_token_here"
 *                 user:
 *                   id: "user_id"
 *                   name: "admin"
 *                   email: "admin@example.com"
 *                   photo: "uploads/user/photo.jpg"
 *       404:
 *         description: User tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan server
 */
userRoute.put('/user/update', authMiddleware, upload('user'), userController.updateProfile);
userRoute.post('/forgot-password', userController.forgotPassword);
userRoute.post('/reset-password/:token', userController.resetPassword);
userRoute.post('/reset-password', userController.resetPassword);
userRoute.get('/user', authMiddleware, userController.getUser);

/**
 * @swagger
 * /api/user/logout:
 *   post:
 *     summary: Logout pengguna
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout berhasil
 *       500:
 *         description: Terjadi kesalahan server
 */
userRoute.post('/user/logout', authMiddleware, userController.logout);

module.exports = userRoute;
