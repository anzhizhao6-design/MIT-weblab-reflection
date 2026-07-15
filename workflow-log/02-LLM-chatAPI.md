# 02 — LLM Chat API

> **Date:** 2026-07-15
> **Stack:** OpenAI SDK → JMAPI (deepseek-v4-pro) + Express

---

## Goal

Replace keyword-based hamster chat replies with real LLM-powered responses where each hamster stays in character. Additionally, refactor into a provider-based architecture so the LLM backend can be switched by changing environment variables.

---

## Specification

**Required:**
- Hamster chat must use an LLM API instead of keyword matching
- System prompt per hamster: name, age, personality, favorite food, hobby, catchphrase
- Conversation history included as context (last 6 messages)
- Keyword fallback when API is unavailable
- Provider layer (`server/providers/llmProvider.js`) decoupled from hamster logic
- Switchable via env vars: `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL`

**JMAPI config:**
- Base URL: `https://jmapi.jaguarmicro.com/v1`
- Model: `deepseek-v4-pro`
- OpenAI-compatible endpoint (`/chat/completions`)

---

## AI Workflow

Requirement → Attempted Claude API (wrong model name) → User provided JMAPI key → Implemented OpenAI SDK with JMAPI base URL → Debug: `hamsterId` missing from schema (seed data lost `id` field) → Fixed schema + re-seeded → Chat worked → Refactored into provider architecture (llmProvider.js) → Debug: syntax error from broken template string → Rewrote with `.join('\n')` → Action formatting tweak `*action*` → `(action)` → Final working state.

---

## Implementation Summary

**Files created (1):**
- `server/providers/llmProvider.js` — thin wrapper; `chat(messages)` → assistant reply; knows nothing about hamsters

**Files modified (3):**
- `server/services/chatService.js` — removed direct API client; calls `llmProvider.chat()`; system prompt uses `.join('\n')` for stability; keyword fallback preserved
- `server/models/Hamster.js` — added `id: { type: Number, unique: true }` (was missing, seed data was silently dropped)
- `server/index.js` — history reduced from 10→6 messages to avoid token overflow

**Config files modified (3):**
- `.env` — `JMAPI_API_KEY` → `LLM_API_KEY`
- `.env.example` — updated to generic `LLM_*` format
- `package.json` — `@anthropic-ai/sdk` → `openai`

---

## Review & Testing

**Problems encountered:**
1. Claude model name `claude-sonnet-4-20250514` didn't exist → API returned errors
2. User switched to JMAPI (company API, OpenAI-compatible)
3. `hamsterId` field missing from Mongoose schema → seed data silently dropped → "Hamster not found" on every request
4. Template string syntax error after editing system prompt → broke entire file → rewritten with `.join('\n')`
5. LLM used `*asterisks*` for actions → strengthened prompt with explicit positive + negative rules

**Final state:** Working LLM chat with per-hamster personality, conversation history context, keyword fallback, and provider abstraction layer.

---

## Reflection

### What worked well?
Provider abstraction was clean — `llmProvider.chat(messages)` has zero hamster knowledge. Switching from JMAPI to DeepSeek or OpenAI is a one-line env var change.

### What required manual intervention?
Debugging `hamsterId` took a while — the symptom ("Hamster not found") was far from the cause (schema missing the `id` field). Template string breakage from a single-character edit was also painful.

### What would I change next time?
Validate the schema matches seed data before running. Use `.join('\n')` for system prompts from the start — more maintainable than template literals.

### Would this workflow be suitable for a larger project?
Yes — provider pattern is the industry standard. Adding a new LLM provider is one file + env vars.

---

## Metrics

| Metric | Value |
|--------|-------|
| Files created | 1 |
| Files modified | 5 |
| API attempts before working | 3 (Claude, JMAPI debug, JMAPI working) |
| Major bugs | 3 (model name, missing schema field, template string) |
| Estimated dev time | 40 min |
