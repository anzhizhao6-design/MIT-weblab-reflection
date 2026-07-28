/**
 * AI Judge — Call an independent model to score subjective dimensions
 *
 * Usage:
 *   node eval/judges/call.js --judge=readability --diff=<path> --model=<provider>
 *
 * The judge model should NOT be the same as the workflow's coding agent.
 * Supports OpenAI-compatible endpoints via LLM_BASE_URL + LLM_API_KEY env vars.
 */

const fs = require('fs');
const path = require('path');

const JUDGES_DIR = __dirname;

async function callJudge(judgeName, inputs = {}) {
  const rubricPath = path.join(JUDGES_DIR, `${judgeName}.md`);
  if (!fs.existsSync(rubricPath)) {
    throw new Error(`Judge rubric not found: ${judgeName}.md`);
  }

  const rubric = fs.readFileSync(rubricPath, 'utf-8');

  // Build prompt based on judge type
  let userContent = '';
  switch (judgeName) {
    case 'readability':
      userContent = `Assess the following code diff for readability:\n\n\`\`\`\n${inputs.diff || '(no diff provided)'}\n\`\`\``;
      break;
    case 'ui-quality':
      userContent = `Assess the UI quality of the provided screenshots. ${inputs.description || ''}`;
      break;
    case 'code-reuse':
      userContent = `Assess whether this change reused prior code:\n\n\`\`\`\n${inputs.diff || '(no diff provided)'}\n\`\`\``;
      break;
    default:
      userContent = inputs.diff || '(no input provided)';
  }

  const messages = [
    { role: 'system', content: rubric },
    { role: 'user', content: userContent },
  ];

  const baseUrl = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    console.warn('  ⚠ No LLM_API_KEY set. Judge skipped.');
    return { score: null, detail: 'No API key', raw: '' };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, temperature: 0.3, max_tokens: 1000 }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || '';

    // Extract numeric score from reply (looks for "Final Score: X/5" or just a number 1-5)
    const scoreMatch = reply.match(/Final Score:\s*(\d)/i) || reply.match(/\b([1-5])\/5\b/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

    return { score, detail: reply.substring(0, 500), raw: reply };
  } catch (err) {
    return { score: null, detail: `Judge API error: ${err.message}`, raw: '' };
  }
}

module.exports = { callJudge };
