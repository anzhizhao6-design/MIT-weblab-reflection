import { useState, useEffect } from 'react';
import './ProfileCard.css';

function ProfileCard({ userId, hamsterName, refreshKey }) {
  const [stats, setStats] = useState({ visitCount: 0, feedCount: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId || !hamsterName) return;

    fetch(`/api/memory?userId=${encodeURIComponent(userId)}&hamsterName=${encodeURIComponent(hamsterName)}`)
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoaded(true);
      })
      .catch(() => {});
  }, [userId, hamsterName, refreshKey]);

  if (!loaded) return null;

  return (
    <div className="profile-card">
      <div className="profile-stat">
        <span className="profile-stat-icon">👣</span>
        <span className="profile-stat-value">Visited {stats.visitCount} time{stats.visitCount !== 1 ? 's' : ''}</span>
      </div>
      <div className="profile-divider" />
      <div className="profile-stat">
        <span className="profile-stat-icon">🍽️</span>
        <span className="profile-stat-value">Fed {stats.feedCount} time{stats.feedCount !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}

export default ProfileCard;
