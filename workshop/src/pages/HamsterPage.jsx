import { useState, useCallback } from 'react';
import hamsters, { foods } from '../data/hamsters';
import './HamsterPage.css';

function getRandomHamster() {
  const index = Math.floor(Math.random() * hamsters.length);
  return hamsters[index];
}

function getFoodInfo(foodId) {
  return foods.find((f) => f.id === foodId) || { label: foodId, emoji: '' };
}

function HamsterPage() {
  const [hamster, setHamster] = useState(() => getRandomHamster());

  const handleVisitAnother = useCallback(() => {
    setHamster(getRandomHamster());
  }, []);

  const food = getFoodInfo(hamster.favouriteFood);

  return (
    <main className="hamster-page">
      <div className="hamster-card">
        <div className="hamster-photo-wrapper">
          <img
            src={hamster.image}
            alt={hamster.name}
            className="hamster-photo"
          />
        </div>

        <div className="hamster-info">
          <h2 className="hamster-name">{hamster.name}</h2>
          <p className="hamster-catchphrase">"{hamster.catchphrase}"</p>

          <div className="hamster-details">
            <div className="detail-item">
              <span className="detail-label">Age</span>
              <span className="detail-value">{hamster.age}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Personality</span>
              <span className="detail-value">{hamster.personality}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Favourite Food</span>
              <span className="detail-value">{food.emoji} {food.label}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Hobby</span>
              <span className="detail-value">{hamster.hobby}</span>
            </div>
          </div>

          <p className="hamster-bio">{hamster.bio}</p>

          <button className="visit-another-btn" onClick={handleVisitAnother}>
            Visit Another
          </button>
        </div>
      </div>
    </main>
  );
}

export default HamsterPage;
