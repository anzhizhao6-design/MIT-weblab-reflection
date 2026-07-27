import React from 'react';
import useHamster from './hooks/useHamster';
import StatusOverlay from './components/StatusOverlay';
import HamsterCard from './components/HamsterCard';
import ProfileCard from './components/ProfileCard';
import DiaryEntry from './components/DiaryEntry';
import FoodTray from './components/FoodTray';
import ChatBox from './components/ChatBox';

function App() {
  const {
    userId,
    hamster,
    status,
    mood,
    refreshKey,
    handleFeed,
    handleHoverPenalty,
    handleFeedRecorded,
    visitAnother,
    retry,
  } = useHamster();

  if (status !== 'ok' || !hamster) {
    return <StatusOverlay status={status} onRetry={retry} />;
  }

  return (
    <div className="app-container">
      <HamsterCard hamster={hamster} mood={mood} />
      <ProfileCard userId={userId} hamsterName={hamster.name} refreshKey={refreshKey} />
      <DiaryEntry hamsterName={hamster.name} />
      <FoodTray
        hamster={hamster}
        mood={mood}
        onFeed={handleFeed}
        onHoverPenalty={handleHoverPenalty}
        userId={userId}
        onFeedRecorded={handleFeedRecorded}
      />
      <ChatBox key={hamster.name} hamster={hamster} userId={userId} />
      <button className="visit-another-btn" onClick={visitAnother}>
        Visit Another Hamster
      </button>
    </div>
  );
}

export default App;
