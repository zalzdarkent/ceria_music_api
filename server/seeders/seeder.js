require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { mongodbUri } = require('../config/env');

const users = [
    {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin12345',
        token: '',
        photo: ''
    },
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(mongodbUri);

        await User.deleteMany();

        console.log('Previous data cleared');

        await User.create(users);
        console.log('Users seeded');

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();