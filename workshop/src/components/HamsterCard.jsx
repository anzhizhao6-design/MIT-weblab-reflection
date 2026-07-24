export default function HamsterCard({ hamster, onVisitAnother }) {
  const foodLabel = hamster.favouriteFood
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <div className="hamster-card">
      <div className="hamster-photo-wrapper">
        <img src={hamster.image} alt={hamster.name} className="hamster-photo" />
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
          <span className="trait-value">{foodLabel}</span>
        </span>
        <span className="hamster-trait">
          <span className="trait-label">Hobby</span>
          <span className="trait-value">{hamster.hobby}</span>
        </span>
      </div>

      <p className="hamster-bio">{hamster.bio}</p>
      <p className="hamster-catchphrase">&ldquo;{hamster.catchphrase}&rdquo;</p>

      <button className="visit-another-btn" onClick={onVisitAnother}>
        Visit Another
      </button>
    </div>
  );
}
