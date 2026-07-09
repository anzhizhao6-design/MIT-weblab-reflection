import { useState } from "react";
import hamsters from "./data/hamsters.js";
import HamsterCard from "./components/HamsterCard.jsx";
import HamsterInfo from "./components/HamsterInfo.jsx";
import FoodTray from "./components/FoodTray.jsx";

/** Convert mood score (0-100) into a label + emoji. */
const getMoodLabel = (score) => {
  if (score >= 80) return "Overjoyed 🤩";
  if (score >= 60) return "Happy 😊";
  if (score >= 40) return "Okay 😐";
  if (score >= 20) return "Grumpy 😤";
  return "Hungry 😢";
};

/** Pick a reaction: shy hamsters warm up when overjoyed (mood >= 80). */
const pickReaction = (hamster, moodAfterFeed) => {
  if (hamster.overjoyedReactions && moodAfterFeed >= 80) {
    const list = hamster.overjoyedReactions;
    return list[Math.floor(Math.random() * list.length)];
  }
  const list = hamster.reactions;
  return list[Math.floor(Math.random() * list.length)];
};

const App = () => {
  // ---- Daily hamster ----
  const todayIndex =
    Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24)) % hamsters.length;
  const todayHamster = hamsters[todayIndex];

  // ---- useState ----
  const [seeds, setSeeds] = useState(0);
  const [moodScore, setMoodScore] = useState(todayHamster.initialMoodScore);
  const [reaction, setReaction] = useState(null);

  // ---- Feed: eat favorite food → mood up ----
  const handleFeed = () => {
    const newSeeds = seeds + 1;
    const newMood = Math.min(moodScore + todayHamster.moodBoost, 100);
    setSeeds(newSeeds);
    setMoodScore(newMood);
    setReaction(pickReaction(todayHamster, newMood));
  };

  // ---- Mood down: teased or bad food ----
  const handleMoodDown = (amount, message) => {
    setMoodScore((prev) => Math.max(prev - amount, 0));
    setReaction(message);
  };

  const moodLabel = getMoodLabel(moodScore);

  return (
    <div>
      <h1 className="u-textCenter page-title">Today's Hamster</h1>

      {/* Two cards side by side */}
      <div className="row">
        <HamsterCard hamster={todayHamster} moodLabel={moodLabel} />
        <HamsterInfo
          hamster={todayHamster}
          moodLabel={moodLabel}
          moodScore={moodScore}
        />
      </div>

      {/* Feed interaction */}
      <div className="seed-section">
        <p className="seed-count">
          {todayHamster.name} has been fed <strong>{seeds}</strong> time
          {seeds !== 1 ? "s" : ""}!
        </p>

        <FoodTray
          hamster={todayHamster}
          onFeed={handleFeed}
          onMoodDown={handleMoodDown}
        />

        {/* Reaction bubble */}
        {reaction && (
          <div className="reaction-bubble">
            <span className="reaction-speaker">{todayHamster.name}:</span>{" "}
            {reaction}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
