import { useState, useCallback } from 'react';
import hamsters from '../data/hamsters';
import './HamsterPage.css';

function getRandomHamster(excludeName) {
  const pool = excludeName
    ? hamsters.filter((h) => h.name !== excludeName)
    : hamsters;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

function HamsterPage() {
  const [hamster, setHamster] = useState(() => getRandomHamster(null));

  const visitAnother = useCallback(() => {
    setHamster((prev) => getRandomHamster(prev.name));
  }, []);

  return (
    <div className="hamster-page">
      <div className="hamster-card">
        <div className="hamster-photo-wrapper">
          <img
            className="hamster-photo"
            src={hamster.image}
            alt={hamster.name}
          />
        </div>
        <div className="hamster-info">
          <h2 className="hamster-name">{hamster.name}</h2>
          <div className="hamster-details">
            <div className="hamster-detail">
              <span className="detail-label">Age</span>
              <span className="detail-value">{hamster.age} year{hamster.age > 1 ? 's' : ''} old</span>
            </div>
            <div className="hamster-detail">
              <span className="detail-label">Personality</span>
              <span className="detail-value">{hamster.personality}</span>
            </div>
            <div className="hamster-detail">
              <span className="detail-label">Favourite Food</span>
              <span className="detail-value">{hamster.favouriteFood}</span>
            </div>
            <div className="hamster-detail">
              <span className="detail-label">Hobby</span>
              <span className="detail-value">{hamster.hobby}</span>
            </div>
          </div>
          <p className="hamster-bio">{hamster.bio}</p>
        </div>
      </div>
      <button className="visit-another-btn" onClick={visitAnother}>
        Visit Another
      </button>
    </div>
  );
}

export default HamsterPage;
