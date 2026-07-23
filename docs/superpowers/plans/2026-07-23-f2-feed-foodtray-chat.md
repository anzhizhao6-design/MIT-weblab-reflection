# F2: Feed + Food Tray + LLM Chat — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Express backend for LLM proxy, Diary section, Food Tray with hover penalty, Mood Bar with 5-level progress, and Chat with LLM + keyword fallback to the HamsterPage.

**Architecture:** Express server on port 3001 proxies `/api/chat` to the LLM API. Vite proxies `/api` to Express. Four new components (Diary, FoodTray, MoodBar, ChatBox) compose into HamsterPage. Mood state lives in HamsterPage, fed down as props.

**Tech Stack:** React 18, Vite 5, Express 4, react-router-dom 6, plain CSS

## Global Constraints

- JavaScript (not TypeScript) — .jsx/.js only
- React 18 + Vite + Express
- All F2 numeric rules from spec §7 (mood 0-100 clamped, initial 50, hover -5, favourite +moodBoost, non-fav +3)
- 12 foods use spec §6.3 `id` for matching favouriteFood
- personality → moodBoost from spec §6.4
- Mood levels per spec §7.3: Hungry(0-19), Sad(20-39), Neutral(40-59), Happy(60-79), Overjoyed(80-100)
- LLM API: POST https://jmapi.jaguarmicro.com/v1/chat/completions, model from LLM_MODEL env, timeout 10s
- API key NEVER exposed to frontend — all LLM calls go through Express backend
- Fallback: client-side keyword matching per spec §7.4, priority food>play>mood>greeting>default, case-insensitive, deterministic
- Chat input disabled when empty, Enter key sends
- F1 regression: all 7 F1 criteria must still pass
- No F3 code (no MongoDB, no user accounts, no visit/feed persistence)
- `.env` in `.gitignore` (already done in F1)

---

### Task 1: Scaffold Express backend + dependencies + proxy

**Files:**
- Create: `workshop/server.js`
- Modify: `workshop/package.json`
- Modify: `workshop/vite.config.js`

**Interfaces:**
- Produces: Express server on port 3001 with `POST /api/chat`
- Produces: Vite proxy `/api` → `http://localhost:3001`
- Produces: `npm run dev` starts both Vite + Express via concurrently

- [ ] **Step 1: Install new dependencies**

Run: `cd workshop && npm install express cors dotenv concurrently --save`

- [ ] **Step 2: Write server.js**

```js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_BASE_URL = process.env.LLM_BASE_URL || 'https://jmapi.jaguarmicro.com/v1';
const LLM_MODEL = process.env.LLM_MODEL || 'deepseek-v4-pro';

app.post('/api/chat', async (req, res) => {
  const { messages, hamster } = req.body;

  if (!messages || !hamster) {
    return res.status(400).json({ error: 'Missing messages or hamster data' });
  }

  const systemPrompt = `You are ${hamster.name}, a hamster with the personality "${hamster.personality}". Your favorite food is ${hamster.favouriteFood}. You love ${hamster.hobby}. Your catchphrase is: "${hamster.catchphrase}". Reply in character as this hamster. Keep responses short (1-3 sentences), cute, and fun. Use the catchphrase occasionally.`;

  const chatMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(-6),
  ];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: chatMessages,
        max_tokens: 150,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error('Invalid response body');
    }

    res.json({ reply });
  } catch (error) {
    console.error('LLM API error:', error.message);
    res.status(503).json({ error: 'LLM API unavailable' });
  }
});

app.listen(PORT, () => {
  console.log(`F2 backend running on http://localhost:${PORT}`);
});
```

- [ ] **Step 3: Update package.json scripts**

Edit `workshop/package.json` — change the `dev` script and add `server`:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run server\" \"vite\"",
    "server": "node server.js",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

- [ ] **Step 4: Update vite.config.js — add proxy**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

- [ ] **Step 5: Verify backend starts**

Run: `cd workshop && npm run dev`
Expected: Terminal shows "F2 backend running on http://localhost:3001" and Vite on port 3000. Browser opens, no console errors about proxy.

- [ ] **Step 6: Test /api/chat endpoint**

Run: `curl -X POST http://localhost:3001/api/chat -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"hello"}],"hamster":{"name":"Test","personality":"Friendly 🥰","favouriteFood":"sunflower-seeds","hobby":"running","catchphrase":"Hi!"}}'`
Expected: JSON response with `reply` field (from LLM) or `error` field (if API unavailable — still proves endpoint works).

- [ ] **Step 7: Commit**

```bash
git add workshop/server.js workshop/package.json workshop/package-lock.json workshop/vite.config.js
git commit -m "feat: add Express backend with /api/chat LLM proxy"
```

---

### Task 2: Add diary data to hamsters.js

**Files:**
- Modify: `workshop/src/data/hamsters.js`

**Interfaces:**
- Produces: each hamster object gains a `diary` field — array of 3 strings

- [ ] **Step 1: Add diary entries to each hamster**

For each of the 12 hamsters, add a `diary` array with 3 short posts. Insert after the existing fields. Example for Biscuit:

```js
diary: [
  'Met a new human today! They had the BEST sunflower seeds. I did my happy dance and they smiled so big!',
  'Spent the afternoon collecting twigs for my nest. It\'s going to be the coziest nest in the whole colony. Just wait!',
  'Dreamt about an endless field of sunflower seeds last night. Woke up and my cheeks were already twitching with excitement!',
],
```

And for Boba:

```js
diary: [
  'Tried a new snack today — cinnamon oats! I ate so many my cheeks looked like two little balloons. No regrets!',
  'The human left the food jar open for 0.3 seconds. That was all I needed. Best. Day. Ever.',
  'Note to self: six meals a day might be too many. (Just kidding, it\'s definitely not enough.)',
],
```

And for Churro:

```js
diary: [
  'REARRANGED MY ENTIRE BEDDING AT 3 AM!!! The old layout was boring. The new layout is also boring but at least it\'s DIFFERENT!',
  'I hid a banana chip somewhere and now I can\'t find it. This is either a tragedy or a fun treasure hunt. Stay tuned.',
  'Ran in zigzags today until I got dizzy. Then I ran in circles. Then I napped for 10 minutes and did it all again.',
],
```

And for Cookie:

```js
diary: [
  'Inspected 47 sunflower seeds today. Three were acceptable. The standards must be maintained.',
  'The human gave me a blueberry. I examined it from every angle. It passed the test. Barely.',
  'Someone rearranged my food bowl. UNACCEPTABLE. I have spent two hours restoring proper color order.',
],
```

And for Dumpling:

```js
diary: [
  'Took three naps today. The first was excellent. The second was transcendent. The third was just showing off.',
  'Found the coziest corner behind the water bottle. No one can see me here. Perfect for some quality dozing.',
  'The wheel was looking at me today. I looked back. We came to an understanding. I napped instead.',
],
```

And for Maple:

```js
diary: [
  'Organized my food bowl by color gradient today. Red strawberries → orange carrots → yellow corn. A masterpiece.',
  'The human added a new seed to my bowl without arranging it properly. I had to redo the WHOLE layout. Sigh.',
  'Today\'s strawberry was perfectly symmetrical. I almost didn\'t want to eat it. Almost.',
],
```

And for Mochi:

```js
diary: [
  'The human came close to my cage today. I hid behind the wheel. They left a corn kernel. Maybe... maybe they\'re nice?',
  'I drew a tiny heart in the sand when no one was looking. If anyone finds it, I\'ll deny everything.',
  'Someone said my name today and I nearly fainted. But they also brought sweet corn, so maybe talking to humans isn\'t so scary?',
],
```

And for Peanut:

```js
diary: [
  'DUG A TUNNEL TODAY!!! It went nowhere but WHO CARES!!! The dirt was flying everywhere and it was GLORIOUS!!!',
  'Someone said the word "peanut" within earshot and I have been vibrating with excitement for the past four hours.',
  'Attempted to swim in the peanut jar. The human caught me. Worth it. I smelled like peanuts for the rest of the day.',
],
```

And for Pudding:

```js
diary: [
  'Drew a spiral pattern in the sand today. It represents the infinite cycle of seeds and naps. Or maybe I just like spirals.',
  'The human watched me draw for a whole minute. I got nervous and hid. But later I found a cucumber slice waiting for me. They understand.',
  'Started a new sand art piece today. It\'s a portrait of... well, you\'ll see when it\'s done. Art takes time.',
],
```

And for Sesame:

```js
diary: [
  'Achieved PERFECT cheek symmetry today! Two identical apple chunks. I stared at my reflection for an hour. Magnificent.',
  'The human laughed at my cheeks. I forgave them because they brought more apples. My cheeks forgive, but they never forget.',
  'New record: fit an entire apple slice plus three seeds in my right cheek alone. The left cheek is demanding equal treatment.',
],
```

And for Snowball:

```js
diary: [
  'Sat on the wheel today. Did not run on it. The wheel is not for running — it is a meditation platform. Few understand this.',
  'Contemplated the nature of seeds. They are tiny, yet they contain infinite potential. Also they taste good.',
  'The human asked why I never run on the wheel. I smiled enigmatically. Some questions have no answers. Some answers have no questions.',
],
```

And for Tofu:

```js
diary: [
  'NEW SPEED RECORD!!! 47 wheel rotations in 10 seconds!!! I am UNSTOPPABLE!!! The other hamsters think I\'m part cheetah!!!',
  'The wheel got so hot from friction today that I had to take a 30-second water break. Then I went RIGHT BACK to full speed.',
  'Found a carrot at the end of my run. Best reward ever. Carrots are like rocket fuel. TO THE WHEEL!!!',
],
```

- [ ] **Step 2: Verify data integrity**

Run: `cd workshop && node -e "import('./src/data/hamsters.js').then(m => { const h = m.default; console.log('Hamsters:', h.length); console.log('All have diary:', h.every(x => x.diary && x.diary.length === 3)); h.forEach(x => console.log(x.name, '- diary posts:', x.diary.length)); })"`
Expected: 12 hamsters, all have diary with 3 posts each.

- [ ] **Step 3: Commit**

```bash
git add workshop/src/data/hamsters.js
git commit -m "feat: add 3 diary posts per hamster (36 total)"
```

---

### Task 3: Create Diary component

**Files:**
- Create: `workshop/src/components/Diary.jsx`
- Create: `workshop/src/components/Diary.css`

**Interfaces:**
- Consumes: `hamster` prop with `{ name, diary: [...] }`
- Produces: `<Diary hamster={hamster} />` — renders diary section

- [ ] **Step 1: Write Diary.jsx**

```jsx
import './Diary.css';

function Diary({ hamster }) {
  const dates = ['July 22', 'July 20', 'July 18'];

  return (
    <section className="diary-section">
      <h3 className="diary-title">{hamster.name}'s Diary</h3>
      <div className="diary-posts">
        {hamster.diary.map((post, i) => (
          <div key={i} className="diary-post">
            <span className="diary-date">{dates[i]}</span>
            <p className="diary-text">{post}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Diary;
```

- [ ] **Step 2: Write Diary.css**

```css
.diary-section {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.diary-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #6b3a2a;
  margin-bottom: 16px;
}

.diary-posts {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.diary-post {
  background: #fef9f0;
  border-radius: 12px;
  padding: 14px 18px;
  border-left: 3px solid #d4956b;
}

.diary-date {
  font-size: 0.8rem;
  color: #b8a080;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.diary-text {
  font-size: 0.95rem;
  color: #5c4a38;
  line-height: 1.5;
  margin-top: 4px;
}
```

- [ ] **Step 3: Verify component exists and has correct exports**

Run: `cd workshop && npx vite build`
Expected: Build succeeds, no import errors.

- [ ] **Step 4: Commit**

```bash
git add workshop/src/components/Diary.jsx workshop/src/components/Diary.css
git commit -m "feat: add Diary component with 3 posts per hamster"
```

---

### Task 4: Create MoodBar component

**Files:**
- Create: `workshop/src/components/MoodBar.jsx`
- Create: `workshop/src/components/MoodBar.css`

**Interfaces:**
- Consumes: `mood` prop (number 0-100)
- Produces: `<MoodBar mood={mood} />` — renders progress bar + level label

- [ ] **Step 1: Write MoodBar.jsx**

```jsx
import './MoodBar.css';

function getMoodLevel(mood) {
  if (mood <= 19) return { level: 'Hungry', emoji: '😡' };
  if (mood <= 39) return { level: 'Sad', emoji: '😢' };
  if (mood <= 59) return { level: 'Neutral', emoji: '😐' };
  if (mood <= 79) return { level: 'Happy', emoji: '😊' };
  return { level: 'Overjoyed', emoji: '🤩' };
}

function getBarColor(mood) {
  if (mood <= 19) return '#e74c3c';
  if (mood <= 39) return '#f39c12';
  if (mood <= 59) return '#f1c40f';
  if (mood <= 79) return '#2ecc71';
  return '#9b59b6';
}

function MoodBar({ mood }) {
  const clamped = Math.max(0, Math.min(100, mood));
  const { level, emoji } = getMoodLevel(clamped);
  const barColor = getBarColor(clamped);

  return (
    <section className="mood-section">
      <div className="mood-header">
        <span className="mood-label">Mood</span>
        <span className="mood-value">{emoji} {level}</span>
      </div>
      <div className="mood-bar-track">
        <div
          className="mood-bar-fill"
          style={{
            width: `${clamped}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
      <span className="mood-number">{clamped}/100</span>
    </section>
  );
}

export default MoodBar;
```

- [ ] **Step 2: Write MoodBar.css**

```css
.mood-section {
  background: #fff;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.mood-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.mood-label {
  font-size: 1rem;
  font-weight: 700;
  color: #6b3a2a;
}

.mood-value {
  font-size: 1rem;
  font-weight: 600;
  color: #4a3728;
}

.mood-bar-track {
  width: 100%;
  height: 14px;
  background: #f0e6d3;
  border-radius: 7px;
  overflow: hidden;
}

.mood-bar-fill {
  height: 100%;
  border-radius: 7px;
  transition: width 0.4s ease, background-color 0.4s ease;
}

.mood-number {
  display: block;
  text-align: right;
  font-size: 0.8rem;
  color: #b8a080;
  margin-top: 4px;
}
```

- [ ] **Step 3: Verify build**

Run: `cd workshop && npx vite build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add workshop/src/components/MoodBar.jsx workshop/src/components/MoodBar.css
git commit -m "feat: add MoodBar component with 5-level progress"
```

---

### Task 5: Create FoodTray component

**Files:**
- Create: `workshop/src/components/FoodTray.jsx`
- Create: `workshop/src/components/FoodTray.css`

**Interfaces:**
- Consumes: `hamster` prop, `onFeed(foodId, isFavourite)`, `onHoverPenalty()`
- Produces: `<FoodTray hamster={hamster} onFeed={onFeed} onHoverPenalty={onHoverPenalty} />`

- [ ] **Step 1: Write FoodTray.jsx**

```jsx
import { useRef, useCallback } from 'react';
import { foods } from '../data/hamsters';
import './FoodTray.css';

function FoodTray({ hamster, onFeed, onHoverPenalty }) {
  const timers = useRef({});

  const handleMouseEnter = useCallback((foodId) => {
    timers.current[foodId] = setTimeout(() => {
      onHoverPenalty();
      delete timers.current[foodId];
    }, 2000);
  }, [onHoverPenalty]);

  const handleMouseLeave = useCallback((foodId) => {
    if (timers.current[foodId]) {
      clearTimeout(timers.current[foodId]);
      delete timers.current[foodId];
    }
  }, []);

  const handleClick = useCallback((foodId, isFavourite) => {
    if (timers.current[foodId]) {
      clearTimeout(timers.current[foodId]);
      delete timers.current[foodId];
    }
    onFeed(foodId, isFavourite);
  }, [onFeed]);

  return (
    <section className="foodtray-section">
      <h3 className="foodtray-title">Food Tray</h3>
      <div className="foodtray-grid">
        {foods.map((food) => {
          const isFavourite = food.id === hamster.favouriteFood;
          return (
            <button
              key={food.id}
              className={`food-btn ${isFavourite ? 'favourite' : ''}`}
              onMouseEnter={() => handleMouseEnter(food.id)}
              onMouseLeave={() => handleMouseLeave(food.id)}
              onClick={() => handleClick(food.id, isFavourite)}
            >
              <span className="food-emoji">{food.emoji}</span>
              <span className="food-name">{food.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default FoodTray;
```

- [ ] **Step 2: Write FoodTray.css**

```css
.foodtray-section {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.foodtray-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #6b3a2a;
  margin-bottom: 16px;
}

.foodtray-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.food-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border: 2px solid #e8d5b0;
  border-radius: 12px;
  background: #fef9f0;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.2s, box-shadow 0.2s;
  font-family: inherit;
}

.food-btn:hover {
  transform: scale(1.05);
  border-color: #d4956b;
}

.food-btn:active {
  transform: scale(0.95);
}

.food-btn.favourite {
  border-color: #e6a817;
  box-shadow: 0 0 8px rgba(230, 168, 23, 0.3);
}

.food-emoji {
  font-size: 1.5rem;
}

.food-name {
  font-size: 0.7rem;
  color: #6b3a2a;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
}

@media (max-width: 768px) {
  .foodtray-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

- [ ] **Step 3: Verify build**

Run: `cd workshop && npx vite build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add workshop/src/components/FoodTray.jsx workshop/src/components/FoodTray.css
git commit -m "feat: add FoodTray with 12 foods, hover penalty, golden border for favourite"
```

---

### Task 6: Create ChatBox component with fallback

**Files:**
- Create: `workshop/src/components/ChatBox.jsx`
- Create: `workshop/src/components/ChatBox.css`

**Interfaces:**
- Consumes: `hamster` prop with `{ name, personality, favouriteFood, hobby, catchphrase }`
- Produces: `<ChatBox hamster={hamster} />` — full chat UI with LLM + fallback

- [ ] **Step 1: Write ChatBox.jsx**

```jsx
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
```

- [ ] **Step 2: Write ChatBox.css**

```css
.chat-section {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}

.chat-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #6b3a2a;
  margin-bottom: 16px;
}

.chat-messages {
  flex: 1;
  min-height: 200px;
  max-height: 360px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 8px;
  margin-bottom: 16px;
}

.chat-placeholder {
  color: #b8a080;
  font-style: italic;
  text-align: center;
  padding: 32px 0;
}

.chat-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 14px;
}

.chat-bubble.user {
  align-self: flex-end;
  background: #d4956b;
  color: #fff;
}

.chat-bubble.hamster {
  align-self: flex-start;
  background: #fef9f0;
  border: 1px solid #e8d5b0;
}

.chat-role {
  font-size: 0.7rem;
  font-weight: 700;
  display: block;
  margin-bottom: 2px;
  opacity: 0.8;
}

.chat-content {
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
}

.chat-content.typing {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.chat-input-row {
  display: flex;
  gap: 8px;
}

.chat-input {
  flex: 1;
  padding: 10px 14px;
  border: 2px solid #e8d5b0;
  border-radius: 12px;
  font-size: 0.95rem;
  font-family: inherit;
  color: #4a3728;
  outline: none;
  transition: border-color 0.2s;
}

.chat-input:focus {
  border-color: #d4956b;
}

.chat-input:disabled {
  background: #f5f0e8;
}

.chat-send-btn {
  padding: 10px 20px;
  background: #d4956b;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  font-family: inherit;
}

.chat-send-btn:hover:not(:disabled) {
  background: #c17f53;
}

.chat-send-btn:disabled {
  background: #d4c4b0;
  cursor: not-allowed;
}
```

- [ ] **Step 3: Verify build**

Run: `cd workshop && npx vite build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add workshop/src/components/ChatBox.jsx workshop/src/components/ChatBox.css
git commit -m "feat: add ChatBox with LLM proxy and keyword fallback"
```

---

### Task 7: Rework HamsterPage — integrate all F2 components

**Files:**
- Modify: `workshop/src/pages/HamsterPage.jsx`
- Modify: `workshop/src/pages/HamsterPage.css`

**Interfaces:**
- Consumes: Diary, FoodTray, MoodBar, ChatBox components
- Produces: Full F2 HamsterPage with mood state, feed handler, layout

- [ ] **Step 1: Rewrite HamsterPage.jsx**

```jsx
import { useState, useCallback } from 'react';
import hamsters, { foods } from '../data/hamsters';
import Diary from '../components/Diary';
import FoodTray from '../components/FoodTray';
import MoodBar from '../components/MoodBar';
import ChatBox from '../components/ChatBox';
import './HamsterPage.css';

function getRandomHamster() {
  const index = Math.floor(Math.random() * hamsters.length);
  return hamsters[index];
}

function getFoodInfo(foodId) {
  return foods.find((f) => f.id === foodId) || { label: foodId, emoji: '' };
}

function HamsterPage() {
  const [hamster, setHamster] = useState(() => getRandomHamster());
  const [mood, setMood] = useState(50);

  const handleVisitAnother = useCallback(() => {
    setHamster(getRandomHamster());
    setMood(50);
  }, []);

  const handleFeed = useCallback((foodId, isFavourite) => {
    setMood((prev) => {
      const boost = isFavourite ? hamster.moodBoost : 3;
      return Math.max(0, Math.min(100, prev + boost));
    });
  }, [hamster.moodBoost]);

  const handleHoverPenalty = useCallback(() => {
    setMood((prev) => Math.max(0, Math.min(100, prev - 5)));
  }, []);

  const food = getFoodInfo(hamster.favouriteFood);

  return (
    <main className="hamster-page">
      <div className="hamster-layout">
        {/* Hamster Card (existing) */}
        <div className="hamster-card">
          <div className="hamster-photo-wrapper">
            <img
              src={hamster.image}
              alt={hamster.name}
              className="hamster-photo"
            />
          </div>

          <div className="hamster-info">
            <h2 className="hamster-name">{hamster.name}</h2>
            <p className="hamster-catchphrase">"{hamster.catchphrase}"</p>

            <div className="hamster-details">
              <div className="detail-item">
                <span className="detail-label">Age</span>
                <span className="detail-value">{hamster.age}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Personality</span>
                <span className="detail-value">{hamster.personality}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Favourite Food</span>
                <span className="detail-value">{food.emoji} {food.label}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Hobby</span>
                <span className="detail-value">{hamster.hobby}</span>
              </div>
            </div>

            <p className="hamster-bio">{hamster.bio}</p>

            <button className="visit-another-btn" onClick={handleVisitAnother}>
              Visit Another
            </button>
          </div>
        </div>

        {/* F2 Sections */}
        <Diary hamster={hamster} />

        <FoodTray
          hamster={hamster}
          onFeed={handleFeed}
          onHoverPenalty={handleHoverPenalty}
        />

        <MoodBar mood={mood} />

        <ChatBox hamster={hamster} />
      </div>
    </main>
  );
}

export default HamsterPage;
```

- [ ] **Step 2: Update HamsterPage.css**

Replace the existing `.hamster-page` content with the F2 layout:

```css
.hamster-page {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 32px 16px;
}

.hamster-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 750px;
  width: 100%;
}

/* --- Hamster Card (kept from F1) --- */
.hamster-card {
  display: flex;
  gap: 40px;
  background: #fff;
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  align-items: center;
}

.hamster-photo-wrapper {
  flex-shrink: 0;
}

.hamster-photo {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #e8d5b0;
}

.hamster-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hamster-name {
  font-size: 1.8rem;
  font-weight: 700;
  color: #6b3a2a;
}

.hamster-catchphrase {
  font-style: italic;
  color: #8b7355;
  font-size: 1rem;
}

.hamster-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 24px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #b8a080;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 1rem;
  color: #4a3728;
  font-weight: 500;
}

.hamster-bio {
  font-size: 0.95rem;
  color: #5c4a38;
  line-height: 1.6;
  margin-top: 4px;
}

.visit-another-btn {
  align-self: flex-start;
  margin-top: 8px;
  padding: 10px 24px;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background-color: #d4956b;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
  font-family: inherit;
}

.visit-another-btn:hover {
  background-color: #c17f53;
  transform: scale(1.03);
}

.visit-another-btn:active {
  transform: scale(0.97);
}

/* --- Mobile --- */
@media (max-width: 768px) {
  .hamster-page {
    padding: 16px;
  }

  .hamster-layout {
    gap: 16px;
  }

  .hamster-card {
    flex-direction: column;
    padding: 24px;
    gap: 24px;
    text-align: center;
  }

  .hamster-photo {
    width: 180px;
    height: 180px;
  }

  .hamster-details {
    grid-template-columns: 1fr;
    text-align: left;
  }

  .hamster-name {
    font-size: 1.5rem;
  }

  .visit-another-btn {
    align-self: center;
  }
}
```

- [ ] **Step 3: Verify build and F1 regression**

Run: `cd workshop && npx vite build`
Expected: Build succeeds, 0 errors.

Run: `cd workshop && npm run dev`
Expected: 
- `/` HomePage unchanged
- `/hamster` shows: hamster card + Diary + FoodTray + MoodBar + ChatBox
- "Visit Another" resets mood to 50 and messages
- F1 criteria all still pass:
  - HomePage with home.jpg ✅
  - HamsterPage shows hamster card ✅
  - Navbar works ✅
  - Mobile stacks vertically ✅

- [ ] **Step 4: Commit**

```bash
git add workshop/src/pages/HamsterPage.jsx workshop/src/pages/HamsterPage.css
git commit -m "feat: integrate Diary, FoodTray, MoodBar, ChatBox into HamsterPage"
```

---

## Self-Review Checklist

1. **Spec coverage:**
   - Diary: Task 2+3 ✅
   - Food Tray + hover penalty: Task 5 ✅
   - Mood system (0-100, 5 levels, feed rules): Task 4+7 ✅
   - Chat (LLM proxy + fallback): Task 1+6 ✅
   - Express backend: Task 1 ✅
   - F1 regression: Task 7 step 3 ✅
   - No F3 leaks: verified across all tasks ✅

2. **Placeholders:** None — all code is complete ✅

3. **Type consistency:** `hamster.favouriteFood` camelCase, `moodBoost` from data, `handleFeed(foodId, isFavourite)` signature consistent across FoodTray and HamsterPage ✅
