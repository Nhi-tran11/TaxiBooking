# Taxi Booking API - Node.js Backend

## Student Information
- Name: Xuan Nhi thi Tran
- Student ID: 23196149

## Description
Node.js Express API for managing taxi bookings with MySQL database.

## Features
- Create new taxi bookings
- Search bookings by reference number
- View unassigned bookings
- View upcoming bookings (within 2 hours)
- Assign bookings to drivers
- **All date/time operations use Auckland, New Zealand timezone (Pacific/Auckland)**

## Technology Stack
- Node.js
- Express.js
- MySQL (mysql2)
- CORS
- dotenv

## Installation

1. Navigate to the nodejs-api directory:
```bash
cd backend/nodejs-api
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Edit the `.env` file with your database credentials
   - Default port is 5000

## Running the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Create Booking
- **POST** `/api/bookings`
- **Body**: 
  ```json
  {
    "cname": "Customer Name",
    "phone": "1234567890",
    "unumber": "Unit 5",
    "snumber": "123",
    "sbname": "Suburb Name",
    "dsbname": "Destination Suburb",
    "pickup_date": "2026-05-25",
    "pickup_time": "14:30"
  }
  ```

### Search Booking
- **GET** `/api/bookings/search?bsearch=BRN00001`

### Get Unassigned Bookings
- **GET** `/api/bookings/unassigned`

### Get Upcoming Bookings
- **GET** `/api/bookings/upcoming`

### Assign Booking
- **POST** `/api/bookings/assign`
- **Body**:
  ```json
  {
    "bookingRef": "BRN00001"
  }
  ```

## Database Schema

The API uses the existing `bookings` table with the following structure:
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- bookingRef (VARCHAR, UNIQUE)
- customer_name (VARCHAR)
- phone_number (VARCHAR)
- unit_number (VARCHAR, NULLABLE)
- street_number (VARCHAR)
- suburb (VARCHAR, NULLABLE)
- destination (VARCHAR, NULLABLE)
- pickup_date (DATE)
- pickup_time (TIME)
- status (VARCHAR, DEFAULT 'unassigned')
- booking_datetime (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

## Frontend Configuration

Update your React frontend to use the new API URL:
- Default: `http://localhost:5000/api/bookings`

## Notes
- All required fields are validated
- Pickup time must be at least 2 hours in the future
- Booking references are generated sequentially (BRN00001, BRN00002, etc.)
- CORS is configured to accept requests from `http://localhost:5173`
- **All date and time operations use Auckland, New Zealand timezone (Pacific/Auckland)**
- The 2-hour minimum booking time is calculated based on Auckland local time
