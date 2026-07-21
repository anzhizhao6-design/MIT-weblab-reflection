import { Link } from 'react-router-dom';
import AccountDropdown from './UserIdPrompt.jsx';

const Navbar = ({ onVisitAnother }) => {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Hamster Daily</Link>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/hamster">Today's Hamster</Link>
        {onVisitAnother && (
          <button className="navbar-link-btn" onClick={onVisitAnother}>
            Visit Another
          </button>
        )}
        <AccountDropdown />
      </div>
    </nav>
  );
};

export default Navbar;
