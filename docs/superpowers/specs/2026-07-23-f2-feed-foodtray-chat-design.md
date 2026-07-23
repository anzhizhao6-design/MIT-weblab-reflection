# F2: Feed + Food Tray + LLM Chat — Design Spec

**Date:** 2026-07-23
**Status:** Approved
**Scope:** F2 only — Diary, Food Tray, Mood System, LLM Chat on top of F1

---

## 1. Goal

Extend the HamsterPage with interactive feeding, mood tracking, diary posts, and LLM-powered chat. Add an Express backend to proxy LLM API calls (API key never exposed to frontend).

## 2. Architecture

- **Frontend:** React 18 + Vite (existing)
- **Backend:** Express (new, port 3001)
- **Proxy:** Vite dev server proxies `/api` → `localhost:3001`
- **Dev runner:** `concurrently` starts both Vite + Express with single `npm run dev`
- **Fallback:** Client-side keyword matching (spec §7.4) — frontend catches API failure and runs deterministic fallback

## 3. New/Modified Files

```
workshop/
├── server.js                      ← NEW: Express backend
├── vite.config.js                 ← MODIFY: add proxy config
├── package.json                   ← MODIFY: express, cors, dotenv, concurrently
├── src/
│   ├── data/
│   │   └── hamsters.js            ← MODIFY: add diary[] (3 posts each)
│   ├── pages/
│   │   ├── HamsterPage.jsx        ← MAJOR REWORK: mood state, feed handler, chat state, layout
│   │   └── HamsterPage.css        ← MAJOR REWORK: all F2 section styles
│   └── components/
│       ├── Diary.jsx + Diary.css          ← NEW
│       ├── FoodTray.jsx + FoodTray.css    ← NEW
│       ├── MoodBar.jsx + MoodBar.css      ← NEW
│       └── ChatBox.jsx + ChatBox.css      ← NEW
```

## 4. HamsterPage Layout (F2 — full page)

```
┌─ Hamster Card (existing, kept) ────────────────────┐
│  circular photo | name, details, bio, [Visit Another]│
└─────────────────────────────────────────────────────┘
┌─ "{name}'s Diary" ─────────────────────────────────┐
│  3 diary posts, each with date + text               │
└─────────────────────────────────────────────────────┘
┌─ Food Tray ────────────────────────────────────────┐
│  12 food buttons (emoji + name) in a grid           │
│  Favourite food: golden border (.favourite class)   │
│  Hover 2s → -5 mood (once per hover session)        │
│  Click → feeds: favourite=moodBoost, non-fav=+3     │
└─────────────────────────────────────────────────────┘
┌─ Mood Bar ─────────────────────────────────────────┐
│  Progress bar (0-100), level label + emoji          │
│  Five levels: Hungry😡 Sad😢 Neutral😐 Happy😊 Overjoyed🤩 │
└─────────────────────────────────────────────────────┘
┌─ Chat ─────────────────────────────────────────────┐
│  Message history (user 🤓 | hamster 🐹 bubbles)     │
│  Input + Send button (disabled when empty)          │
│  Enter key sends                                    │
│  POST /api/chat → LLM or fallback                   │
└─────────────────────────────────────────────────────┘
```

## 5. Mood System (spec §7.1–§7.3)

### State
- `useState(50)` initial mood, resets on "Visit Another"
- Always clamped: `Math.max(0, Math.min(100, value))`

### Feeding Rules
| Food | Mood Change |
|------|-------------|
| Favourite (matches `hamster.favouriteFood`) | `+moodBoost` (from personality) |
| Non-favourite | `+3` |

### Hover Penalty (spec §7.2)
- `onMouseEnter` starts a 2-second timer
- Timer fires → `mood - 5` (once per hover session)
- `onMouseLeave` or `onClick` cancels timer
- New hover = new timer (fresh session)

### Mood Levels (spec §7.3)
| Range | Level | Emoji |
|-------|-------|-------|
| 0–19 | Hungry | 😡 |
| 20–39 | Sad | 😢 |
| 40–59 | Neutral | 😐 |
| 60–79 | Happy | 😊 |
| 80–100 | Overjoyed | 🤩 |

## 6. Food Tray

- Props: `hamster`, `mood`, `onFeed(foodId, isFavourite)`, `onHoverPenalty()`
- 12 food buttons in a responsive grid (4 columns desktop → 3 mobile)
- Favourite food button: golden border + subtle glow
- Each button: emoji + label
- Hover timer logic internal to FoodTray

## 7. Diary

- Title: `"{name}'s Diary"`
- 3 diary posts per hamster, stored in `hamsters.js` as `diary: ["post1", "post2", "post3"]`
- Each post displayed as a card with a made-up date stamp
- 36 total diary entries (12 hamsters × 3)

## 8. Chat System

### Frontend (ChatBox)
- Props: `hamster`
- State: `messages` array `[{role: "user"|"assistant", content}]`
- Input + Send button; Enter key sends; disabled when input empty
- Sends `POST /api/chat` with `{ messages, hamster }`
- On API failure: runs client-side fallback (spec §7.4)
- Last 6 messages sent to API for context
- Reset messages on "Visit Another"

### Backend (Express server.js)
- `POST /api/chat`
- Builds system prompt from hamster data
- Calls `POST https://jmapi.jaguarmicro.com/v1/chat/completions`
  - Model: `deepseek-v4-pro` (from `LLM_MODEL` env var)
  - API key: `LLM_API_KEY` env var
  - Timeout: 10 seconds
- Returns `{ reply: "..." }`
- On any failure: returns HTTP error → frontend activates fallback

### Fallback (spec §7.4) — Client-side
Priority: food > play > mood > greeting > default

| Priority | Intent | Triggers | Template |
|----------|--------|----------|----------|
| 1 | food | food, eat, hungry, feed, 吃, 饿 | `"{name} loves {favouriteFood}! {catchphrase}"` |
| 2 | play | play, wheel, run, fun, 玩, 跑 | `"{name} spent all morning {hobby}. Best day!"` |
| 3 | mood | mood, happy, sad, how are you, feeling, 心情 | `"{name} is feeling {personality} today!"` |
| 4 | greeting | hello, hi, hey, good morning, 你好 | `"Oh! You're back! {name} missed you! {catchphrase}"` |
| 5 | default | *(anything else)* | `"{name} is busy {hobby} right now. Leave a seed and come back later!"` |

Rules: case-insensitive, trimmed input, substring match, deterministic (same hamster + same input → same output).

## 9. Dependencies Added

```json
{
  "express": "^4.18.0",
  "cors": "^2.8.5",
  "dotenv": "^16.3.0",
  "concurrently": "^8.2.0"
}
```

## 10. What F2 Does NOT Include

- No database (MongoDB in F3)
- No user accounts, user IDs, visit/feed tracking (F3)
- No persistent memory across sessions (F3)
- No `GET /api/hamsters/random` or other F3 API endpoints
- No `npm run db:seed` (F3)

## 11. F1 Regression Checklist

All 7 F1 acceptance criteria must continue to pass:
- [x] React + Vite starts
- [x] `/` HomePage unchanged
- [x] `/hamster` HamsterPage shows hamster card
- [x] 12 hamster data entries with all fields
- [x] "Visit Another" works
- [x] Navbar unchanged
- [x] Mobile responsive
