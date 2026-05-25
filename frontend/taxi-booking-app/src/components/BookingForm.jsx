/*
 * Student Information:
 * Name: Xuan Nhi thi Tran
 * Student ID: 23196149
 *
 * File: BookingForm.jsx
 * Description: React component for customer taxi booking form
 * Functions:
 * - BookingForm: Main component for handling customer bookings
 * - handleSubmit: Processes form submission and sends data to backend API
 * - handleDateChange: Updates form data when date changes
 */

import { useState } from 'react';
import './BookingForm.css';

const BookingForm = () => {
  const [formData, setFormData] = useState({
    cname: '',
    phone: '',
    unumber: '',
    snumber: '',
    sbname: '',
    dsbname: '',
    pickup_date: '',
    pickup_time: ''
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [error, setError] = useState('');

  // Updates form data when date changes
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setFormData({ ...formData, pickup_date: selectedDate });
  };

  // Handles form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Submits booking data to backend API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    console.log('Form submitted with data:', formData);

    // Validate required fields
    if (!formData.pickup_date || !formData.pickup_time) {
      const errorMsg = 'Please select both pickup date and time.';
      setError(errorMsg);
      alert(errorMsg);
      console.log('Validation failed: Missing required fields');
      return;
    }

    // Validate that pickup time is not in the past
    const pickupDateTime = new Date(`${formData.pickup_date}T${formData.pickup_time}`);
    const now = new Date();

    console.log('Selected pickup time:', pickupDateTime.toLocaleString());
    console.log('Current time:', now.toLocaleString());

    if (pickupDateTime < now) {
      const errorMsg = 'You cannot book a pickup time in the past. Please select a current or future time.';
      setError(errorMsg);
      alert(errorMsg);
      console.log('Validation failed: Pickup time is in the past');
      return;
    }

    console.log('Validation passed. Proceeding with booking...');

    try {
      console.log('Sending request to backend...');
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setBookingDetails(data);
        setShowConfirmation(true);
      } else {
        const errorMsg = data.message || 'Booking failed. Please try again.';
        setError(errorMsg);
        alert(errorMsg);
        console.log('Booking failed:', errorMsg);
      }
    } catch (err) {
      const errorMsg = 'An error occurred while processing your booking. Please check if the backend server is running.';
      setError(errorMsg);
      alert(errorMsg);
      console.error('Error:', err);
    }
  };

  // Resets form to initial state
  const handleNewBooking = () => {
    setFormData({
      cname: '',
      phone: '',
      unumber: '',
      snumber: '',
      sbname: '',
      dsbname: '',
      pickup_date: '',
      pickup_time: ''
    });
    setShowConfirmation(false);
    setBookingDetails(null);
    setError('');
  };

  if (showConfirmation) {
    return (
      <div className="confirmation-container">
        <h1>Booking Confirmed!</h1>
        <div className="confirmation-details">
          <p><strong>Booking Reference Number:</strong> {bookingDetails.bookingRef}</p>
          <p><strong>Pickup Date:</strong> {bookingDetails.pickup_date}</p>
          <p><strong>Pickup Time:</strong> {bookingDetails.pickup_time}</p>
          <p className="tracking-info">
            💡 Save your booking reference to track your ride status!
          </p>
        </div>
        <div className="confirmation-buttons">
          <button onClick={handleNewBooking} className="btn-primary">Make Another Booking</button>
          <button onClick={() => window.location.href = '/tracker'} className="btn-info">📍 Track My Booking</button>
          <button onClick={() => window.location.href = '/admin'} className="btn-secondary">Go to Admin Page</button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-container">
      <h1>Welcome to the Taxi Booking System</h1>
      <div className="navigation-buttons">
        <button onClick={() => window.location.href = '/tracker'} className="btn-info">📍 Track Booking</button>
        <button onClick={() => window.location.href = '/fare'} className="btn-info">💰 Fare Calculator</button>
        <button onClick={() => window.location.href = '/driver'} className="btn-info">🚗 Driver Dashboard</button>
        <button onClick={() => window.location.href = '/admin'} className="btn-secondary">Admin Page</button>
      </div>
      
      <h2>Booking Page</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="booking-form">
        <h3>Please fill in your booking details below:</h3>
        
        <div className="form-group">
          <label htmlFor="cname">Enter your name *</label>
          <input
            type="text"
            id="cname"
            name="cname"
            value={formData.cname}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Enter your phone number *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            pattern="[0-9]+"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="unumber">Unit Number</label>
          <input
            type="text"
            id="unumber"
            name="unumber"
            value={formData.unumber}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="snumber">Street Number and Name *</label>
          <input
            type="text"
            id="snumber"
            name="snumber"
            value={formData.snumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="sbname">Suburb Name</label>
          <input
            type="text"
            id="sbname"
            name="sbname"
            value={formData.sbname}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="dsbname">Destination Suburb</label>
          <input
            type="text"
            id="dsbname"
            name="dsbname"
            value={formData.dsbname}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="pickup_date">Pickup Date *</label>
          <input
            type="date"
            id="pickup_date"
            name="pickup_date"
            value={formData.pickup_date}
            onChange={handleDateChange}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="pickup_time">Pickup Time *</label>
          <input
            type="time"
            id="pickup_time"
            name="pickup_time"
            value={formData.pickup_time}
            onChange={handleChange}
            required
          />
          <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
            Please select a time that is not in the past
          </small>
        </div>

        <button type="submit" className="btn-primary">Book</button>
      </form>
    </div>
  );
};

export default BookingForm;
