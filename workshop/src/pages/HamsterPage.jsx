import { useState, useCallback, useReducer, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import Diary from '../components/Diary';
import FoodTray from '../components/FoodTray';
import ChatBox from '../components/ChatBox';
import ProfileCard from '../components/ProfileCard';
import './HamsterPage.css';

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
  const { userId } = useUser();
  const [hamster, setHamster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mood, dispatch] = useReducer(moodReducer, 50);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch random hamster from API
  const fetchHamster = useCallback(async (excludeName) => {
    setLoading(true);
    try {
      let hamsterData = null;
      for (let i = 0; i < 20; i++) {
        const res = await fetch('/api/hamsters/random');
        const data = await res.json();
        if (!excludeName || data.name !== excludeName) {
          hamsterData = data;
          break;
        }
      }
      if (hamsterData) {
        setHamster(hamsterData);
      }
    } catch {
      // If API fails, try again
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchHamster(null);
  }, [fetchHamster]);

  // Record visit when hamster changes — wait for POST then refresh ProfileCard
  useEffect(() => {
    if (hamster && userId) {
      fetch('/api/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, hamsterName: hamster.name }),
      })
        .then(() => setRefreshKey((k) => k + 1))
        .catch(() => {});
    }
  }, [hamster, userId]);

  // Reset mood when hamster changes
  useEffect(() => {
    dispatch({ type: 'RESET' });
  }, [hamster]);

  const visitAnother = useCallback(() => {
    if (hamster) {
      fetchHamster(hamster.name);
    }
  }, [hamster, fetchHamster]);

  const handleFeed = useCallback((amount) => {
    dispatch({ type: 'FEED', amount });
  }, []);

  const handleHoverPenalty = useCallback(() => {
    dispatch({ type: 'HOVER_PENALTY' });
  }, []);

  const handleFeedRecorded = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  if (loading || !hamster) {
    return (
      <div className="hamster-page">
        <div className="hamster-loading">Finding your hamster...</div>
      </div>
    );
  }

  return (
    <div className="hamster-page">
      {/* F1: Hamster Card */}
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

      {/* F3: Profile Card */}
      <ProfileCard userId={userId} hamsterName={hamster.name} refreshKey={refreshKey} />

      {/* F2: Diary */}
      <Diary hamsterName={hamster.name} />

      {/* F2: Food Tray with Mood */}
      <FoodTray
        hamster={hamster}
        mood={mood}
        onFeed={handleFeed}
        onHoverPenalty={handleHoverPenalty}
        userId={userId}
        onFeedRecorded={handleFeedRecorded}
      />

      {/* F2: Chat */}
      <ChatBox key={hamster.name} hamster={hamster} userId={userId} />

      {/* F1: Visit Another */}
      <button className="visit-another-btn" onClick={visitAnother}>
        Visit Another
      </button>
    </div>
  );
}

export default HamsterPage;
