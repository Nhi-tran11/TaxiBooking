================================================================================
TAXI BOOKING SYSTEM - README (Part 2: React + .NET)
================================================================================

Student Information:
Name: Xuan Nhi thi Tran
Student ID: 23196149

================================================================================
PROJECT STRUCTURE
================================================================================

The system has been refactored into a modern web application with:
- Frontend: React (using Vite)
- Backend: C# .NET 8 Web API
- Database: MySQL

DIRECTORY STRUCTURE:
--------------------
Assign/
├── frontend/
│   └── taxi-booking-app/         # React application
│       ├── src/
│       │   ├── components/
│       │   │   ├── BookingForm.jsx       # Customer booking component
│       │   │   ├── BookingForm.css
│       │   │   ├── AdminPage.jsx         # Admin interface component
│       │   │   └── AdminPage.css
│       │   ├── App.jsx                   # Main app with routing
│       │   ├── App.css
│       │   └── main.jsx
│       └── package.json
├── backend/
│   └── TaxiBookingApi/            # .NET Web API
│       ├── Controllers/
│       │   └── BookingsController.cs     # API endpoints
│       ├── Models/
│       │   ├── Booking.cs                # Booking entity model
│       │   └── BookingDto.cs             # Data transfer objects
│       ├── Data/
│       │   └── BookingContext.cs         # Database context
│       ├── Program.cs                    # App configuration
│       ├── appsettings.json              # Configuration file
│       └── TaxiBookingApi.csproj         # Project file
├── admin.html                     # (Legacy PHP files)
├── admin.php
├── booking.html
├── booking.php
├── settings.php
└── readme.txt                     # This file

================================================================================
FILE LIST (NEW REACT + .NET IMPLEMENTATION)
================================================================================

FRONTEND (React):
-----------------
1. frontend/taxi-booking-app/src/components/BookingForm.jsx
   - React component for customer booking interface
   - Handles form validation and submission
   - Displays booking confirmation

2. frontend/taxi-booking-app/src/components/BookingForm.css
   - Styling for the booking form component

3. frontend/taxi-booking-app/src/components/AdminPage.jsx
   - React component for admin interface
   - Search bookings by reference
   - View and assign unassigned bookings
   - View upcoming bookings within 2 hours

4. frontend/taxi-booking-app/src/components/AdminPage.css
   - Styling for the admin page component

5. frontend/taxi-booking-app/src/App.jsx
   - Main application component with routing configuration

6. frontend/taxi-booking-app/src/App.css
   - Global application styles

BACKEND (.NET):
---------------
7. backend/TaxiBookingApi/Controllers/BookingsController.cs
   - REST API controller with endpoints:
     * POST /api/bookings - Create new booking
     * GET /api/bookings/search - Search booking by reference
     * GET /api/bookings/unassigned - Get all unassigned bookings
     * GET /api/bookings/upcoming - Get bookings within 2 hours
     * POST /api/bookings/assign - Assign a booking

8. backend/TaxiBookingApi/Models/Booking.cs
   - Entity model representing a booking in the database

9. backend/TaxiBookingApi/Models/BookingDto.cs
   - Data transfer objects for API requests/responses

10. backend/TaxiBookingApi/Data/BookingContext.cs
    - Entity Framework database context

11. backend/TaxiBookingApi/Program.cs
    - Application startup and configuration

12. backend/TaxiBookingApi/appsettings.json
    - Configuration including database connection string

13. backend/TaxiBookingApi/TaxiBookingApi.csproj
    - .NET project file with dependencies

LEGACY FILES (PHP):
-------------------
14. booking.html/booking.php - Original PHP booking implementation
15. admin.html/admin.php - Original PHP admin implementation
16. settings.php - PHP database configuration
17. readme.txt - This documentation file

================================================================================
SYSTEM REQUIREMENTS
================================================================================

- Node.js (v18 or higher) and npm
- .NET 8 SDK
- MySQL database
- Modern web browser (Chrome, Firefox, Safari, or Edge)

================================================================================
INSTALLATION & SETUP
================================================================================

1. DATABASE SETUP:
   ----------------
   - The application connects to the MySQL database specified in 
     backend/TaxiBookingApi/appsettings.json
   - Current configuration:
     * Host: webdev.aut.ac.nz
     * Database: fhb6820
     * User: fhb6820
   - The table will be created automatically by Entity Framework if needed

2. BACKEND SETUP (.NET API):
   -------------------------
   a) Navigate to the backend directory:
      cd backend/TaxiBookingApi

   b) Restore dependencies:
      dotnet restore

   c) Run the API (defaults to http://localhost:5000):
      dotnet run

   The API will be available at: http://localhost:5000
   Swagger documentation at: http://localhost:5000/swagger

3. FRONTEND SETUP (React):
   -----------------------
   a) Navigate to the frontend directory:
      cd frontend/taxi-booking-app

   b) Install dependencies:
      npm install

   c) Start the development server:
      npm run dev

   The React app will be available at: http://localhost:5173

================================================================================
HOW TO USE THE SYSTEM
================================================================================

FOR CUSTOMERS (Booking Page):
-----------------------------
1. Open http://localhost:5173 in your web browser
2. Fill in the booking form with:
   - Your name (required)
   - Phone number (required)
   - Unit number (optional)
   - Street number and name (required)
   - Suburb name (optional)
   - Destination suburb (optional)
   - Pickup date (required)
   - Pickup time (required - must be at least 2 hours from now)
3. Click the "Book" button to submit your booking
4. You will receive a booking reference number (format: BRN00001)
5. Save this reference number for future reference

FOR ADMINISTRATORS (Admin Page):
---------------------------------
1. Navigate to http://localhost:5173/admin or click "Go to Admin Page"
2. To search for a specific booking:
   - Enter a booking reference number (e.g., BRN00001)
   - Click "Search"
   - The booking details will be displayed if found
3. To view all unassigned bookings:
   - Leave the search field empty
   - Click "Search"
   - All upcoming unassigned bookings will be displayed
4. To view bookings within 2 hours:
   - Click "Show Upcoming (2hrs)" button
   - Bookings with pickup times within the next 2 hours will be displayed
5. To assign a booking:
   - Click the "Assign" button next to any unassigned booking
   - Confirm the action
   - The booking status will change to "assigned"

NAVIGATION:
-----------
- Use "Go to Admin Page" button to switch to admin interface
- Use "Go to Booking Page" button to return to the booking page
- React Router handles client-side navigation

================================================================================
API ENDPOINTS
================================================================================

Base URL: http://localhost:5000/api/bookings

1. POST /api/bookings
   - Creates a new booking
   - Request body: BookingRequestDto (JSON)
   - Returns: BookingResponseDto with booking reference

2. GET /api/bookings/search?bsearch={bookingRef}
   - Searches for a booking by reference number
   - Query parameter: bsearch (e.g., BRN00001)
   - Returns: Booking details if found

3. GET /api/bookings/unassigned
   - Retrieves all unassigned bookings with future pickup times
   - Returns: List of unassigned bookings

4. GET /api/bookings/upcoming
   - Retrieves bookings within 2 hours from current time
   - Returns: List of upcoming bookings

5. POST /api/bookings/assign
   - Assigns a booking to a driver
   - Request body: { "bookingRef": "BRN00001" }
   - Returns: Success/failure response

================================================================================
FEATURES IMPLEMENTED
================================================================================

1. Customer Booking:
   - Form validation (required fields)
   - Date/time validation (minimum 2 hours in advance)
   - Automatic booking reference generation
   - Booking confirmation display

2. Admin Interface:
   - Search by booking reference with format validation
   - View all unassigned bookings
   - View bookings within 2 hours from current time
   - Assign bookings with confirmation
   - Responsive table layout

3. Technical Features:
   - RESTful API architecture
   - CORS configuration for cross-origin requests
   - Entity Framework Core with MySQL
   - React Router for client-side navigation
   - Component-based UI architecture
   - Consistent error handling
   - Swagger API documentation

================================================================================
CODE QUALITY
================================================================================

- Consistent naming conventions:
  * PascalCase for C# classes and methods
  * camelCase for JavaScript variables and functions
  * kebab-case for CSS classes

- Proper indentation and formatting throughout all files

- Comprehensive comments:
  * Student information in all files
  * File descriptions
  * Function/method descriptions
  * Complex logic explanations

- No commented-out code

- Modular component structure

- Separation of concerns (models, controllers, views)

================================================================================
BOOKING REFERENCE FORMAT
================================================================================

All bookings are assigned a unique reference number in the format: BRNxxxxx
(e.g., BRN00001, BRN00002, etc.)

References are generated sequentially and cannot be changed.

================================================================================
TROUBLESHOOTING
================================================================================

Backend Issues:
--------------
- Ensure .NET 8 SDK is installed: dotnet --version
- Check database credentials in appsettings.json
- Verify MySQL server is running and accessible
- Check API is running on port 5000
- View detailed errors in terminal where 'dotnet run' is executed

Frontend Issues:
---------------
- Ensure Node.js is installed: node --version
- Check frontend is running on port 5173
- Verify backend API is running before testing frontend
- Check browser console for JavaScript errors
- Ensure no CORS errors in browser console

Database Issues:
---------------
- Verify database connection string is correct
- Ensure database user has proper permissions
- Check that bookings table exists or can be created
- Review Entity Framework logs for migration issues

API Connection Issues:
---------------------
- Verify backend URL in React components is http://localhost:5000
- Check CORS policy allows requests from http://localhost:5173
- Ensure both frontend and backend are running simultaneously

================================================================================
DEVELOPMENT COMMANDS
================================================================================

Backend:
--------
cd backend/TaxiBookingApi
dotnet restore          # Install dependencies
dotnet build            # Build the project
dotnet run              # Run the API
dotnet watch run        # Run with hot reload

Frontend:
---------
cd frontend/taxi-booking-app
npm install             # Install dependencies
npm run dev             # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

================================================================================
