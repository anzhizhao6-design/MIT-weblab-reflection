import { useState, useCallback, useReducer, useEffect, useRef } from 'react';

const API_BASE = 'https://hamster-daily.onrender.com';
const HAMSTER_STORAGE_KEY = 'hamster_daily_current';

function moodReducer(state, action) {
  switch (action.type) {
    case 'FEED':
      return Math.min(100, state + action.amount);
    case 'HOVER_PENALTY':
      return Math.max(0, state - 5);
    case 'RESET':
      return 50;
    default:
      return state;
  }
}

export default function useHamster() {
  const [userId, setUserId] = useState(null);
  const [hamster, setHamster] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ok' | 'backend_down' | 'error'
  const [mood, dispatch] = useReducer(moodReducer, 50);
  const [refreshKey, setRefreshKey] = useState(0);
  const userIdResolved = useRef(false);

  // Step 1: Resolve userId
  useEffect(() => {
    if (userIdResolved.current) return;
    userIdResolved.current = true;

    async function resolveUserId() {
      // 1. Check chrome.storage.local (set by content script from website)
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          const stored = await chrome.storage.local.get('userId');
          if (stored.userId) {
            setUserId(stored.userId);
            return;
          }
        }
      } catch {
        // chrome.storage not available
      }

      // 2. Check side panel's own localStorage
      try {
        const cached = window.localStorage.getItem('userId');
        if (cached) {
          setUserId(cached);
          return;
        }
      } catch {
        // localStorage not available
      }

      // 3. Generate new UUID and register on backend
      const newId = crypto.randomUUID ? crypto.randomUUID() : 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
      try {
        const res = await fetch(`${API_BASE}/api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uuid: newId }),
        });
        if (res.ok) {
          const data = await res.json();
          setUserId(data.userId || data.uuid);
          try { window.localStorage.setItem('userId', data.uuid); } catch {}
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ userId: data.uuid }).catch(() => {});
          }
          return;
        }
      } catch {
        // Backend might be down — use local userId anyway
      }
      setUserId(newId);
      try { window.localStorage.setItem('userId', newId); } catch {}
    }

    resolveUserId();
  }, []);

  // Step 2: Check backend + fetch hamster (after userId is set)
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function init() {
      setStatus('loading');

      // Check if backend is reachable
      try {
        const healthCheck = await fetch(`${API_BASE}/api/hamsters/random`, {
          signal: AbortSignal.timeout(5000),
        });
        if (!healthCheck.ok) {
          if (!cancelled) setStatus('error');
          return;
        }
      } catch {
        if (!cancelled) setStatus('backend_down');
        return;
      }

      // Check if we have a persisted hamster name
      let hamsterName = null;
      try {
        hamsterName = window.localStorage.getItem(HAMSTER_STORAGE_KEY);
      } catch {}

      try {
        let hamsterData = null;

        if (hamsterName) {
          // Try to fetch the persisted hamster
          const res = await fetch(`${API_BASE}/api/hamsters/${encodeURIComponent(hamsterName)}`);
          if (res.ok) {
            hamsterData = await res.json();
          }
        }

        // Fall back to random if persisted hamster not found
        if (!hamsterData) {
          const res = await fetch(`${API_BASE}/api/hamsters/random`);
          if (res.ok) {
            hamsterData = await res.json();
          }
        }

        if (!cancelled && hamsterData) {
          setHamster(hamsterData);
          try { window.localStorage.setItem(HAMSTER_STORAGE_KEY, hamsterData.name); } catch {}
          setStatus('ok');

          // Record visit
          fetch(`${API_BASE}/api/visit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, hamsterId: hamsterData.id }),
          })
            .then(() => setTimeout(() => setRefreshKey((k) => k + 1), 300))
            .catch(() => {});
        } else if (!cancelled) {
          setStatus('error');
        }
      } catch {
        if (!cancelled) setStatus('backend_down');
      }
    }

    init();
    return () => { cancelled = true; };
  }, [userId]);

  // Feed handler
  const handleFeed = useCallback((amount) => {
    dispatch({ type: 'FEED', amount });
  }, []);

  const handleHoverPenalty = useCallback(() => {
    dispatch({ type: 'HOVER_PENALTY' });
  }, []);

  const handleFeedRecorded = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Visit another hamster
  const visitAnother = useCallback(async () => {
    setStatus('loading');
    dispatch({ type: 'RESET' });

    try {
      // Fetch random, excluding current
      let hamsterData = null;
      for (let i = 0; i < 10; i++) {
        const res = await fetch(`${API_BASE}/api/hamsters/random`);
        const data = await res.json();
        if (!hamster || data.name !== hamster.name) {
          hamsterData = data;
          break;
        }
      }
      if (!hamsterData) {
        // If we couldn't get a different one (unlikely with 12), just take whatever
        const res = await fetch(`${API_BASE}/api/hamsters/random`);
        hamsterData = await res.json();
      }

      setHamster(hamsterData);
      try { window.localStorage.setItem(HAMSTER_STORAGE_KEY, hamsterData.name); } catch {}
      setStatus('ok');

      // Record visit for the new hamster
      if (userId) {
        fetch(`${API_BASE}/api/visit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, hamsterId: hamsterData.id }),
        })
          .then(() => setTimeout(() => setRefreshKey((k) => k + 1), 300))
          .catch(() => {});
      }
    } catch {
      setStatus('backend_down');
    }
  }, [hamster, userId]);

  const retry = useCallback(() => {
    userIdResolved.current = false;
    setStatus('loading');
    // Re-trigger the userId effect
    setUserId(null);
    setTimeout(() => {
      userIdResolved.current = false;
      setUserId((prev) => prev || 'retry');
    }, 100);
  }, []);

  return {
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
  };
}
