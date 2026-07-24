import { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ensureUserId } from './utils/user';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import HamsterPage from './pages/HamsterPage';

export default function App() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    ensureUserId().then(setUserId);
  }, []);

  const handleUserIdChange = useCallback((newId) => {
    setUserId(newId);
  }, []);

  return (
    <div className="app">
      <Navbar onUserIdChange={handleUserIdChange} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hamster" element={<HamsterPage userId={userId} />} />
        </Routes>
      </main>
    </div>
  );
}
