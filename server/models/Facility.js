const mongoose = require('mongoose');
const facilitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name is required']
    },
    unit: {
        type: Number,
        required: [true, 'Unit is required']
    }
}, {
    timestamps: true
});

const FacilitiesModel = mongoose.model('Facilities', facilitySchema);
module.exports = FacilitiesModel;