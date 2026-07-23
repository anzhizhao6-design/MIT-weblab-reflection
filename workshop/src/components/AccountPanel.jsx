import { useState } from 'react';
import './AccountPanel.css';

function AccountPanel({ userId, onSwitch }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pasteId, setPasteId] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
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
  };

  const handleApply = () => {
    if (pasteId.trim()) {
      onSwitch(pasteId.trim());
    }
  };

  return (
    <div className="account-wrapper">
      <button
        className="account-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Account"
      >
        👤
      </button>

      {isOpen && (
        <div className="account-panel">
          <h4 className="account-panel-title">Account</h4>

          <div className="account-field">
            <span className="account-label">Your ID</span>
            <div className="account-id-row">
              <code className="account-id">{userId.slice(0, 8)}...</code>
              <button className="account-copy-btn" onClick={handleCopy}>
                {copied ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
          </div>

          <div className="account-field">
            <span className="account-label">Switch Device</span>
            <div className="account-switch-row">
              <input
                type="text"
                className="account-switch-input"
                placeholder="Paste your ID here..."
                value={pasteId}
                onChange={(e) => setPasteId(e.target.value)}
              />
              <button
                className="account-apply-btn"
                onClick={handleApply}
                disabled={!pasteId.trim()}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountPanel;
