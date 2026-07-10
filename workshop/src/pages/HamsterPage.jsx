import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import HamsterAvatar from "../components/HamsterAvatar.jsx";
import Feed from "../components/Feed.jsx";
import FoodTray from "../components/FoodTray.jsx";
import ChatBox from "../components/ChatBox.jsx";
import hamsters from "../data/hamsters.js";

/** Convert mood score (0-100) into a label + emoji. */
const getMoodLabel = (score) => {
  if (score >= 80) return "Overjoyed 🤩";
  if (score >= 60) return "Happy 😊";
  if (score >= 40) return "Okay 😐";
  if (score >= 20) return "Grumpy 😤";
  return "Hungry 😢";
};

/** Pick a random hamster different from the current one. */
const pickAnother = (current) => {
  const others = hamsters.filter((h) => h.id !== current.id);
  return others[Math.floor(Math.random() * others.length)];
};

/** Pick a reaction: shy hamsters warm up when overjoyed. */
const pickReaction = (hamster, moodAfterFeed) => {
  if (hamster.overjoyedReactions && moodAfterFeed >= 80) {
    const list = hamster.overjoyedReactions;
    return list[Math.floor(Math.random() * list.length)];
  }
  const list = hamster.reactions;
  return list[Math.floor(Math.random() * list.length)];
};

const HamsterPage = () => {
  // Pick a random hamster once when the page loads
  const [hamster, setHamster] = useState(() => {
    return hamsters[Math.floor(Math.random() * hamsters.length)];
  });

  // Mood & feed state
  const [seeds, setSeeds] = useState(0);
  const [moodScore, setMoodScore] = useState(hamster.initialMoodScore);
  const [reaction, setReaction] = useState(null);

  const handleFeed = () => {
    const newSeeds = seeds + 1;
    const newMood = Math.min(moodScore + hamster.moodBoost, 100);
    setSeeds(newSeeds);
    setMoodScore(newMood);
    setReaction(pickReaction(hamster, newMood));
  };

  const handleMoodDown = (amount, message) => {
    setMoodScore((prev) => Math.max(prev - amount, 0));
    setReaction(message);
  };

  const handleMeetAnother = () => {
    const next = pickAnother(hamster);
    setHamster(next);
    setSeeds(0);
    setMoodScore(next.initialMoodScore);
    setReaction(null);
  };

  const moodLabel = getMoodLabel(moodScore);

  return (
    <div>
      <Navbar />

      <div className="hamster-page">
        {/* Profile card */}
        <div className="profile-card">
          <HamsterAvatar src={hamster.image} alt={hamster.name} size={160} />
          <h2>{hamster.name}</h2>
          <p className="profile-age">{hamster.age} old</p>
          <p className="profile-personality">{hamster.personality}</p>
          <div className="profile-details">
            <p>
              <strong>Favourite Food:</strong> {hamster.favouriteFood}
            </p>
            <p>
              <strong>Hobby:</strong> {hamster.hobby}
            </p>
          </div>
          <p className="profile-bio">{hamster.bio}</p>

          {/* Mood bar */}
          <div className="mood-section">
            <p className="mood-label"> Mood: {moodLabel}</p>
            <div className="mood-bar-bg">
              <div
                className="mood-bar-fill"
                style={{ width: `${moodScore}%` }}
              />
            </div>
            <p className="mood-number">{moodScore} / 100</p>
          </div>
        </div>

        {/* Right column: Feed + FoodTray + Chat */}
        <div className="hamster-side">
          <Feed feed={hamster.feed} name={hamster.name} />

          {/* Food tray */}
          <div className="seed-section">
            <p className="seed-count">
              {hamster.name} has been fed <strong>{seeds}</strong> time
              {seeds !== 1 ? "s" : ""}!
            </p>
            <FoodTray
              hamster={hamster}
              onFeed={handleFeed}
              onMoodDown={handleMoodDown}
            />
            {reaction && (
              <div className="reaction-bubble">
                <span className="reaction-speaker">{hamster.name}:</span>{" "}
                {reaction}
              </div>
            )}
          </div>

          <ChatBox hamster={hamster} />
        </div>
      </div>

      {/* Buttons */}
      <div className="hamster-actions">
        <button className="btn-secondary" onClick={handleMeetAnother}>
          Meet Another Hamster
        </button>
        <Link to="/" className="btn-secondary">
          Back Home
        </Link>
      </div>
    </div>
  );
};

export default HamsterPage;
