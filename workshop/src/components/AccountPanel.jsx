import { useState, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import './AccountPanel.css';

function AccountPanel() {
  const { userId, switchUser } = useUser();
  const [pasteInput, setPasteInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [switched, setSwitched] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-HTTPS
      const input = document.createElement('input');
      input.value = userId;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [userId]);

  const handleSwitch = useCallback(() => {
    const newId = pasteInput.trim();
    if (newId) {
      switchUser(newId);
      setPasteInput('');
      setSwitched(true);
      setTimeout(() => setSwitched(false), 2000);
    }
  }, [pasteInput, switchUser]);

  return (
    <div className="account-panel">
      <div className="account-section">
        <label className="account-label">Your ID</label>
        <div className="account-id-row">
          <code className="account-id">{userId?.slice(0, 8)}...</code>
          <button className="account-btn account-btn-copy" onClick={handleCopy}>
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="account-section">
        <label className="account-label">Switch Device</label>
        <p className="account-hint">Paste a UUID from another device to sync your history.</p>
        <div className="account-switch-row">
          <input
            type="text"
            className="account-input"
            placeholder="Paste UUID here..."
            value={pasteInput}
            onChange={(e) => setPasteInput(e.target.value)}
          />
          <button
            className="account-btn account-btn-switch"
            onClick={handleSwitch}
            disabled={!pasteInput.trim()}
          >
            {switched ? '✓ Switched!' : 'Switch'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccountPanel;
