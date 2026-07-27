# Workflow: Matt Pocock Skills

## 1. Setup
- Branch: `workflow/matt-skills`
- Starting point: `benchmark-baseline` (`37c159d`)
- Model: Claude Code (see experiment-protocol.md for version)
- Tools / skills enabled: Matt Pocock Skills (41 installed: ask-matt, tdd, implement, grilling, code-review, diagnosing-bugs, research, prototype, wayfinder, domain-modeling, etc.)
- Date: 2026-07-24
- Total working time: 51 minutes (F1: 7min, F2: 10min, F3: 34min)

## 2. Objective
Build "Hamster Daily" — React + Vite + Express hamster showcase. Workflow emphasises relentless questioning before coding and TDD: grill until requirements are perfectly clear → implement test-first → review.

## 3. Prompt Strategy

All three features received the same initial prompts. Agent was instructed to "use the Matt Pocock Skills workflow."

## 4. Development Process

### Step 1 — Planning
Matt's "grilling" asked 5–7 clarification questions per feature before coding. Questions were practical: project structure, data location, backend architecture, dev server setup. Grilling prevented ambiguity but didn't produce a written plan document.

### Step 2 — Implementation
- **F1** (1 commit): Scaffold → 12 hamsters with correct food IDs → Navbar → HomePage → HamsterPage. 7min, 661K tokens.
- **F2** (1 commit): Diary → FoodTray with OpenAI SDK → MoodBar → ChatBox with fallback → Express `/api/chat`. 10min, 121K tokens. Cleaner fallback than Superpowers.
- **F3** (1 commit): MongoDB models → seed script → API routes → ProfileCard → AccountPanel → chat memory.

### Step 3 — Debugging
Zero bugs in F1/F2. F3 had 3 bugs: feed count +2 (StrictMode), collection name mismatch, visit count delay. All required user diagnosis.

### Step 4 — Final Verification
19/19 acceptance criteria passed. Zero regressions. User verified.

## 5. Issues Encountered

| Issue | Cause | Resolution | Human intervention |
|-------|-------|------------|-------------------|
| Feed count sometimes +2 | React StrictMode double-invokes state updater | Moved `recordFeed()` outside updater | Yes (Level 2) |
| Collection name mismatch | Mongoose default pluralisation | Added `{ collection: 'hamster_memories' }` | Yes (Level 2) |
| Visit count refreshes slowly | `recordVisit()` + `fetchMemory()` ran concurrently | Added `await` before `fetchMemory()` | Yes (Level 2) |

## 6. Results
- Build succeeded: Yes
- Core features: 19/19
- Missing: None
- Visual result: `benchmark/screenshots/matt-skills/` (5 screenshots)
- Runtime errors: None significant
- Deployment: Not deployed
- Readability: F1: 5/5, F2: 3/5, F3: 3/5. F1 excellent. F2 diary layout misaligned. F3 template less refined than Agent Skills, but LLM responses felt more natural than Superpowers.

## 7. Metrics

| Metric | F1 | F2 | F3 | Total |
|--------|----|----|----|-------|
| Time (min) | 7 | 10 | 34 | 51 |
| User messages | 9 | 7 | 8 | 24 |
| Clarification questions | 7 | 6 | 5 | 18 |
| Retry cycles | 0 | 0 | 2 | 2 |
| Human intervention | Level 0 | Level 0 | Level 2 | — |
| Bugs | 0 | 0 | 3 | 3 |
| Input tokens | 535K | 41K | 681K | 1,257K |
| Output tokens | 126K | 80K | 85K | 291K |
| **Total tokens** | **661K** | **121K** | **767K** | **1,549K** |
| Lines added | 2,421 | 2,260 | 936 | 5,617 |
| Files created | 11 | 8 | 12 | 31 |
| Commits | 1 | 1 | 1 | 3 |

## 8. Strengths
- **Fastest overall**: 51 minutes (3.8× faster than Superpowers).
- **F2 token efficiency**: 121K — lowest of any workflow on any feature.
- **Clean technical choices**: Used OpenAI SDK instead of raw `fetch`.
- **Effective grilling**: 5–7 questions per feature prevented mid-implementation ambiguity.

## 9. Weaknesses
- **No incremental commits**: One commit per feature — no rollback safety.
- **F1 token bloat**: 661K (2.5× Superpowers). Grilling consumed significant tokens.
- **F3 token explosion**: 767K (3.1× Superpowers). Questioning approach doesn't scale well to complex features.
- **Did not self-detect bugs**: All 3 F3 bugs required user diagnosis.
- **Build artifacts in initial commit**: F1 commit included `node_modules/` and `dist/`. Resolved with `.gitignore` and amend.

## 10. Key Takeaway
Matt's grilling is remarkably fast for well-scoped tasks — F1 (7min) and F2 (10min) were the fastest of any workflow. But upfront questioning doesn't prevent bugs in complex features. The single-commit pattern is a double-edged sword: fast to deliver but no safety net. Best for experienced developers with clear requirements who can answer grilling questions quickly.
