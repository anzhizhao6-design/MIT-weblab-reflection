import { useState, useCallback, useReducer, useEffect } from 'react';
import hamsters from '../data/hamsters';
import Diary from '../components/Diary';
import FoodTray from '../components/FoodTray';
import ChatBox from '../components/ChatBox';
import './HamsterPage.css';

function getRandomHamster(excludeName) {
  const pool = excludeName
    ? hamsters.filter((h) => h.name !== excludeName)
    : hamsters;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

function moodReducer(state, action) {
  switch (action.type) {
    case 'FEED':
      return Math.min(100, state + action.amount);
    case 'HOVER_PENALTY':
      return Math.max(0, state - 5);
    case 'RESET':
      return 50;
    default:
      return state;
  }
}

function HamsterPage() {
  const [hamster, setHamster] = useState(() => getRandomHamster(null));
  const [mood, dispatch] = useReducer(moodReducer, 50);

  // Reset mood when hamster changes
  useEffect(() => {
    dispatch({ type: 'RESET' });
  }, [hamster]);

  const visitAnother = useCallback(() => {
    setHamster((prev) => getRandomHamster(prev.name));
  }, []);

  const handleFeed = useCallback((amount) => {
    dispatch({ type: 'FEED', amount });
  }, []);

  const handleHoverPenalty = useCallback(() => {
    dispatch({ type: 'HOVER_PENALTY' });
  }, []);

  return (
    <div className="hamster-page">
      {/* Existing F1: Hamster Card */}
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

      {/* F2: Diary */}
      <Diary hamsterName={hamster.name} />

      {/* F2: Food Tray with Mood */}
      <FoodTray
        hamster={hamster}
        mood={mood}
        onFeed={handleFeed}
        onHoverPenalty={handleHoverPenalty}
      />

      {/* F2: Chat */}
      <ChatBox key={hamster.name} hamster={hamster} />

      {/* F1: Visit Another */}
      <button className="visit-another-btn" onClick={visitAnother}>
        Visit Another
      </button>
    </div>
  );
}

export default HamsterPage;
