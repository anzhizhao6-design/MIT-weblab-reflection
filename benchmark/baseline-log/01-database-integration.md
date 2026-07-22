# 01 — Database Integration

> **Date:** 2026-07-14
> **Stack:** Mongoose + MongoDB Atlas

---

## Goal

Replace in-memory JS hamster data with a persistent cloud database while keeping the frontend unchanged.

---

## Specification

- Database tables/collections: `hamsters`, `users`, `conversations`, `hamster_memory`
- Separate DB layer (`server/db/`, `server/models/`) from services (`server/services/`)
- Existing `GET /api/hamsters/random` and `POST /api/chat` unchanged
- New silent endpoints: `POST /api/visit`, `POST /api/feed`
- Frontend: localStorage-based UUID, auto-sent with API calls

---

## AI Workflow

Requirement → Schema discussion → SQLite implementation (better-sqlite3) → Install failed (no Python on Windows) → Switched to sql.js (pure JS) → Working but not deployment-friendly → Switched to MongoDB Atlas + Mongoose (cloud, no local file dependency) → Final implementation.

---

## Implementation Summary

**Final architecture:**
- 4 Mongoose models: `Hamster`, `User`, `Conversation`, `HamsterMemory`
- `server/db/database.js` — `mongoose.connect(MONGO_SRV)`
- 3 services: `hamsterService`, `chatService`, `memoryService`
- Seed script imports 12 hamsters to Atlas
- Connection string stored in `.env` (gitignored)

**Files created:** `server/models/` (4 files), `server/db/database.js`, `.env`
**Files modified:** `server/index.js`, 3 service files, `package.json`
**Files deleted:** `server/hamsterData.js`, `server/db/schema.js`, `data/hamster.db`

---

## Review & Testing

**Problems encountered:**
1. `better-sqlite3` needs Python + node-gyp for native compilation → Windows had no Python → install failed
2. Switched to `sql.js` (WASM, pure JS) → worked, but `data/hamster.db` is a local file → would be lost on Render deployment
3. Final fix: MongoDB Atlas (cloud-hosted, free tier) via Mongoose — no local file, data survives server restarts

**Verification:**
1. `npm install` → mongoose installed cleanly
2. `npm run db:seed` → 12 hamsters stored in Atlas
3. `node server/index.js` → backend starts, connected to cloud DB
4. Frontend visually unchanged — all changes are backend infrastructure

---

## Reflection

### What worked well?
Schema discussion before coding prevented rework across 3 database implementations. Service layer abstraction meant switching SQLite → MongoDB only touched service internals.

### What required manual intervention?
Two full dependency switches (better-sqlite3 → sql.js → mongoose). Each required rewriting the database connection layer, but the service API stayed the same.

### What would I change next time?
Start with MongoDB Atlas directly. For a deployable web app, cloud DB is the right choice from day one.

### Would this workflow be suitable for a larger project?
Yes — Mongoose models + service layer is the standard Node.js pattern. Adding new collections and endpoints follows the same structure.

---

## Metrics

| Metric | Value |
|--------|-------|
| Files created | 7 |
| Files modified | 4 |
| Collections created | 4 |
| Implementation iterations | 3 (SQLite → sql.js → MongoDB) |
| Major bugs | 2 (better-sqlite3 install, SQLite deployment concern) |
| Estimated dev time | 35 min |
