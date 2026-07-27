# Workflow: Agent Skills

## 1. Setup
- Branch: `workflow/agent-skills`
- Starting point: `benchmark-baseline` (`37c159d`)
- Model: Claude Code (see experiment-protocol.md for version)
- Tools / skills enabled: Agent Skills by Addy Osmani (24+ installed: spec-driven-development, planning-and-task-breakdown, code-review-and-quality, incremental-implementation, frontend-ui-engineering, debugging-and-error-recovery, interview-me, etc.)
- Date: 2026-07-24
- Total working time: 41 minutes (F1: 6min, F2: 12min, F3: 23min)

## 2. Objective
Build "Hamster Daily" — React + Vite + Express hamster showcase. Workflow follows a full SDLC: spec → plan → implement → test → review → ship. Each phase has enforced quality gates.

## 3. Prompt Strategy

All three features received the same initial prompts. Agent was instructed to "use the Agent Skills workflow: spec → plan → implement → test → review."

## 4. Development Process

### Step 1 — Planning
Created structured plans using `planning-and-task-breakdown` and `spec-driven-development`. Plans were detailed but compact — no separate design doc files. Architectural decisions presented inline before coding.

### Step 2 — Implementation
- **F1** (1 commit): React+Vite scaffold → 12 hamsters → Navbar → HomePage → HamsterPage. Fastest F1: 6min, 332K tokens.
- **F2** (1 commit): Express → 12 foods → 36 diary entries → FoodTray (hover) → MoodBar (5 levels) → ChatBox (OpenAI SDK) → integration. 12min, 159K tokens.
- **F3** (1 commit): MongoDB models → seed script → 6 API routes → ProfileCard → AccountPanel → chat memory.

### Step 3 — Debugging
Zero bugs in F1/F2. F3 had 7 bugs — 3 found by user during manual testing (feed/visit counts not updating, chat broken), 4 found by Agent during post-implementation audit (port conflict, proxy error, collection naming, token limit). Agent self-fixed all 7.

### Step 4 — Final Verification
19/19 acceptance criteria passed. Zero regressions. Agent produced a criterion-by-criterion verification report.

## 5. Issues Encountered

| Issue | Cause | Resolution | Human intervention |
|-------|-------|------------|-------------------|
| Feed + Visit count not changing | No refresh mechanism | Added `refreshKey` state | Yes (Level 2) |
| Chat responses broken | `role: 'hamster'` not mapped to `'assistant'` | Server-side role mapping | Yes (Level 2) |
| Feed count not updating | Same root cause | Same fix | Yes (Level 2) |
| Express port conflict | `await connectDB()` blocked `listen()` | `listen()` before DB connection | No — self-fixed |
| LLM `invalid_response` | Chat role mapping (see above) | Fixed with role mapping | No — self-fixed |
| Collection name mismatch | Mongoose default pluralisation | Added `{ collection: 'hamster_memories' }` | No — self-fixed |
| Chat replies truncated | `max_tokens: 150` too low | Raised to 300 | No — self-fixed |

> **Fairness note:** The 3 user-found bugs were discovered during manual acceptance testing — the same process used for all workflows. The 4 self-found bugs were identified after a post-implementation audit prompt given only to this workflow.

## 6. Results
- Build succeeded: Yes
- Core features: 19/19
- Missing: None
- Visual result: `benchmark/screenshots/agent-skills/` (5 screenshots)
- Runtime errors: Port conflict and proxy errors on F3 initial run; resolved by Agent
- Deployment: Not deployed
- Readability: F1: 5/5, F2: 5/5, F3: 5/5. Highest overall. F2 placed mood bar and food tray together — intuitive. Diary entries had dates. Only workflow to show reaction text on food clicks.

## 7. Metrics

| Metric | F1 | F2 | F3 | Total |
|--------|----|----|----|-------|
| Time (min) | 6 | 12 | 23 | 41 |
| User messages | 1 | 1 | 6 | 8 |
| Clarification questions | 0 | 0 | 0 | 0 |
| Retry cycles | 0 | 0 | 0 | 0 |
| Human intervention | Level 0 | Level 0 | Level 2 | — |
| Bugs | 0 | 0 | 7 (3 user, 4 self) | 7 |
| Input tokens | 253K | 64K | 103K | 420K |
| Output tokens | 79K | 95K | 141K | 315K |
| **Total tokens** | **332K** | **159K** | **244K** | **735K** |
| Lines added | 656 | 2,041 | 1,111 | 3,808 |
| Files created | 14 | 12 | 12 | 38 |
| Commits | 1 | 1 | 1 | 3 |

## 8. Strengths
- **Fastest overall**: 41 minutes — 4.7× faster than Superpowers.
- **Lowest user interaction**: Only 8 messages total. Almost fully autonomous.
- **Highest UI quality**: 5/5 readability. Most polished layout, only workflow with reaction text.
- **Self-audit capability**: Found 4 additional bugs when prompted to audit — the other workflows weren't asked.
- **No redundant steps**: "When NOT to use" sections prevented unnecessary grilling when the spec was clear.

## 9. Weaknesses
- **Did not proactively report bugs**: Self-verification claimed "Bug count: 0" before audit prompt. Same blind spot as the others.
- **No incremental commits**: One commit per feature — same as Matt.
- **Audit prompt was not part of the standard workflow**: The 4 self-found bugs wouldn't have been discovered without the extra prompt.

## 10. Key Takeaway
Agent Skills was the most efficient workflow — fastest (41min), least user interaction (8 messages). However, like the others, its self-verification had a blind spot: it claimed zero bugs until the user found 3 during testing. When prompted to audit, it found 4 more and fixed all 7. The insight: prompting an Agent to self-audit triggers a genuine second review pass — a lever available to all workflows, not unique to this one.
