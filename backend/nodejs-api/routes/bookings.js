/*
 * Student Information:
 * Name: Xuan Nhi thi Tran
 * Student ID: 23196149
 *
 * File: bookings.js
 * Description: API routes for handling booking operations
 * Endpoints:
 * - POST /api/bookings: Creates a new booking
 * - GET /api/bookings/search: Searches for a booking by reference
 * - GET /api/bookings/unassigned: Retrieves all unassigned bookings
 * - GET /api/bookings/upcoming: Retrieves bookings within 2 hours
 * - POST /api/bookings/assign: Assigns a booking to a driver
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Helper function to get Auckland time components
function getAucklandTimeComponents() {
  const formatter = new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(new Date());
  const values = {};
  parts.forEach(part => {
    if (part.type !== 'literal') {
      values[part.type] = part.value;
    }
  });
  
  return {
    year: parseInt(values.year),
    month: parseInt(values.month),
    day: parseInt(values.day),
    hours: parseInt(values.hour),
    minutes: parseInt(values.minute),
    seconds: parseInt(values.second)
  };
}

// Helper function to get current Auckland date string
function getAucklandDateString() {
  const { year, month, day } = getAucklandTimeComponents();
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Helper function to get current Auckland time string
function getAucklandTimeString() {
  const { hours, minutes } = getAucklandTimeComponents();
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * POST /api/bookings
 * Creates a new taxi booking and returns booking reference
 */
router.post('/', (req, res) => {
  try {
    const { cname, phone, unumber, snumber, sbname, dsbname, pickup_date, pickup_time } = req.body;

    // Validate required fields
    if (!cname || !phone || !snumber || !pickup_date || !pickup_time) {
      return res.json({
        success: false,
        message: 'Please fill in all required fields.'
      });
    }

    // Validate date/time format
    const pickupDateTime = new Date(`${pickup_date}T${pickup_time}`);
    if (isNaN(pickupDateTime.getTime())) {
      return res.json({
        success: false,
        message: 'Invalid date/time format.'
      });
    }

    // Validate pickup time is not in the past
    const now = new Date();
    if (pickupDateTime < now) {
      return res.json({
        success: false,
        message: 'You cannot book a pickup time in the past. Please select a current or future time.'
      });
    }

    // Generate booking reference
    const bookingRef = generateBookingRef();

    // Insert new booking
    const query = `
      INSERT INTO bookings 
      (bookingRef, customer_name, phone_number, unit_number, street_number, suburb, destination, pickup_date, pickup_time, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'unassigned')
    `;

    const stmt = db.prepare(query);
    stmt.run(
      bookingRef,
      cname,
      phone,
      unumber || null,
      snumber,
      sbname || null,
      dsbname || null,
      pickup_date,
      pickup_time
    );

    return res.json({
      success: true,
      bookingRef: bookingRef,
      pickup_date: pickup_date,
      pickup_time: pickup_time
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    return res.json({
      success: false,
      message: `An error occurred: ${error.message}`
    });
  }
});

/**
 * GET /api/bookings/search?bsearch=BRN00001
 * Searches for a booking by reference number
 */
router.get('/search', (req, res) => {
  try {
    const bookingRef = req.query.bsearch?.toUpperCase().trim();

    if (!bookingRef) {
      return res.json({
        success: false,
        message: 'Please provide a booking reference'
      });
    }

    // Validate format: BRN followed by 5 digits
    if (!/^BRN\d{5}$/.test(bookingRef)) {
      return res.json({
        success: false,
        message: 'Invalid booking reference format. Please enter a valid booking reference number.'
      });
    }

    const stmt = db.prepare('SELECT * FROM bookings WHERE bookingRef = ?');
    const booking = stmt.get(bookingRef);

    if (!booking) {
      return res.json({
        success: false,
        message: 'Booking not found'
      });
    }

    return res.json({
      success: true,
      booking: {
        bookingRef: booking.bookingRef,
        customer_name: booking.customer_name,
        phone_number: booking.phone_number,
        unit_number: booking.unit_number,
        street_number: booking.street_number,
        suburb: booking.suburb,
        destination: booking.destination,
        pickup_date: formatDate(booking.pickup_date),
        pickup_time: formatTime(booking.pickup_time),
        status: booking.status
      }
    });

  } catch (error) {
    console.error('Error searching booking:', error);
    return res.json({
      success: false,
      message: `An error occurred: ${error.message}`
    });
  }
});

/**
 * GET /api/bookings/unassigned
 * Retrieves all unassigned bookings with future pickup times
 */
router.get('/unassigned', (req, res) => {
  try {
    const currentDate = getAucklandDateString();
    const currentTime = getAucklandTimeString();

    const query = `
      SELECT * FROM bookings 
      WHERE status = 'unassigned' 
      AND (
        pickup_date > ? 
        OR (pickup_date = ? AND pickup_time > ?)
      )
      ORDER BY pickup_date, pickup_time
    `;

    const stmt = db.prepare(query);
    const rows = stmt.all(currentDate, currentDate, currentTime);

    const bookings = rows.map(booking => ({
      bookingRef: booking.bookingRef,
      customer_name: booking.customer_name,
      phone_number: booking.phone_number,
      unit_number: booking.unit_number,
      street_number: booking.street_number,
      suburb: booking.suburb,
      destination: booking.destination,
      pickup_date: formatDate(booking.pickup_date),
      pickup_time: formatTime(booking.pickup_time),
      status: booking.status
    }));

    return res.json({
      success: true,
      bookings: bookings
    });

  } catch (error) {
    console.error('Error fetching unassigned bookings:', error);
    return res.json({
      success: false,
      message: `An error occurred: ${error.message}`
    });
  }
});

/**
 * GET /api/bookings/upcoming
 * Retrieves bookings with pickup times within 2 hours from current time
 */
router.get('/upcoming', (req, res) => {
  try {
    const auckland = getAucklandTimeComponents();
    let minHours = auckland.hours + 2;
    let minMinutes = auckland.minutes;
    let twoHoursDate = getAucklandDateString();
    
    // Handle day overflow
    if (minHours >= 24) {
      minHours = minHours - 24;
      // Move to next day
      const tomorrow = new Date(auckland.year, auckland.month - 1, auckland.day + 1);
      twoHoursDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    }
    
    const currentDate = getAucklandDateString();
    const currentTime = getAucklandTimeString();
    const twoHoursTime = `${String(minHours).padStart(2, '0')}:${String(minMinutes).padStart(2, '0')}`;

    // Handle case where 2 hours spans into next day
    let query;
    let params;
    
    if (currentDate === twoHoursDate) {
      // Same day: simple between query
      query = `
        SELECT * FROM bookings 
        WHERE pickup_date = ? 
        AND pickup_time >= ? 
        AND pickup_time <= ?
        ORDER BY pickup_date, pickup_time
      `;
      params = [currentDate, currentTime, twoHoursTime];
    } else {
      // Spans into next day
      query = `
        SELECT * FROM bookings 
        WHERE (
          (pickup_date = ? AND pickup_time >= ?)
          OR (pickup_date = ? AND pickup_time <= ?)
        )
        ORDER BY pickup_date, pickup_time
      `;
      params = [currentDate, currentTime, twoHoursDate, twoHoursTime];
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
      pickup_date: formatDate(booking.pickup_date),
      pickup_time: formatTime(booking.pickup_time),
      status: booking.status
    }));

    return res.json({
      success: true,
      bookings: bookings
    });

  } catch (error) {
    console.error('Error fetching upcoming bookings:', error);
    return res.json({
      success: false,
      message: `An error occurred: ${error.message}`
    });
  }
});

/**
 * POST /api/bookings/assign
 * Assigns a booking by changing status from unassigned to assigned
 */
router.post('/assign', (req, res) => {
  try {
    const { bookingRef } = req.body;

    if (!bookingRef) {
      return res.json({
        success: false,
        message: 'Booking reference is required'
      });
    }

    // Check if booking exists
    const stmt = db.prepare('SELECT * FROM bookings WHERE bookingRef = ?');
    const booking = stmt.get(bookingRef);

    if (!booking) {
      return res.json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'unassigned') {
      return res.json({
        success: false,
        message: 'Booking is already assigned'
      });
    }

    // Update booking status
    const updateStmt = db.prepare('UPDATE bookings SET status = ? WHERE bookingRef = ?');
    updateStmt.run('assigned', bookingRef);

    return res.json({
      success: true,
      message: 'Booking assigned successfully'
    });

  } catch (error) {
    console.error('Error assigning booking:', error);
    return res.json({
      success: false,
      message: `An error occurred: ${error.message}`
    });
  }
});

/**
 * Helper function: Generates the next sequential booking reference number
 * @returns {string} Booking reference in format BRN00001
 */
function generateBookingRef() {
  try {
    const stmt = db.prepare('SELECT bookingRef FROM bookings ORDER BY id DESC LIMIT 1');
    const row = stmt.get();

    if (!row) {
      return 'BRN00001';
    }

    const lastBookingRef = row.bookingRef;
    const lastNumber = parseInt(lastBookingRef.substring(3));
    const newNumber = lastNumber + 1;
    return `BRN${newNumber.toString().padStart(5, '0')}`;
  } catch (error) {
    console.error('Error generating booking reference:', error);
    throw error;
  }
}

/**
 * Helper function: Formats date to YYYY-MM-DD
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Helper function: Formats time to HH:MM
 * @param {string} time - Time to format
 * @returns {string} Formatted time string
 */
function formatTime(time) {
  if (!time) return '';
  // Handle both HH:MM:SS and HH:MM formats
  if (typeof time === 'string') {
    return time.substring(0, 5);
  }
  return time;
}

module.exports = router;
