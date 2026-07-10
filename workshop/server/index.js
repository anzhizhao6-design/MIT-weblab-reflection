import express from 'express';
import hamsters from './hamsterData.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// ============================================================
// GET /api/hamsters/random
// ============================================================
app.get('/api/hamsters/random', (req, res) => {
  const randomIndex = Math.floor(Math.random() * hamsters.length);
  const hamster = hamsters[randomIndex];
  res.json({
    id: hamster.id,
    name: hamster.name,
    emoji: hamster.emoji,
    age: hamster.age,
    personality: hamster.personality,
    favouriteFood: hamster.favouriteFood,
    hobby: hamster.hobby,
    bio: hamster.bio,
    image: hamster.image,
    feed: hamster.feed,
    catchphrase: hamster.catchphrase,
  });
});

// ============================================================
// POST /api/chat
// ============================================================
app.post('/api/chat', (req, res) => {
  const { message, hamsterId } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  const hamster = hamsters.find((h) => h.id === hamsterId);
  if (!hamster) {
    return res.status(404).json({ error: 'Hamster not found.' });
  }

  const reply = generateHamsterReply(message, hamster);
  res.json({ reply });
});

// ============================================================
// Hamster reply generator
// ============================================================
// --- FUTURE AI INTEGRATION ---
// Replace the logic below to use OpenAI/Claude:
//
//   import OpenAI from 'openai';
//   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
//   const response = await openai.chat.completions.create({
//     model: 'gpt-3.5-turbo',
//     messages: [
//       { role: 'system', content: `You are ${hamster.name}, a ${hamster.personality} hamster.` },
//       { role: 'user', content: message },
//     ],
//   });
//   return response.choices[0].message.content;
//
// Store your API key in .env:  OPENAI_API_KEY=sk-...
// --- END FUTURE AI INTEGRATION ---

function generateHamsterReply(message, hamster) {
  const msg = message.toLowerCase();

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return `Hello! ${hamster.catchphrase}`;
  }
  if (msg.includes('food') || msg.includes('eat') || msg.includes('hungry')) {
    return `I LOVE ${hamster.favouriteFood.toUpperCase()}!! It's my absolute favorite!! 🐹✨`;
  }
  if (msg.includes('how are you') || msg.includes('how do you feel')) {
    const moods = [
      `I'm feeling great!! Just had some ${hamster.favouriteFood}!`,
      `A bit sleepy... all that wheel running wore me out! 💤`,
      `Wonderful!! The bedding is extra fluffy today!`,
    ];
    return moods[Math.floor(Math.random() * moods.length)];
  }
  if (msg.includes('love') || msg.includes('cute')) {
    const isShy = hamster.personality.includes('Shy');
    return isShy
      ? '...really?? 🥺 You\'re pretty great yourself!'
      : 'AW THANK YOU!! 🥹💕 You\'re pretty great yourself!';
  }

  const defaults = [
    `${hamster.emoji} ${hamster.name} listens intently. Squeak!`,
    `That's interesting!! Let me tell you about ${hamster.favouriteFood}...`,
    `${hamster.catchphrase} (That means "tell me more" in hamster)`,
    `I don't quite understand, but I appreciate you talking to me!! 🐹`,
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(PORT, () => {
  console.log(`🐹 Hamster server running on http://localhost:${PORT}`);
});
