/*
 * Student Information:
 * Name: Xuan Nhi thi Tran
 * Student ID: 23196149
 *
 * File: database.js
 * Description: SQLite database configuration and initialization
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create or connect to SQLite database
const dbPath = path.join(dataDir, 'bookings.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
function initDatabase() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bookingRef VARCHAR(20) NOT NULL UNIQUE,
      customer_name VARCHAR(100) NOT NULL,
      phone_number VARCHAR(20) NOT NULL,
      unit_number VARCHAR(20),
      street_number VARCHAR(100) NOT NULL,
      suburb VARCHAR(100),
      destination VARCHAR(100),
      pickup_date DATE NOT NULL,
      pickup_time TIME NOT NULL,
      status VARCHAR(20) DEFAULT 'unassigned',
      fare DECIMAL(10,2),
      driver_name VARCHAR(100),
      booking_datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
      assigned_datetime DATETIME,
      pickup_datetime DATETIME,
      completed_datetime DATETIME
    )
  `;
  
  db.exec(createTableSQL);
  
  // Add columns if they don't exist (migration)
  try {
    db.exec('ALTER TABLE bookings ADD COLUMN fare DECIMAL(10,2)');
  } catch (e) { /* Column already exists */ }
  
  try {
    db.exec('ALTER TABLE bookings ADD COLUMN driver_name VARCHAR(100)');
  } catch (e) { /* Column already exists */ }
  
  try {
    db.exec('ALTER TABLE bookings ADD COLUMN assigned_datetime DATETIME');
  } catch (e) { /* Column already exists */ }
  
  try {
    db.exec('ALTER TABLE bookings ADD COLUMN pickup_datetime DATETIME');
  } catch (e) { /* Column already exists */ }
  
  try {
    db.exec('ALTER TABLE bookings ADD COLUMN completed_datetime DATETIME');
  } catch (e) { /* Column already exists */ }
  
  console.log('Database initialized successfully');
}

// Initialize the database when this module is loaded
initDatabase();

module.exports = db;
