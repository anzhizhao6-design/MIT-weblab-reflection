import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">🐹 Hamster Daily</Link>
      <div className="navbar-links">
        <Link
          to="/"
          className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
        >
          Home
        </Link>
        <Link
          to="/hamster"
          className={`navbar-link ${location.pathname === '/hamster' ? 'active' : ''}`}
        >
          Today's Hamster
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
