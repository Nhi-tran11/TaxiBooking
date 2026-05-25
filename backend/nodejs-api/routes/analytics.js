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
    // Total bookings
    const totalStmt = db.prepare('SELECT COUNT(*) as count FROM bookings');
    const totalResult = totalStmt.get();
    const totalBookings = totalResult.count;

    // Bookings by status
    const statusStmt = db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM bookings 
      GROUP BY status
    `);
    const statusResults = statusStmt.all();
    const byStatus = {};
    statusResults.forEach(row => {
      byStatus[row.status] = row.count;
    });

    // Today's bookings
    const today = new Date().toISOString().split('T')[0];
    const todayStmt = db.prepare(`
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE DATE(booking_datetime) = ?
    `);
    const todayResult = todayStmt.get(today);
    const todayBookings = todayResult.count;

    // Total revenue
    const revenueStmt = db.prepare(`
      SELECT SUM(fare) as total 
      FROM bookings 
      WHERE fare IS NOT NULL
    `);
    const revenueResult = revenueStmt.get();
    const totalRevenue = revenueResult.total || 0;

    // Average fare
    const avgFareStmt = db.prepare(`
      SELECT AVG(fare) as average 
      FROM bookings 
      WHERE fare IS NOT NULL
    `);
    const avgFareResult = avgFareStmt.get();
    const avgFare = avgFareResult.average || 0;

    // Completed bookings
    const completedStmt = db.prepare(`
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE status = 'completed'
    `);
    const completedResult = completedStmt.get();
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
    // Popular pickup suburbs
    const pickupStmt = db.prepare(`
      SELECT suburb, COUNT(*) as count 
      FROM bookings 
      WHERE suburb IS NOT NULL AND suburb != ''
      GROUP BY suburb 
      ORDER BY count DESC 
      LIMIT 10
    `);
    const pickupResults = pickupStmt.all();

    // Popular destinations
    const destStmt = db.prepare(`
      SELECT destination, COUNT(*) as count 
      FROM bookings 
      WHERE destination IS NOT NULL AND destination != ''
      GROUP BY destination 
      ORDER BY count DESC 
      LIMIT 10
    `);
    const destResults = destStmt.all();

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
 * Returns revenue data over time
 */
router.get('/revenue', (req, res) => {
  try {
    // Daily revenue for last 7 days
    const dailyStmt = db.prepare(`
      SELECT 
        DATE(booking_datetime) as date,
        COUNT(*) as bookings,
        SUM(CASE WHEN fare IS NOT NULL THEN fare ELSE 0 END) as revenue
      FROM bookings 
      WHERE DATE(booking_datetime) >= DATE('now', '-7 days')
      GROUP BY DATE(booking_datetime)
      ORDER BY date DESC
    `);
    const dailyResults = dailyStmt.all();

    // Revenue by status
    const statusRevenueStmt = db.prepare(`
      SELECT 
        status,
        COUNT(*) as bookings,
        SUM(CASE WHEN fare IS NOT NULL THEN fare ELSE 0 END) as revenue
      FROM bookings 
      GROUP BY status
    `);
    const statusRevenueResults = statusRevenueStmt.all();

    return res.json({
      success: true,
      revenue: {
        daily: dailyResults.map(row => ({
          date: row.date,
          bookings: row.bookings,
          revenue: Math.round(row.revenue * 100) / 100
        })),
        byStatus: statusRevenueResults.map(row => ({
          status: row.status,
          bookings: row.bookings,
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
