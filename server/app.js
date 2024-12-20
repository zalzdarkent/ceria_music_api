const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { port } = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const cron = require('node-cron');
const bookingController = require('./controllers/bookingController');
const router = require('./routes');
require('dotenv').config(); 
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json()); 

connectDB();

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Ceria Music Management API',
            version: '1.0.0',
            description: 'API documentation for Music Studio Rent System'
        },
        servers: [
            {
                url: `https://ceriamusicapi-production.up.railway.app/`,
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                Facility: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'ID of the facility'
                        },
                        name: {
                            type: 'string',
                            description: 'Name of the facility'
                        },
                        unit: {
                            type: 'number',
                            description: 'Unit of the facility'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Creation date of the facility'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update date of the facility'
                        }
                    },
                    required: ['name', 'unit']
                },
                Booking: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Unique identifier for the booking'
                        },
                        room_id: {
                            type: 'string',
                            description: 'ID of the room being booked'
                        },
                        name: {
                            type: 'string',
                            description: 'Name of the customer'
                        },
                        phoneNumber: {
                            type: 'string',
                            description: 'Customer phone number'
                        },
                        date: {
                            type: 'string',
                            format: 'date',
                            description: 'Date of the booking'
                        },
                        startTime: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Start time of the booking'
                        },
                        endTime: {
                            type: 'string',
                            format: 'date-time',
                            description: 'End time of the booking'
                        },
                        status: {
                            type: 'string',
                            enum: ['Waiting', 'Confirmed', 'Cancelled'],
                            description: 'Status of the booking'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Date and time when the booking was created'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Date and time when the booking was last updated'
                        }
                    },
                    required: ['room_id', 'name', 'phoneNumber', 'date', 'startTime', 'endTime']
                },
                Payment: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Unique identifier for the booking'
                        },
                        booking_id: {
                            type: 'string',
                            description: 'ID of the booking being payment'
                        },
                        total_amount: {
                            type: 'number',
                            description: 'Total amount'
                        },
                        payment_status: {
                            type: 'string',
                            enum: ['Pending', 'Paid', 'Failed'],
                            description: 'Status of payment'
                        },
                        payment_date: {
                            type: 'string',
                            format: 'date',
                            description: 'Date of the payment'
                        },
                        payment_code: {
                            type: 'string',
                            description: 'Code of the payment'
                        },
                        payment_code_expiry: {
                            type: 'string',
                            format: 'date',
                            description: ''
                        },
                        receipt_path: {
                            type: 'string',
                            enum: ['Pending', 'Paid', 'Failed'],
                            description: 'Path of receipt'
                        },
                        receipt_status: {
                            type: 'string',
                            description: 'Path of receipt'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Date and time when the booking was created'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Date and time when the booking was last updated'
                        }
                    },
                    required: ['room_id', 'name', 'phoneNumber', 'date', 'startTime', 'endTime']
                },
            }
        }
    },
    apis: ['./server/routes/*.js']  // Ensure this path includes your route files
};

// Menjadikan folder "uploads, dan receipts" sebagai folder statis
app.use('/uploads', express.static(path.join('uploads')));
app.use('/receipts', express.static(path.join('receipts')));

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/', (req, res) => {
    res.send('Welcome to API Studio Musik Rental!');
});

// route
app.use('/api', router)

app.use(errorHandler)

cron.schedule('* * * * *', async () => { // Cron berjalan setiap menit
    // console.log('Memeriksa booking yang kedaluwarsa...');
    await bookingController.cancelExpiredBookings();
});

app.listen(port, () => {
    console.log(`Server is running on https://ceriamusicapi-production.up.railway.app/`);
    console.log(`Swagger documentation available at http://localhost:${port}/docs`);
});
