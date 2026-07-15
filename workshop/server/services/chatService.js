import Conversation from '../models/Conversation.js';
import { chat } from '../providers/llmProvider.js';

/** Save a chat message to the database. */
export async function saveMessage({ userId, hamsterId, role, message }) {
  return Conversation.create({ userId, hamsterId, role, message });
}

/** Get recent conversation history for a user + hamster. */
export async function getHistory(userId, hamsterId, limit = 20) {
  const msgs = await Conversation.find({ userId, hamsterId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return msgs.reverse();
}

/** Build a system prompt that defines the hamster's character. */
function buildSystemPrompt(hamster) {
  return [
    `You are ${hamster.name}, a hamster. You live in a cozy cage and love your human friend.`,
    '',
    'Your profile:',
    `- Name: ${hamster.name}`,
    `- Age: ${hamster.age}`,
    `- Personality: ${hamster.personality}`,
    `- Favorite food: ${hamster.favouriteFood}`,
    `- Hobby: ${hamster.hobby}`,
    `- Catchphrase: "${hamster.catchphrase}"`,
    '',
    'Rules:',
    '- Always stay in character as a hamster, not a human.',
    '- Keep replies short and cute (1-3 sentences).',
    '- Use emojis occasionally but naturally.',
    '- NEVER break character or mention being an AI.',
    '- When describing an action you are doing, ALWAYS use parentheses, NEVER use asterisks. Example: (squeaks) (runs on wheel) (hides in bedding)',
    '- DO NOT use *asterisks* for actions. Only use (parentheses).',
  ].join('\n');
}

/** Assemble messages for the LLM: system prompt + history + user message. */
function buildMessages(message, hamster, history) {
  return [
    { role: 'system', content: buildSystemPrompt(hamster) },
    ...history.map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.message,
    })),
    { role: 'user', content: message },
  ];
}

/** Generate a hamster reply via LLM, with keyword fallback. */
export async function generateHamsterReply(message, hamster, history = []) {
  if (!process.env.LLM_API_KEY) {
    console.warn('LLM_API_KEY not set — using keyword fallback');
    return keywordReply(message, hamster);
  }

  try {
    const messages = buildMessages(message, hamster, history);
    return await chat(messages);
  } catch (err) {
    console.error('LLM error:', err.message, err.status);
    return keywordReply(message, hamster);
  }
}

/** Simple keyword-based reply when LLM is unavailable. */
function keywordReply(message, hamster) {
  const msg = message.toLowerCase();
  if (msg.includes('hello') || msg.includes('hi')) {
    return 'Hello! ' + hamster.catchphrase;
  }
  if (msg.includes('food') || msg.includes('eat')) {
    return 'I LOVE ' + hamster.favouriteFood.toUpperCase() + '!! It is my absolute favorite!!';
  }
  if (msg.includes('how are you')) {
    return 'Wonderful!! The bedding is extra fluffy today!';
  }
  return hamster.catchphrase + ' (That means "tell me more" in hamster)';
}
