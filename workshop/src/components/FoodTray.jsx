import { useState, useRef, useCallback } from 'react';
import foods from '../data/foods';
import MoodBar from './MoodBar';
import './FoodTray.css';

function getReactionText(change, foodName, hamsterName) {
  if (change < 0) {
    const reactions = [
      `Hmm... ${hamsterName} isn't sure about ${foodName}...`,
      `${hamsterName} gives ${foodName} a suspicious sniff...`,
      `${hamsterName} stares at the ${foodName} skeptically...`,
    ];
    return reactions[Math.floor(Math.random() * reactions.length)];
  }
  const reactions = [
    `${hamsterName} loves ${foodName}! 😍`,
    `Yum! ${hamsterName} is so happy! ✨`,
    `${hamsterName} squeaks with joy! 🎉`,
    `Delicious! ${hamsterName} can't get enough!`,
  ];
  return reactions[Math.floor(Math.random() * reactions.length)];
}

function FoodTray({ hamster, mood, onFeed, onHoverPenalty, userId, onFeedRecorded }) {
  const [reaction, setReaction] = useState(null);
  const [favouriteFed, setFavouriteFed] = useState(false);
  const reactionTimer = useRef(null);
  const hoverTimers = useRef({});

  const clearReaction = useCallback(() => {
    if (reactionTimer.current) clearTimeout(reactionTimer.current);
    reactionTimer.current = setTimeout(() => setReaction(null), 2500);
  }, []);

  const handleMouseEnter = useCallback(
    (foodId) => {
      if (hoverTimers.current[foodId]) return;

      hoverTimers.current[foodId] = setTimeout(() => {
        onHoverPenalty();
        const food = foods.find((f) => f.id === foodId);
        setReaction(
          `${hamster.name} is getting impatient with ${food.label}... (-5)`
        );
        clearReaction();
        hoverTimers.current[foodId] = null;
      }, 2000);
    },
    [hamster.name, onHoverPenalty, clearReaction]
  );

  const handleMouseLeave = useCallback((foodId) => {
    if (hoverTimers.current[foodId]) {
      clearTimeout(hoverTimers.current[foodId]);
      hoverTimers.current[foodId] = null;
    }
  }, []);

  const handleClick = useCallback(
    (foodId) => {
      if (hoverTimers.current[foodId]) {
        clearTimeout(hoverTimers.current[foodId]);
        hoverTimers.current[foodId] = null;
      }

      const isFavourite = foodId === hamster.favouriteFood;
      const change = isFavourite ? hamster.moodBoost : 3;

      if (isFavourite && !favouriteFed) {
        setFavouriteFed(true);
      }

      onFeed(change);

      // F3: Record feed to API (fire-and-forget)
      if (userId) {
        fetch('/api/feed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            hamsterName: hamster.name,
            foodId,
            isFavourite,
            moodChange: change,
          }),
        })
          .then(() => {
            if (onFeedRecorded) onFeedRecorded();
          })
          .catch(() => {});
      }

      const food = foods.find((f) => f.id === foodId);
      setReaction(getReactionText(change, food.label, hamster.name));
      clearReaction();
    },
    [hamster, onFeed, clearReaction, favouriteFed, userId]
  );

  return (
    <div className="food-tray-section">
      <h3 className="section-title">🍽️ Food Tray</h3>
      <MoodBar mood={mood} />
      {reaction && <div className="food-reaction">{reaction}</div>}
      <div className="food-grid">
        {foods.map((food) => {
          const isFavourite = food.id === hamster.favouriteFood;
          return (
            <button
              key={food.id}
              className={`food-btn ${isFavourite ? 'food-btn-favourite' : ''}`}
              onMouseEnter={() => handleMouseEnter(food.id)}
              onMouseLeave={() => handleMouseLeave(food.id)}
              onClick={() => handleClick(food.id)}
            >
              <span className="food-emoji">{food.emoji}</span>
              <span className="food-label">{food.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default FoodTray;
