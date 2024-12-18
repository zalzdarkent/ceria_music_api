/**
 * @swagger
 * tags:
 *   name: Facilities
 *   description: Endpoints untuk pengelolaan fasilitas
 */

const express = require('express');
const facilityRoute = express.Router();
const authMiddleware = require('../middleware/auth');
const facilityController = require('../controllers/facilityController');

/**
 * @swagger
 * /api/facilities:
 *   get:
 *     summary: Daftar Fasilitas Alat Musik
 *     tags: [Facilities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar fasilitas berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Facility'
 *       401:
 *         description: Tidak diotorisasi
 *       500:
 *         description: Terjadi kesalahan server
 */
facilityRoute.get('/facilities', authMiddleware, facilityController.getFacilities);
facilityRoute.get('/facility/search', authMiddleware, facilityController.searchByName); 

/**
 * @swagger
 * /api/facility/{id}:
 *   get:
 *     summary: Dapatkan detail fasilitas berdasarkan ID
 *     tags: [Facilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID fasilitas
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail fasilitas berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Facility'
 *       404:
 *         description: Fasilitas tidak ditemukan
 *       401:
 *         description: Tidak diotorisasi
 *       500:
 *         description: Terjadi kesalahan server
 */
facilityRoute.get('/facility/:id', authMiddleware, facilityController.getEachFacility);

/**
 * @swagger
 * /api/facility/{id}:
 *   put:
 *     summary: Perbarui fasilitas berdasarkan ID
 *     tags: [Facilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID fasilitas
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Facility'
 *     responses:
 *       200:
 *         description: Fasilitas berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Facility'
 *       404:
 *         description: Fasilitas tidak ditemukan
 *       401:
 *         description: Tidak diotorisasi
 *       500:
 *         description: Terjadi kesalahan server
 */
facilityRoute.put('/facility/:id', authMiddleware, facilityController.updateFacility);

/**
 * @swagger
 * /api/facility:
 *   post:
 *     summary: Buat fasilitas baru
 *     tags: [Facilities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Facility'
 *     responses:
 *       201:
 *         description: Fasilitas berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Facility'
 *       401:
 *         description: Tidak diotorisasi
 *       500:
 *         description: Terjadi kesalahan server
 */
facilityRoute.post('/facility', authMiddleware, facilityController.createFacility);

/**
 * @swagger
 * /api/facility/{id}:
 *   delete:
 *     summary: Hapus fasilitas berdasarkan ID
 *     tags: [Facilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID fasilitas
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Facility deleted successfully
 *       404:
 *         description: Fasilitas tidak ditemukan
 *       401:
 *         description: Tidak diotorisasi
 *       500:
 *         description: Terjadi kesalahan server
 */
facilityRoute.delete('/facility/:id', authMiddleware, facilityController.deleteFacility);

/**
 * @swagger
 * /api/facility/search:
 *   get:
 *     summary: Cari fasilitas berdasarkan nama
 *     tags: [Facilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Nama fasilitas yang akan dicari
 *     responses:
 *       200:
 *         description: Daftar fasilitas yang sesuai
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Facility'
 *       401:
 *         description: Tidak diotorisasi
 *       500:
 *         description: Terjadi kesalahan server
 */

module.exports = facilityRoute;
