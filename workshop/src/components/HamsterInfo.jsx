/**
 * HamsterInfo — shows the hamster's food, hobby, and mood score bar.
 * Props:
 *   - hamster: object with { name, favouriteFood, hobby }
 *   - moodLabel: string like "Happy 😊"
 *   - moodScore: number 0-100
 */
const HamsterInfo = ({ hamster, moodLabel, moodScore }) => {
  return (
    <div className="card">
      <h2>{hamster.name}'s Info</h2>
      <p>
        <strong>Favourite Food: </strong> {hamster.favouriteFood}
      </p>
      <p>
        <strong>Hobby: </strong> {hamster.hobby}
      </p>
      <p>
        <strong>Characteristic: </strong> {hamster.characteristic}
      </p>

      {/* Mood bar */}
      <div className="mood-section">
        <p className="mood-label"> Mood: {moodLabel}</p>
        <div className="mood-bar-bg">
          <div className="mood-bar-fill" style={{ width: `${moodScore}%` }} />
        </div>
        <p className="mood-number">{moodScore} / 100</p>
      </div>
    </div>
  );
};

export default HamsterInfo;
