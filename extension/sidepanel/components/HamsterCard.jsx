import React from 'react';
import MoodBar from './MoodBar';
import './HamsterCard.css';

const API_BASE = 'https://hamster-daily.onrender.com';

function HamsterCard({ hamster, mood }) {
  const imageUrl = hamster.image
    ? hamster.image.startsWith('http')
      ? hamster.image
      : `${API_BASE}${hamster.image}`
    : `${API_BASE}/hamsters/home.jpg`;

  return (
    <div className="hamster-card">
      <div className="hamster-photo-wrapper">
        <img
          className="hamster-photo"
          src={imageUrl}
          alt={hamster.name}
        />
      </div>
      <h2 className="hamster-name">{hamster.name}</h2>
      <p className="hamster-personality">{hamster.personality}</p>
      <MoodBar mood={mood} />
      <p className="hamster-favourite">
        <span className="favourite-label">Favourite:</span>{' '}
        {hamster.favouriteFood}
      </p>
    </div>
  );
}

export default HamsterCard;
