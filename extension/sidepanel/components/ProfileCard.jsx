import React, { useState, useEffect } from 'react';
import './ProfileCard.css';

const API_BASE = 'https://hamster-daily.onrender.com';

function ProfileCard({ userId, hamsterId, refreshKey }) {
  const [stats, setStats] = useState({ visitCount: 0, totalFeeds: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId || !hamsterId) return;

    fetch(`${API_BASE}/api/memory?userId=${encodeURIComponent(userId)}&hamsterId=${encodeURIComponent(hamsterId)}`)
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoaded(true);
      })
      .catch(() => {});
  }, [userId, hamsterId, refreshKey]);

  if (!loaded) return null;

  return (
    <div className="profile-card">
      <div className="profile-stat">
        <span className="profile-stat-icon">👣</span>
        <span className="profile-stat-value">
          Visited {stats.visitCount} time{stats.visitCount !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="profile-divider" />
      <div className="profile-stat">
        <span className="profile-stat-icon">🍽️</span>
        <span className="profile-stat-value">
          Fed {stats.totalFeeds} time{stats.totalFeeds !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}

export default ProfileCard;
