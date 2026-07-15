/**
 * LLM Provider — thin wrapper around an OpenAI-compatible chat API.
 *
 * Knows NOTHING about hamsters. Only receives messages and returns a reply.
 *
 * Configure via environment variables:
 *   LLM_API_KEY   — API key (required)
 *   LLM_BASE_URL  — endpoint (default: JMAPI)
 *   LLM_MODEL     — model name (default: deepseek-v4-pro)
 *
 * To switch providers, just change the env vars:
 *   DeepSeek:  LLM_BASE_URL=https://api.deepseek.com/v1  LLM_MODEL=deepseek-chat
 *   OpenAI:    LLM_BASE_URL=https://api.openai.com/v1    LLM_MODEL=gpt-3.5-turbo
 */

import OpenAI from 'openai';

let client = null;

/** Lazy-init the OpenAI-compatible client from env vars. */
function getClient() {
  if (!client) {
    if (!process.env.LLM_API_KEY) {
      throw new Error('LLM_API_KEY is not set. Add it to your .env file.');
    }
    client = new OpenAI({
      apiKey: process.env.LLM_API_KEY,
      baseURL: process.env.LLM_BASE_URL || 'https://jmapi.jaguarmicro.com/v1',
    });
  }
  return client;
}

/**
 * Send messages to the LLM and return the assistant's reply text.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<string>} — the assistant's reply
 */
export async function chat(messages) {
  const model = process.env.LLM_MODEL || 'deepseek-v4-pro';
  const response = await getClient().chat.completions.create({
    model,
    max_tokens: 300,
    temperature: 0.9,
    messages,
  });
  return response.choices[0].message.content;
}
