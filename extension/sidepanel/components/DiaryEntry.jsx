import React, { useState, useMemo } from 'react';
import diaryEntries, { getDiaryForHamster } from '@shared/diary';
import './DiaryEntry.css';

function DiaryEntry({ hamsterName }) {
  const [expanded, setExpanded] = useState(false);

  const latestEntry = useMemo(() => {
    const entries = getDiaryForHamster(hamsterName);
    if (entries.length === 0) return null;
    // Return the most recent entry (sorted by date descending)
    return entries.sort((a, b) => b.date.localeCompare(a.date))[0];
  }, [hamsterName]);

  if (!latestEntry) return null;

  const preview = latestEntry.content.length > 60
    ? latestEntry.content.slice(0, 60) + '...'
    : latestEntry.content;

  return (
    <div className="diary-section">
      <h3 className="section-title">📖 Latest Diary</h3>
      <div
        className={`diary-entry ${expanded ? 'diary-expanded' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="diary-date">{latestEntry.date}</div>
        <div className="diary-content">
          {expanded ? latestEntry.content : preview}
        </div>
        <div className="diary-toggle">
          {expanded ? '▲ Collapse' : '▼ Expand'}
        </div>
      </div>
    </div>
  );
}

export default DiaryEntry;
