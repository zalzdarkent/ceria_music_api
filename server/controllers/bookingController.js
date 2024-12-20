const BookingModel = require('../models/Booking');
const PaymentModel = require('../models/Payment');
const RoomsModel = require('../models/Room');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const ResponseAPI = require('../utils/response');

const bookingController = {
    createBooking: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { room_id, name, phoneNumber, date, startTime, endTime } = req.body;

            // Validasi input
            if (!room_id || !name || !phoneNumber || !date || !startTime || !endTime) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            // Gabungkan tanggal dengan waktu, konversi ke Asia/Jakarta
            const startLocal = moment.tz(`${date}T${startTime}:00`, 'Asia/Jakarta').toDate();
            const endLocal = moment.tz(`${date}T${endTime}:00`, 'Asia/Jakarta').toDate();

            // Tambahkan validasi untuk tanggal di masa lalu
            const today = moment().tz('Asia/Jakarta').startOf('day');
            const bookingDate = moment.tz(date, 'Asia/Jakarta').startOf('day');

            if (bookingDate.isBefore(today)) {
                return res.status(400).json({
                    message: 'Booking cannot be made for past dates.',
                });
            }

            // Konversi ke UTC untuk disimpan di database
            const startUTC = moment(startLocal).utc().toDate();
            const endUTC = moment(endLocal).utc().toDate();

            // Validasi waktu tidak di masa lalu
            const nowUTC = moment.utc(); // Waktu sekarang dalam UTC
            const todayStartLimit = moment().tz('Asia/Jakarta').add(3, 'hours').utc().toDate(); // Batas 3 jam dari sekarang

            // Jika booking dilakukan hari ini, validasi jarak waktu minimal 3 jam dari sekarang
            if (date === moment().format('YYYY-MM-DD')) {
                if (startUTC < todayStartLimit) {
                    return res.status(400).json({
                        message: 'Booking must be at least 3 hours from now if booked today.'
                    });
                }
            }

            // Validasi endTime lebih besar dari startTime
            if (startUTC >= endUTC) {
                return res.status(400).json({ message: 'End time must be after start time' });
            }

            // Validasi durasi harus kelipatan 1 jam
            const diffInMinutes = (endUTC - startUTC) / (1000 * 60); // Selisih waktu dalam menit
            if (diffInMinutes % 60 !== 0) {
                return res.status(400).json({ message: 'Duration must be in full hours (e.g., 1 hour, 2 hours).' });
            }

            // Validasi overlapping booking
            const overlappingBookings = await BookingModel.find({
                room_id,
                status: { $ne: 'Cancelled' },
                $or: [
                    { startTime: { $lt: endUTC }, endTime: { $gt: startUTC } },
                ],
            });

            if (overlappingBookings.length > 0) {
                return res.status(400).json({ message: 'This room is already booked for the selected time range' });
            }

            // Buat booking baru
            const newBooking = new BookingModel({
                room_id,
                name,
                phoneNumber,
                date,
                startTime: startUTC,
                endTime: endUTC,
                status: 'Waiting',
            });

            const savedBooking = await newBooking.save({ session });
            console.log('Booking saved successfully:', savedBooking);

            // Generate kode pembayaran unik
            const paymentCode = Array.from(crypto.randomBytes(8))
                .map((byte) => (byte % 36).toString(36).toUpperCase())
                .join('');
            const expiryTime = new Date(Date.now() + 5 * 60 * 1000);

            // Hitung durasi dalam jam
            const totalHours = (endUTC - startUTC) / 3600000;

            // Ambil data room
            const room = await RoomsModel.findById(room_id);
            if (!room) {
                return res.status(404).json({ message: 'Room not found' });
            }

            if (typeof room.price_perhour !== 'number' || isNaN(room.price_perhour)) {
                return res.status(500).json({ message: 'Invalid room price' });
            }

            // Hitung total harga
            const totalAmount = totalHours * room.price_perhour;
            if (isNaN(totalAmount) || totalAmount <= 0) {
                return res.status(400).json({ message: 'Invalid total amount' });
            }

            // Buat payment baru
            const newPayment = new PaymentModel({
                booking_id: savedBooking._id,
                total_amount: totalAmount,
                payment_status: 'Pending',
                payment_date: null,
                payment_code: paymentCode,
                payment_code_expiry: expiryTime,
                receipt_path: null,
                receipt_status: 'Pending',
            });

            const savedPayment = await newPayment.save({ session });
            console.log('Payment saved successfully:', savedPayment);

            // Commit transaksi setelah semua operasi berhasil
            await session.commitTransaction();

            // Generate receipt
            const pdfPath = await bookingController.generateReceipt(savedBooking._id);

            savedPayment.receipt_path = pdfPath;
            savedPayment.receipt_status = 'Pending';
            await savedPayment.save();

            // Kirim respon sukses dengan detail booking dan payment
            return res.status(200).json({
                message: 'Booking created successfully',
                newBooking: {
                    ...savedBooking._doc,
                    startTime: moment(savedBooking.startTime).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
                    endTime: moment(savedBooking.endTime).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
                },
                newPayment: savedPayment,
            });
        } catch (error) {
            await session.abortTransaction();
            console.error(error.message);
            return res.status(500).json({ message: 'Error creating booking' });
        } finally {
            session.endSession();
        }
    },

    generateReceipt: async (bookingId) => {
        try {
            const booking = await BookingModel.findById(bookingId).populate('room_id');
            if (!booking) throw new Error('Booking not found');

            const payment = await PaymentModel.findOne({ booking_id: bookingId });
            if (!payment) throw new Error('Payment not found');

            const room = booking.room_id;
            const receiptsDir = path.join('receipts');

            if (!fs.existsSync(receiptsDir)) {
                fs.mkdirSync(receiptsDir, { recursive: true });
            }

            const pdfPath = path.posix.join(receiptsDir, `receipt-${payment._id}.pdf`);
            const doc = new PDFDocument();
            const writeStream = fs.createWriteStream(pdfPath);

            doc.pipe(writeStream);

            doc.fontSize(18).font('Helvetica').text('Music Studio Rental Receipt', { align: 'center' });
            doc.moveDown();

            // Konversi waktu ke Asia/Jakarta dan hanya tampilkan jam:menit
            const startTimeLocal = moment(booking.startTime).tz('Asia/Jakarta').format('HH:mm');
            const endTimeLocal = moment(booking.endTime).tz('Asia/Jakarta').format('HH:mm');
            const paymentDateLocal = payment.payment_date
                ? moment(payment.payment_date).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss')
                : '-';

            // Format currency untuk Rupiah Indonesia
            const formatRupiah = new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
            });

            const formattedPricePerHour = formatRupiah.format(room.price_perhour);
            const formattedTotalAmount = formatRupiah.format(payment.total_amount);

            doc.fontSize(14).font('Helvetica').text(`Receipt ID: ${payment._id}`);
            doc.text(`Booking ID: ${booking._id}`);
            doc.text(`Name: ${booking.name}`);
            doc.text(`Phone Number: ${booking.phoneNumber}`);
            doc.text(`Date: ${moment(booking.date).format('YYYY-MM-DD')}`);
            doc.text(`Start Time: ${startTimeLocal}`);
            doc.text(`End Time: ${endTimeLocal}`);
            doc.moveDown();
            doc.text(`Room Name: ${room.name}`);
            doc.text(`Price per Hour: ${formattedPricePerHour}`);
            doc.moveDown();
            doc.text(`Total Amount: ${formattedTotalAmount}`);
            doc.text(`Payment Code: ${payment.payment_code}`);
            doc.text(`Payment Status: ${payment.payment_status}`);
            doc.moveDown();
            doc.text('Thank you for booking with us!', { align: 'center' });

            doc.end();

            return new Promise((resolve, reject) => {
                writeStream.on('finish', () => resolve(pdfPath));
                writeStream.on('error', reject);
            });
        } catch (error) {
            console.error('Error in generateReceipt:', error.message);
            throw error;
        }
    },

    async getBookingDetails(req, res) {
        try {
            const { id } = req.params;

            // Cari data pembayaran terkait booking
            const payment = await PaymentModel.findOne({ booking_id: id });

            // Cari data booking dan relasi lainnya
            const booking = await BookingModel.findById(id).populate('room_id');

            if (!booking) {
                return res.status(404).json({
                    message: "Booking not found."
                });
            }

            // Buat pesan status untuk booking yang telah dibatalkan
            let message = null;
            if (payment && payment.payment_status === 'Failed') {
                message = "Your booking has been canceled by the system due to expired payment.";
            }

            return res.status(200).json({
                booking,
                payment,
                message: message || "Booking details retrieved successfully."
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    getAllBookings: async (req, res) => {
        try {
            // Ambil semua data booking dari database
            const bookings = await BookingModel.find();

            // Konversi waktu ke Asia/Jakarta untuk setiap booking
            const formattedBookings = bookings.map((booking) => ({
                ...booking._doc, // Spread data asli
                startTime: moment(booking.startTime).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
                endTime: moment(booking.endTime).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
            }));

            // Kirim respon dengan data booking, meskipun kosong
            return res.status(200).json({
                message: 'Bookings retrieved successfully',
                bookings: formattedBookings || [], // Kembalikan array kosong jika tidak ada data
            });
        } catch (error) {
            // Tangani error dan kirim respon error
            console.error(error.message);
            return res.status(500).json({ message: 'Error retrieving bookings' });
        }
    },

    async cancelExpiredBookings() {
        try {
            const now = new Date();

            // Cari semua pembayaran yang kedaluwarsa
            const expiredPayments = await PaymentModel.find({
                payment_status: 'Pending',
                payment_code_expiry: { $lte: now }
            });

            for (const payment of expiredPayments) {
                // Perbarui status pembayaran
                payment.payment_status = 'Failed';
                await payment.save();

                // Perbarui status pemesanan terkait
                const booking = await BookingModel.findById(payment.booking_id);
                if (booking) {
                    booking.status = 'Cancelled'; // Tambahkan field "status" di model Booking
                    await booking.save();
                }

                // Hapus file PDF jika ada
                if (payment.receipt_path) {
                    const pdfPath = path.join(payment.receipt_path);
                    if (fs.existsSync(pdfPath)) {
                        fs.unlink(pdfPath, (err) => {
                            if (err) {
                                console.error(`Error deleting PDF for payment ${payment._id}:`, err.message);
                            } else {
                                console.log(`PDF for payment ${payment._id} has been deleted.`);
                            }
                        });
                    }
                }

                console.log(`Booking ${payment.booking_id} and payment ${payment._id} have been marked as expired.`);
            }
        } catch (error) {
            console.error('Error canceling expired bookings:', error.message);
        }
    },

    async searchByName(req, res) {
        try {
            const booking = await BookingModel.find({
                name: { $regex: req.query.name, $options: 'i' },
                userId: req.user._id
            });

            if (booking.length === 0) {
                return ResponseAPI.notFound(res, 'booking not found');
            }

            ResponseAPI.success(res, booking);
        } catch (error) {
            ResponseAPI.serverError(res, error);
        }
    },

    async deleteBooking(req, res) {
        const { id } = req.params;

        try {
            // Cari booking berdasarkan ID dan hapus
            const booking = await BookingModel.findByIdAndDelete(id);

            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' });
            }

            res.status(200).json({ message: 'Booking deleted successfully', booking });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting booking', error });
        }
    },

    async deleteAllBookings(req, res) {
        try {
            await BookingModel.deleteMany({})
            res.status(200).json({ message: 'All bookings deleted successfully' });
        } catch (error) {
            console.error('Error deleting all bookings:', error.message);
        }
    }
};

module.exports = bookingController