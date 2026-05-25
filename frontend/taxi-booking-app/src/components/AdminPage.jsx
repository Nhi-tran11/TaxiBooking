/*
 * Student Information:
 * Name: Xuan Nhi thi Tran
 * Student ID: 23196149
 *
 * File: AdminPage.jsx
 * Description: React component for admin interface to search and assign bookings
 * Functions:
 * - AdminPage: Main admin component
 * - handleSearch: Searches for bookings by reference or lists upcoming unassigned bookings
 * - handleAssign: Assigns a booking to a driver
 * - renderBookings: Renders the booking table with data
 */

import { useState } from 'react';
import config from '../config';
import './AdminPage.css';

const AdminPage = () => {
  const [searchRef, setSearchRef] = useState('');
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Searches for bookings by reference number or lists all upcoming unassigned bookings
  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = searchRef 
        ? `${config.API_URL}/api/bookings/search?bsearch=${encodeURIComponent(searchRef)}`
        : `${config.API_URL}/api/bookings/unassigned`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        // If single booking, wrap in array for consistent rendering
        setBookings(data.booking ? [data.booking] : data.bookings || []);
      } else {
        setError(data.message || 'No bookings found');
        setBookings([]);
      }
    } catch (err) {
      setError('An error occurred while searching. Please try again.');
      console.error('Error:', err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Lists bookings with pickup times within 2 hours from current time
  const handleUpcomingBookings = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${config.API_URL}/api/bookings/upcoming`);
      const data = await response.json();

      if (data.success) {
        setBookings(data.bookings || []);
        if (data.bookings.length === 0) {
          setError('No upcoming bookings found within the next 2 hours');
        }
      } else {
        setError(data.message || 'No bookings found');
        setBookings([]);
      }
    } catch (err) {
      setError('An error occurred while fetching upcoming bookings. Please try again.');
      console.error('Error:', err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Assigns a booking to a driver
  const handleAssign = async (bookingRef) => {
    if (!window.confirm(`Are you sure you want to assign booking ${bookingRef}?`)) {
      return;
    }

    try {
      const response = await fetch(`${config.API_URL}/api/bookings/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingRef })
      });

      const data = await response.json();

      if (data.success) {
        alert('Booking assigned successfully!');
        // Refresh the booking list
        handleSearch(new Event('submit'));
      } else {
        alert(data.message || 'Failed to assign booking');
      }
    } catch (err) {
      alert('An error occurred while assigning the booking. Please try again.');
      console.error('Error:', err);
    }
  };

  return (
    <div className="admin-container">
      <h1>Taxi Booking Admin Page</h1>
      
      <div className="navigation-buttons">
        <button onClick={() => window.location.href = '/'} className="btn-secondary">Go to Booking Page</button>
        <button onClick={() => window.location.href = '/analytics'} className="btn-primary">📊 Analytics Dashboard</button>
      </div>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-group">
            <label htmlFor="bsearch">Search by Booking Reference</label>
            <input
              type="text"
              id="bsearch"
              name="bsearch"
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value.toUpperCase())}
              placeholder="e.g., BRN00001"
              pattern="BRN\d{5}"
              title="Format: BRN followed by 5 digits (e.g., BRN00001)"
            />
          </div>
          <div className="button-group">
            <button type="submit" className="btn-primary">Search</button>
            <button type="button" onClick={handleUpcomingBookings} className="btn-info">
              Show Upcoming (2hrs)
            </button>
          </div>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Loading...</div>}

      {bookings.length > 0 && (
        <div className="results-section">
          <h2>Booking Results</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Booking Reference</th>
                  <th>Customer Name</th>
                  <th>Phone</th>
                  <th>Pickup Address</th>
                  <th>Destination</th>
                  <th>Pickup Date</th>
                  <th>Pickup Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const address = [
                    booking.unit_number,
                    booking.street_number,
                    booking.suburb
                  ].filter(Boolean).join(', ');

                  return (
                    <tr key={booking.bookingRef}>
                      <td>{booking.bookingRef}</td>
                      <td>{booking.customer_name}</td>
                      <td>{booking.phone_number}</td>
                      <td>{address}</td>
                      <td>{booking.destination || 'N/A'}</td>
                      <td>{booking.pickup_date}</td>
                      <td>{booking.pickup_time}</td>
                      <td>
                        <span className={`status-badge status-${booking.status}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        {booking.status === 'unassigned' ? (
                          <button
                            onClick={() => handleAssign(booking.bookingRef)}
                            className="btn-assign"
                          >
                            Assign
                          </button>
                        ) : (
                          <span className="assigned-text">Assigned</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
