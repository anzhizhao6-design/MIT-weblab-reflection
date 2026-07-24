import { useState, useRef, useEffect, useCallback } from 'react';

function buildSystemMessage(hamster) {
  return {
    role: 'system',
    content:
      `You are ${hamster.name}, a ${hamster.age}-year-old hamster.\n` +
      `Personality: ${hamster.personality}\n` +
      `Favorite food: ${hamster.favouriteFood}\n` +
      `Hobby: ${hamster.hobby}\n` +
      `Catchphrase: "${hamster.catchphrase}"\n\n` +
      `Rules:\n` +
      `- Always stay in character as ${hamster.name}\n` +
      `- Keep replies short (1-3 sentences)\n` +
      `- Reference your catchphrase, hobby, or favorite food naturally\n` +
      `- Respond like a cute, talking hamster`,
  };
}

const FALLBACK_INTENTS = [
  { priority: 1, intent: 'food', triggers: ['food', 'eat', 'hungry', 'feed', '吃', '饿'] },
  { priority: 2, intent: 'play', triggers: ['play', 'wheel', 'run', 'fun', '玩', '跑'] },
  { priority: 3, intent: 'mood', triggers: ['mood', 'happy', 'sad', 'how are you', 'feeling', '心情'] },
  { priority: 4, intent: 'greeting', triggers: ['hello', 'hi', 'hey', 'good morning', '你好'] },
];

function getFallbackReply(inputText, hamster) {
  const cleaned = inputText.trim().replace(/^[^\w\s]+|[^\w\s]+$/g, '').toLowerCase();

  let matchedIntent = null;
  for (const item of FALLBACK_INTENTS) {
    for (const trigger of item.triggers) {
      if (cleaned.includes(trigger)) {
        if (!matchedIntent || item.priority < matchedIntent.priority) {
          matchedIntent = item;
        }
        break;
      }
    }
  }

  const intent = matchedIntent?.intent || 'default';

  switch (intent) {
    case 'food':
      return `${hamster.name} loves ${hamster.favouriteFood}! ${hamster.catchphrase}`;
    case 'play':
      return `${hamster.name} spent all morning ${hamster.hobby}. Best day!`;
    case 'mood':
      return `${hamster.name} is feeling ${hamster.personality} today!`;
    case 'greeting':
      return `Oh! You're back! ${hamster.name} missed you! ${hamster.catchphrase}`;
    default:
      return `${hamster.name} is busy ${hamster.hobby} right now. Leave a seed and come back later!`;
  }
}

export default function ChatBox({ hamster, userId, chatMessages, setChatMessages }) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setInput('');
    setSending(true);

    try {
      const systemMsg = buildSystemMessage(hamster);
      const lastSix = updatedMessages.slice(-6);
      const payload = [systemMsg, ...lastSix];

      const body = {
        messages: payload,
        userId: userId || null,
        hamsterId: hamster.id || null,
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          setChatMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
          setSending(false);
          return;
        }
      }

      const fallback = getFallbackReply(text, hamster);
      setChatMessages((prev) => [...prev, { role: 'assistant', content: fallback }]);
    } catch {
      const fallback = getFallbackReply(text, hamster);
      setChatMessages((prev) => [...prev, { role: 'assistant', content: fallback }]);
    }

    setSending(false);
  }, [input, sending, chatMessages, hamster, userId, setChatMessages]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  return (
    <div className="chat-box">
      <h3 className="chat-title">Chat with {hamster.name}</h3>

      <div className="chat-messages">
        {chatMessages.length === 0 && (
          <p className="chat-placeholder">Say hello to {hamster.name}!</p>
        )}
        {chatMessages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-hamster'}`}>
            <div className="chat-msg-bubble">{msg.content}</div>
          </div>
        ))}
        {sending && (
          <div className="chat-msg chat-msg-hamster">
            <div className="chat-msg-bubble chat-typing">...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-row">
        <input
          type="text"
          className="chat-input"
          placeholder={`Chat with ${hamster.name}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
        />
        <button
          className="chat-send-btn"
          onClick={sendMessage}
          disabled={!input.trim() || sending}
        >
          Send
        </button>
      </div>
    </div>
  );
}
