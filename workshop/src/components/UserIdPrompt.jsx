import { useState, useRef, useEffect } from 'react';
import { getUserId, createNewUser, checkUserId, setUserId } from '../utils/user.js';

const AccountDropdown = () => {
  const [userId, setLocalUserId] = useState(getUserId);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const shortId = userId.slice(0, 12) + '...';

  const handleCopy = () => {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCreate = async () => {
    const newId = await createNewUser();
    setLocalUserId(newId);
  };

  const handleSwitch = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const exists = await checkUserId(trimmed);
    if (exists) {
      setUserId(trimmed);
      setLocalUserId(trimmed);
      setInput('');
      setError('');
    } else {
      setError('ID not found');
    }
  };

  return (
    <div className="account-dropdown" ref={ref}>
      <button className="navbar-link-btn" onClick={() => setOpen(!open)}>
        Account
      </button>

      {open && (
        <div className="account-panel">
          <div className="account-row">
            <span className="account-label">Your ID</span>
            <span className="account-id">{shortId}</span>
            <button className="account-action" onClick={handleCopy}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="account-row">
            <span className="account-label">Switch Device</span>
            <div className="account-switch">
              <input
                className="account-input"
                placeholder="Paste your ID..."
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSwitch(); }}
              />
              <button className="account-action" onClick={handleSwitch}>OK</button>
            </div>
            {error && <span className="account-error">{error}</span>}
          </div>

          <div className="account-row">
            <button className="account-action account-create" onClick={handleCreate}>
              + Create New ID
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDropdown;
