# F3: Database + Persistent Memory — Design Spec

**Date:** 2026-07-23
**Status:** Approved
**Scope:** F3 only — MongoDB, visit/feed tracking, user identity, memory injection, Account panel

---

## 1. Goal

Migrate from static JS data to MongoDB Atlas with Mongoose. Add persistent visit/feed tracking per user+hamster pair. Add UUID-based user identity with Account panel. Inject memory into chat system prompt. All on top of F1+F2.

## 2. Architecture

- **Database:** MongoDB Atlas via Mongoose
- **DB name:** from `MONGODB_DB_NAME` env var (`hamster_superpowers`)
- **Backend refactor:** Split `server.js` into `models/` + `routes/`, `server.js` becomes entry point
- **Frontend additions:** AccountPanel (Navbar dropdown), ProfileCard (visit/feed stats)
- **Identity:** `crypto.randomUUID()` stored in `localStorage`, synced to backend via `POST /api/users`

## 3. Collections (5)

| Collection | Key Fields | Purpose |
|------------|------------|---------|
| `hamsters` | name, age, personality, favouriteFood, hobby, bio, image, catchphrase, moodBoost, diary[] | Hamster catalog |
| `users` | uuid (unique), createdAt | User identity |
| `conversations` | userId, hamsterName, messages[] | Chat history (optional persist) |
| `hamster_memories` | userId, hamsterName, visitCount, feedCount, lastVisit | Per-user per-hamster stats |
| `feed_posts` | hamsterName, diaryIndex, content, date | Diary posts (seeded separately) |

## 4. API Endpoints (7)

| Method | Path | Body/Query | Response | Notes |
|--------|------|-----------|----------|-------|
| GET | `/api/hamsters/random` | — | Random hamster doc | Replaces client-side random from static data |
| POST | `/api/chat` | `{ messages, hamster, userId }` | `{ reply }` | Enhanced: inject memory into system prompt, save conversation |
| POST | `/api/visit` | `{ userId, hamsterName }` | `{ visitCount }` | Upserts hamster_memories, increments visitCount |
| POST | `/api/feed` | `{ userId, hamsterName, foodId, isFavourite }` | `{ feedCount }` | Upserts hamster_memories, increments feedCount |
| GET | `/api/memory` | `?userId=X&hamsterName=Y` | `{ visitCount, feedCount }` | Returns stats for ProfileCard |
| POST | `/api/users` | `{ uuid }` | `{ user }` | Upsert user by UUID |
| GET | `/api/users/:id` | — | `{ user }` | Get user by UUID |

## 5. File Changes

```
workshop/
├── server.js                      ← REWORK: Mongoose connect + mount routes
├── db/
│   └── seed.js                    ← NEW
├── models/
│   ├── Hamster.js                 ← NEW
│   ├── User.js                    ← NEW
│   ├── Conversation.js            ← NEW
│   ├── HamsterMemory.js           ← NEW
│   └── FeedPost.js                ← NEW
├── routes/
│   ├── hamsters.js                ← NEW: GET /api/hamsters/random
│   ├── chat.js                    ← MIGRATE from server.js + memory injection
│   ├── visits.js                  ← NEW: POST /api/visit
│   ├── feeds.js                   ← NEW: POST /api/feed
│   ├── memory.js                  ← NEW: GET /api/memory
│   └── users.js                   ← NEW: POST /api/users, GET /api/users/:id
├── src/
│   ├── hooks/
│   │   └── useUserId.js           ← NEW: localStorage UUID helper
│   ├── components/
│   │   ├── Navbar.jsx             ← MODIFY: add AccountPanel trigger
│   │   ├── AccountPanel.jsx       ← NEW
│   │   ├── AccountPanel.css       ← NEW
│   │   ├── ProfileCard.jsx        ← NEW
│   │   └── ProfileCard.css        ← NEW
│   ├── pages/
│   │   └── HamsterPage.jsx        ← MODIFY: add userId, visit/feed tracking, ProfileCard
│   └── data/
│       └── hamsters.js            ← KEPT (used by seed script, not removed)
├── package.json                   ← ADD: mongoose
└── .env                           ← ADD: MONGO_SRV, MONGODB_DB_NAME
```

## 6. User Identity Flow

```
App.jsx mount:
  1. Check localStorage for 'hamster_user_id'
  2. If missing → generate crypto.randomUUID(), store in localStorage
  3. POST /api/users { uuid } → backend upserts
  4. Pass userId down via React Context

useUserId.js hook:
  - getUserId() → returns stored UUID (generates if missing)
  - Provides to all components that need it
```

## 7. Account Panel

- Navbar: account icon (👤) button on the right
- Click → dropdown panel below the icon
- Shows: "Your ID" truncated (first 8 chars + ...) with 📋 Copy button
- "Switch Device" section: text input + "Apply" button
- Copy uses `navigator.clipboard.writeText()`
- Apply: saves pasted UUID to localStorage, reloads page

## 8. Profile Card

- Rendered on HamsterPage between hamster card and diary
- Shows two stats: "Visited: X times" | "Fed: X times"
- Fetches from `GET /api/memory?userId=X&hamsterName=Y` on mount + Visit Another
- Displays loading state briefly, then shows counts

## 9. Visit & Feed Tracking

- **Visit:** POST triggered on HamsterPage mount + "Visit Another"
  - `POST /api/visit { userId, hamsterName }` → upserts HamsterMemory, `$inc: { visitCount: 1 }`
- **Feed:** POST triggered on `handleFeed`
  - `POST /api/feed { userId, hamsterName, foodId, isFavourite }` → upserts HamsterMemory, `$inc: { feedCount: 1 }`
- Both calls are fire-and-forget (don't block UI)

## 10. Chat Memory Injection

In `routes/chat.js`, before calling LLM:
1. Query `HamsterMemory.findOne({ userId, hamsterName })`
2. If found, append to system prompt:
   ```
   Memory: This human has visited you ${visitCount} times and fed you ${feedCount} times.
   ```
   This is appended AFTER the character definition, so the hamster can reference the relationship.

## 11. Seed Script (`npm run db:seed`)

```
node db/seed.js:
  1. dotenv config
  2. mongoose.connect(MONGO_SRV, { dbName: MONGODB_DB_NAME })
  3. Clear all 5 collections
  4. Insert 12 hamsters from workshop/src/data/hamsters.js (use dynamic import)
  5. Insert 36 feed_posts (3 diary posts × 12 hamsters)
  6. Log summary, disconnect
```

## 12. Dependencies

```json
{ "mongoose": "^8.0.0" }
```

## 13. .env

```
LLM_API_KEY=sk-...
LLM_BASE_URL=https://jmapi.jaguarmicro.com/v1
LLM_MODEL=deepseek-v4-pro
MONGO_SRV=<provided MongoDB connection string>
MONGODB_DB_NAME=hamster_superpowers
```

## 14. F1+F2 Regression Checklist

- All F1 criteria (7) and F2 criteria (6) must continue to pass
- HamsterPage still shows all F2 sections
- Chat still works with LLM + fallback
- Mood system unchanged
- FoodTray unchanged
- Diary unchanged
- Navbar + HomePage unchanged

## 15. What F3 Does NOT Include

- No additional collections beyond the 5 listed
- No authentication/passwords
- No email or additional user profile fields
- This is the final phase — no F4
