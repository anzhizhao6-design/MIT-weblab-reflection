import { useState, useCallback } from 'react';
import hamsters from '../data/hamsters';
import HamsterCard from '../components/HamsterCard';
import Diary from '../components/Diary';
import MoodBar from '../components/MoodBar';
import FoodTray from '../components/FoodTray';
import ChatBox from '../components/ChatBox';

export default function HamsterPage() {
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.floor(Math.random() * hamsters.length)
  );
  const [mood, setMood] = useState(50);
  const [chatMessages, setChatMessages] = useState([]);

  const hamster = hamsters[currentIndex];

  const visitAnother = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * hamsters.length);
      } while (newIndex === prevIndex && hamsters.length > 1);
      return newIndex;
    });
    setMood(50);
    setChatMessages([]);
  }, []);

  const handleFeed = useCallback(
    (foodId, isClick, isPenalty) => {
      setMood((prev) => {
        if (isPenalty) {
          return Math.max(0, prev - 5);
        }

        if (!isClick) return prev;

        const isFavourite = hamster.favouriteFood === foodId;
        const boost = isFavourite ? hamster.moodBoost : 3;
        return Math.min(100, prev + boost);
      });
    },
    [hamster]
  );

  return (
    <div className="hamster-page">
      <div className="hamster-left-col">
        <HamsterCard hamster={hamster} onVisitAnother={visitAnother} />
        <Diary diary={hamster.diary} hamsterName={hamster.name} />
      </div>

      <div className="hamster-right-col">
        <MoodBar mood={mood} />
        <FoodTray hamster={hamster} mood={mood} onFeed={handleFeed} />
        <ChatBox
          hamster={hamster}
          chatMessages={chatMessages}
          setChatMessages={setChatMessages}
        />
      </div>
    </div>
  );
}
