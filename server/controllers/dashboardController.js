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
            const { month, year } = req.query; // Mengambil query parameter

            // Query match untuk filter berdasarkan bulan dan tahun
            let matchQuery = { payment_status: 'Paid' };

            if (month && year) {
                matchQuery = {
                    ...matchQuery,
                    $expr: {
                        $and: [
                            { $eq: [{ $month: '$createdAt' }, parseInt(month)] }, // Filter bulan
                            { $eq: [{ $year: '$createdAt' }, parseInt(year)] },  // Filter tahun
                        ]
                    }
                };
            }

            // Menghitung total revenue berdasarkan filter
            const totalRevenue = await PaymentModel.aggregate([
                { $match: matchQuery }, // Filter data
                {
                    $group: {
                        _id: null, // Tidak perlu grup jika hanya menghitung total
                        total: { $sum: '$total_amount' } // Menjumlahkan total_amount
                    }
                }
            ]);

            // Jika tidak ada data, maka totalRevenue akan menjadi array kosong
            const total = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

            // Mengembalikan total pendapatan (semua atau per bulan)
            return ResponseAPI.success(
                res,
                { totalRevenue: total },
                'Total revenue fetched successfully'
            );
        } catch (error) {
            return ResponseAPI.serverError(res, error);
        }
    },

    // Mendapatkan revenue per bulan untuk chart
    async getMonthlyRevenue(req, res) {
        try {
            const { year } = req.query; // Tahun dari query parameter
            const currentYear = year ? parseInt(year) : new Date().getFullYear(); // Default ke tahun sekarang jika tidak ada
            const matchQuery = { payment_status: 'Paid' };
    
            if (year) {
                matchQuery.$expr = { $eq: [{ $year: '$createdAt' }, currentYear] };
            }
    
            // Ambil data dari database menggunakan aggregate
            const monthlyRevenue = await PaymentModel.aggregate([
                { $match: matchQuery }, // Filter data
                {
                    $group: {
                        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, // Grup per bulan
                        total: { $sum: '$total_amount' } // Menjumlahkan total_amount
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } } // Mengurutkan berdasarkan tahun dan bulan
            ]);
    
            // Format hasil agar lebih mudah dipahami frontend
            const formattedRevenue = monthlyRevenue.map(data => ({
                month: data._id.month,
                year: data._id.year,
                totalRevenue: data.total,
            }));
    
            // Tambahkan data untuk bulan-bulan kosong
            const completeRevenue = [];
            for (let i = 1; i <= 12; i++) {
                const existingMonth = formattedRevenue.find(data => data.month === i && data.year === currentYear);
                completeRevenue.push({
                    month: i,
                    year: currentYear,
                    totalRevenue: existingMonth ? existingMonth.totalRevenue : 0,
                });
            }
    
            return ResponseAPI.success(
                res,
                { monthlyRevenue: completeRevenue },
                'Monthly revenue fetched successfully'
            );
        } catch (error) {
            return ResponseAPI.serverError(res, error);
        }
    }    
};

module.exports = dashboardController;