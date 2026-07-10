/**
 * Navbar — shared navigation bar with brand and links.
 * Props: none
 */
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">🐹 Hamster Daily</Link>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/hamster">Today's Hamster</Link>
        <a href="#about">About</a>
      </div>
    </nav>
  );
};

export default Navbar;
