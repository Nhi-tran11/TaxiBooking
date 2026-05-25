/*
 * Student Information:
 * Name: Xuan Nhi thi Tran
 * Student ID: 23196149
 *
 * File: FareCalculator.jsx
 * Description: Fare calculator for estimating taxi fares
 */

import { useState, useEffect } from 'react';
import './FareCalculator.css';
import config from '../config';

const FareCalculator = () => {
  const [suburbs, setSuburbs] = useState([]);
  const [formData, setFormData] = useState({
    pickupSuburb: '',
    destinationSuburb: '',
    pickupDate: '',
    pickupTime: ''
  });
  const [fareResult, setFareResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSuburbs();
  }, []);

  const fetchSuburbs = async () => {
    try {
      const response = await fetch(`${config.API_URL}/api/fare/suburbs`);
      const data = await response.json();
      
      if (data.success) {
        setSuburbs(data.suburbs);
      }
    } catch (err) {
      console.error('Failed to fetch suburbs:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    
    if (!formData.pickupSuburb || !formData.destinationSuburb) {
      setError('Please select both pickup and destination suburbs');
      return;
    }

    setLoading(true);
    setError('');
    setFareResult(null);

    try {
      const response = await fetch(`${config.API_URL}/api/fare/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setFareResult(data.fare);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to calculate fare. Please check if backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fare-calculator">
      <h1>Fare Calculator</h1>
      
      <div className="navigation-buttons">
        <button onClick={() => window.location.href = '/'} className="btn-secondary">
          Back to Home
        </button>
      </div>

      <div className="calculator-container">
        <form onSubmit={handleCalculate} className="calculator-form">
          <h2>Estimate Your Fare</h2>
          
          <div className="form-group">
            <label htmlFor="pickupSuburb">Pickup Suburb *</label>
            <select
              id="pickupSuburb"
              name="pickupSuburb"
              value={formData.pickupSuburb}
              onChange={handleChange}
              required
            >
              <option value="">Select pickup suburb</option>
              {suburbs.map(suburb => (
                <option key={suburb.name} value={suburb.name}>
                  {suburb.name} (Zone {suburb.zone})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="destinationSuburb">Destination Suburb *</label>
            <select
              id="destinationSuburb"
              name="destinationSuburb"
              value={formData.destinationSuburb}
              onChange={handleChange}
              required
            >
              <option value="">Select destination suburb</option>
              {suburbs.map(suburb => (
                <option key={suburb.name} value={suburb.name}>
                  {suburb.name} (Zone {suburb.zone})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pickupDate">Pickup Date (Optional)</label>
              <input
                type="date"
                id="pickupDate"
                name="pickupDate"
                value={formData.pickupDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="pickupTime">Pickup Time (Optional)</label>
              <input
                type="time"
                id="pickupTime"
                name="pickupTime"
                value={formData.pickupTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate Fare'}
          </button>

          <div className="info-box">
            <h4>ℹ️ Pricing Information</h4>
            <ul>
              <li><strong>Base Fare:</strong> $5.00</li>
              <li><strong>Per Kilometer:</strong> $2.50</li>
              <li><strong>Peak Hour Surcharge:</strong> +50% (Weekdays 7-9am, 5-7pm)</li>
              <li><strong>Night Time Surcharge:</strong> +30% (10pm-6am)</li>
              <li><strong>Zone Multipliers:</strong> Zone 1 (1.0x), Zone 2 (1.1x), Zone 3 (1.2x)</li>
            </ul>
          </div>
        </form>

        {error && <div className="error-message">{error}</div>}

        {fareResult && (
          <div className="fare-result">
            <div className="result-header">
              <h2>Estimated Fare</h2>
              <div className="total-fare">
                ${fareResult.total.toFixed(2)} <span className="currency">{fareResult.currency}</span>
              </div>
            </div>

            <div className="route-info">
              <div className="route-item">
                <span className="icon">📍</span>
                <div>
                  <div className="route-label">From</div>
                  <div className="route-value">{fareResult.route.from}</div>
                </div>
              </div>
              <div className="route-arrow">→</div>
              <div className="route-item">
                <span className="icon">🎯</span>
                <div>
                  <div className="route-label">To</div>
                  <div className="route-value">{fareResult.route.to}</div>
                </div>
              </div>
            </div>

            <div className="route-stats">
              <div className="stat-item">
                <span className="stat-icon">🚗</span>
                <div className="stat-value">{fareResult.route.distance}</div>
                <div className="stat-label">Distance</div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">⏱️</span>
                <div className="stat-value">{fareResult.route.estimatedTime}</div>
                <div className="stat-label">Est. Time</div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🏷️</span>
                <div className="stat-value">Zone {fareResult.breakdown.zone}</div>
                <div className="stat-label">Zone</div>
              </div>
            </div>

            <div className="breakdown-section">
              <h3>Fare Breakdown</h3>
              <div className="breakdown-items">
                <div className="breakdown-item">
                  <span>Base Fare</span>
                  <span>${fareResult.breakdown.baseFare.toFixed(2)}</span>
                </div>
                <div className="breakdown-item">
                  <span>Distance ({fareResult.breakdown.distance} km)</span>
                  <span>${fareResult.breakdown.distanceFare.toFixed(2)}</span>
                </div>
                <div className="breakdown-item">
                  <span>Zone Multiplier (x{fareResult.breakdown.zoneMultiplier})</span>
                  <span>Applied</span>
                </div>
                {fareResult.breakdown.multipliers.map((mult, idx) => (
                  <div key={idx} className="breakdown-item surcharge">
                    <span>{mult.type} (x{mult.multiplier})</span>
                    <span>+{((mult.multiplier - 1) * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="disclaimer">
              <strong>Note:</strong> This is an estimated fare. Actual fare may vary based on traffic conditions and route taken.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FareCalculator;
