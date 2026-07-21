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

/** Build a system prompt that defines the hamster's character, with memory if available. */
function buildSystemPrompt(hamster, memory) {
  const lines = [
    `You are ${hamster.name}, a hamster. You live in a cozy cage and love your human friend.`,
    '',
    'Your profile:',
    `- Name: ${hamster.name}`,
    `- Age: ${hamster.age}`,
    `- Personality: ${hamster.personality}`,
    `- Favorite food: ${hamster.favouriteFood}`,
    `- Hobby: ${hamster.hobby}`,
    `- Catchphrase: "${hamster.catchphrase}"`,
  ];

  // Inject memory into the prompt so the hamster can reference it
  if (memory && (memory.visitCount > 0)) {
    lines.push('');
    lines.push('Your memory with this human:');
    lines.push(`- They have visited you ${memory.visitCount} time(s).`);
    if (memory.totalFeeds > 0) {
      lines.push(`- They have fed you ${memory.totalFeeds} time(s).`);
    }
    if (memory.lastVisit) {
      const daysAgo = Math.floor((Date.now() - new Date(memory.lastVisit).getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo > 0) {
        lines.push(`- They last visited ${daysAgo} day(s) ago.`);
      } else {
        lines.push('- They are visiting you right now.');
      }
    }
  }

  lines.push('');
  lines.push('Rules:');
  lines.push('- Always stay in character as a hamster, not a human.');
  lines.push('- Keep replies short and cute (1-3 sentences).');
  lines.push('- Use emojis occasionally but naturally.');
  lines.push('- NEVER break character or mention being an AI.');
  lines.push('- When describing an action you are doing, ALWAYS use parentheses, NEVER use asterisks. Example: (squeaks) (runs on wheel) (hides in bedding)');
  lines.push('- DO NOT use *asterisks* for actions. Only use (parentheses).');
  lines.push('- If you know this human, reference your shared history naturally.');

  return lines.join('\n');
}

/** Assemble messages for the LLM: system prompt + history + user message. */
function buildMessages(message, hamster, history, memory) {
  return [
    { role: 'system', content: buildSystemPrompt(hamster, memory) },
    ...history.map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.message,
    })),
    { role: 'user', content: message },
  ];
}

/** Generate a hamster reply via LLM, with keyword fallback. */
export async function generateHamsterReply(message, hamster, history = [], memory = null) {
  if (!process.env.LLM_API_KEY) {
    console.warn('LLM_API_KEY not set — using keyword fallback');
    return keywordReply(message, hamster);
  }

  try {
    const messages = buildMessages(message, hamster, history, memory);
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
