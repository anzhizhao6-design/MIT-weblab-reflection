import './MoodBar.css';

const MOOD_LEVELS = [
  { min: 0, max: 19, label: 'Hungry 😡', color: '#e74c3c' },
  { min: 20, max: 39, label: 'Sad 😢', color: '#e67e22' },
  { min: 40, max: 59, label: 'Neutral 😐', color: '#f1c40f' },
  { min: 60, max: 79, label: 'Happy 😊', color: '#2ecc71' },
  { min: 80, max: 100, label: 'Overjoyed 🤩', color: '#9b59b6' },
];

function getMoodLevel(mood) {
  return MOOD_LEVELS.find((l) => mood >= l.min && mood <= l.max);
}

function MoodBar({ mood }) {
  const level = getMoodLevel(mood);
  const percentage = Math.max(0, Math.min(100, mood));

  return (
    <div className="mood-bar-container">
      <div className="mood-bar-label">
        <span>Mood</span>
        <span className="mood-level-text" style={{ color: level.color }}>
          {level.label}
        </span>
      </div>
      <div className="mood-bar-track">
        <div
          className="mood-bar-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: level.color,
          }}
        />
      </div>
      <div className="mood-bar-value">{mood}/100</div>
    </div>
  );
}

export { MOOD_LEVELS, getMoodLevel };
export default MoodBar;
