# Workflow: Agent Skills

## 1. Setup
- Branch: `workflow/agent-skills`
- Starting point: `benchmark-baseline` (`37c159d`)
- Model: Claude Code（具体版本见 experiment-protocol.md）
- Tools / skills enabled: Agent Skills by Addy Osmani (planning-and-task-breakdown, spec-driven-development, test-driven-development, code-review-and-quality, incremental-implementation, debugging-and-error-recovery, interview-me, api-and-interface-design, frontend-ui-engineering, etc. — 24+ skills installed)
- Date: 2026-07-24
- Total working time: 41 minutes（F1: 6min, F2: 12min, F3: 23min）

## 2. Objective
Build "Hamster Daily" — a React + Vite + Express hamster showcase app across three features (F1→F2→F3). Workflow follows a full SDLC: spec → plan → implement → test → review → ship. Each phase has enforced quality gates.

## 3. Prompt Strategy

### F1 Prompt
```
请根据 benchmark/case-spec.md 中的 F1 要求，完成 HomePage + Random Hamster 的开发。
使用 Agent Skills workflow 完成：spec → plan → implement → test → review。
```

### F2 Prompt
```
请根据 benchmark/case-spec.md 中的 F2 要求，在 F1 基础上完成 Feed + Food Tray + LLM Chat 的开发。
使用 Agent Skills workflow 完成。
```

### F3 Prompt
```
请根据 benchmark/case-spec.md 中的 F3 要求，在 F1+F2 基础上完成 Database + Persistent Memory 的开发。
使用 Agent Skills workflow 完成。
```

## 4. Development Process

### Step 1 — Planning
Agent Skills created structured plans using `planning-and-task-breakdown` and `spec-driven-development`. Plans were detailed but compact — no separate design doc files. Agent presented architectural decisions (project structure, API design, component tree) inline before coding.

### Step 2 — Implementation
- **F1**: Single commit — React+Vite scaffold → 12 hamsters → Navbar → HomePage → HamsterPage. Fastest F1 of any workflow: 6 minutes, 332K tokens.
- **F2**: Single commit — Express backend → 12 foods → 36 diary entries → FoodTray with hover → MoodBar with 5 levels → ChatBox with OpenAI SDK → HamsterPage integration. 12 minutes, 159K tokens.
- **F3**: Single commit — MongoDB models → seed script → 6 API routes → ProfileCard → AccountPanel → UserContext → chat memory injection.

### Step 3 — Debugging
F1 and F2 had zero bugs. F3 had 7 bugs — **3 found by the user** during manual testing (feed/visit counts not updating, chat responses broken), and **4 found by the Agent** after being asked to audit its own work (port conflict, proxy error, collection naming, token limit). Agent self-fixed all 7.

### Step 4 — Final Verification
All 19 acceptance criteria passed. Zero regressions. Agent produced a detailed self-verification report listing each criterion, status, and evidence.

## 5. Issues Encountered

| Issue | Cause | Resolution | Human intervention |
|-------|-------|------------|-------------------|
| Feed + Visit count not changing | No refresh mechanism; `useEffect` dependencies never updated | Added `refreshKey` state, event-driven refresh | Yes (Level 2) — user observed and reported |
| Chat responses broken | `role: 'hamster'` not mapped to `'assistant'` for LLM API | Server-side role mapping + restart | Yes (Level 2) — user observed and reported |
| Feed count not updating (`npm run dev` tested) | Same root cause as above | Same fix | Yes (Level 2) |
| Express port conflict + proxy error | `await connectDB()` blocked `listen()`; port 3001 race | `listen()` before DB connection; DB in background | No — Agent self-fixed |
| LLM `invalid_response` on all messages | See chat role mapping above | Fixed with role mapping | No — Agent self-fixed |
| Collection name `hamstermemories` ≠ spec | Mongoose default pluralisation | Added `{ collection: 'hamster_memories' }` | No — Agent self-fixed |
| Chat replies truncated mid-sentence | `max_tokens: 150` too low | Raised to 300 | No — Agent self-fixed |

> **Fairness note:** The 3 user-found bugs were discovered during manual acceptance testing — the same process used for Superpowers and Matt. The 4 self-found bugs were identified after a post-implementation audit prompt that was only given to this workflow. Without that prompt, Agent Skills F3 would have been recorded as 3 bugs (user-found), comparable to Matt (3) and Superpowers (4).

## 6. Results
- Build succeeded: Yes (all three features)
- Core features completed: 19/19 acceptance criteria
- Missing features: None
- Visual result: See `benchmark/screenshots/agent-skills/` (5 screenshots)
- Runtime errors: Port conflict and proxy errors on F3 initial run; resolved by Agent
- Deployment status: Not deployed（benchmark did not require deployment）
- Readability scores: F1: 5/5, F2: 5/5, F3: 5/5. Highest overall. F2 placed mood bar and food tray together — intuitive layout. Diary entries had dates. F3 was the only workflow to show reaction text on food clicks. UI felt the most polished.

## 7. Metrics

| Metric | F1 | F2 | F3 | Total |
|--------|----|----|----|-------|
| Time (min) | 6 | 12 | 23 | 41 |
| User messages | 1 | 1 | 6 | 8 |
| Agent responses | 1 | 1 | 6 | 8 |
| Clarification questions | 0 | 0 | 0 | 0 |
| Retry cycles | 0 | 0 | 0 | 0 |
| Human intervention | Level 0 | Level 0 | Level 0 | — |
| Bugs | 0 | 0 | 7 (all self-fixed) | 7 |
| Input tokens | 253K | 64K | 103K | 420K |
| Output tokens | 79K | 95K | 141K | 315K |
| **Total tokens** | **332K** | **159K** | **244K** | **735K** |
| Lines added | 656 | 2,041 | 1,111 | 3,808 |
| Files created | 14 | 12 | 12 | 38 |
| Files modified | 1 | 5 | 9 | 15 |
| Commits | 1 | 1 | 1 | 3 |

## 8. Strengths
- **Fastest overall**: 41 minutes — 4.7× faster than Superpowers, 20% faster than Matt.
- **Lowest user interaction**: Only 8 user messages total (1 for F1, 1 for F2, 6 for F3). Almost fully autonomous.
- **Self-healing when prompted**: When asked to audit its own work, Agent found and fixed 4 additional bugs independently. Combined with user-found 3 bugs, total 7 identified and resolved.
- **No clarification questions needed**: Agent read the spec and made decisions autonomously without grilling the user.
- **Detailed self-verification**: Each feature had a criterion-by-criterion verification report with evidence.

## 9. Weaknesses
- **Did not proactively report bugs**: Like the other workflows, Agent wouldn't have disclosed bugs without being asked. The self-verification report claimed "Bug 数：0" before the user's prompt.
- **No incremental commits**: Each feature was one commit — same as Matt.

## 10. Key Takeaway
Agent Skills was the most efficient workflow — fastest (41min), least user interaction (8 messages). However, like the others, its self-verification had a blind spot: it claimed zero bugs until the user found 3 during manual testing. When subsequently asked to audit its own work, the Agent found 4 more bugs and fixed all 7. The key insight is that **prompting an Agent to self-audit triggers a genuine second review pass** — not just a superficial checklist. This is a lever available to all workflows, not unique to Agent Skills.
