# Workflow Benchmark

> Testing three AI-assisted development workflows on the same Hamster Daily project.

---

## Three Workflows

| Workflow | One-liner | Approach |
|----------|-----------|----------|
| **A: Superpowers** | Detailed upfront plan, then Agent executes autonomously, self-reviews, fixes bugs, delivers | A contractor you just verify |
| **B: Matt Pocock Skills** | Relentless questioning until requirements are perfectly clear, then TDD | A senior dev who won't stop asking |
| **C: Agent Skills** | Full SDLC: requirements → design → dev → test → review → ship, with anti-skipping checks at every step | PM + Tech Lead + QA team |

---

## Key Differences

> ⚠️ **Pre-experiment Hypotheses** — based on workflow documentation analysis. For actual results, see Observed Results below.

| | Superpowers | Matt Pocock | Agent Skills |
|---|---|---|---|
| **Upfront burden** | Heavy — brainstorming back-and-forth | Heavy — grilling questions | Medium — spec phase |
| **Mid-work interruptions** | Almost none (auto-pilot after spec) | Possible (questions throughout) | Confirms at each phase end |
| **Anti-skipping** | Plan forced to be "junior-dev readable" | Won't code until grilling confirms | Rationalizations table + Red Flags per skill |
| **Best for** | Clear requirements, hands-off | Fuzzy requirements, need clarity first | Quality assurance + team standardization |

---

## Experiment Design

All three workflows start from the same `benchmark-baseline` branch and implement identical features. Each feature is recorded separately.

See: [plan.md](plan.md) · [case-spec.md](case-spec.md) · [metrics.md](metrics.md)

---

## Observed Results

> Experiment completed 2026-07-24. Full data in `results.csv`. Session logs in `runs/`. Screenshots in `screenshots/`.

### Summary

| Workflow | Time | Tokens | Bugs | Human Int. | Build | Key Strength |
| --- | ---: | ---: | ---: | --- | --- | --- |
| **Superpowers** | 194min | 702K | 4 | Level 2 (F3) | ✅ | Lowest tokens, cleanest commits |
| **Matt Skills** | 51min | 1,549K | 3 | Level 2 (F3) | ✅ | Fastest F1/F2, effective grilling |
| **Agent Skills** | 41min | 735K | 7* | Level 2 (F3) | ✅ | Fastest overall, self-audited 4 bugs |

> \*Agent Skills: 7 bugs total — 3 found by user during manual testing, 4 found by Agent during post-implementation audit. Superpowers and Matt were not given the same audit prompt.

### Per-Feature Comparison

| Workflow | F1 Time | F1 Tokens | F1 Bugs | F1 Int. | F2 Time | F2 Tokens | F2 Bugs | F2 Int. | F3 Time | F3 Tokens | F3 Bugs | F3 Int. |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **Superpowers** | 38min | 269K | 0 | 0 | 38min | 187K | 0 | 0 | 118min | 246K | 4 | 2 |
| **Matt Skills** | 7min | 661K | 0 | 0 | 10min | 121K | 0 | 0 | 34min | 767K | 3 | 2 |
| **Agent Skills** | 6min | 332K | 0 | 0 | 12min | 159K | 0 | 0 | 23min | 244K | 7\* | 2 |

### Key Findings

1. **All workflows passed 19/19 acceptance criteria** — zero functional difference in final output.
2. **Complexity amplifies differences**: F1/F2 were close; F3 separated dramatically (23min vs 118min).
3. **No workflow self-detected bugs during initial implementation**: All three claimed zero bugs. User found 3–4 in each during acceptance testing.
4. **Tokens ≠ speed**: Matt used 2.2× more tokens than Superpowers but finished 3.8× faster.
5. **Commit style reflects workflow philosophy**: Superpowers: 18 incremental commits; Matt and Agent Skills: 3 (one per feature). Both produced correct code.

### Machine-Verified Results

To reduce human bias and enable reproducible evaluation, an automated evaluation platform (`feature/auto-eval`) was built to independently re-score all three workflow branches.

**Methodology note — why the checker is strict:** The spec checkers are calibrated against the frozen `case-spec.md`. Superpowers achieved a perfect 19/19 score, confirming that full spec compliance is attainable. The platform treats Superpowers' implementation as the reference standard — any deviation, whether a missing feature (e.g., no fallback chat), a structural difference (e.g., server file layout), or a visual inconsistency (e.g., non-circular photo), is flagged as a spec violation. This strictness is intentional: the goal is not to rank workflows but to measure their fidelity to a shared specification. Lower scores on Matt and Agent Skills reflect genuine implementation differences from the spec, not checker errors.

| Workflow | F1 | F2 | F3 | Token | Readability (AI) |
|----------|----|----|----|-------|-----------------|
| Superpowers | 7/7 | 4/4 | 8/8 | 702K | 4/5 |
| Matt Skills | 5/7 | 4/4 | 5/8 | 1,549K | 4/5 |
| Agent Skills | 5/7 | 1/4 | 7/8 | 491K* | 4/5 |

> \*Agent Skills: F3 session log unavailable in JSONL format; 491K covers F1+F2 only.

**Platform architecture:** Three independent layers — spec checkers (19 criteria, static analysis + Puppeteer browser tests), data parsers (token, git diff, session metrics), and an AI judge (independent LLM with 5-axis rubric). The judge uses a different model from the coding agent to ensure impartiality. See [`feature/auto-eval`](https://github.com/anzhizhao6-design/MIT-weblab-reflection/tree/feature/auto-eval) for full details and usage instructions.

---

## Directory Structure

```
benchmark/
├── README.md               ← You are here
├── README-zh.md             ← Chinese version
├── plan.md                  ← Experiment design
├── case-spec.md             ← Frozen feature specification
├── metrics.md               ← Evaluation metrics
├── experiment-protocol.md   ← Frozen experiment protocol
├── skill-analysis-EN.md     ← Skill design & architecture analysis (EN)
├── skill-analysis.md        ← Chinese version
├── results.csv              ← 9 rows of experiment data
├── baseline-log/            ← Original project dev log
├── workflow-notes/          ← Per-workflow observation notes
├── runs/                    ← Full session logs (JSONL)
└── screenshots/             ← UI screenshots per workflow
```
