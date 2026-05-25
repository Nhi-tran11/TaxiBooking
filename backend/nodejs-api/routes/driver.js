/*
 * Student Information:
 * Name: Xuan Nhi thi Tran
 * Student ID: 23196149
 *
 * File: driver.js
 * Description: API routes for driver dashboard functionality
 * Endpoints:
 * - GET /api/driver/bookings/:status: Get bookings by status
 * - PUT /api/driver/bookings/:bookingRef/status: Update booking status
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * GET /api/driver/bookings/:status
 * Retrieves bookings filtered by status
 * Valid status: assigned, picked-up, en-route, completed, all
 */
router.get('/bookings/:status', (req, res) => {
  try {
    const { status } = req.params;
    let query;
    let params = [];

    if (status === 'all') {
      query = `
        SELECT * FROM bookings 
        WHERE status IN ('assigned', 'picked-up', 'en-route', 'completed')
        ORDER BY pickup_date, pickup_time
      `;
    } else {
      query = `
        SELECT * FROM bookings 
        WHERE status = ?
        ORDER BY pickup_date, pickup_time
      `;
      params = [status];
    }

    const stmt = db.prepare(query);
    const rows = stmt.all(...params);

    const bookings = rows.map(booking => ({
      bookingRef: booking.bookingRef,
      customer_name: booking.customer_name,
      phone_number: booking.phone_number,
      unit_number: booking.unit_number,
      street_number: booking.street_number,
      suburb: booking.suburb,
      destination: booking.destination,
      pickup_date: booking.pickup_date,
      pickup_time: booking.pickup_time,
      status: booking.status,
      fare: booking.fare,
      driver_name: booking.driver_name,
      assigned_datetime: booking.assigned_datetime,
      pickup_datetime: booking.pickup_datetime,
      completed_datetime: booking.completed_datetime
    }));

    return res.json({
      success: true,
      bookings: bookings
    });

  } catch (error) {
    console.error('Error fetching driver bookings:', error);
    return res.json({
      success: false,
      message: `An error occurred: ${error.message}`
    });
  }
});

/**
 * PUT /api/driver/bookings/:bookingRef/status
 * Updates booking status and timestamps
 * Body: { status, driverName }
 * Status flow: assigned -> picked-up -> en-route -> completed
 */
router.put('/bookings/:bookingRef/status', (req, res) => {
  try {
    const { bookingRef } = req.params;
    const { status, driverName } = req.body;

    if (!status) {
      return res.json({
        success: false,
        message: 'Status is required'
      });
    }

    // Validate status
    const validStatuses = ['assigned', 'picked-up', 'en-route', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.json({
        success: false,
        message: 'Invalid status. Must be: assigned, picked-up, en-route, or completed'
      });
    }

    // Check if booking exists
    const checkStmt = db.prepare('SELECT * FROM bookings WHERE bookingRef = ?');
    const booking = checkStmt.get(bookingRef);

    if (!booking) {
      return res.json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Build update query based on status
    let updateQuery = 'UPDATE bookings SET status = ?';
    let params = [status];
    const now = new Date().toISOString();

    if (status === 'assigned' && driverName) {
      updateQuery += ', driver_name = ?, assigned_datetime = ?';
      params.push(driverName, now);
    } else if (status === 'picked-up') {
      updateQuery += ', pickup_datetime = ?';
      params.push(now);
    } else if (status === 'completed') {
      updateQuery += ', completed_datetime = ?';
      params.push(now);
    }

    updateQuery += ' WHERE bookingRef = ?';
    params.push(bookingRef);

    const updateStmt = db.prepare(updateQuery);
    updateStmt.run(...params);

    return res.json({
      success: true,
      message: `Booking status updated to ${status}`
    });

  } catch (error) {
    console.error('Error updating booking status:', error);
    return res.json({
      success: false,
      message: `An error occurred: ${error.message}`
    });
  }
});

module.exports = router;
