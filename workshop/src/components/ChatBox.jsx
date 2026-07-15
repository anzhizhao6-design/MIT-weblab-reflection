import { useState, useRef, useEffect } from 'react';
import { getUserId } from '../utils/user.js';

/**
 * ChatBox — user types a message, hamster replies via backend API.
 * Props:
 *   - hamster: the current hamster object
 */
const ChatBox = ({ hamster }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    const userMsg = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, hamsterId: hamster.id, userId: getUserId() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Chat failed');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'hamster', text: data.reply }]);
    } catch (err) {
      setError('Oops! The hamster is sleeping. Try again? 💤');
      console.error('Chat error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="chat-box">
      <h3>Chat with {hamster.name}</h3>

      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="chat-hint">Send a message to start chatting with {hamster.name}! 🐹</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role}`}>
            <span className="chat-role">{msg.role === 'user' ? 'You' : '🐾'}</span>
            <p>{msg.text}</p>
          </div>
        ))}
        {sending && (
          <div className="chat-bubble hamster">
            <span className="chat-role">🐾</span>
            <p className="chat-typing">typing...</p>
          </div>
        )}
        {error && <p className="chat-error">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-row">
        <input
          type="text"
          className="chat-input"
          placeholder={`Say hi to ${hamster.name}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!input.trim() || sending}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
