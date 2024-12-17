const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Bookings', required: true },
    total_amount: { type: Number, required: true },
    payment_status: { type: String, enum: ['Paid', 'Pending', 'Failed'], default: 'Pending' },
    payment_code: { type: String, required: true },
    payment_code_expiry: { type: Date, required: true },
    receipt_path: { type: String, default: null },
    receipt_status: { type: String, enum: ['Paid', 'Pending', 'Failed'], default: 'Pending' },
}, {
    timestamps: true
});

const PaymentModel = mongoose.model('Payments', paymentSchema);
module.exports = PaymentModel;