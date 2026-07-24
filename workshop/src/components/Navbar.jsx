import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🐹 Hamster Daily
        </Link>
        <ul className="navbar-links">
          <li>
            <Link
              to="/"
              className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/hamster"
              className={`navbar-link ${location.pathname === '/hamster' ? 'active' : ''}`}
            >
              Today's Hamster
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
