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

module.exports = dashboardRoute;