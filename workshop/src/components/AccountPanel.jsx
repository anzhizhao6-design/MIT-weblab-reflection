import { useState, useCallback } from 'react';
import { getUserId, switchUserId, createNewUser } from '../utils/user';

function shortId(id) {
  if (!id) return '';
  return id.slice(0, 8) + '...';
}

export default function AccountPanel({ onUserIdChange }) {
  const [userId, setUserIdState] = useState(() => getUserId());
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleCopy = useCallback(() => {
    if (userId) {
      navigator.clipboard.writeText(userId).catch(() => {});
    }
  }, [userId]);

  const handleSwitch = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    try {
      const res = await fetch(`/api/users/${trimmed}`);
      if (!res.ok) {
        setError('User ID not found');
        return;
      }
      switchUserId(trimmed);
      setUserIdState(trimmed);
      setInputValue('');
      setShowInput(false);
      setError('');
      if (onUserIdChange) onUserIdChange(trimmed);
    } catch {
      setError('Failed to check user ID');
    }
  }, [inputValue, onUserIdChange]);

  const handleCreateNew = useCallback(async () => {
    try {
      const newId = await createNewUser();
      setUserIdState(newId);
      setInputValue('');
      setShowInput(false);
      setError('');
      if (onUserIdChange) onUserIdChange(newId);
    } catch {
      setError('Failed to create new user');
    }
  }, [onUserIdChange]);

  return (
    <div className="account-panel">
      <span className="account-id">
        🐹 {shortId(userId)}
      </span>
      <button className="account-btn" onClick={handleCopy} title="Copy ID">
        📋
      </button>
      <button
        className="account-btn"
        onClick={() => setShowInput(!showInput)}
        title="Switch user"
      >
        🔄
      </button>

      {showInput && (
        <div className="account-switch">
          <input
            type="text"
            className="account-switch-input"
            placeholder="Paste user ID..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSwitch();
            }}
          />
          <button className="account-switch-btn" onClick={handleSwitch}>
            OK
          </button>
          <button className="account-switch-btn account-switch-new" onClick={handleCreateNew}>
            +
          </button>
          {error && <span className="account-error">{error}</span>}
        </div>
      )}
    </div>
  );
}
