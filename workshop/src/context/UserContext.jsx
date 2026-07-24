import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UserContext = createContext(null);

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const STORAGE_KEY = 'hamster_user_uuid';

function getStoredUUID() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeUUID(uuid) {
  try {
    localStorage.setItem(STORAGE_KEY, uuid);
  } catch {
    // localStorage unavailable
  }
}

export function UserProvider({ children }) {
  const [userId, setUserId] = useState(null);

  // Initialize: read from localStorage or generate new
  useEffect(() => {
    let uuid = getStoredUUID();
    if (!uuid) {
      uuid = generateUUID();
      storeUUID(uuid);
    }
    setUserId(uuid);

    // Register with backend
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uuid }),
    }).catch(() => {});
  }, []);

  // Switch to a different UUID (paste from another device)
  const switchUser = useCallback((newUuid) => {
    if (!newUuid || newUuid === userId) return;
    storeUUID(newUuid);
    setUserId(newUuid);
    // Register the new UUID
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uuid: newUuid }),
    }).catch(() => {});
  }, [userId]);

  return (
    <UserContext.Provider value={{ userId, switchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}

export default UserContext;
