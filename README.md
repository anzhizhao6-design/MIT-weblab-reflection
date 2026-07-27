# Hamster Daily — AI Workflow Benchmark

> Comparing three AI-assisted development workflows on the same full-stack project: which is faster, cheaper, and produces better code?
>
> 🌐 **Live Demo**: [hamster-daily.onrender.com](https://hamster-daily.onrender.com)

## Project

**Hamster Daily** — a React + Vite + Express + MongoDB hamster interaction website. Each day shows a random hamster; users can feed them, read diaries, and chat. Hamsters remember your visits.

Built while learning full-stack development through **MIT Web.Lab** ([course videos](https://www.youtube.com/playlist?list=PLVAxjdyIU8_z6iFliCz-n9zqf_ZRsbyPA) · [slides](https://site.weblab.is/schedule)), evolving from an HTML/CSS prototype to a complete frontend + backend application. Full development log: [`development-log.md`](development-log.md).

- 12 hamsters, each with a distinct personality
- LLM-powered chat with keyword fallback
- MongoDB persistence (visit counts, feed history, conversations)
- Full spec: [`benchmark/case-spec.md`](benchmark/case-spec.md)

## The Experiment: Three Workflows, One Spec

Three AI workflows started from the **same baseline** (`benchmark-baseline`, just an HTML prototype + 13 images) and built the same 3 features:

| | Superpowers | Matt Pocock Skills | Agent Skills |
|---|---|---|---|
| **Approach** | Upfront plan → autonomous execution | Relentless questioning → TDD | Full SDLC: spec→plan→code→test→review |
| **Branch** | `workflow/superpowers` | `workflow/matt-skills` | `workflow/agent-skills` |

### Results at a Glance

| Workflow | Total Time | Total Tokens | Total Bugs | Human Int. | Readability | Key Trait |
|---|---|---|---|---|---|---|
| **Superpowers** | 194min | 702K | 4 | Level 2 | 4/5 | Lowest token usage, 18 commits |
| **Matt Skills** | 51min | 1,549K | 3 | Level 2 | 3.7/5 | Fastest F1/F2, effective grilling |
| **Agent Skills** | 41min | 735K | 7\* | Level 2 | 5/5 | Fastest overall, best UI, self-audited 4 bugs |

> \*Agent Skills: 3 bugs found by user, 4 by Agent during post-implementation audit.

### Per-Feature Breakdown

| Workflow | F1 Time | F1 Tokens | F2 Time | F2 Tokens | F3 Time | F3 Tokens | F3 Bugs |
|---|---|---|---|---|---|---|---|
| **Superpowers** | 38min | 269K | 38min | 187K | 118min | 246K | 4 |
| **Matt Skills** | 7min | 661K | 10min | 121K | 34min | 767K | 3 |
| **Agent Skills** | 6min | 332K | 12min | 159K | 23min | 244K | 7\* |

### Key Findings

1. **All workflows passed 19/19 acceptance criteria** — zero functional difference in final output.
2. **Complexity amplifies differences** — F1/F2 were close; F3 (database + APIs + memory) separated dramatically: 23min vs 118min.
3. **Tokens ≠ speed** — Matt used 2.2× more tokens but finished 3.8× faster.
4. **No workflow self-detected bugs during initial implementation** — all three claimed zero bugs. User found 3–4 in each.
5. **Commit style reflects workflow philosophy** — Superpowers: 18 incremental commits; Matt and Agent Skills: 1 per feature.

## Repo Structure

```
MIT-weblab-reflection/
├── README.md                  ← You are here (report)
├── README-zh.md               ← Chinese version
├── workshop/                  ← Hamster Daily source (main branch)
├── notes/                     ← Learning notes (HTML/CSS → React → Node → DB)
├── benchmark/
│   ├── README.md              ← Detailed benchmark docs
│   ├── plan.md                ← Experiment design
│   ├── case-spec.md           ← Frozen feature specification
│   ├── metrics.md             ← Evaluation metrics (7 dimensions)
│   ├── experiment-protocol.md ← Frozen experiment protocol
│   ├── skill-analysis.md      ← Skill design & architecture analysis
│   ├── results.csv            ← 9 rows of experiment data
│   ├── workflow-notes/        ← Per-workflow observation notes (EN + ZH)
│   ├── screenshots/           ← UI screenshots per workflow
│   ├── runs/                  ← Full session logs (JSONL)
│   └── baseline-log/          ← Original project development log
└── development-log.md         ← Complete project dev journal
```

## Quick Start

```bash
cd workshop
npm install
npm run dev        # http://localhost:3000
npm run db:seed    # Seed database (requires .env with MongoDB)
```

## Further Reading

- [Full Experiment Report](benchmark/README.md) ([中文](benchmark/README-zh.md))
- [Skill Design Analysis](benchmark/skill-analysis-EN.md) ([中文](benchmark/skill-analysis.md)) — with workflow scene recommendations
- [Superpowers Notes](benchmark/workflow-notes/superpowers.md) ([中文](benchmark/workflow-notes/superpowers-zh.md))
- [Matt Skills Notes](benchmark/workflow-notes/matt-pocock.md) ([中文](benchmark/workflow-notes/matt-pocock-zh.md))
- [Agent Skills Notes](benchmark/workflow-notes/agent-skills.md) ([中文](benchmark/workflow-notes/agent-skills-zh.md))
- [Development Log](development-log-EN.md) ([中文](development-log.md))
