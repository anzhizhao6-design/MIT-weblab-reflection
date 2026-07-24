import { useState, useCallback, useEffect, useRef } from 'react';
import { ensureUserId } from '../utils/user';
import HamsterCard from '../components/HamsterCard';
import Diary from '../components/Diary';
import MoodBar from '../components/MoodBar';
import FoodTray from '../components/FoodTray';
import ChatBox from '../components/ChatBox';

export default function HamsterPage({ userId }) {
  const [hamster, setHamster] = useState(null);
  const [memory, setMemory] = useState(null);
  const [mood, setMood] = useState(50);
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(false);

  const fetchRandomHamster = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hamsters/random');
      if (res.ok) {
        const data = await res.json();
        setHamster(data);
        setMood(50);
        setChatMessages([]);
        return data;
      }
    } catch {
      // API unavailable
    }
    setLoading(false);
    return null;
  }, []);

  const fetchMemory = useCallback(async (hamsterId) => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/memory?userId=${userId}&hamsterId=${hamsterId}`);
      if (res.ok) {
        const data = await res.json();
        setMemory(data);
      }
    } catch {
      // Memory fetch failed
    }
  }, [userId]);

  const recordVisit = useCallback(async (hamsterId) => {
    if (!userId) return;
    try {
      await fetch('/api/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, hamsterId }),
      });
    } catch {
      // Visit recording failed
    }
  }, [userId]);

  const recordFeed = useCallback(async (hamsterId, foodId, isFavourite) => {
    if (!userId) return;
    try {
      await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, hamsterId, foodId, isFavourite }),
      });
    } catch {
      // Feed recording failed
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    fetchRandomHamster().then(async (data) => {
      if (data) {
        await recordVisit(data.id);
        fetchMemory(data.id);
      }
    });
  }, [fetchRandomHamster, recordVisit, fetchMemory]);

  const visitAnother = useCallback(async () => {
    const data = await fetchRandomHamster();
    if (data) {
      await recordVisit(data.id);
      fetchMemory(data.id);
    }
  }, [fetchRandomHamster, recordVisit, fetchMemory]);

  const handleFeed = useCallback(
    async (foodId, isClick, isPenalty) => {
      if (isPenalty) {
        setMood((prev) => Math.max(0, prev - 5));
        return;
      }

      if (!isClick) return;

      const isFavourite = hamster.favouriteFood === foodId;
      const boost = isFavourite ? hamster.moodBoost : 3;

      setMood((prev) => Math.min(100, prev + boost));

      // Await write before read to avoid stale memory
      await recordFeed(hamster.id, foodId, isFavourite);
      fetchMemory(hamster.id);
    },
    [hamster, recordFeed, fetchMemory]
  );

  if (loading && !hamster) {
    return (
      <div className="hamster-page">
        <div className="hamster-loading">Loading...</div>
      </div>
    );
  }

  if (!hamster) {
    return (
      <div className="hamster-page">
        <div className="hamster-loading">No hamsters found. Run npm run db:seed first.</div>
      </div>
    );
  }

  return (
    <div className="hamster-page">
      <div className="hamster-left-col">
        <HamsterCard hamster={hamster} memory={memory} onVisitAnother={visitAnother} />
        <Diary diary={hamster.diary} hamsterName={hamster.name} />
      </div>

      <div className="hamster-right-col">
        <MoodBar mood={mood} />
        <FoodTray hamster={hamster} mood={mood} onFeed={handleFeed} />
        <ChatBox
          hamster={hamster}
          userId={userId}
          chatMessages={chatMessages}
          setChatMessages={setChatMessages}
        />
      </div>
    </div>
  );
}
