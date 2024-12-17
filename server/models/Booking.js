const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Rooms', required: true },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    date: { type: Date, required: true },
    status: {
        type: String,
        enum: ['Waiting', 'Confirmed','Cancelled'],
        default: 'Waiting',
    },    
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
}, {
    timestamps: true
});

const BookingModel = mongoose.model('Bookings', bookingSchema);
module.exports = BookingModel;