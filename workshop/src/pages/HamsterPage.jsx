import { useState, useCallback, useEffect } from 'react';
import hamsters, { foods } from '../data/hamsters';
import Diary from '../components/Diary';
import FoodTray from '../components/FoodTray';
import MoodBar from '../components/MoodBar';
import ChatBox from '../components/ChatBox';
import ProfileCard from '../components/ProfileCard';
import './HamsterPage.css';

function getRandomHamster() {
  const index = Math.floor(Math.random() * hamsters.length);
  return hamsters[index];
}

function getFoodInfo(foodId) {
  return foods.find((f) => f.id === foodId) || { label: foodId, emoji: '' };
}

function HamsterPage({ userId }) {
  const [hamster, setHamster] = useState(() => getRandomHamster());
  const [mood, setMood] = useState(50);
  const [feedTrigger, setFeedTrigger] = useState(0);

  // Record visit on mount + hamster change
  useEffect(() => {
    if (!userId) return;
    fetch('/api/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, hamsterName: hamster.name }),
    }).catch(() => {});
  }, [hamster.name, userId]);

  const handleVisitAnother = useCallback(() => {
    setHamster(getRandomHamster());
    setMood(50);
    setFeedTrigger(0);
  }, []);

  const handleFeed = useCallback((foodId, isFavourite) => {
    setMood((prev) => {
      const boost = isFavourite ? hamster.moodBoost : 3;
      return Math.max(0, Math.min(100, prev + boost));
    });

    // Record feed
    if (userId) {
      fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, hamsterName: hamster.name, foodId, isFavourite }),
      })
        .then(() => setFeedTrigger((t) => t + 1))
        .catch(() => {});
    }
  }, [hamster.moodBoost, hamster.name, userId]);

  const handleHoverPenalty = useCallback(() => {
    setMood((prev) => Math.max(0, Math.min(100, prev - 5)));
  }, []);

  const food = getFoodInfo(hamster.favouriteFood);

  return (
    <main className="hamster-page">
      <div className="hamster-layout">
        {/* Hamster Card */}
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

        {/* F3: Profile Card */}
        <ProfileCard userId={userId} hamsterName={hamster.name} trigger={feedTrigger} />

        {/* F2 Sections */}
        <Diary hamster={hamster} />

        <FoodTray
          hamster={hamster}
          onFeed={handleFeed}
          onHoverPenalty={handleHoverPenalty}
        />

        <MoodBar mood={mood} />

        <ChatBox hamster={hamster} userId={userId} />
      </div>
    </main>
  );
}

export default HamsterPage;
