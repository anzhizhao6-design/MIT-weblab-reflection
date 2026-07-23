import { useState, useEffect } from 'react';
import './ProfileCard.css';

function ProfileCard({ userId, hamsterName }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setStats(null);

    if (!userId || !hamsterName) {
      setLoading(false);
      return;
    }

    fetch(`/api/memory?userId=${encodeURIComponent(userId)}&hamsterName=${encodeURIComponent(hamsterName)}`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setStats({ visitCount: 0, feedCount: 0 });
        setLoading(false);
      });
  }, [userId, hamsterName]);

  if (loading) {
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
