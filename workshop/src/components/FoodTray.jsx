import { useState, useRef, useCallback, useEffect } from 'react';
import foods from '../data/foods';

export default function FoodTray({ hamster, mood, onFeed }) {
  const [hoverTimer, setHoverTimer] = useState(null);
  const [activeFoodId, setActiveFoodId] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleMouseEnter = useCallback(
    (foodId) => {
      setActiveFoodId(foodId);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onFeed(foodId, false, true); // penalty
        timerRef.current = null;
      }, 2000);
    },
    [onFeed]
  );

  const handleMouseLeave = useCallback(() => {
    setActiveFoodId(null);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleClick = useCallback(
    (foodId) => {
      setActiveFoodId(null);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      onFeed(foodId, true, false); // eat
    },
    [onFeed]
  );

  return (
    <div className="food-tray">
      <h3 className="food-tray-title">Food Tray</h3>
      <div className="food-tray-grid">
        {foods.map((food) => {
          const isFavourite = hamster.favouriteFood === food.id;
          const isHovered = activeFoodId === food.id;

          return (
            <button
              key={food.id}
              className={`food-btn ${isFavourite ? 'food-btn-fav' : ''} ${isHovered ? 'food-btn-hover' : ''}`}
              onMouseEnter={() => handleMouseEnter(food.id)}
              onMouseLeave={handleMouseLeave}
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
