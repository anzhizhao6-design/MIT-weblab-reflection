import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { messages, hamster } = req.body;

  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL || 'https://jmapi.jaguarmicro.com/v1';
  const model = process.env.LLM_MODEL || 'deepseek-v4-pro';

  if (!apiKey) {
    return res.json({ error: true, type: 'no_api_key' });
  }

  const systemPrompt = `You are ${hamster.name}, a hamster with a ${hamster.personality} personality. Your favourite food is ${hamster.favouriteFood}. Your hobby is ${hamster.hobby}. Your catchphrase is: "${hamster.catchphrase}". You live in Hamster Daily, a cozy hamster website. Reply in character as ${hamster.name} — use your catchphrase occasionally, mention your hobby, and express your personality. Keep replies short (1-3 sentences), warm, and playful.`;

  const conversationMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(-6).map((m) => ({
      role: m.role,
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
        max_tokens: 150,
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

    res.json({ content });
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.json({ error: true, type: 'timeout' });
    }
    res.json({ error: true, type: 'network_error' });
  }
});

import http from 'http';

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
