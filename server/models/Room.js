const mongoose = require('mongoose');

const roomsSchema = new mongoose.Schema({
    facilities: [
        {
            facility_id: {
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Facilities',
                required: true
            }
        }
    ],
    name: {
        type: String,
        required: true
    },
    price_perhour: {
        type: Number,
        required: true
    },
    photo: {
        type: String,
        default: '',
        required: true
    },
    category: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Available'
    }
}, {
    timestamps: true
});

const RoomsModel = mongoose.model('Rooms', roomsSchema);
module.exports = RoomsModel;
