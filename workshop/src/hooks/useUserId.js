import { useState, useEffect } from 'react';

const STORAGE_KEY = 'hamster_user_id';

function generateUUID() {
  return crypto.randomUUID();
}

function getStoredUserId() {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = generateUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export function useUserId() {
  const [userId, setUserId] = useState(() => getStoredUserId());

  useEffect(() => {
    // Register with backend on mount
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uuid: userId }),
    }).catch(() => {});
  }, [userId]);

  const switchUserId = (newId) => {
    if (newId && newId.trim()) {
      localStorage.setItem(STORAGE_KEY, newId.trim());
      setUserId(newId.trim());
      window.location.reload();
    }
  };

  return { userId, switchUserId };
}

export default useUserId;
