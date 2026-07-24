import { useState, useRef, useEffect, useCallback } from 'react';
import { getFallbackResponse } from '../utils/chatFallback';
import './ChatBox.css';

function ChatBox({ hamster }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          hamster: {
            name: hamster.name,
            personality: hamster.personality,
            favouriteFood: hamster.favouriteFood,
            hobby: hamster.hobby,
            catchphrase: hamster.catchphrase,
          },
        }),
      });

      const data = await res.json();

      if (data.error) {
        // Use fallback
        const fallback = getFallbackResponse(text, hamster);
        setMessages((prev) => [...prev, { role: 'hamster', content: fallback }]);
      } else {
        setMessages((prev) => [...prev, { role: 'hamster', content: data.content }]);
      }
    } catch {
      // Network error → fallback
      const fallback = getFallbackResponse(text, hamster);
      setMessages((prev) => [...prev, { role: 'hamster', content: fallback }]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, hamster, loading]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  const canSend = input.trim().length > 0 && !loading;

  return (
    <div className="chat-section">
      <h3 className="section-title">💬 Chat with {hamster.name}</h3>
      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="chat-placeholder">
            Say hi to {hamster.name}! They'd love to chat with you.
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-bubble ${
              msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-hamster'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="chat-bubble chat-bubble-hamster chat-typing">
            {hamster.name} is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-row">
        <input
          type="text"
          className="chat-input"
          placeholder={`Message ${hamster.name}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          className="chat-send-btn"
          onClick={sendMessage}
          disabled={!canSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatBox;
