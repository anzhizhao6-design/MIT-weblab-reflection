import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();
const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_BASE_URL = process.env.LLM_BASE_URL || 'https://jmapi.jaguarmicro.com/v1';
const LLM_MODEL = process.env.LLM_MODEL || 'deepseek-v4-pro';

router.post('/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid messages array' });
  }

  if (!LLM_API_KEY) {
    return res.status(503).json({ error: 'LLM API key not configured' });
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
        messages,
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

    return res.json({ reply: content.trim() });
  } catch (err) {
    clearTimeout(err.timeout);

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
