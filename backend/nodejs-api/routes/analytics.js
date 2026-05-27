/*
 * Student Information:
 * Name: Xuan Nhi thi Tran
 * Student ID: 23196149
 *
 * File: analytics.js
 * Description: API routes for admin analytics dashboard
 * Endpoints:
 * - GET /api/analytics/stats: Get overall statistics
 * - GET /api/analytics/popular-routes: Get popular routes
 * - GET /api/analytics/revenue: Get revenue data
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * GET /api/analytics/stats
 * Returns overall booking statistics
 */
router.get('/stats', (req, res) => {
  try {
    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Total bookings (today only)
    const totalStmt = db.prepare(`
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE DATE(booking_datetime) = ?
    `);
    const totalResult = totalStmt.get(today);
    const totalBookings = totalResult.count;

    // Bookings by status (today only)
    const statusStmt = db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM bookings 
      WHERE DATE(booking_datetime) = ?
      GROUP BY status
    `);
    const statusResults = statusStmt.all(today);
    const byStatus = {};
    statusResults.forEach(row => {
      byStatus[row.status] = row.count;
    });

    // Today's bookings (same as total now)
    const todayBookings = totalBookings;

    // Total revenue (today only)
    const revenueStmt = db.prepare(`
      SELECT SUM(fare) as total 
      FROM bookings 
      WHERE fare IS NOT NULL
        AND DATE(booking_datetime) = ?
    `);
    const revenueResult = revenueStmt.get(today);
    const totalRevenue = revenueResult.total || 0;

    // Average fare (today only)
    const avgFareStmt = db.prepare(`
      SELECT AVG(fare) as average 
      FROM bookings 
      WHERE fare IS NOT NULL
        AND DATE(booking_datetime) = ?
    `);
    const avgFareResult = avgFareStmt.get(today);
    const avgFare = avgFareResult.average || 0;
  
    // Completed bookings (today only)
    const completedStmt = db.prepare(`
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE status = 'completed'
        AND DATE(booking_datetime) = ?
    `);
    const completedResult = completedStmt.get(today);
    const completedBookings = completedResult.count;

    // Completion rate
    const completionRate = totalBookings > 0 
      ? Math.round((completedBookings / totalBookings) * 100) 
      : 0;

    return res.json({
      success: true,
      stats: {
        totalBookings,
        todayBookings,
        completedBookings,
        completionRate,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        avgFare: Math.round(avgFare * 100) / 100,
        byStatus: {
          unassigned: byStatus.unassigned || 0,
          assigned: byStatus.assigned || 0,
          'picked-up': byStatus['picked-up'] || 0,
          'en-route': byStatus['en-route'] || 0,
          completed: byStatus.completed || 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    return res.json({
      success: false,
      message: `An error occurred: ${error.message}`
    });
  }
});

/**
 * GET /api/analytics/popular-routes
 * Returns most popular pickup suburbs and destinations
 */
router.get('/popular-routes', (req, res) => {
  try {
    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Popular pickup suburbs (today only)
    const pickupStmt = db.prepare(`
      SELECT suburb, COUNT(*) as count 
      FROM bookings 
      WHERE suburb IS NOT NULL AND suburb != ''
        AND DATE(booking_datetime) = ?
      GROUP BY suburb 
      ORDER BY count DESC 
      LIMIT 10
    `);
    const pickupResults = pickupStmt.all(today);

    // Popular destinations (today only)
    const destStmt = db.prepare(`
      SELECT destination, COUNT(*) as count 
      FROM bookings 
      WHERE destination IS NOT NULL AND destination != ''
        AND DATE(booking_datetime) = ?
      GROUP BY destination 
      ORDER BY count DESC 
      LIMIT 10
    `);
    const destResults = destStmt.all(today);

    return res.json({
      success: true,
      routes: {
        topPickups: pickupResults.map(row => ({
          suburb: row.suburb,
          count: row.count
        })),
        topDestinations: destResults.map(row => ({
          destination: row.destination,
          count: row.count
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching popular routes:', error);
    return res.json({
      success: false,
      message: `An error occurred: ${error.message}`
    });
  }
});

/**
 * GET /api/analytics/revenue
 * Returns revenue data by day and status
 */
router.get('/revenue', (req, res) => {
  try {
    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Revenue by day (last 7 days from today)
    const dailyStmt = db.prepare(`
      SELECT 
        DATE(booking_datetime) as date,
        COUNT(*) as bookings,
        SUM(CASE WHEN fare IS NOT NULL THEN fare ELSE 0 END) as revenue
      FROM bookings 
      WHERE DATE(booking_datetime) >= date(?, '-6 days')
        AND DATE(booking_datetime) <= ?
      GROUP BY DATE(booking_datetime)
      ORDER BY date DESC
    `);
    const dailyResults = dailyStmt.all(today, today);

    // Revenue by status (today only)
    const statusStmt = db.prepare(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(CASE WHEN fare IS NOT NULL THEN fare ELSE 0 END) as revenue
      FROM bookings 
      WHERE DATE(booking_datetime) = ?
      GROUP BY status
    `);
    const statusResults = statusStmt.all(today);

    return res.json({
      success: true,
      revenue: {
        daily: dailyResults.map(row => ({
          date: row.date,
          bookings: row.bookings,
          revenue: Math.round(row.revenue * 100) / 100
        })),
        byStatus: statusResults.map(row => ({
          status: row.status,
          count: row.count,
          revenue: Math.round(row.revenue * 100) / 100
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return res.json({
      success: false,
      message: `An error occurred: ${error.message}`
    });
  }
});


module.exports = router;
