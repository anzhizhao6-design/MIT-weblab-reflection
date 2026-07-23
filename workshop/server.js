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
