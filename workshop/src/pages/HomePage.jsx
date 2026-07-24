import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-hero" onClick={() => navigate('/hamster')}>
      <div className="home-hero-overlay">
        <div className="home-hero-content">
          <h1 className="home-hero-text">Meet Today's Hamster</h1>
          <span className="home-hero-arrow">→</span>
        </div>
      </div>
    </div>
  );
}
