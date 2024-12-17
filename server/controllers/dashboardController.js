const BookingModel = require('../models/Booking');
const RoomsModel = require('../models/Room');
const ResponseAPI = require('../utils/response'); 
const PaymentModel = require('../models/Payment');

const dashboardController = {
    async getTotalRooms(req, res) {
        try {
            // Menghitung jumlah ruangan dengan status 'Available'
            const totalAvailableRooms = await RoomsModel.countDocuments({
                status: 'Available'
            });

            // Jika tidak ada ruangan yang tersedia
            if (totalAvailableRooms === 0) {
                return ResponseAPI.success(res, null, 'No available rooms at the moment');
            }

            // Mengembalikan jumlah ruangan yang tersedia
            return ResponseAPI.success(res, { totalAvailableRooms }, 'Total available rooms fetched successfully');
        } catch (error) {
            // Menangani error menggunakan ResponseAPI
            return ResponseAPI.serverError(res, error);
        }
    },

    async getTotalBookings(req, res) {
        try {
            // Menghitung jumlah booking yang statusnya bukan 'Cancelled'
            const totalBookings = await BookingModel.countDocuments({
                status: { $ne: 'Cancelled' }
            });

            // Mengembalikan jumlah total booking yang belum dibatalkan
            return ResponseAPI.success(res, { totalBookings }, 'Total bookings fetched successfully');
        } catch (error) {
            // Menangani error menggunakan ResponseAPI
            return ResponseAPI.serverError(res, error);
        }
    },

    async getTotalRevenue(req, res) {
        try {
            // Menggunakan aggregate untuk menjumlahkan total_amount dari payment yang statusnya "Paid"
            const totalRevenue = await PaymentModel.aggregate([
                {
                    $match: { payment_status: 'Paid' } // Filter hanya yang statusnya "Paid"
                },
                {
                    $group: {
                        _id: null, // Tidak perlu grup berdasarkan field tertentu
                        total: { $sum: '$total_amount' } // Menjumlahkan field total_amount
                    }
                }
            ]);

            // Jika tidak ada data, maka totalRevenue akan menjadi array kosong
            const total = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

            // Mengembalikan total pendapatan yang berhasil dihitung
            return ResponseAPI.success(res, { totalRevenue: total }, 'Total revenue fetched successfully');
        } catch (error) {
            // Menangani error menggunakan ResponseAPI
            return ResponseAPI.serverError(res, error);
        }
    }
};

module.exports = dashboardController;