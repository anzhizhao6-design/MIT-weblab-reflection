import express from 'express';
import { connectDb } from './db/database.js';
import { getRandomHamster, getHamsterById } from './services/hamsterService.js';
import { saveMessage, getHistory, generateHamsterReply } from './services/chatService.js';
import { ensureUser, recordVisit, recordFeed } from './services/memoryService.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

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

    // Get conversation history for context, then generate reply
    const history = userId ? await getHistory(userId, hamsterId, 6) : [];
    const reply = await generateHamsterReply(message, hamster, history);

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
