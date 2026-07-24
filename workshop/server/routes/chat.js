import { Router } from 'express';
import OpenAI from 'openai';
import Conversation from '../models/Conversation.js';
import HamsterMemory from '../models/HamsterMemory.js';

const router = Router();
const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_BASE_URL = process.env.LLM_BASE_URL || 'https://jmapi.jaguarmicro.com/v1';
const LLM_MODEL = process.env.LLM_MODEL || 'deepseek-v4-pro';

router.post('/chat', async (req, res) => {
  const { messages, userId, hamsterId } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid messages array' });
  }

  if (!LLM_API_KEY) {
    return res.status(503).json({ error: 'LLM API key not configured' });
  }

  // Fetch memory and inject into system prompt
  let enrichedMessages = messages;
  if (userId && hamsterId != null) {
    try {
      const memory = await HamsterMemory.findOne({ userId, hamsterId: Number(hamsterId) });
      if (memory) {
        const memText =
          `\n\nMemory:\n` +
          `- This user has visited you ${memory.visitCount} time(s)\n` +
          `- They have fed you ${memory.feedCount} time(s) total\n` +
          `- Their last visit was ${memory.lastVisit ? new Date(memory.lastVisit).toLocaleDateString() : 'just now'}\n` +
          `\nYou remember this user! Reference their past visits naturally when it fits the conversation.`;

        const systemIdx = enrichedMessages.findIndex((m) => m.role === 'system');
        if (systemIdx >= 0) {
          enrichedMessages = enrichedMessages.map((m, i) =>
            i === systemIdx ? { ...m, content: m.content + memText } : m
          );
        }
      }
    } catch {
      // Memory fetch failed — continue without memory injection
    }
  }

  try {
    const client = new OpenAI({
      apiKey: LLM_API_KEY,
      baseURL: LLM_BASE_URL,
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await client.chat.completions.create(
      {
        model: LLM_MODEL,
        messages: enrichedMessages,
        max_tokens: 200,
        temperature: 0.8,
      },
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    const content = response?.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(502).json({ error: 'Invalid or empty response from LLM API' });
    }

    // Store conversation in DB
    if (userId && hamsterId != null) {
      try {
        const userMsg = messages[messages.length - 1];
        await Conversation.create({ userId, hamsterId: Number(hamsterId), role: 'user', content: userMsg.content });
        await Conversation.create({ userId, hamsterId: Number(hamsterId), role: 'assistant', content: content.trim() });
      } catch {
        // Storage failed — reply still works
      }
    }

    return res.json({ reply: content.trim() });
  } catch (err) {
    if (err.name === 'AbortError' || err.code === 'ETIMEDOUT' || err.message?.includes('timeout')) {
      return res.status(504).json({ error: 'Request timeout' });
    }

    if (err.status && err.status >= 400 && err.status < 500) {
      return res.status(502).json({ error: `LLM API returned status ${err.status}` });
    }

    return res.status(502).json({ error: 'LLM API request failed' });
  }
});

export default router;
