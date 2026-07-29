# Eval Platform

> Project-agnostic automated evaluation for AI-assisted development workflows. Swap `spec-checkers/<project>/` to evaluate a different project.

> ⚠️ This document is `eval/README.md`, placed at the branch root for GitHub visibility. The platform entry point is `eval/evaluate.js`.

## Quick Start

```bash
# 1. Start the project under test
cd workshop && npm run dev

# 2. Run evaluation (auto-detect port, read config, execute checkers)
node eval/evaluate.js --workflow=superpowers --no-judge

# 3. With AI Judge scoring
node eval/evaluate.js --workflow=superpowers
```

## Three-Layer Architecture

### 1. Spec Checkers (Objective)

Each acceptance criterion → one executable checker, returning `{ pass: boolean, detail: string }`.

| Type | Method | Example |
|------|--------|---------|
| `static` | File scanning, regex matching | Check `package.json` for React dependency |
| `browser` | Puppeteer opens page, inspects DOM | `page.goto('/hamster')` → verify hamster name displayed |

Current `hamster/` project: 19 checkers (F1: 7, F2: 4, F3: 8). Browser checkers use system Edge via `puppeteer-core` — no Chromium download needed.

### 2. Data Parsers (Automated)

Fully automated extraction from source files. No manual recording.

| Parser | Input | Output | Project-agnostic |
|--------|-------|--------|------------------|
| `token-parser.js` | Session JSONL | `{ input_tokens, output_tokens, total_tokens }` | Yes |
| `git-parser.js` | `git diff` | `{ lines_added, lines_deleted, files_added, files_modified, commits }` | Yes |
| `session-parser.js` | Session JSONL | `{ user_messages, agent_responses, clarification_questions }` | Yes |

### 3. AI Judge (Subjective)

Independent LLM (not the coding agent) scores using rubrics. Each score is accompanied by 2–3 pieces of specific evidence.

| Judge | Dimensions | Scale |
|-------|-----------|-------|
| `readability.md` | 5-axis: Naming (25%), Structure (25%), Formatting (15%), Comments (15%), DRY (20%) | 1–5 |
| `ui-quality.md` | 5-axis: Layout, Spacing, Hierarchy, Color, Mobile | 1–5 |
| `code-reuse.md` | Compare diffs across features | Yes / No / N/A + evidence |

Supports DeepSeek, OpenAI, or any OpenAI-compatible API. Enter credentials interactively on first run (or set `LLM_API_KEY` env var to skip).

## Directory Structure

```
eval/
├── evaluate.js            ← Main entry: checkers → parsers → judge → CSV
├── eval-config.json       ← Register workflows (session path, baseline commit). Run with --workflow=
├── spec-checkers/
│   └── hamster/           ← 19 acceptance criteria (F1: 7, F2: 4, F3: 8)
├── parsers/
│   ├── token-parser.js
│   ├── git-parser.js
│   └── session-parser.js
├── judges/
│   ├── readability.md     ← Rubric: naming/structure/formatting/comments/DRY
│   ├── ui-quality.md      ← Rubric: layout/spacing/hierarchy/color/mobile
│   ├── code-reuse.md      ← Rubric: Yes/No/N/A + evidence
│   └── call.js            ← Calls external LLM API
└── output/
    └── results.csv        ← Auto-generated evaluation rows
```

## Verified Results

The platform independently re-evaluated all three workflow branches, producing scores highly consistent with manual recording:

| Workflow | F1 | F2 | F3 | Token | Readability (AI) |
|----------|----|----|----|-------|-----------------|
| Superpowers | 7/7 | 4/4 | 8/8 | 702K | 4/5 |
| Matt Skills | 5/7 | 4/4 | 5/8 | 1,549K | 4/5 |
| Agent Skills | 5/7 | 1/4 | 7/8 | 491K* | 4/5 |

> \*Agent Skills: F3 session log in `.md` format; JSONL covers F1+F2 only.

### Cross-Validation with Manual Records

| Metric | Manual | Platform | Agreement |
|--------|--------|----------|-----------|
| Token count | Manual JSONL extraction | Automated parsing | ✅ Exact match (702K / 1,549K) |
| Spec compliance | Manual per-criterion verification | Automated checkers | ✅ Consistent direction |
| Readability | Subjective scoring | AI Judge + rubric | ≈ Platform slightly more conservative (all 4/5) |
| Time per workflow | ~10min | ~30s | ⚡ 20× speedup |

## Methodology Note

The spec checkers are calibrated against the frozen `case-spec.md`. Superpowers achieved a perfect 19/19 score, confirming full spec compliance is attainable. The platform treats Superpowers' implementation as the reference standard — deviations in Matt and Agent Skills reflect genuine implementation differences (e.g., no fallback chat, different server file layout, non-circular photo), not checker errors. This strictness is intentional: the goal is to measure specification fidelity, not to rank workflows.

## Porting to Another Project

1. Place the project under test in `workshop/` (or specify a custom path)
2. Create a new folder under `spec-checkers/` (e.g., `spec-checkers/todo-app/`)
3. Write checkers for each feature
4. Register workflows in `eval-config.json` (session path, baseline commit)
5. No other changes needed — parsers, judges, and `evaluate.js` are project-agnostic

## Known Limitations

- **Browser checkers require a running dev server** (`npm run dev`)
- **MongoDB checkers require database connectivity** (seed data must be pre-loaded)
- **AI Judge requires a separate API key** (use a different model than the coding agent for fairness)
- **Puppeteer may not install in restricted environments** — static checkers remain functional
