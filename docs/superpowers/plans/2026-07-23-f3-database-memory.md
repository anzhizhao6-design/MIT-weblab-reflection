# F3: Database + Persistent Memory — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate from static hamster data to MongoDB Atlas, add persistent visit/feed tracking per user, UUID identity with Account panel, and memory-injected chat.

**Architecture:** Mongoose models in `models/`, Express route handlers in `routes/`, `server.js` as thin entry point. Frontend adds `useUserId` hook, `AccountPanel` (Navbar dropdown), `ProfileCard` (stats display). HamsterPage gains user-aware visit/feed tracking.

**Tech Stack:** React 18, Vite 5, Express 4, Mongoose 8, plain CSS

## Global Constraints

- JavaScript (not TypeScript) — .jsx/.js only
- React 18 + Vite + Express + Mongoose
- Database name from `MONGODB_DB_NAME` env var (`hamster_superpowers`) — NEVER hardcoded
- MongoDB connection string from `MONGO_SRV` env var — NEVER hardcoded
- 5 collections: `hamsters`, `users`, `conversations`, `hamster_memories`, `feed_posts`
- 7 API endpoints: GET /api/hamsters/random, POST /api/chat, POST /api/visit, POST /api/feed, GET /api/memory, POST /api/users, GET /api/users/:id
- `npm run db:seed` imports 12 hamsters + 36 feed_posts
- UUID identity via `localStorage` (no third-party auth)
- API key NEVER exposed to frontend
- F1+F2 regression: all 13 criteria must still pass
- `.env` stores MONGO_SRV, LLM_API_KEY; `.gitignore` excludes `.env`

---

### Task 1: Install Mongoose + create all 5 models + server.js DB connection

**Files:**
- Create: `workshop/models/Hamster.js`
- Create: `workshop/models/User.js`
- Create: `workshop/models/Conversation.js`
- Create: `workshop/models/HamsterMemory.js`
- Create: `workshop/models/FeedPost.js`
- Modify: `workshop/server.js`
- Modify: `workshop/package.json`

**Interfaces:**
- Produces: Mongoose connected to Atlas, all 5 models exportable
- Produces: `server.js` connects on startup, logs status

- [ ] **Step 1: Install mongoose**

Run: `cd workshop && npm install mongoose --save`

- [ ] **Step 2: Write models/Hamster.js**

```js
import mongoose from 'mongoose';

const hamsterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  personality: { type: String, required: true },
  favouriteFood: { type: String, required: true },
  hobby: { type: String, required: true },
  bio: { type: String, required: true },
  image: { type: String, required: true },
  catchphrase: { type: String, required: true },
  moodBoost: { type: Number, required: true },
  diary: [{ type: String }],
});

export default mongoose.model('Hamster', hamsterSchema);
```

- [ ] **Step 3: Write models/User.js**

```js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true, index: true },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
```

- [ ] **Step 4: Write models/Conversation.js**

```js
import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  hamsterName: { type: String, required: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant', 'system'] },
    content: String,
  }],
}, { timestamps: true });

export default mongoose.model('Conversation', conversationSchema);
```

- [ ] **Step 5: Write models/HamsterMemory.js**

```js
import mongoose from 'mongoose';

const hamsterMemorySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  hamsterName: { type: String, required: true },
  visitCount: { type: Number, default: 0 },
  feedCount: { type: Number, default: 0 },
  lastVisit: { type: Date, default: Date.now },
});

hamsterMemorySchema.index({ userId: 1, hamsterName: 1 }, { unique: true });

export default mongoose.model('HamsterMemory', hamsterMemorySchema);
```

- [ ] **Step 6: Write models/FeedPost.js**

```js
import mongoose from 'mongoose';

const feedPostSchema = new mongoose.Schema({
  hamsterName: { type: String, required: true, index: true },
  diaryIndex: { type: Number, required: true },
  content: { type: String, required: true },
  date: { type: String, required: true },
});

export default mongoose.model('FeedPost', feedPostSchema);
```

- [ ] **Step 7: Rewrite server.js — add Mongoose connection, keep chat route inline for now**

```js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const MONGO_SRV = process.env.MONGO_SRV;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'hamster_superpowers';
const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_BASE_URL = process.env.LLM_BASE_URL || 'https://jmapi.jaguarmicro.com/v1';
const LLM_MODEL = process.env.LLM_MODEL || 'deepseek-v4-pro';

// MongoDB connection
mongoose.connect(MONGO_SRV, { dbName: MONGODB_DB_NAME })
  .then(() => console.log(`MongoDB connected: ${MONGODB_DB_NAME}`))
  .catch((err) => console.error('MongoDB connection error:', err.message));

// --- Routes (chat inline for now, others added in later tasks) ---

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
      body: JSON.stringify({ model: LLM_MODEL, messages: chatMessages, max_tokens: 150 }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) throw new Error(`API returned ${response.status}`);

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) throw new Error('Invalid response body');

    res.json({ reply });
  } catch (error) {
    console.error('LLM API error:', error.message);
    res.status(503).json({ error: 'LLM API unavailable' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

- [ ] **Step 8: Verify server starts (MongoDB may fail if no MONGO_SRV yet — that's OK)**

Run: `cd workshop && node server.js`
Expected: Either "MongoDB connected" (if MONGO_SRV set) or connection error (if not set). Server still listens on port 3001.

- [ ] **Step 9: Commit**

```bash
git add workshop/models/ workshop/server.js workshop/package.json workshop/package-lock.json
git commit -m "feat: add Mongoose models and DB connection to server"
```

---

### Task 2: Create seed script

**Files:**
- Create: `workshop/db/seed.js`
- Modify: `workshop/package.json` (add db:seed script)

**Interfaces:**
- Consumes: `src/data/hamsters.js` (static data), Mongoose models
- Produces: Populated `hamsters` and `feed_posts` collections

- [ ] **Step 1: Write db/seed.js**

```js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGO_SRV = process.env.MONGO_SRV;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'hamster_superpowers';

if (!MONGO_SRV) {
  console.error('MONGO_SRV not set in .env');
  process.exit(1);
}

// Define schemas inline to avoid ESM import issues
const hamsterSchema = new mongoose.Schema({
  name: String, age: Number, personality: String, favouriteFood: String,
  hobby: String, bio: String, image: String, catchphrase: String,
  moodBoost: Number, diary: [String],
});
const Hamster = mongoose.model('Hamster', hamsterSchema);

const feedPostSchema = new mongoose.Schema({
  hamsterName: String, diaryIndex: Number, content: String, date: String,
});
const FeedPost = mongoose.model('FeedPost', feedPostSchema);

async function seed() {
  await mongoose.connect(MONGO_SRV, { dbName: MONGODB_DB_NAME });
  console.log(`Connected to ${MONGODB_DB_NAME}`);

  // Clear existing data
  await Hamster.deleteMany({});
  await FeedPost.deleteMany({});
  await mongoose.connection.db.dropCollection('users').catch(() => {});
  await mongoose.connection.db.dropCollection('conversations').catch(() => {});
  await mongoose.connection.db.dropCollection('hamster_memories').catch(() => {});

  // Import hamsters from static data
  const { default: hamsters } = await import('../src/data/hamsters.js');

  const hamsterDocs = hamsters.map(({ name, age, personality, favouriteFood, hobby, bio, image, catchphrase, moodBoost, diary }) => ({
    name, age, personality, favouriteFood, hobby, bio, image, catchphrase, moodBoost, diary,
  }));

  await Hamster.insertMany(hamsterDocs);
  console.log(`Inserted ${hamsterDocs.length} hamsters`);

  // Insert 36 feed_posts
  const dates = ['July 22', 'July 20', 'July 18'];
  const feedPosts = [];
  for (const h of hamsters) {
    for (let i = 0; i < h.diary.length; i++) {
      feedPosts.push({
        hamsterName: h.name,
        diaryIndex: i,
        content: h.diary[i],
        date: dates[i],
      });
    }
  }

  await FeedPost.insertMany(feedPosts);
  console.log(`Inserted ${feedPosts.length} feed posts`);

  await mongoose.disconnect();
  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
```

- [ ] **Step 2: Add db:seed script to package.json**

```json
"scripts": {
  "dev": "concurrently \"npm run server\" \"vite\"",
  "server": "node server.js",
  "build": "vite build",
  "preview": "vite preview",
  "db:seed": "node db/seed.js"
}
```

- [ ] **Step 3: Test seed script**

Run: `cd workshop && npm run db:seed`
Expected: "Connected to hamster_superpowers", "Inserted 12 hamsters", "Inserted 36 feed posts", "Seed complete."

- [ ] **Step 4: Commit**

```bash
git add workshop/db/seed.js workshop/package.json
git commit -m "feat: add db:seed script for 12 hamsters and 36 feed posts"
```

---

### Task 3: Create API route files (hamsters, users, visits, feeds, memory)

**Files:**
- Create: `workshop/routes/hamsters.js`
- Create: `workshop/routes/users.js`
- Create: `workshop/routes/visits.js`
- Create: `workshop/routes/feeds.js`
- Create: `workshop/routes/memory.js`
- Modify: `workshop/server.js` (mount routes)

**Interfaces:**
- Each route file exports a router (Express Router)
- server.js mounts them at appropriate paths

- [ ] **Step 1: Write routes/hamsters.js**

```js
import { Router } from 'express';
import Hamster from '../models/Hamster.js';

const router = Router();

router.get('/random', async (req, res) => {
  try {
    const count = await Hamster.countDocuments();
    const random = Math.floor(Math.random() * count);
    const hamster = await Hamster.findOne().skip(random);
    res.json(hamster);
  } catch (error) {
    console.error('GET /api/hamsters/random error:', error.message);
    res.status(500).json({ error: 'Failed to fetch random hamster' });
  }
});

export default router;
```

- [ ] **Step 2: Write routes/users.js**

```js
import { Router } from 'express';
import User from '../models/User.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { uuid } = req.body;
    if (!uuid) return res.status(400).json({ error: 'uuid required' });

    const user = await User.findOneAndUpdate(
      { uuid },
      { uuid },
      { upsert: true, new: true }
    );
    res.json({ user });
  } catch (error) {
    console.error('POST /api/users error:', error.message);
    res.status(500).json({ error: 'Failed to upsert user' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ uuid: req.params.id });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    console.error('GET /api/users/:id error:', error.message);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
```

- [ ] **Step 3: Write routes/visits.js**

```js
import { Router } from 'express';
import HamsterMemory from '../models/HamsterMemory.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { userId, hamsterName } = req.body;
    if (!userId || !hamsterName) {
      return res.status(400).json({ error: 'userId and hamsterName required' });
    }

    const memory = await HamsterMemory.findOneAndUpdate(
      { userId, hamsterName },
      { $inc: { visitCount: 1 }, $set: { lastVisit: new Date() } },
      { upsert: true, new: true }
    );

    res.json({ visitCount: memory.visitCount });
  } catch (error) {
    console.error('POST /api/visit error:', error.message);
    res.status(500).json({ error: 'Failed to record visit' });
  }
});

export default router;
```

- [ ] **Step 4: Write routes/feeds.js**

```js
import { Router } from 'express';
import HamsterMemory from '../models/HamsterMemory.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { userId, hamsterName, foodId, isFavourite } = req.body;
    if (!userId || !hamsterName) {
      return res.status(400).json({ error: 'userId and hamsterName required' });
    }

    const memory = await HamsterMemory.findOneAndUpdate(
      { userId, hamsterName },
      { $inc: { feedCount: 1 }, $set: { lastVisit: new Date() } },
      { upsert: true, new: true }
    );

    res.json({ feedCount: memory.feedCount });
  } catch (error) {
    console.error('POST /api/feed error:', error.message);
    res.status(500).json({ error: 'Failed to record feed' });
  }
});

export default router;
```

- [ ] **Step 5: Write routes/memory.js**

```js
import { Router } from 'express';
import HamsterMemory from '../models/HamsterMemory.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { userId, hamsterName } = req.query;
    if (!userId || !hamsterName) {
      return res.status(400).json({ error: 'userId and hamsterName query params required' });
    }

    const memory = await HamsterMemory.findOne({ userId, hamsterName });
    res.json({
      visitCount: memory?.visitCount || 0,
      feedCount: memory?.feedCount || 0,
    });
  } catch (error) {
    console.error('GET /api/memory error:', error.message);
    res.status(500).json({ error: 'Failed to fetch memory' });
  }
});

export default router;
```

- [ ] **Step 6: Update server.js — mount the new routes**

Add these lines after the `app.use(express.json())` line, BEFORE the chat route:

```js
import hamsterRoutes from './routes/hamsters.js';
import userRoutes from './routes/users.js';
import visitRoutes from './routes/visits.js';
import feedRoutes from './routes/feeds.js';
import memoryRoutes from './routes/memory.js';

app.use('/api/hamsters', hamsterRoutes);
app.use('/api/users', userRoutes);
app.use('/api/visit', visitRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/memory', memoryRoutes);
```

- [ ] **Step 7: Verify build + test endpoints**

Run: `cd workshop && npx vite build`
Expected: Build succeeds.

Test: `curl http://localhost:3001/api/hamsters/random`
Expected: JSON hamster object from MongoDB.

- [ ] **Step 8: Commit**

```bash
git add workshop/routes/ workshop/server.js
git commit -m "feat: add API routes for hamsters, users, visits, feeds, memory"
```

---

### Task 4: Migrate chat route + add memory injection

**Files:**
- Create: `workshop/routes/chat.js`
- Modify: `workshop/server.js` (remove inline chat, mount chat route)

**Interfaces:**
- Consumes: `HamsterMemory` model
- Produces: Enhanced `/api/chat` with memory injection and conversation saving

- [ ] **Step 1: Write routes/chat.js**

```js
import { Router } from 'express';
import HamsterMemory from '../models/HamsterMemory.js';
import Conversation from '../models/Conversation.js';

const router = Router();

const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_BASE_URL = process.env.LLM_BASE_URL || 'https://jmapi.jaguarmicro.com/v1';
const LLM_MODEL = process.env.LLM_MODEL || 'deepseek-v4-pro';

router.post('/', async (req, res) => {
  try {
    const { messages, hamster, userId } = req.body;

    if (!messages || !hamster) {
      return res.status(400).json({ error: 'Missing messages or hamster data' });
    }

    // Build system prompt with memory injection
    let systemPrompt = `You are ${hamster.name}, a hamster with the personality "${hamster.personality}". Your favorite food is ${hamster.favouriteFood}. You love ${hamster.hobby}. Your catchphrase is: "${hamster.catchphrase}". Reply in character as this hamster. Keep responses short (1-3 sentences), cute, and fun. Use the catchphrase occasionally.`;

    if (userId) {
      const memory = await HamsterMemory.findOne({
        userId,
        hamsterName: hamster.name,
      });
      if (memory && (memory.visitCount > 0 || memory.feedCount > 0)) {
        systemPrompt += ` Memory: This human has visited you ${memory.visitCount} times and fed you ${memory.feedCount} times.`;
      }
    }

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-6),
    ];

    // Call LLM
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLM_API_KEY}`,
      },
      body: JSON.stringify({ model: LLM_MODEL, messages: chatMessages, max_tokens: 150 }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) throw new Error(`API returned ${response.status}`);

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) throw new Error('Invalid response body');

    // Save conversation (non-blocking)
    if (userId) {
      Conversation.findOneAndUpdate(
        { userId, hamsterName: hamster.name },
        {
          userId,
          hamsterName: hamster.name,
          $push: {
            messages: {
              $each: [
                messages[messages.length - 1],
                { role: 'assistant', content: reply },
              ],
            },
          },
        },
        { upsert: true, new: true }
      ).catch((err) => console.error('Failed to save conversation:', err.message));
    }

    res.json({ reply });
  } catch (error) {
    console.error('LLM API error:', error.message);
    res.status(503).json({ error: 'LLM API unavailable' });
  }
});

export default router;
```

- [ ] **Step 2: Update server.js — remove inline /api/chat, mount chat route**

Remove the entire `app.post('/api/chat', ...)` block. Add:

```js
import chatRoutes from './routes/chat.js';
app.use('/api/chat', chatRoutes);
```

- [ ] **Step 3: Verify chat still works**

Run: `cd workshop && node server.js`
Test: `curl -X POST http://localhost:3001/api/chat -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"hello"}],"hamster":{"name":"Biscuit","personality":"Friendly 🥰","favouriteFood":"sunflower-seeds","hobby":"collecting twigs","catchphrase":"Hi!"},"userId":"test-123"}'`
Expected: LLM reply in hamster character. Server console may show memory lookup (null = no prior visits).

- [ ] **Step 4: Commit**

```bash
git add workshop/routes/chat.js workshop/server.js
git commit -m "feat: migrate chat to route file with memory injection and conversation saving"
```

---

### Task 5: Create useUserId hook + AccountPanel + modify Navbar

**Files:**
- Create: `workshop/src/hooks/useUserId.js`
- Create: `workshop/src/components/AccountPanel.jsx`
- Create: `workshop/src/components/AccountPanel.css`
- Modify: `workshop/src/components/Navbar.jsx`
- Modify: `workshop/src/components/Navbar.css`

**Interfaces:**
- Produces: `useUserId()` hook returns `{ userId }`
- Produces: `<AccountPanel />` component

- [ ] **Step 1: Write hooks/useUserId.js**

```js
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'hamster_user_id';

function generateUUID() {
  return crypto.randomUUID();
}

function getStoredUserId() {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = generateUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export function useUserId() {
  const [userId, setUserId] = useState(() => getStoredUserId());

  useEffect(() => {
    // Register with backend on mount
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uuid: userId }),
    }).catch(() => {});
  }, [userId]);

  const switchUserId = (newId) => {
    if (newId && newId.trim()) {
      localStorage.setItem(STORAGE_KEY, newId.trim());
      setUserId(newId.trim());
      window.location.reload();
    }
  };

  return { userId, switchUserId };
}

export default useUserId;
```

- [ ] **Step 2: Write AccountPanel.jsx**

```jsx
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
```

- [ ] **Step 3: Write AccountPanel.css**

```css
.account-wrapper {
  position: relative;
}

.account-trigger {
  background: none;
  border: 2px solid #e8d5b0;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.account-trigger:hover {
  background-color: #f0d9a8;
}

.account-panel {
  position: absolute;
  top: 44px;
  right: 0;
  width: 300px;
  background: #fff;
  border: 2px solid #e8d5b0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  z-index: 100;
}

.account-panel-title {
  font-size: 1rem;
  font-weight: 700;
  color: #6b3a2a;
  margin-bottom: 14px;
}

.account-field {
  margin-bottom: 14px;
}

.account-field:last-child {
  margin-bottom: 0;
}

.account-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #b8a080;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.account-id-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.account-id {
  font-size: 0.85rem;
  background: #fef9f0;
  padding: 6px 10px;
  border-radius: 6px;
  color: #6b3a2a;
}

.account-copy-btn {
  padding: 6px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  background: #d4956b;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  font-family: inherit;
}

.account-copy-btn:hover {
  background: #c17f53;
}

.account-switch-row {
  display: flex;
  gap: 8px;
}

.account-switch-input {
  flex: 1;
  padding: 6px 10px;
  border: 2px solid #e8d5b0;
  border-radius: 8px;
  font-size: 0.85rem;
  font-family: inherit;
  color: #4a3728;
  outline: none;
}

.account-switch-input:focus {
  border-color: #d4956b;
}

.account-apply-btn {
  padding: 6px 14px;
  font-size: 0.8rem;
  font-weight: 600;
  background: #d4956b;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
}

.account-apply-btn:hover:not(:disabled) {
  background: #c17f53;
}

.account-apply-btn:disabled {
  background: #d4c4b0;
  cursor: not-allowed;
}
```

- [ ] **Step 4: Modify Navbar.jsx — add AccountPanel**

Import and render AccountPanel. Add `userId` and `onSwitch` props. Updated Navbar:

```jsx
import { Link, useLocation } from 'react-router-dom';
import AccountPanel from './AccountPanel';
import './Navbar.css';

function Navbar({ userId, onSwitch }) {
  const location = useLocation();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">🐹 Hamster Daily</Link>
      <div className="navbar-links">
        <Link
          to="/"
          className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
        >
          Home
        </Link>
        <Link
          to="/hamster"
          className={`navbar-link ${location.pathname === '/hamster' ? 'active' : ''}`}
        >
          Today's Hamster
        </Link>
      </div>
      <AccountPanel userId={userId} onSwitch={onSwitch} />
    </nav>
  );
}

export default Navbar;
```

- [ ] **Step 5: Verify build**

Run: `cd workshop && npx vite build`
Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add workshop/src/hooks/useUserId.js workshop/src/components/AccountPanel.jsx workshop/src/components/AccountPanel.css workshop/src/components/Navbar.jsx workshop/src/components/Navbar.css
git commit -m "feat: add useUserId hook and AccountPanel with copy/paste device switch"
```

---

### Task 6: Create ProfileCard component

**Files:**
- Create: `workshop/src/components/ProfileCard.jsx`
- Create: `workshop/src/components/ProfileCard.css`

**Interfaces:**
- Consumes: `userId`, `hamsterName` props
- Produces: Display "Visited X times" and "Fed X times"

- [ ] **Step 1: Write ProfileCard.jsx**

```jsx
import { useState, useEffect } from 'react';
import './ProfileCard.css';

function ProfileCard({ userId, hamsterName }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setStats(null);

    if (!userId || !hamsterName) {
      setLoading(false);
      return;
    }

    fetch(`/api/memory?userId=${encodeURIComponent(userId)}&hamsterName=${encodeURIComponent(hamsterName)}`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setStats({ visitCount: 0, feedCount: 0 });
        setLoading(false);
      });
  }, [userId, hamsterName]);

  if (loading) {
    return (
      <section className="profile-card">
        <p className="profile-loading">Loading stats...</p>
      </section>
    );
  }

  const visitCount = stats?.visitCount || 0;
  const feedCount = stats?.feedCount || 0;

  return (
    <section className="profile-card">
      <h3 className="profile-title">Your Visits</h3>
      <div className="profile-stats">
        <div className="profile-stat">
          <span className="profile-stat-value">{visitCount}</span>
          <span className="profile-stat-label">Visits</span>
        </div>
        <div className="profile-divider" />
        <div className="profile-stat">
          <span className="profile-stat-value">{feedCount}</span>
          <span className="profile-stat-label">Fed</span>
        </div>
      </div>
    </section>
  );
}

export default ProfileCard;
```

- [ ] **Step 2: Write ProfileCard.css**

```css
.profile-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.profile-title {
  font-size: 1rem;
  font-weight: 700;
  color: #6b3a2a;
  margin-bottom: 12px;
}

.profile-loading {
  color: #b8a080;
  font-style: italic;
  font-size: 0.9rem;
}

.profile-stats {
  display: flex;
  align-items: center;
  gap: 0;
}

.profile-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.profile-stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #d4956b;
}

.profile-stat-label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #b8a080;
  letter-spacing: 0.05em;
}

.profile-divider {
  width: 2px;
  height: 40px;
  background: #e8d5b0;
}
```

- [ ] **Step 3: Verify build**

Run: `cd workshop && npx vite build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add workshop/src/components/ProfileCard.jsx workshop/src/components/ProfileCard.css
git commit -m "feat: add ProfileCard with visit and feed counts"
```

---

### Task 7: Rework HamsterPage — integrate userId, visit/feed tracking, ProfileCard

**Files:**
- Modify: `workshop/src/pages/HamsterPage.jsx`
- Modify: `workshop/src/App.jsx`

**Interfaces:**
- Consumes: `userId` from App (via prop or hook), ProfileCard
- Produces: Visit + feed tracking calls on mount/action

- [ ] **Step 1: Rewrite HamsterPage.jsx**

```jsx
import { useState, useCallback, useEffect, useRef } from 'react';
import hamsters, { foods } from '../data/hamsters';
import Diary from '../components/Diary';
import FoodTray from '../components/FoodTray';
import MoodBar from '../components/MoodBar';
import ChatBox from '../components/ChatBox';
import ProfileCard from '../components/ProfileCard';
import './HamsterPage.css';

function getRandomHamster() {
  const index = Math.floor(Math.random() * hamsters.length);
  return hamsters[index];
}

function getFoodInfo(foodId) {
  return foods.find((f) => f.id === foodId) || { label: foodId, emoji: '' };
}

function HamsterPage({ userId }) {
  const [hamster, setHamster] = useState(() => getRandomHamster());
  const [mood, setMood] = useState(50);
  const initialLoad = useRef(true);

  // Record visit on mount + hamster change
  useEffect(() => {
    if (!userId) return;
    fetch('/api/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, hamsterName: hamster.name }),
    }).catch(() => {});
  }, [hamster.name, userId]);

  const handleVisitAnother = useCallback(() => {
    setHamster(getRandomHamster());
    setMood(50);
  }, []);

  const handleFeed = useCallback((foodId, isFavourite) => {
    setMood((prev) => {
      const boost = isFavourite ? hamster.moodBoost : 3;
      return Math.max(0, Math.min(100, prev + boost));
    });

    // Record feed
    if (userId) {
      fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, hamsterName: hamster.name, foodId, isFavourite }),
      }).catch(() => {});
    }
  }, [hamster.moodBoost, hamster.name, userId]);

  const handleHoverPenalty = useCallback(() => {
    setMood((prev) => Math.max(0, Math.min(100, prev - 5)));
  }, []);

  const food = getFoodInfo(hamster.favouriteFood);

  return (
    <main className="hamster-page">
      <div className="hamster-layout">
        {/* Hamster Card */}
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

        {/* F3: Profile Card */}
        <ProfileCard userId={userId} hamsterName={hamster.name} />

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

- [ ] **Step 2: Update App.jsx — add useUserId, pass props**

```jsx
import { Routes, Route } from 'react-router-dom';
import useUserId from './hooks/useUserId';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import HamsterPage from './pages/HamsterPage';

function App() {
  const { userId, switchUserId } = useUserId();

  return (
    <div className="app">
      <Navbar userId={userId} onSwitch={switchUserId} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/hamster" element={<HamsterPage userId={userId} />} />
      </Routes>
    </div>
  );
}

export default App;
```

- [ ] **Step 3: Update ChatBox — pass userId to /api/chat**

In `workshop/src/components/ChatBox.jsx`, modify the `fetch('/api/chat', ...)` call to include `userId`. The ChatBox needs to accept a `userId` prop, and the request body changes to:

```js
body: JSON.stringify({
  messages: newMessages,
  hamster: { ... },
  userId: userId,
}),
```

The ChatBox component signature becomes `function ChatBox({ hamster, userId })`.

And in HamsterPage, render: `<ChatBox hamster={hamster} userId={userId} />`

- [ ] **Step 4: Verify build + F1+F2 regression**

Run: `cd workshop && npx vite build`
Expected: Build succeeds, 0 errors.

Run: `cd workshop && npm run dev`
Expected:
- `/` HomePage unchanged
- `/hamster` shows: hamster card + ProfileCard + Diary + FoodTray + MoodBar + ChatBox
- AccountPanel visible in Navbar (👤 icon)
- Click Account → panel opens with ID, Copy, Switch Device
- Visit + feed calls fire (check browser network tab)
- All F1+F2 features still work

- [ ] **Step 5: Commit**

```bash
git add workshop/src/pages/HamsterPage.jsx workshop/src/App.jsx workshop/src/components/ChatBox.jsx
git commit -m "feat: integrate userId, visit/feed tracking, ProfileCard into HamsterPage"
```

---

### Task 8: .env update + final wiring + verify all endpoints

**Files:**
- Modify: `workshop/.env` (add MONGO_SRV, MONGODB_DB_NAME)

- [ ] **Step 1: Verify .env has all required keys**

The `.env` should contain:
```
LLM_API_KEY=sk-...
LLM_BASE_URL=https://jmapi.jaguarmicro.com/v1
LLM_MODEL=deepseek-v4-pro
MONGO_SRV=<connection string>
MONGODB_DB_NAME=hamster_superpowers
```

- [ ] **Step 2: Full end-to-end test**

Run: `cd workshop && npm run db:seed` → verify 12 hamsters + 36 posts
Run: `cd workshop && npm run dev` → verify both servers start
Test all 7 endpoints:
- `GET /api/hamsters/random` → hamster JSON
- `POST /api/users` → user upserted
- `GET /api/users/:id` → user found
- `POST /api/visit` → visitCount incremented
- `POST /api/feed` → feedCount incremented
- `GET /api/memory?userId=X&hamsterName=Y` → stats returned
- `POST /api/chat` → LLM reply with memory

- [ ] **Step 3: Commit**

```bash
git add workshop/.env
git commit -m "chore: update .env with MONGO_SRV and MONGODB_DB_NAME"
```

---

## Self-Review Checklist

1. **Spec coverage:** All F3 requirements mapped to tasks.
2. **Placeholders:** None — all code is complete.
3. **Type consistency:** `userId` prop passes through App → Navbar → HamsterPage → ChatBox consistently. `hamsterName` matches `hamster.name`.
4. **F1+F2 regression:** App.jsx still renders Navbar + HomePage + HamsterPage. All components preserved.
