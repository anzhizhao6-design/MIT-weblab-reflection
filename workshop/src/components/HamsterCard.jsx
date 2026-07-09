/**
 * HamsterCard — shows the hamster's name, quote, big emoji, mood, and characteristic.
 * Props:
 *   - hamster: object with { name, emoji, quote, characteristic }
 *   - moodLabel: string like "Happy 😊"
 */
const HamsterCard = ({ hamster, moodLabel }) => {
  return (
    <div className="card">
      <h2>Meet {hamster.name}!</h2>
      <div className="emoji-big">{hamster.emoji}</div>
      <p className="quote">"{hamster.quote}"</p>
    </div>
  );
};

export default HamsterCard;
