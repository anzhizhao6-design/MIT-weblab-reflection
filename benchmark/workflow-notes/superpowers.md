# Workflow: Superpowers

## 1. Setup
- Branch: `workflow/superpowers`
- Starting point: `benchmark-baseline` (`37c159d`)
- Model: Claude Code（具体版本见 experiment-protocol.md）
- Tools / skills enabled: Superpowers (brainstorming, writing-plans, executing-plans, subagent-driven-development, verification-before-completion)
- Date: 2026-07-23
- Total working time: 194 minutes（F1: 38min, F2: 38min, F3: 118min）

## 2. Objective
Build "Hamster Daily" — a React + Vite + Express hamster showcase app across three features (F1→F2→F3). Workflow emphasises upfront planning and autonomous execution: brainstorm → write detailed plan → Agent implements independently → self-review → user verifies.

## 3. Prompt Strategy

### F1 Prompt
```
请根据 benchmark/case-spec.md 中的 F1 要求，完成 HomePage + Random Hamster 的开发。
使用 Superpowers workflow 完成。
```

### F2 Prompt
```
请根据 benchmark/case-spec.md 中的 F2 要求，在 F1 基础上完成 Feed + Food Tray + LLM Chat 的开发。
使用 Superpowers workflow 完成。
```

### F3 Prompt
```
请根据 benchmark/case-spec.md 中的 F3 要求，在 F1+F2 基础上完成 Database + Persistent Memory 的开发。
使用 Superpowers workflow 完成。
```

## 4. Development Process

### Step 1 — Planning
Agent produced design specs and implementation plans for each feature (stored in `.superpowers/sdd/`). F1 plan was comprehensive with detailed task breakdowns. Plans grew less detailed for F2 and F3 but remained adequate. Agent broke work into 5–7 numbered tasks per feature, each with a brief and a report.

### Step 2 — Implementation
- **F1** (5 tasks): Scaffold React+Vite → hamster data → Navbar → HomePage → HamsterPage. Agent validated all 12 food IDs against spec §6.3 and personality mapping against §6.4. Self-review diff files generated for each task pair.
- **F2** (7 tasks): Express backend with LLM proxy → diary posts → FoodTray with 2s hover penalty → MoodBar with 5 levels → ChatBox with fallback priority matching → HamsterPage integration.
- **F3** (7 tasks): Mongoose models → seed script → API routes → useUserId hook → ProfileCard → AccountPanel → chat memory injection.

### Step 3 — Debugging
F1 and F2 had zero bugs. F3 introduced 4 bugs:
1. **Collection name**: `HamsterMemory` defaulted to `hamstermemories` (Mongoose) instead of spec `hamster_memories`.
2. **Visit count stuck at 0**: Race condition between `POST /api/visit` and `GET /api/memory`.
3. **Chat system prompt**: Passed food ID (`sweet-potato`) instead of display label (`Sweet Potato 🍠`).
4. **ESM hoisting**: `process.env.LLM_API_KEY` read at module scope before `dotenv.config()`. Agent self-diagnosed and fixed this one.

### Step 4 — Final Verification
All 19 acceptance criteria passed (7 F1 + 4 F2 + 8 F3). Zero regressions. Build clean. User manually verified each feature on `localhost:3000`.

## 5. Issues Encountered

| Issue | Cause | Resolution | Human intervention |
|-------|-------|------------|-------------------|
| Collection name `hamstermemories` ≠ spec `hamster_memories` | Mongoose default pluralisation | Added `{ collection: 'hamster_memories' }` | Yes (Level 2) |
| Visit count always 0 | Race: POST visit + GET memory in same render cycle | Added refresh trigger after visit POST | Yes (Level 2) |
| LLM received food ID not label | `hamster.favouriteFood` = `sweet-potato` (ID) | Wrapped hamster with `getFoodInfo()` for `🍠 Sweet Potato` | Yes (Level 2) |
| ESM hoisting: API key `undefined` | Module-level env read before `dotenv.config()` | Moved env reads inside route handler | No — Agent self-fixed |

## 6. Results
- Build succeeded: Yes (all three features)
- Core features completed: 19/19 acceptance criteria
- Missing features: None
- Visual result: See `benchmark/screenshots/superpowers/` (6 screenshots)
- Runtime errors: Port conflict on F3 (Vite + Express both on 3001); resolved
- Deployment status: Not deployed（benchmark did not require deployment）

## 7. Metrics

| Metric | F1 | F2 | F3 | Total |
|--------|----|----|----|-------|
| Time (min) | 38 | 38 | 118 | 194 |
| User messages | 4 | 4 | 13 | 21 |
| Agent responses | 4 | 4 | 13 | 21 |
| Clarification questions | 3 | 3 | 5 | 11 |
| Retry cycles | 0 | 0 | 4 | 4 |
| Human intervention | Level 0 | Level 0 | Level 2 | — |
| Bugs | 0 | 0 | 4 | 4 |
| Input tokens | 198K | 121K | 123K | 442K |
| Output tokens | 71K | 66K | 123K | 260K |
| **Total tokens** | **269K** | **187K** | **246K** | **702K** |
| Lines added | 3,513 | 1,808 | 1,062 | 6,383 |
| Files created | 16 | 9 | 17 | 42 |
| Files modified | 1 | 4 | 5 | 10 |
| Commits | 5 | 6 | 7 | 18 |

## 8. Strengths
- **Lowest token usage**: 702K total — 55% less than Matt, 4% less than Agent Skills.
- **Autonomous on simple tasks**: F1 and F2 required only 4 user messages each, zero bugs, zero retries.
- **Clean commit discipline**: 18 well-structured commits with descriptive messages.
- **Comprehensive planning output**: Design specs and plans archived in `.superpowers/sdd/`.

## 9. Weaknesses
- **Did not self-detect bugs**: Agent's self-review ("Concerns: None" on all 7 F3 tasks) was incorrect. All 4 bugs required user observation and diagnosis.
- **F3 time ballooned**: 118 minutes (3× F1 or F2), largely idle while user diagnosed bugs.
- **Plan became stale at edges**: The F3 plan missed ESM import ordering, Mongoose defaults, and React state timing.
- **Build-only verification**: `npx vite build` didn't catch runtime behaviour issues.

## 10. Key Takeaway
Superpowers excels when the task fits within a single conceptual domain (F1: frontend, F2: frontend + one API). It produced the cleanest commits and lowest token usage. However, its "plan-then-execute" model breaks when complexity exceeds what the plan anticipated — the Agent lacks a self-verification loop. Best paired with a human who actively tests output rather than trusting "Concerns: None."
