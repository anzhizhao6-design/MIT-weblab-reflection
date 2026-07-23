import { useState, useEffect } from 'react';
import './ProfileCard.css';

function ProfileCard({ userId, hamsterName, trigger }) {
  const [stats, setStats] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!userId || !hamsterName) {
      setInitialLoad(false);
      return;
    }

    fetch(`/api/memory?userId=${encodeURIComponent(userId)}&hamsterName=${encodeURIComponent(hamsterName)}`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setInitialLoad(false);
      })
      .catch(() => {
        setStats((prev) => prev || { visitCount: 0, feedCount: 0 });
        setInitialLoad(false);
      });
  }, [userId, hamsterName, trigger]);

  if (initialLoad) {
    return (
      <section className="profile-card">
        <p className="profile-loading">Loading stats...</p>
      </section>
    );
  }

  const visitCount = stats?.visitCount || 0;
  const feedCount = stats?.feedCount || 0;

  return (
    <section className="profile-card">
      <h3 className="profile-title">Your Visits</h3>
      <div className="profile-stats">
        <div className="profile-stat">
          <span className="profile-stat-value">{visitCount}</span>
          <span className="profile-stat-label">Visits</span>
        </div>
        <div className="profile-divider" />
        <div className="profile-stat">
          <span className="profile-stat-value">{feedCount}</span>
          <span className="profile-stat-label">Fed</span>
        </div>
      </div>
    </section>
  );
}

export default ProfileCard;
