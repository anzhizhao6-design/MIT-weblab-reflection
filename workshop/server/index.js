import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDb } from './db/database.js';
import { getRandomHamster, getHamsterById } from './services/hamsterService.js';
import { saveMessage, getHistory, generateHamsterReply } from './services/chatService.js';
import { ensureUser, recordVisit, recordFeed, getMemory } from './services/memoryService.js';
import User from './models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Serve static files in production
const distPath = path.join(__dirname, '..', 'dist');
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(distPath));
app.use(express.static(publicPath));

// GET /api/hamsters/random
app.get('/api/hamsters/random', async (req, res) => {
  try {
    const hamster = await getRandomHamster();
    if (!hamster) return res.status(404).json({ error: 'No hamsters found.' });
    res.json(hamster);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message, hamsterId, userId } = req.body;
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const hamster = await getHamsterById(hamsterId);
    if (!hamster) return res.status(404).json({ error: 'Hamster not found.' });

    if (userId) {
      await ensureUser(userId);
      await saveMessage({ userId, hamsterId, role: 'user', message: message.trim() });
    }

    // Get conversation history and memory, then generate reply
    const history = userId ? await getHistory(userId, hamsterId, 6) : [];
    const memory = userId ? await getMemory(userId, hamsterId) : null;
    const reply = await generateHamsterReply(message, hamster, history, memory);

    if (userId) {
      await saveMessage({ userId, hamsterId, role: 'hamster', message: reply });
    }

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/visit
app.post('/api/visit', async (req, res) => {
  try {
    const { userId, hamsterId } = req.body;
    if (!userId || !hamsterId) return res.status(400).json({ error: 'userId and hamsterId required.' });
    await ensureUser(userId);
    await recordVisit(userId, hamsterId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/feed
app.post('/api/feed', async (req, res) => {
  try {
    const { userId, hamsterId } = req.body;
    if (!userId || !hamsterId) return res.status(400).json({ error: 'userId and hamsterId required.' });
    await recordFeed(userId, hamsterId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/memory?userId=xxx&hamsterId=xxx
app.get('/api/memory', async (req, res) => {
  try {
    const { userId, hamsterId } = req.query;
    if (!userId || !hamsterId) return res.status(400).json({ error: 'userId and hamsterId required.' });
    const memory = await getMemory(userId, parseInt(hamsterId));
    res.json(memory || { visitCount: 0, totalFeeds: 0, lastVisit: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users — create a new user
app.post('/api/users', async (req, res) => {
  try {
    const user = await User.create({ _id: 'user-' + crypto.randomUUID() });
    res.json({ userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:id — check if a user exists
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json({ exists: !!user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve React app for all non-API routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

// Start
await connectDb();
app.listen(PORT, () => {
  console.log(`🐹 Hamster server running on http://localhost:${PORT}`);
});
