import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AccountPanel from './AccountPanel';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const [showAccount, setShowAccount] = useState(false);

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
          <li className="navbar-account-li">
            <button
              className={`navbar-link navbar-account-btn ${showAccount ? 'active' : ''}`}
              onClick={() => setShowAccount((v) => !v)}
            >
              👤 Account
            </button>
            {showAccount && (
              <div className="navbar-account-dropdown">
                <AccountPanel />
              </div>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
