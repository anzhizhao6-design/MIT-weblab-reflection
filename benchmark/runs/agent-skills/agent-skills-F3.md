# Agent Skills — F3 Session Log

> **Feature:** Database + Persistent Memory
> **Date:** 2026-07-24
> **Duration:** 23 min (16:10-16:17 initial + 17:00-17:16 debug)

## Flow

1. **Plan** — Wrote implementation plan (6 tasks), approved
2. **Task 1** — Mongoose + DB connection + 5 models
3. **Task 2** — Seed script (`npm run db:seed`)
4. **Task 3** — 7 API endpoints (server/index.js rewrite)
5. **Task 4** — UserContext (UUID + localStorage)
6. **Task 5** — AccountPanel + ProfileCard + Navbar update
7. **Task 6** — HamsterPage + FoodTray + ChatBox API integration
8. **Debug phase** — 7 bugs found, 3 human-assisted, 4 agent self-fixed

## Bugs

| # | Bug | Resolution |
|---|-----|------------|
| 1 | Express 5 `app.listen(cb)` not supported | Agent self-fixed: `http.createServer(app).listen()` |
| 2 | `ECONNREFUSED` — DB blocked HTTP listener | Agent self-fixed: `listen()` before `connectDB()` |
| 3 | Visit/Feed counts never update | Agent self-fixed: `refreshKey` mechanism |
| 4 | LLM `invalid_response` — `role: 'hamster'` not mapped | Agent self-fixed: `hamster→assistant` mapping |
| 5 | Conversations never saved for fallback | Agent self-fixed: new `/api/conversations` endpoint |
| 6 | Wrong collection names (hamstermemories / feedposts) | Human pointed out → fixed |
| 7 | LLM response truncated mid-sentence | Human pointed out → `max_tokens` 150→300 |

## Human Interventions

| # | Type | Description |
|---|------|-------------|
| 1 | Level 2 | Pointed out collection name mismatch (hamster_memories / feed_posts) |
| 2 | Level 2 | Reported visit/feed counts not updating |
| 3 | Level 2 | Reported chat response truncation |

