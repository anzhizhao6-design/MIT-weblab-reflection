# 03 — Persistent Memory

> **Date:** 2026-07-16
> **Stack:** MongoDB (existing) + Express

---

## Goal

Make the hamster "remember" the user by surfacing visit counts, feed history, and last visit time — both in the UI and in chat conversations.

---

## Specification

- New `GET /api/memory?userId=xxx&hamsterId=xxx` endpoint
- Returns `{ visitCount, totalFeeds, lastVisit }` from existing `HamsterMemory` collection
- Chat system prompt includes memory context so the hamster can reference shared history
- Frontend displays visit and feed counts in the profile card

**Key constraint:** No new database collections or fields needed — all data already exists from the visit/feed tracking built in 01.

---

## AI Workflow

Requirement → User asked "what's the difference between DB and memory?" → Explained: DB = storage, Memory = surfacing stored data meaningfully → Implementation (API → chat context → frontend display) → Review.

---

## Implementation Summary

**Files modified (4):**
- `server/index.js` — added `GET /api/memory` endpoint; chat endpoint now fetches and passes memory
- `server/services/chatService.js` — `buildSystemPrompt()` accepts optional `memory` parameter; injects visit/feed/last-visit context when available
- `src/pages/HamsterPage.jsx` — fetches memory on mount; displays visit count and feed count below the bio
- `src/styles.css` — added `.memory-section` styling

**No new files created.**

---

## Review & Testing

**Verification:**
1. Visit a hamster → profile card shows "👋 Visited 1 time" (increments on revisit)
2. Feed the hamster → "🍽️ Fed 1 time" appears
3. Chat with the hamster → hamster references past visits naturally (e.g. "You've visited me 3 times!")
4. `GET /api/memory?userId=xxx&hamsterId=1` returns correct JSON

---

## Reflection

### What worked well?
Zero new data structures — memory is purely a read layer over existing visit/feed tracking. The system prompt injection is lightweight; memory is a few lines of text appended to the existing hamster profile.

### What required manual intervention?
None — straightforward implementation.

### What would I change next time?
Add a "days since last visit" display on the frontend. Consider memory decay (older visits matter less).

### Would this workflow be suitable for a larger project?
Yes — the pattern of "read existing data → compute insights → inject into prompt" is how most AI memory systems work.

---

## Metrics

| Metric | Value |
|--------|-------|
| Files modified | 4 |
| Files created | 0 |
| New API endpoints | 1 |
| Implementation iterations | 1 |
| Estimated dev time | 10 min |
