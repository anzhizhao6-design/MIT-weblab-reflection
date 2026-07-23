import { useState, useRef, useEffect, useCallback } from 'react';
import './ChatBox.css';

const FALLBACK_RULES = [
  {
    intent: 'food',
    triggers: ['food', 'eat', 'hungry', 'feed', '吃', '饿'],
    template: (h) => `${h.name} loves ${h.favouriteFood}! ${h.catchphrase}`,
  },
  {
    intent: 'play',
    triggers: ['play', 'wheel', 'run', 'fun', '玩', '跑'],
    template: (h) => `${h.name} spent all morning ${h.hobby}. Best day!`,
  },
  {
    intent: 'mood',
    triggers: ['mood', 'happy', 'sad', 'how are you', 'feeling', '心情'],
    template: (h) => `${h.name} is feeling ${h.personality} today!`,
  },
  {
    intent: 'greeting',
    triggers: ['hello', 'hi', 'hey', 'good morning', '你好'],
    template: (h) => `Oh! You're back! ${h.name} missed you! ${h.catchphrase}`,
  },
  {
    intent: 'default',
    triggers: [],
    template: (h) => `${h.name} is busy ${h.hobby} right now. Leave a seed and come back later!`,
  },
];

function getFallbackReply(input, hamster) {
  const trimmed = input.trim().toLowerCase().replace(/[^\w\s一-鿿]/g, '');

  for (const rule of FALLBACK_RULES) {
    if (rule.intent === 'default') continue;
    for (const trigger of rule.triggers) {
      if (trimmed.includes(trigger.toLowerCase())) {
        return rule.template(hamster);
      }
    }
  }

  return FALLBACK_RULES.find((r) => r.intent === 'default').template(hamster);
}

function ChatBox({ hamster }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    setMessages([]);
    setInput('');
  }, [hamster.name]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
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

      if (!response.ok) {
        throw new Error('API error');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch {
      const fallbackReply = getFallbackReply(text, hamster);
      setMessages([...newMessages, { role: 'assistant', content: fallbackReply }]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading, hamster]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && input.trim()) {
      sendMessage();
    }
  }, [input, sendMessage]);

  return (
    <section className="chat-section">
      <h3 className="chat-title">Chat with {hamster.name}</h3>
      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="chat-placeholder">
            Say hi to {hamster.name}! They'd love to chat.
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-bubble ${msg.role === 'user' ? 'user' : 'hamster'}`}
          >
            <span className="chat-role">
              {msg.role === 'user' ? '🤓 You' : `🐹 ${hamster.name}`}
            </span>
            <p className="chat-content">{msg.content}</p>
          </div>
        ))}
        {loading && (
          <div className="chat-bubble hamster">
            <span className="chat-role">🐹 {hamster.name}</span>
            <p className="chat-content typing">...</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-row">
        <input
          type="text"
          className="chat-input"
          placeholder={`Say something to ${hamster.name}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          className="chat-send-btn"
          onClick={sendMessage}
          disabled={!input.trim() || loading}
        >
          Send
        </button>
      </div>
    </section>
  );
}

export default ChatBox;
