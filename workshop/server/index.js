import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { connectDB } from './db.js';
import Hamster from './models/Hamster.js';
import User from './models/User.js';
import Conversation from './models/Conversation.js';
import HamsterMemory from './models/HamsterMemory.js';
import FeedPost from './models/FeedPost.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ── GET /api/hamsters/random ──────────────────────────────────
app.get('/api/hamsters/random', async (req, res) => {
  try {
    const [hamster] = await Hamster.aggregate([{ $sample: { size: 1 } }]);
    if (!hamster) {
      return res.status(404).json({ error: 'No hamsters found' });
    }
    res.json(hamster);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// ── POST /api/users ───────────────────────────────────────────
app.post('/api/users', async (req, res) => {
  const { uuid } = req.body;
  if (!uuid) return res.status(400).json({ error: 'uuid required' });

  try {
    let user = await User.findOne({ uuid });
    if (!user) {
      user = await User.create({ uuid });
    }
    res.json({ uuid: user.uuid, createdAt: user.createdAt });
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// ── GET /api/users/:id ────────────────────────────────────────
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findOne({ uuid: req.params.id });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const memories = await HamsterMemory.find({ userId: req.params.id });
    const totalVisits = memories.reduce((s, m) => s + m.visitCount, 0);
    const totalFeeds = memories.reduce((s, m) => s + m.feedCount, 0);

    res.json({
      uuid: user.uuid,
      createdAt: user.createdAt,
      totalVisits,
      totalFeeds,
      hamsterCount: memories.length,
    });
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// ── POST /api/visit ───────────────────────────────────────────
app.post('/api/visit', async (req, res) => {
  const { userId, hamsterName } = req.body;
  if (!userId || !hamsterName)
    return res.status(400).json({ error: 'userId and hamsterName required' });

  try {
    const memory = await HamsterMemory.findOneAndUpdate(
      { userId, hamsterName },
      { $inc: { visitCount: 1 }, $set: { lastVisit: new Date() } },
      { upsert: true, returnDocument: 'after' }
    );
    res.json({ visitCount: memory.visitCount, feedCount: memory.feedCount });
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// ── POST /api/feed ────────────────────────────────────────────
app.post('/api/feed', async (req, res) => {
  const { userId, hamsterName, foodId, isFavourite, moodChange } = req.body;
  if (!userId || !hamsterName || !foodId)
    return res.status(400).json({ error: 'userId, hamsterName, foodId required' });

  try {
    // Create feed post
    await FeedPost.create({
      userId,
      hamsterName,
      foodId,
      isFavourite: isFavourite || false,
      moodChange: moodChange || 3,
    });

    // Update memory
    const memory = await HamsterMemory.findOneAndUpdate(
      { userId, hamsterName },
      { $inc: { feedCount: 1 }, $set: { lastVisit: new Date() } },
      { upsert: true, returnDocument: 'after' }
    );

    res.json({ feedCount: memory.feedCount });
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// ── GET /api/memory ───────────────────────────────────────────
app.get('/api/memory', async (req, res) => {
  const { userId, hamsterName } = req.query;
  if (!userId || !hamsterName)
    return res.status(400).json({ error: 'userId and hamsterName required' });

  try {
    const memory = await HamsterMemory.findOne({ userId, hamsterName });
    res.json({
      visitCount: memory?.visitCount || 0,
      feedCount: memory?.feedCount || 0,
    });
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// ── POST /api/chat (enhanced: DB persistence + memory injection) ──
app.post('/api/chat', async (req, res) => {
  const { messages, hamster, userId } = req.body;

  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL || 'https://jmapi.jaguarmicro.com/v1';
  const model = process.env.LLM_MODEL || 'deepseek-v4-pro';

  if (!apiKey) {
    return res.json({ error: true, type: 'no_api_key' });
  }

  // Build memory context
  let memoryContext = '';
  if (userId) {
    try {
      const memory = await HamsterMemory.findOne({
        userId,
        hamsterName: hamster.name,
      });
      if (memory && (memory.visitCount > 0 || memory.feedCount > 0)) {
        memoryContext = `\n\nYou remember this visitor. They have visited you ${memory.visitCount} time(s) and fed you ${memory.feedCount} time(s). Mention this naturally in conversation when relevant.`;
      }
    } catch {
      // Memory lookup failed — proceed without memory context
    }
  }

  const systemPrompt = `You are ${hamster.name}, a hamster with a ${hamster.personality} personality. Your favourite food is ${hamster.favouriteFood}. Your hobby is ${hamster.hobby}. Your catchphrase is: "${hamster.catchphrase}". You live in Hamster Daily, a cozy hamster website. Reply in character as ${hamster.name} — use your catchphrase occasionally, mention your hobby, and express your personality. Keep replies short (1-3 sentences), warm, and playful.${memoryContext}`;

  const conversationMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(-6).map((m) => ({
      role: m.role === 'hamster' ? 'assistant' : m.role,
      content: m.content,
    })),
  ];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: conversationMessages,
        max_tokens: 300,
        temperature: 0.8,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return res.json({ error: true, type: 'api_error', status: response.status });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return res.json({ error: true, type: 'invalid_response' });
    }

    // Save conversation to DB
    if (userId) {
      try {
        const lastUserMsg = messages[messages.length - 1];
        await Conversation.findOneAndUpdate(
          { userId, hamsterName: hamster.name },
          {
            $push: {
              messages: {
                $each: [
                  { role: lastUserMsg?.role || 'user', content: lastUserMsg?.content || '' },
                  { role: 'hamster', content },
                ],
              },
            },
            $set: { updatedAt: new Date() },
          },
          { upsert: true, returnDocument: 'after' }
        );
      } catch {
        // Conversation save failed — still return the response
      }
    }

    res.json({ content });
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.json({ error: true, type: 'timeout' });
    }
    res.json({ error: true, type: 'network_error' });
  }
});

// ── POST /api/conversations ────────────────────────────────────
app.post('/api/conversations', async (req, res) => {
  const { userId, hamsterName, userMessage, hamsterResponse } = req.body;
  if (!userId || !hamsterName) {
    return res.status(400).json({ error: 'userId and hamsterName required' });
  }

  try {
    const msgs = [];
    if (userMessage) msgs.push({ role: 'user', content: userMessage });
    if (hamsterResponse) msgs.push({ role: 'hamster', content: hamsterResponse });

    if (msgs.length > 0) {
      await Conversation.findOneAndUpdate(
        { userId, hamsterName },
        { $push: { messages: { $each: msgs } }, $set: { updatedAt: new Date() } },
        { upsert: true, returnDocument: 'after' }
      );
    }
    res.json({ saved: true });
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// ── Start server ──────────────────────────────────────────────
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Connect DB in background — don't block the HTTP listener
connectDB();
