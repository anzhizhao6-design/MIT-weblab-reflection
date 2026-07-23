import './MoodBar.css';

function getMoodLevel(mood) {
  if (mood <= 19) return { level: 'Hungry', emoji: '😡' };
  if (mood <= 39) return { level: 'Sad', emoji: '😢' };
  if (mood <= 59) return { level: 'Neutral', emoji: '😐' };
  if (mood <= 79) return { level: 'Happy', emoji: '😊' };
  return { level: 'Overjoyed', emoji: '🤩' };
}

function getBarColor(mood) {
  if (mood <= 19) return '#e74c3c';
  if (mood <= 39) return '#f39c12';
  if (mood <= 59) return '#f1c40f';
  if (mood <= 79) return '#2ecc71';
  return '#9b59b6';
}

function MoodBar({ mood }) {
  const clamped = Math.max(0, Math.min(100, mood));
  const { level, emoji } = getMoodLevel(clamped);
  const barColor = getBarColor(clamped);

  return (
    <section className="mood-section">
      <div className="mood-header">
        <span className="mood-label">Mood</span>
        <span className="mood-value">{emoji} {level}</span>
      </div>
      <div className="mood-bar-track">
        <div
          className="mood-bar-fill"
          style={{
            width: `${clamped}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
      <span className="mood-number">{clamped}/100</span>
    </section>
  );
}

export default MoodBar;
