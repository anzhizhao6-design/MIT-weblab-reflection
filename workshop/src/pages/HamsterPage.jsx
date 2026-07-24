import { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import HamsterAvatar from "../components/HamsterAvatar.jsx";
import Feed from "../components/Feed.jsx";
import FoodTray from "../components/FoodTray.jsx";
import ChatBox from "../components/ChatBox.jsx";
import hamsters from "../data/hamsters.js";
import { getUserId } from "../utils/user.js";

const getMoodLabel = (score) => {
  if (score >= 80) return "Overjoyed 🤩";
  if (score >= 60) return "Happy 😊";
  if (score >= 40) return "Okay 😐";
  if (score >= 20) return "Grumpy 😤";
  return "Hungry 😢";
};

const pickAnother = (current) => {
  const others = hamsters.filter((h) => h.id !== current.id);
  return others[Math.floor(Math.random() * others.length)];
};

const pickReaction = (hamster, moodAfterFeed) => {
  if (hamster.overjoyedReactions && moodAfterFeed >= 80) {
    const list = hamster.overjoyedReactions;
    return list[Math.floor(Math.random() * list.length)];
  }
  const list = hamster.reactions;
  return list[Math.floor(Math.random() * list.length)];
};

const HamsterPage = () => {
  const [hamster, setHamster] = useState(() => hamsters[Math.floor(Math.random() * hamsters.length)]);
  const [seeds, setSeeds] = useState(0);
  const [moodScore, setMoodScore] = useState(hamster.initialMoodScore);
  const [reaction, setReaction] = useState(null);
  const [memory, setMemory] = useState(null);
  const [flipped, setFlipped] = useState(false);

  const fetchMemory = () => {
    const userId = getUserId();
    if (!userId) return;
    fetch(`/api/memory?userId=${userId}&hamsterId=${hamster.id}`)
      .then((r) => r.json())
      .then(setMemory)
      .catch(() => {});
  };

  useEffect(() => {
    const userId = getUserId();
    fetch('/api/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, hamsterId: hamster.id }),
    })
      .then(() => fetchMemory())
      .catch(() => {});
  }, [hamster.id]);

  const handleFeed = () => {
    const newSeeds = seeds + 1;
    const newMood = Math.min(moodScore + hamster.moodBoost, 100);
    setSeeds(newSeeds);
    setMoodScore(newMood);
    setReaction(pickReaction(hamster, newMood));
    fetch('/api/feed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: getUserId(), hamsterId: hamster.id }),
    })
      .then(() => fetchMemory())
      .catch(() => {});
  };

  const handleMoodDown = (amount, message) => {
    setMoodScore((prev) => Math.max(prev - amount, 0));
    setReaction(message);
  };

  const handleVisitAnother = () => {
    const next = pickAnother(hamster);
    setHamster(next);
    setSeeds(0);
    setMoodScore(next.initialMoodScore);
    setReaction(null);
  };

  const moodLabel = getMoodLabel(moodScore);

  return (
    <div>
      <Navbar onVisitAnother={handleVisitAnother} />

      {/* Left column: Avatar + Flip Card + Snack */}
      <div className="hp-row">
        <div className="hp-left">
          <div className="hp-left-top">
            <HamsterAvatar src={hamster.image} alt={hamster.name} size={180} />

            <div className={`flip-card ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
              <div className="flip-inner">
                {/* Front: Profile Info */}
                <div className="flip-front hp-card">
                  <div className="hp-card-top">
                    <h2>{hamster.name}</h2>
                    <span className="profile-age">{hamster.age}</span>
                    <span className="profile-personality">{hamster.personality}</span>
                  </div>
                  <div className="hp-card-mid">
                    <span>🍽️ {hamster.favouriteFood}</span>
                    <span>🎯 {hamster.hobby}</span>
                  </div>
                  {memory && (
                    <div className="hp-card-memory">
                      <p>👋 Visited {memory.visitCount} time{memory.visitCount !== 1 ? 's' : ''}</p>
                      <p>🍽️ Fed {memory.totalFeeds} time{memory.totalFeeds !== 1 ? 's' : ''}</p>
                    </div>
                  )}
                  <div className="hp-card-mood">
                    <span className="mood-label-inline">💛 {moodLabel}</span>
                    <div className="mood-bar-bg mood-bar-inline">
                      <div className="mood-bar-fill" style={{ width: `${moodScore}%` }} />
                    </div>
                    <span className="mood-number-inline">{moodScore}/100</span>
                  </div>
                  <p className="flip-hint">Click to flip ↻</p>
                </div>

                {/* Back: Hamster Diary */}
                <div className="flip-back hp-card">
                  <Feed feed={hamster.feed} name={hamster.name} />
                  <p className="flip-hint">Click to flip back ↺</p>
                </div>
              </div>
            </div>
          </div>

          <div className="hp-food">
            <FoodTray hamster={hamster} onFeed={handleFeed} onMoodDown={handleMoodDown} />
            {reaction && (
              <div className="reaction-bubble">
                <span className="reaction-speaker">{hamster.name}:</span> {reaction}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Chat (tall, aligned with left column) */}
        <ChatBox hamster={hamster} />
      </div>
    </div>
  );
};

export default HamsterPage;
