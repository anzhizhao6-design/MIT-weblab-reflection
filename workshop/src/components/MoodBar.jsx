export default function MoodBar({ mood }) {
  const clamped = Math.max(0, Math.min(100, mood));

  let level;
  if (clamped <= 19) level = { label: 'Hungry', emoji: '😡' };
  else if (clamped <= 39) level = { label: 'Sad', emoji: '😢' };
  else if (clamped <= 59) level = { label: 'Neutral', emoji: '😐' };
  else if (clamped <= 79) level = { label: 'Happy', emoji: '😊' };
  else level = { label: 'Overjoyed', emoji: '🤩' };

  let barColor;
  if (clamped <= 19) barColor = '#e85d5d';
  else if (clamped <= 39) barColor = '#e8a850';
  else if (clamped <= 59) barColor = '#c9b037';
  else if (clamped <= 79) barColor = '#7bc96e';
  else barColor = '#4ec96e';

  return (
    <div className="mood-bar-container">
      <div className="mood-bar-header">
        <span className="mood-bar-label">Mood</span>
        <span className="mood-bar-value">
          {level.emoji} {level.label} ({clamped}/100)
        </span>
      </div>
      <div className="mood-bar-track">
        <div
          className="mood-bar-fill"
          style={{ width: `${clamped}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}
