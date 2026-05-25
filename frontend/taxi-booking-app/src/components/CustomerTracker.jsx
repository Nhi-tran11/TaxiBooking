/*
 * Student Information:
 * Name: Xuan Nhi thi Tran
 * Student ID: 23196149
 *
 * File: CustomerTracker.jsx
 * Description: Customer booking tracker for real-time status updates
 */

import { useState } from 'react';
import './CustomerTracker.css';
import config from '../config';

const CustomerTracker = () => {
  const [bookingRef, setBookingRef] = useState('');
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!bookingRef.trim()) {
      setError('Please enter a booking reference');
      return;
    }

    setLoading(true);
    setError('');
    setBooking(null);

    try {
      const response = await fetch(`${config.API_URL}/api/tracker/${bookingRef.trim()}`);
      const data = await response.json();

      if (data.success) {
        setBooking(data.booking);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to track booking. Please check if backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (bookingRef) {
      handleSearch({ preventDefault: () => {} });
    }
  };

  return (
    <div className="customer-tracker">
      <h1>Track Your Booking</h1>
      
      <div className="navigation-buttons">
        <button onClick={() => window.location.href = '/'} className="btn-secondary">
          Back to Home
        </button>
      </div>

      <form onSubmit={handleSearch} className="tracker-form">
        <div className="search-group">
          <input
            type="text"
            placeholder="Enter Booking Reference (e.g., BRN00001)"
            value={bookingRef}
            onChange={(e) => setBookingRef(e.target.value.toUpperCase())}
            maxLength="8"
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Track Booking'}
          </button>
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}

      {booking && (
        <div className="tracking-result">
          <div className="status-header" style={{ backgroundColor: booking.statusColor }}>
            <h2>{booking.statusDisplay}</h2>
            <p>{booking.statusMessage}</p>
          </div>

          <div className="booking-info">
            <div className="info-section">
              <h3>Booking Details</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Booking Ref:</span>
                  <span className="value">{booking.bookingRef}</span>
                </div>
                <div className="info-item">
                  <span className="label">Customer:</span>
                  <span className="value">{booking.customer_name}</span>
                </div>
                <div className="info-item">
                  <span className="label">Phone:</span>
                  <span className="value">{booking.phone_number}</span>
                </div>
                <div className="info-item">
                  <span className="label">Pickup Address:</span>
                  <span className="value">{booking.pickup_address}</span>
                </div>
                <div className="info-item">
                  <span className="label">Destination:</span>
                  <span className="value">{booking.destination}</span>
                </div>
                <div className="info-item">
                  <span className="label">Pickup Time:</span>
                  <span className="value">{booking.pickup_date} at {booking.pickup_time}</span>
                </div>
                {booking.fare && (
                  <div className="info-item">
                    <span className="label">Fare:</span>
                    <span className="value">${booking.fare} NZD</span>
                  </div>
                )}
                {booking.driver_name && (
                  <div className="info-item">
                    <span className="label">Driver:</span>
                    <span className="value">{booking.driver_name}</span>
                  </div>
                )}
              </div>
            </div>

            {booking.timeUntilPickup && (
              <div className="countdown-section">
                <h3>Time Until Pickup</h3>
                <div className="countdown">
                  <div className="countdown-item">
                    <span className="countdown-value">{booking.timeUntilPickup.hours}</span>
                    <span className="countdown-label">Hours</span>
                  </div>
                  <div className="countdown-divider">:</div>
                  <div className="countdown-item">
                    <span className="countdown-value">{booking.timeUntilPickup.minutes}</span>
                    <span className="countdown-label">Minutes</span>
                  </div>
                </div>
              </div>
            )}

            <div className="timeline-section">
              <h3>Booking Timeline</h3>
              <div className="timeline">
                <div className={`timeline-item ${booking.timeline.booked ? 'completed' : ''}`}>
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h4>Booking Placed</h4>
                    {booking.timeline.booked && (
                      <p>{new Date(booking.timeline.booked).toLocaleString()}</p>
                    )}
                  </div>
                </div>

                <div className={`timeline-item ${booking.timeline.assigned ? 'completed' : ''}`}>
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h4>Driver Assigned</h4>
                    {booking.timeline.assigned && (
                      <p>{new Date(booking.timeline.assigned).toLocaleString()}</p>
                    )}
                  </div>
                </div>

                <div className={`timeline-item ${booking.timeline.pickedUp ? 'completed' : ''}`}>
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h4>Picked Up</h4>
                    {booking.timeline.pickedUp && (
                      <p>{new Date(booking.timeline.pickedUp).toLocaleString()}</p>
                    )}
                  </div>
                </div>

                <div className={`timeline-item ${booking.timeline.completed ? 'completed' : ''}`}>
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h4>Completed</h4>
                    {booking.timeline.completed && (
                      <p>{new Date(booking.timeline.completed).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button onClick={handleRefresh} className="btn-secondary refresh-btn">
              🔄 Refresh Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerTracker;
