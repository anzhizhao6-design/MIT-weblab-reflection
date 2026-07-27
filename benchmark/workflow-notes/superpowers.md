# Workflow: Superpowers

## 1. Setup
- Branch: `workflow/superpowers`
- Starting point: `benchmark-baseline` (`37c159d`)
- Model: Claude Code (see experiment-protocol.md for version)
- Tools / skills enabled: Superpowers (brainstorming, writing-plans, executing-plans, subagent-driven-development, verification-before-completion)
- Date: 2026-07-23
- Total working time: 194 minutes (F1: 38min, F2: 38min, F3: 118min)

## 2. Objective
Build "Hamster Daily" — React + Vite + Express hamster showcase. Workflow emphasises upfront planning and autonomous execution: brainstorm → detailed plan → Agent implements independently → self-review → user verifies.

## 3. Prompt Strategy

All three features received the same initial prompts as the other workflows. Agent was instructed to "use the Superpowers workflow."

## 4. Development Process

### Step 1 — Planning
Agent produced design specs and implementation plans for each feature (in `.superpowers/sdd/`). F1 plan was comprehensive; F2/F3 plans were less detailed but adequate. 5–7 numbered tasks per feature, each with a brief and report.

### Step 2 — Implementation
- **F1** (5 tasks): Scaffold → hamster data → Navbar → HomePage → HamsterPage. Validated food IDs (§6.3) and personality mapping (§6.4).
- **F2** (7 tasks): Express backend + LLM proxy → diary posts → FoodTray (hover penalty) → MoodBar (5 levels) → ChatBox (fallback) → integration.
- **F3** (7 tasks): Mongoose models → seed script → 6 API routes → useUserId → ProfileCard → AccountPanel → chat memory.

### Step 3 — Debugging
Zero bugs in F1/F2. F3 had 4 bugs: collection name mismatch, visit count race condition, chat food ID vs label, ESM hoisting (self-fixed). Three required user diagnosis.

### Step 4 — Final Verification
19/19 acceptance criteria passed. Zero regressions. User manually verified each feature.

## 5. Issues Encountered

| Issue | Cause | Resolution | Human intervention |
|-------|-------|------------|-------------------|
| Collection name mismatch | Mongoose default pluralisation | Added `{ collection: 'hamster_memories' }` | Yes (Level 2) |
| Visit count always 0 | Race: POST + GET in same render cycle | Added refresh trigger | Yes (Level 2) |
| LLM received food ID not label | `hamster.favouriteFood` = kebab ID | Wrapped hamster with display name resolver | Yes (Level 2) |
| ESM hoisting: API key undefined | Module-level env read before `dotenv.config()` | Moved env reads inside route handler | No — self-fixed |

## 6. Results
- Build succeeded: Yes
- Core features: 19/19
- Missing: None
- Visual result: `benchmark/screenshots/superpowers/` (6 screenshots)
- Runtime errors: Port conflict on F3; resolved
- Deployment: Not deployed (not required by benchmark)
- Readability: F1: 4/5, F2: 4/5, F3: 4/5. Consistent, clean. Generated copy functional but not creative.

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
| Commits | 5 | 6 | 7 | 18 |

## 8. Strengths
- **Lowest token usage**: 702K total — 55% less than Matt, 4% less than Agent Skills.
- **Autonomous on simple tasks**: F1/F2 needed only 4 user messages each, zero bugs.
- **Clean commit discipline**: 18 well-structured commits with descriptive messages.
- **Comprehensive planning output**: Design specs and plans archived in `.superpowers/sdd/`.

## 9. Weaknesses
- **Did not self-detect bugs**: All 7 F3 task reports said "Concerns: None." Three bugs required user diagnosis.
- **F3 time ballooned**: 118 minutes (3× F1 or F2), largely idle while user debugged.
- **Plan became stale at edges**: Plan missed ESM import ordering, Mongoose defaults, React state timing.
- **Build-only verification**: `npx vite build` didn't catch runtime behaviour issues.

## 10. Key Takeaway
Superpowers excels when tasks fit within a single conceptual domain. It produced the cleanest commits and lowest token usage. But its "plan-then-execute" model breaks when complexity exceeds what the plan anticipated — the Agent lacks a self-verification loop. Best paired with a human who actively tests output rather than trusting "Concerns: None."
