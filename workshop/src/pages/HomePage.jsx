import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  return (
    <div className="home-page">
      <Link to="/hamster" className="home-card">
        <div className="home-card-text">
          <h1 className="home-card-title">Meet Today's Hamster</h1>
          <p className="home-card-subtitle">Click to discover your daily furry friend!</p>
        </div>
        <div className="home-card-arrow">→</div>
      </Link>
    </div>
  );
}

export default HomePage;
