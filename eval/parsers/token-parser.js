/**
 * Token Parser — Extract token usage from Claude Code session JSONL
 * Project-agnostic. Input: path to JSONL file. Output: { input_tokens, output_tokens, total_tokens }
 */
const fs = require('fs');

function parse(filePath) {
  if (!fs.existsSync(filePath)) {
    return { input_tokens: null, output_tokens: null, total_tokens: null, error: 'File not found' };
  }

  const data = fs.readFileSync(filePath, 'utf-8');
  const lines = data.split('\n').filter(l => l.trim());
  let input = 0, output = 0, cacheRead = 0, usageLines = 0;

  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      const usage = obj.message && obj.message.usage;
      if (usage) {
        input += usage.input_tokens || 0;
        output += usage.output_tokens || 0;
        cacheRead += usage.cache_read_input_tokens || 0;
        usageLines++;
      }
    } catch {}
  }

  return {
    input_tokens: input,
    output_tokens: output,
    total_tokens: input + output,
    cache_read_tokens: cacheRead,
    usage_lines: usageLines,
    total_lines: lines.length,
  };
}

module.exports = { parse };
