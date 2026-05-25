/*
 * Student Information:
 * Name: Xuan Nhi thi Tran
 * Student ID: 23196149
 *
 * File: DriverDashboard.jsx
 * Description: Driver dashboard for managing bookings and updating status
 */

import { useState, useEffect } from 'react';
import './DriverDashboard.css';
import config from '../config';

const DriverDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState('assigned');
  const [driverName, setDriverName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBookings(filterStatus);
  }, [filterStatus]);

  const fetchBookings = async (status) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${config.API_URL}/api/driver/bookings/${status}`);
      const data = await response.json();
      
      if (data.success) {
        setBookings(data.bookings);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch bookings. Please check if backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingRef, newStatus) => {
    if (newStatus === 'assigned' && !driverName.trim()) {
      alert('Please enter driver name first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`${config.API_URL}/api/driver/bookings/${bookingRef}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          driverName: newStatus === 'assigned' ? driverName : undefined
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(`Booking ${bookingRef} updated to ${newStatus}`);
        fetchBookings(filterStatus);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to update booking status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'unassigned': '#FF9800',
      'assigned': '#2196F3',
      'picked-up': '#9C27B0',
      'en-route': '#FF5722',
      'completed': '#4CAF50'
    };
    return colors[status] || '#757575';
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'unassigned': 'assigned',
      'assigned': 'picked-up',
      'picked-up': 'en-route',
      'en-route': 'completed'
    };
    return statusFlow[currentStatus];
  };

  const getNextStatusLabel = (currentStatus) => {
    const labels = {
      'unassigned': 'Assign to Me',
      'assigned': 'Mark Picked Up',
      'picked-up': 'Start Journey',
      'en-route': 'Complete Ride'
    };
    return labels[currentStatus];
  };

  return (
    <div className="driver-dashboard">
      <h1>Driver Dashboard</h1>
      
      <div className="navigation-buttons">
        <button onClick={() => window.location.href = '/'} className="btn-secondary">
          Back to Home
        </button>
      </div>

      {filterStatus === 'assigned' && (
        <div className="driver-input">
          <label htmlFor="driverName">Driver Name:</label>
          <input
            type="text"
            id="driverName"
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
      )}

      <div className="status-filters">
        <button 
          className={filterStatus === 'assigned' ? 'active' : ''}
          onClick={() => setFilterStatus('assigned')}
        >
          Assigned
        </button>
        <button 
          className={filterStatus === 'picked-up' ? 'active' : ''}
          onClick={() => setFilterStatus('picked-up')}
        >
          Picked Up
        </button>
        <button 
          className={filterStatus === 'en-route' ? 'active' : ''}
          onClick={() => setFilterStatus('en-route')}
        >
          En Route
        </button>
        <button 
          className={filterStatus === 'completed' ? 'active' : ''}
          onClick={() => setFilterStatus('completed')}
        >
          Completed
        </button>
        <button 
          className={filterStatus === 'all' ? 'active' : ''}
          onClick={() => setFilterStatus('all')}
        >
          All
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      {loading && <div className="loading">Loading...</div>}

      <div className="bookings-grid">
        {bookings.length === 0 && !loading && (
          <p className="no-bookings">No bookings found for this status.</p>
        )}
        
        {bookings.map(booking => (
          <div key={booking.bookingRef} className="booking-card">
            <div className="booking-header">
              <h3>{booking.bookingRef}</h3>
              <span 
                className="status-badge" 
                style={{ backgroundColor: getStatusColor(booking.status) }}
              >
                {booking.status}
              </span>
            </div>
            
            <div className="booking-details">
              <p><strong>Customer:</strong> {booking.customer_name}</p>
              <p><strong>Phone:</strong> {booking.phone_number}</p>
              <p><strong>Pickup:</strong> {[booking.unit_number, booking.street_number, booking.suburb].filter(Boolean).join(', ')}</p>
              <p><strong>Destination:</strong> {booking.destination || 'Not specified'}</p>
              <p><strong>Time:</strong> {booking.pickup_date} at {booking.pickup_time}</p>
              {booking.fare && <p><strong>Fare:</strong> ${booking.fare}</p>}
              {booking.driver_name && <p><strong>Driver:</strong> {booking.driver_name}</p>}
            </div>

            {booking.status !== 'completed' && getNextStatus(booking.status) && (
              <button 
                className="btn-primary"
                onClick={() => updateStatus(booking.bookingRef, getNextStatus(booking.status))}
                disabled={loading}
              >
                {getNextStatusLabel(booking.status)}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DriverDashboard;
