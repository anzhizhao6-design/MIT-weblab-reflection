import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  return (
    <main className="homepage">
      <Link to="/hamster" className="homepage-card">
        <div className="homepage-overlay">
          <div className="homepage-text">
            <h1>Meet Today's Hamster</h1>
          </div>
          <div className="homepage-arrow">
            <span className="arrow-icon">&rarr;</span>
          </div>
        </div>
      </Link>
    </main>
  );
}

export default HomePage;
