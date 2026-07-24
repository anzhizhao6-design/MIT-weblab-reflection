import AccountPanel from './AccountPanel';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ onUserIdChange }) {
  const location = useLocation();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🐹 Hamster Daily
      </Link>
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
      <AccountPanel onUserIdChange={onUserIdChange} />
    </nav>
  );
}
