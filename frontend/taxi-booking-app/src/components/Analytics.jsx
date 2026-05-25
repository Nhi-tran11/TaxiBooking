/*
 * Student Information:
 * Name: Xuan Nhi thi Tran
 * Student ID: 23196149
 *
 * File: Analytics.jsx
 * Description: Admin analytics dashboard with statistics and charts
 */

import { useState, useEffect } from 'react';
import './Analytics.css';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [routes, setRoutes] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');

    try {
      const [statsRes, routesRes, revenueRes] = await Promise.all([
        fetch('http://localhost:5000/api/analytics/stats'),
        fetch('http://localhost:5000/api/analytics/popular-routes'),
        fetch('http://localhost:5000/api/analytics/revenue')
      ]);

      const statsData = await statsRes.json();
      const routesData = await routesRes.json();
      const revenueData = await revenueRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (routesData.success) setRoutes(routesData.routes);
      if (revenueData.success) setRevenue(revenueData.revenue);

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
        <button onClick={() => window.location.href = '/admin'} className="btn-secondary">
          Back to Admin
        </button>
        <button onClick={fetchAnalytics} className="btn-primary">
          🔄 Refresh Data
        </button>
      </div>

      {/* Key Metrics */}
      {stats && (
        <div className="metrics-grid">
          <div className="metric-card blue">
            <div className="metric-icon">📦</div>
            <div className="metric-value">{stats.totalBookings}</div>
            <div className="metric-label">Total Bookings</div>
          </div>

          <div className="metric-card green">
            <div className="metric-icon">✅</div>
            <div className="metric-value">{stats.completedBookings}</div>
            <div className="metric-label">Completed</div>
          </div>

          <div className="metric-card purple">
            <div className="metric-icon">📅</div>
            <div className="metric-value">{stats.todayBookings}</div>
            <div className="metric-label">Today's Bookings</div>
          </div>

          <div className="metric-card orange">
            <div className="metric-icon">💰</div>
            <div className="metric-value">${stats.totalRevenue.toFixed(2)}</div>
            <div className="metric-label">Total Revenue</div>
          </div>

          <div className="metric-card teal">
            <div className="metric-icon">💵</div>
            <div className="metric-value">${stats.avgFare.toFixed(2)}</div>
            <div className="metric-label">Avg Fare</div>
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
              <div className="status-bar" style={{ width: `${(stats.byStatus.unassigned / stats.totalBookings) * 100}%`, backgroundColor: '#FF9800' }}></div>
              <div className="status-info">
                <span className="status-name">Unassigned</span>
                <span className="status-count">{stats.byStatus.unassigned}</span>
              </div>
            </div>

            <div className="status-item">
              <div className="status-bar" style={{ width: `${(stats.byStatus.assigned / stats.totalBookings) * 100}%`, backgroundColor: '#2196F3' }}></div>
              <div className="status-info">
                <span className="status-name">Assigned</span>
                <span className="status-count">{stats.byStatus.assigned}</span>
              </div>
            </div>

            <div className="status-item">
              <div className="status-bar" style={{ width: `${(stats.byStatus['picked-up'] / stats.totalBookings) * 100}%`, backgroundColor: '#9C27B0' }}></div>
              <div className="status-info">
                <span className="status-name">Picked Up</span>
                <span className="status-count">{stats.byStatus['picked-up']}</span>
              </div>
            </div>

            <div className="status-item">
              <div className="status-bar" style={{ width: `${(stats.byStatus['en-route'] / stats.totalBookings) * 100}%`, backgroundColor: '#FF5722' }}></div>
              <div className="status-info">
                <span className="status-name">En Route</span>
                <span className="status-count">{stats.byStatus['en-route']}</span>
              </div>
            </div>

            <div className="status-item">
              <div className="status-bar" style={{ width: `${(stats.byStatus.completed / stats.totalBookings) * 100}%`, backgroundColor: '#4CAF50' }}></div>
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

      {/* Revenue Chart */}
      {revenue && revenue.daily.length > 0 && (
        <div className="dashboard-section">
          <h2>💰 Daily Revenue (Last 7 Days)</h2>
          <div className="revenue-chart">
            {revenue.daily.map((day) => {
              const maxRevenue = Math.max(...revenue.daily.map(d => d.revenue));
              const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
              
              return (
                <div key={day.date} className="chart-bar">
                  <div className="bar-container">
                    <div 
                      className="bar" 
                      style={{ height: `${height}%` }}
                      title={`$${day.revenue.toFixed(2)}`}
                    ></div>
                  </div>
                  <div className="bar-label">
                    <div className="bar-date">{new Date(day.date).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })}</div>
                    <div className="bar-value">${day.revenue.toFixed(2)}</div>
                    <div className="bar-bookings">{day.bookings} rides</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Revenue by Status */}
      {revenue && revenue.byStatus.length > 0 && (
        <div className="dashboard-section">
          <h2>📊 Revenue by Status</h2>
          <div className="revenue-table">
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Bookings</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {revenue.byStatus.map((item) => (
                  <tr key={item.status}>
                    <td className="status-cell">{item.status}</td>
                    <td>{item.bookings}</td>
                    <td className="revenue-cell">${item.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
