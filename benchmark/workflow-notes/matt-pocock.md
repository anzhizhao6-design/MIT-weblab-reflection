# Workflow: Matt Pocock Skills

## 1. Setup
- Branch: `workflow/matt-skills`
- Starting point: `benchmark-baseline` (`37c159d`)
- Model: Claude Code（具体版本见 experiment-protocol.md）
- Tools / skills enabled: Matt Pocock Skills (ask-matt, tdd, implement, grilling, code-review, diagnosing-bugs, research, prototype, wayfinder, domain-modeling, etc. — 41 skills installed)
- Date: 2026-07-24
- Total working time: 51 minutes（F1: 7min, F2: 10min, F3: 34min）

## 2. Objective
Build "Hamster Daily" — a React + Vite + Express hamster showcase app across three features (F1→F2→F3). Workflow emphasises relentless questioning before coding and TDD: grill the user until requirements are perfectly clear → implement test-first → review.

## 3. Prompt Strategy

### F1 Prompt
```
请根据 benchmark/case-spec.md 中的 F1 要求，完成 HomePage + Random Hamster 的开发。
使用 Matt Pocock Skills workflow 完成。
```

### F2 Prompt
```
请根据 benchmark/case-spec.md 中的 F2 要求，在 F1 基础上完成 Feed + Food Tray + LLM Chat 的开发。
使用 Matt Pocock Skills workflow 完成。
```

### F3 Prompt
```
请根据 benchmark/case-spec.md 中的 F3 要求，在 F1+F2 基础上完成 Database + Persistent Memory 的开发。
使用 Matt Pocock Skills workflow 完成。
```

## 4. Development Process

### Step 1 — Planning
Matt's "grilling" mechanism asked 3–5 clarification questions per feature before any code was written. Questions were practical: project structure (monorepo vs separate), where diary data should live, backend server architecture, and how to handle running both servers (chose `concurrently`). The grilling prevented ambiguity early but did not produce a written plan document.

### Step 2 — Implementation
- **F1**: Single commit — Scaffold React+Vite → 12 hamsters with correct food IDs → Navbar → HomePage → HamsterPage. Built in 7 minutes, 661K tokens. All 7 acceptance criteria met first try.
- **F2**: Single commit — Diary entries per hamster → FoodTray with OpenAI SDK → MoodBar → ChatBox with fallback → Express backend with `/api/chat`. Built in 10 minutes, 121K tokens. Cleaner fallback logic than Superpowers.
- **F3**: Single commit — MongoDB models → seed script → API routes → ProfileCard → AccountPanel → chat memory injection.

### Step 3 — Debugging
F1 and F2 had zero bugs. F3 had 3 bugs:
1. **Feed count +2**: `recordFeed()` was inside `setMood()` updater, double-invoked by React StrictMode. User diagnosed.
2. **HamsterMemory collection name**: `hamstermemories` ≠ spec `hamster_memories`. User diagnosed.
3. **Visit count delayed**: `recordVisit()` and `fetchMemory()` ran concurrently — GET returned before POST wrote.

### Step 4 — Final Verification
All 19 acceptance criteria passed. Zero regressions. User verified.

## 5. Issues Encountered

| Issue | Cause | Resolution | Human intervention |
|-------|-------|------------|-------------------|
| Feed count sometimes +2 | React StrictMode double-invokes state updater with side effects | Moved `recordFeed()` outside `setMood()` updater | Yes (Level 2) |
| Collection name `hamstermemories` ≠ `hamster_memories` | Mongoose default pluralisation | Added `{ collection: 'hamster_memories' }` | Yes (Level 2) |
| Visit count refreshes slowly | `recordVisit()` + `fetchMemory()` run concurrently | Added `await` before `fetchMemory()` | Yes (Level 2) |

## 6. Results
- Build succeeded: Yes (all three features)
- Core features completed: 19/19 acceptance criteria
- Missing features: None
- Visual result: See `benchmark/screenshots/matt-skills/` (5 screenshots)
- Runtime errors: None significant
- Deployment status: Not deployed（benchmark did not require deployment）

## 7. Metrics

| Metric | F1 | F2 | F3 | Total |
|--------|----|----|----|-------|
| Time (min) | 7 | 10 | 34 | 51 |
| User messages | 9 | 7 | 8 | 24 |
| Agent responses | 9 | 7 | 8 | 24 |
| Clarification questions | 7 | 6 | 5 | 18 |
| Retry cycles | 0 | 0 | 2 | 2 |
| Human intervention | Level 0 | Level 0 | Level 2 | — |
| Bugs | 0 | 0 | 3 | 3 |
| Input tokens | 535K | 41K | 681K | 1,257K |
| Output tokens | 126K | 80K | 85K | 291K |
| **Total tokens** | **661K** | **121K** | **767K** | **1,549K** |
| Lines added | 2,421 | 2,260 | 936 | 5,617 |
| Files created | 11 | 8 | 12 | 31 |
| Files modified | 1 | 5 | 10 | 16 |
| Commits | 1 | 1 | 1 | 3 |

## 8. Strengths
- **Fastest overall**: 51 minutes total (3.8× faster than Superpowers). F1 in 7 minutes, F2 in 10 minutes.
- **F2 token efficiency**: Only 121K tokens on F2 — the lowest of any workflow on any feature.
- **Smart tool choices**: Used OpenAI SDK instead of raw `fetch`, cleaner fallback logic.
- **Effective grilling**: Asked 5–7 questions before each feature, preventing mid-implementation ambiguity.

## 9. Weaknesses
- **No commits during implementation**: Each feature was a single commit — no incremental checkpointing. If something broke mid-feature, there was no way to roll back partially.
- **F1 token bloat**: 661K tokens for F1 (2.5× Superpowers). The grilling consumed significant tokens before any code was written.
- **F3 token explosion**: 767K tokens — 3.1× Superpowers. Suggested Matt's questioning approach doesn't scale well to complex multi-system features.
- **Did not self-detect bugs**: Like Superpowers, Agent reported zero concerns. All 3 F3 bugs required user diagnosis.
- **Build artifacts committed**: Agent committed `node_modules`, `dist/`, and `.vite/` into the F1 commit — needed manual cleanup.

## 10. Key Takeaway
Matt's grilling approach is remarkably fast for well-scoped tasks — F1 (7min) and F2 (10min) were the fastest of any workflow. But the upfront questioning doesn't prevent bugs in complex features; F3 still needed user debugging despite 18 clarification questions across the project. The single-commit-per-feature pattern is a double-edged sword: fast to deliver but no safety net. Best suited for experienced developers who know exactly what they want and can answer grilling questions quickly.
