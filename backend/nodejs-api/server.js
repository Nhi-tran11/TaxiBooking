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

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
