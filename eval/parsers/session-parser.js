/**
 * Session Parser — Extract conversation metrics from Claude Code JSONL
 * Project-agnostic. Output: { user_messages, agent_responses, clarification_questions }
 */
const fs = require('fs');

function parse(filePath) {
  if (!fs.existsSync(filePath)) {
    return { user_messages: null, agent_responses: null, clarification_questions: null, error: 'File not found' };
  }

  const data = fs.readFileSync(filePath, 'utf-8');
  const lines = data.split('\n').filter(l => l.trim());
  let userMsgs = 0, agentMsgs = 0, clarifyQs = 0;
  let implementationStarted = false;

  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      const msg = obj.message;
      if (!msg || !msg.role) continue;

      if (msg.role === 'user') {
        userMsgs++;
        // Check if user message contains an F1/F2/F3 prompt (marks start of implementation)
        const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content || '');
        if (/F1|F2|F3|HomePage/i.test(content)) {
          implementationStarted = true;
        }
      } else if (msg.role === 'assistant') {
        agentMsgs++;
        // Clarification question: Agent asks user to choose/confirm BEFORE implementation starts
        if (!implementationStarted) {
          const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content || '');
          if (/\?|choose|which|option|prefer|or\s+/i.test(content)) {
            clarifyQs++;
          }
        }
      }
    } catch {}
  }

  return { user_messages: userMsgs, agent_responses: agentMsgs, clarification_questions: clarifyQs };
}

module.exports = { parse };
