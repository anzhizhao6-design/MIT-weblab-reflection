import { Link, useLocation } from 'react-router-dom';
import AccountPanel from './AccountPanel';
import './Navbar.css';

function Navbar({ userId, onSwitch }) {
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
      <AccountPanel userId={userId} onSwitch={onSwitch} />
    </nav>
  );
}

export default Navbar;
