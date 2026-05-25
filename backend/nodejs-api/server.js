/*
 * Student Information:
 * Name: Xuan Nhi thi Tran
 * Student ID: 23196149
 *
 * File: server.js
 * Description: Main entry point for the Node.js Express API application
 * Functions:
 * - Configures Express middleware including CORS
 * - Sets up routes for booking operations
 * - Starts the server
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const bookingsRouter = require('./routes/bookings');
const driverRouter = require('./routes/driver');
const trackerRouter = require('./routes/tracker');
const fareRouter = require('./routes/fare');
const analyticsRouter = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://taxibooking-app.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean);

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Taxi Booking API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      bookings: '/api/bookings',
      driver: '/api/driver',
      tracker: '/api/tracker',
      fare: '/api/fare',
      analytics: '/api/analytics',
      health: '/health'
    }
  });
});

// Routes
app.use('/api/bookings', bookingsRouter);
app.use('/api/driver', driverRouter);
app.use('/api/tracker', trackerRouter);
app.use('/api/fare', fareRouter);
app.use('/api/analytics', analyticsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Taxi Booking API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
