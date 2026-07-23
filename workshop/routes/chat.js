import { Router } from 'express';
import HamsterMemory from '../models/HamsterMemory.js';
import Conversation from '../models/Conversation.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { messages, hamster, userId } = req.body;

    if (!messages || !hamster) {
      return res.status(400).json({ error: 'Missing messages or hamster data' });
    }

    // Read env at request time — after dotenv has loaded
    const LLM_API_KEY = process.env.LLM_API_KEY;
    const LLM_BASE_URL = process.env.LLM_BASE_URL || 'https://jmapi.jaguarmicro.com/v1';
    const LLM_MODEL = process.env.LLM_MODEL || 'deepseek-v4-pro';

    // Build system prompt with memory injection (non-blocking, 2s timeout)
    let systemPrompt = `You are ${hamster.name}, a hamster with the personality "${hamster.personality}". Your favorite food is ${hamster.favouriteFood}. You love ${hamster.hobby}. Your catchphrase is: "${hamster.catchphrase}". Reply in character as this hamster. Keep responses short (1-3 sentences), cute, and fun. Use the catchphrase occasionally.`;

    if (userId) {
      try {
        const memory = await Promise.race([
          HamsterMemory.findOne({ userId, hamsterName: hamster.name }),
          new Promise((resolve) => setTimeout(() => resolve(null), 2000)),
        ]);
        if (memory && (memory.visitCount > 0 || memory.feedCount > 0)) {
          systemPrompt += ` Memory: This human has visited you ${memory.visitCount} times and fed you ${memory.feedCount} times.`;
        }
      } catch {
        // Memory lookup failed — proceed without it
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
