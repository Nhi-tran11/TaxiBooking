import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="nav-container">
        <h1 className="nav-brand">🚕 Taxi Booking</h1>
        <ul className="nav-links">
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              Book Ride
            </Link>
          </li>
          <li>
            <Link to="/tracker" className={location.pathname === '/tracker' ? 'active' : ''}>
              Track Booking
            </Link>
          </li>
          <li>
            <Link to="/fare" className={location.pathname === '/fare' ? 'active' : ''}>
              Calculate Fare
            </Link>
          </li>
          <li>
            <Link to="/driver" className={location.pathname === '/driver' ? 'active' : ''}>
              Driver Dashboard
            </Link>
          </li>
          <li>
            <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
              Admin
            </Link>
          </li>
          <li>
            <Link to="/analytics" className={location.pathname === '/analytics' ? 'active' : ''}>
              Analytics
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
