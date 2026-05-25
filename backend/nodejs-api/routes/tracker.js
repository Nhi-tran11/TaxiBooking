/*
 * Student Information:
 * Name: Xuan Nhi thi Tran
 * Student ID: 23196149
 *
 * File: tracker.js
 * Description: API routes for customer booking tracking
 * Endpoints:
 * - GET /api/tracker/:bookingRef: Track booking status
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * GET /api/tracker/:bookingRef
 * Retrieves detailed booking status for customer tracking
 */
router.get('/:bookingRef', (req, res) => {
  try {
    const { bookingRef } = req.params;

    if (!bookingRef) {
      return res.json({
        success: false,
        message: 'Booking reference is required'
      });
    }

    // Validate format: BRN followed by 5 digits
    if (!/^BRN\d{5}$/i.test(bookingRef.toUpperCase())) {
      return res.json({
        success: false,
        message: 'Invalid booking reference format. Expected format: BRN00001'
      });
    }

    const stmt = db.prepare('SELECT * FROM bookings WHERE bookingRef = ?');
    const booking = stmt.get(bookingRef.toUpperCase());

    if (!booking) {
      return res.json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Calculate time remaining until pickup
    const now = new Date();
    const pickupDateTime = new Date(`${booking.pickup_date}T${booking.pickup_time}`);
    const timeUntilPickup = pickupDateTime - now;
    const hoursUntil = Math.floor(timeUntilPickup / (1000 * 60 * 60));
    const minutesUntil = Math.floor((timeUntilPickup % (1000 * 60 * 60)) / (1000 * 60));

    // Get status details
    const statusInfo = getStatusInfo(booking.status);

    return res.json({
      success: true,
      booking: {
        bookingRef: booking.bookingRef,
        customer_name: booking.customer_name,
        phone_number: booking.phone_number,
        pickup_address: [
          booking.unit_number,
          booking.street_number,
          booking.suburb
        ].filter(Boolean).join(', '),
        destination: booking.destination || 'Not specified',
        pickup_date: booking.pickup_date,
        pickup_time: booking.pickup_time,
        status: booking.status,
        statusDisplay: statusInfo.display,
        statusColor: statusInfo.color,
        statusMessage: statusInfo.message,
        fare: booking.fare,
        driver_name: booking.driver_name,
        timeUntilPickup: timeUntilPickup > 0 ? {
          hours: hoursUntil,
          minutes: minutesUntil,
          display: `${hoursUntil}h ${minutesUntil}m`
        } : null,
        timeline: {
          booked: booking.booking_datetime,
          assigned: booking.assigned_datetime,
          pickedUp: booking.pickup_datetime,
          completed: booking.completed_datetime
        }
      }
    });

  } catch (error) {
    console.error('Error tracking booking:', error);
    return res.json({
      success: false,
      message: `An error occurred: ${error.message}`
    });
  }
});

/**
 * Helper function to get status display information
 */
function getStatusInfo(status) {
  const statusMap = {
    'unassigned': {
      display: 'Unassigned',
      color: '#FF9800',
      message: 'Your booking is confirmed. We are assigning a driver.'
    },
    'assigned': {
      display: 'Driver Assigned',
      color: '#2196F3',
      message: 'A driver has been assigned to your booking.'
    },
    'picked-up': {
      display: 'Driver Arrived',
      color: '#9C27B0',
      message: 'Your driver has arrived at the pickup location.'
    },
    'en-route': {
      display: 'En Route',
      color: '#FF5722',
      message: 'Your ride is in progress to the destination.'
    },
    'completed': {
      display: 'Completed',
      color: '#4CAF50',
      message: 'Your ride has been completed. Thank you!'
    }
  };

  return statusMap[status] || {
    display: status,
    color: '#757575',
    message: 'Status unknown'
  };
}

module.exports = router;
