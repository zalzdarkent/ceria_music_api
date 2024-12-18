/**
 * @swagger
 * tags:
 *   name: User
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
 *     tags: [User]
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
 *     tags: [User]
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
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout berhasil
 *       500:
 *         description: Terjadi kesalahan server
 */
userRoute.post('/user/logout', authMiddleware, userController.logout);

/**
 * @swagger
 * api/forgot-password:
 *   post:
 *     summary: Request a password reset email
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email address of the user
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *       400:
 *         description: Invalid email
 *       500:
 *         description: Internal server error
 * 
 * api/reset-password/{token}:
 *   get:
 *     summary: Validate a password reset token
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token for resetting the password
 *     responses:
 *       200:
 *         description: Token is valid
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Internal server error
 * 
 * /api/reset-password:
 *   post:
 *     summary: Reset the user's password
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Password reset token
 *                 example: abc123
 *               newPassword:
 *                 type: string
 *                 description: New password for the user
 *                 example: newSecurePassword123
 *     responses:
 *       200:
 *         description: Password successfully updated
 *       400:
 *         description: Invalid token or password
 *       500:
 *         description: Internal server error
 * 
 * api/user:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

module.exports = userRoute;
