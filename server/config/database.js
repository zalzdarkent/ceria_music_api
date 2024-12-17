const mongoose = require('mongoose');
const { mongodbUri } = require('./env');

const connectDB = async () => {
    try {
        await mongoose.connect(mongodbUri);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;