import { useState, useRef, useEffect, useCallback } from 'react';
import { getFallbackResponse } from '../utils/chatFallback';
import './ChatBox.css';

async function saveConversation(userId, hamsterName, userMsg, hamsterMsg) {
  if (!userId) return;
  try {
    await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        hamsterName,
        userMessage: userMsg,
        hamsterResponse: hamsterMsg,
      }),
    });
  } catch {
    // Non-critical
  }
}

function ChatBox({ hamster, userId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

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

    let responseContent = null;

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
          userId: userId || undefined,
        }),
      });

      const data = await res.json();

      if (data.error) {
        responseContent = getFallbackResponse(text, hamster);
      } else {
        responseContent = data.content;
      }
    } catch {
      responseContent = getFallbackResponse(text, hamster);
    }

    // Always save both user message and hamster response
    if (responseContent) {
      setMessages((prev) => [...prev, { role: 'hamster', content: responseContent }]);
      saveConversation(userId, hamster.name, text, responseContent);
    }

    setLoading(false);
  }, [input, messages, hamster, loading, userId]);

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
