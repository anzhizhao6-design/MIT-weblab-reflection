import React from 'react';
import './StatusOverlay.css';

function StatusOverlay({ status, onRetry }) {
  if (status === 'ok') return null;

  return (
    <div className="status-overlay">
      {status === 'loading' && (
        <div className="status-content">
          <div className="status-spinner" />
          <p>Finding your hamster...</p>
        </div>
      )}
      {status === 'backend_down' && (
        <div className="status-content">
          <span className="status-icon">🔌</span>
          <p>Server not running</p>
          <p className="status-hint">Please run <code>npm run dev</code> in the workshop folder, then reopen this panel.</p>
          {onRetry && (
            <button className="status-retry-btn" onClick={onRetry}>Retry</button>
          )}
        </div>
      )}
      {status === 'error' && (
        <div className="status-content">
          <span className="status-icon">⚠️</span>
          <p>Something went wrong</p>
          <p className="status-hint">Could not load hamster data. Check that the server is running.</p>
          {onRetry && (
            <button className="status-retry-btn" onClick={onRetry}>Retry</button>
          )}
        </div>
      )}
    </div>
  );
}

export default StatusOverlay;
