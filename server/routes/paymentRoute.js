/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management API
 */


const paymentController = require("../controllers/paymentController");
const express = require('express');
const authMiddleware = require("../middleware/auth");
const paymentRoute = express.Router();

/**
 * @swagger
 * /api/payment:
 *   put:
 *     summary: 'Process a payment'
 *     tags: [Payments]
 *     description: 'Handles the payment process, validates payment code, amount, and updates payment status'
 *     operationId: 'processPayment'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: 'object'
 *             properties:
 *               payment_code:
 *                 type: 'string'
 *                 description: 'Payment code associated with the booking'
 *               amount:
 *                 type: 'number'
 *                 description: 'Amount to be paid'
 *             required:
 *               - payment_code
 *               - amount
 *     responses:
 *       '200':
 *         description: 'Payment processed successfully'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       '400':
 *         description: 'Invalid payment or payment code expired'
 *       '404':
 *         description: 'Payment code not found'
 *       '500':
 *         description: 'Server error'
 */

/**
 * @swagger
 * /api/payment/receipt/{paymentId}:
 *   get:
 *     summary: 'Download payment receipt'
 *     tags: [Payments]
 *     description: 'Download the receipt PDF for a paid payment'
 *     operationId: 'downloadReceipt'
 *     parameters:
 *       - name: 'paymentId'
 *         in: 'path'
 *         required: true
 *         description: 'ID of the payment to download the receipt for'
 *         schema:
 *           type: 'string'
 *     responses:
 *       '200':
 *         description: 'Receipt PDF successfully retrieved'
 *       '404':
 *         description: 'Receipt not found or payment not found'
 *       '500':
 *         description: 'Server error'
 */

/**
 * @swagger
 * /api/payment:
 *   get:
 *     summary: Get all payments
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: List of all payments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Payment'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/payment/{id}:
 *   delete:
 *     summary: Delete a payment by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the payment to delete
 *     responses:
 *       200:
 *         description: Payment deleted successfully
 *       404:
 *         description: Payment not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/payment/delete-all:
 *   delete:
 *     summary: Delete all payments
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All payments deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

paymentRoute.put('/payment', paymentController.processPayment);
paymentRoute.get('/payment', paymentController.getAllPayments);
paymentRoute.get('/payment/receipt/:paymentId', paymentController.downloadReceipt);
paymentRoute.delete('/payment/:id', authMiddleware, paymentController.deletePaymentById);
paymentRoute.delete('/payment/delete-all', authMiddleware, paymentController.deleteAllPayments);

module.exports = paymentRoute