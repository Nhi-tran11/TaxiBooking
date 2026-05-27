/*
 * Student Information:
 * Name: Xuan Nhi thi Tran
 * Student ID: 23196149
 *
 * File: Analytics.jsx
 * Description: Admin analytics dashboard with statistics and charts
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Analytics.css';
import config from '../config';

const Analytics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [routes, setRoutes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');

    try {
      const [statsRes, routesRes] = await Promise.all([
        fetch(`${config.API_URL}/api/analytics/stats`),
        fetch(`${config.API_URL}/api/analytics/popular-routes`)
      ]);

      const statsData = await statsRes.json();
      const routesData = await routesRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (routesData.success) setRoutes(routesData.routes);

    } catch (err) {
      setError('Failed to fetch analytics. Please check if backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-dashboard">
        <h1>Analytics Dashboard</h1>
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-dashboard">
        <h1>Analytics Dashboard</h1>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <h1>📊 Analytics Dashboard</h1>
      
      <div className="navigation-buttons">
        <button onClick={() => navigate('/admin')} className="btn-secondary">
          Back to Admin
        </button>
        <button onClick={fetchAnalytics} className="btn-primary">
          🔄 Refresh Data
        </button>
      </div>

      {/* Key Metrics */}
      {stats && (
        <div className="metrics-grid">
          <div className="metric-card purple">
            <div className="metric-icon">📅</div>
            <div className="metric-value">{stats.todayBookings}</div>
            <div className="metric-label">Today's Bookings</div>
          </div>

          <div className="metric-card green">
            <div className="metric-icon">✅</div>
            <div className="metric-value">{stats.completedBookings}</div>
            <div className="metric-label">Completed Today</div>
          </div>

          <div className="metric-card pink">
            <div className="metric-icon">📈</div>
            <div className="metric-value">{stats.completionRate}%</div>
            <div className="metric-label">Completion Rate</div>
          </div>
        </div>
      )}

      {/* Status Distribution */}
      {stats && (
        <div className="dashboard-section">
          <h2>Bookings by Status</h2>
          <div className="status-grid">
            <div className="status-item">
              <div className="status-bar" style={{ width: `${stats.todayBookings > 0 ? (stats.byStatus.unassigned / stats.todayBookings) * 100 : 0}%`, backgroundColor: '#FF9800' }}></div>
              <div className="status-info">
                <span className="status-name">Unassigned</span>
                <span className="status-count">{stats.byStatus.unassigned}</span>
              </div>
            </div>

            <div className="status-item">
              <div className="status-bar" style={{ width: `${stats.todayBookings > 0 ? (stats.byStatus.assigned / stats.todayBookings) * 100 : 0}%`, backgroundColor: '#2196F3' }}></div>
              <div className="status-info">
                <span className="status-name">Assigned</span>
                <span className="status-count">{stats.byStatus.assigned}</span>
              </div>
            </div>

            <div className="status-item">
              <div className="status-bar" style={{ width: `${stats.todayBookings > 0 ? (stats.byStatus['picked-up'] / stats.todayBookings) * 100 : 0}%`, backgroundColor: '#9C27B0' }}></div>
              <div className="status-info">
                <span className="status-name">Picked Up</span>
                <span className="status-count">{stats.byStatus['picked-up']}</span>
              </div>
            </div>

            <div className="status-item">
              <div className="status-bar" style={{ width: `${stats.todayBookings > 0 ? (stats.byStatus['en-route'] / stats.todayBookings) * 100 : 0}%`, backgroundColor: '#FF5722' }}></div>
              <div className="status-info">
                <span className="status-name">En Route</span>
                <span className="status-count">{stats.byStatus['en-route']}</span>
              </div>
            </div>

            <div className="status-item">
              <div className="status-bar" style={{ width: `${stats.todayBookings > 0 ? (stats.byStatus.completed / stats.todayBookings) * 100 : 0}%`, backgroundColor: '#4CAF50' }}></div>
              <div className="status-info">
                <span className="status-name">Completed</span>
                <span className="status-count">{stats.byStatus.completed}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popular Routes */}
      {routes && (
        <div className="dashboard-row">
          <div className="dashboard-section">
            <h2>🏆 Top Pickup Locations</h2>
            <div className="ranking-list">
              {routes.topPickups.slice(0, 5).map((pickup, index) => (
                <div key={pickup.suburb} className="ranking-item">
                  <span className="rank">#{index + 1}</span>
                  <span className="location">{pickup.suburb}</span>
                  <span className="count">{pickup.count} bookings</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-section">
            <h2>🎯 Top Destinations</h2>
            <div className="ranking-list">
              {routes.topDestinations.slice(0, 5).map((dest, index) => (
                <div key={dest.destination} className="ranking-item">
                  <span className="rank">#{index + 1}</span>
                  <span className="location">{dest.destination}</span>
                  <span className="count">{dest.count} bookings</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
