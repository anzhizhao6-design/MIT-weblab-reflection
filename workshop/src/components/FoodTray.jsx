import { useRef, useCallback } from 'react';
import { foods } from '../data/hamsters';
import './FoodTray.css';

function FoodTray({ hamster, onFeed, onHoverPenalty }) {
  const timers = useRef({});

  const handleMouseEnter = useCallback((foodId) => {
    timers.current[foodId] = setTimeout(() => {
      onHoverPenalty();
      delete timers.current[foodId];
    }, 2000);
  }, [onHoverPenalty]);

  const handleMouseLeave = useCallback((foodId) => {
    if (timers.current[foodId]) {
      clearTimeout(timers.current[foodId]);
      delete timers.current[foodId];
    }
  }, []);

  const handleClick = useCallback((foodId, isFavourite) => {
    if (timers.current[foodId]) {
      clearTimeout(timers.current[foodId]);
      delete timers.current[foodId];
    }
    onFeed(foodId, isFavourite);
  }, [onFeed]);

  return (
    <section className="foodtray-section">
      <h3 className="foodtray-title">Food Tray</h3>
      <div className="foodtray-grid">
        {foods.map((food) => {
          const isFavourite = food.id === hamster.favouriteFood;
          return (
            <button
              key={food.id}
              className={`food-btn ${isFavourite ? 'favourite' : ''}`}
              onMouseEnter={() => handleMouseEnter(food.id)}
              onMouseLeave={() => handleMouseLeave(food.id)}
              onClick={() => handleClick(food.id, isFavourite)}
            >
              <span className="food-emoji">{food.emoji}</span>
              <span className="food-name">{food.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default FoodTray;
