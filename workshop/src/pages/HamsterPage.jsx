import { useState, useCallback } from 'react';
import hamsters from '../data/hamsters';

export default function HamsterPage() {
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.floor(Math.random() * hamsters.length)
  );

  const visitAnother = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * hamsters.length);
      } while (newIndex === prevIndex && hamsters.length > 1);
      return newIndex;
    });
  }, []);

  const hamster = hamsters[currentIndex];

  return (
    <div className="hamster-profile">
      <div className="hamster-card">
        <div className="hamster-photo-wrapper">
          <img
            src={hamster.image}
            alt={hamster.name}
            className="hamster-photo"
          />
        </div>

        <h2 className="hamster-name">{hamster.name}</h2>
        <p className="hamster-age">Age {hamster.age}</p>

        <div className="hamster-traits">
          <span className="hamster-trait">
            <span className="trait-label">Personality</span>
            <span className="trait-value">{hamster.personality}</span>
          </span>
          <span className="hamster-trait">
            <span className="trait-label">Favourite Food</span>
            <span className="trait-value">{hamster.favouriteFood}</span>
          </span>
          <span className="hamster-trait">
            <span className="trait-label">Hobby</span>
            <span className="trait-value">{hamster.hobby}</span>
          </span>
        </div>

        <p className="hamster-bio">{hamster.bio}</p>
        <p className="hamster-catchphrase">"{hamster.catchphrase}"</p>

        <button className="visit-another-btn" onClick={visitAnother}>
          Visit Another
        </button>
      </div>
    </div>
  );
}
