# Skill Design Analysis

> Comparing the source code and experimental results of Superpowers, Matt Pocock Skills, and Agent Skills to understand what makes a skill effective, how skill architectures differ, and which patterns produce the best outcomes.

---

## 1. Skill vs Agent: Core Concepts

After running all three workflows, this distinction needs to be clear:

| Concept | Definition | Analogy | In Our Experiment |
|---------|-----------|---------|-------------------|
| **Skill** | A standalone instruction document that tells the AI "when to use me, what to do, and to what standard" | A script | One `SKILL.md` file |
| **Agent** | The running Claude Code session — reads skills, understands context, executes instructions | An actor | The Claude session in each F1/F2/F3 window |
| **Workflow** | How a set of skills is organized and invoked — "what comes first, what comes next, how they connect" | A director | Superpowers / Matt / Agent Skills |

**Core insight: The three workflows differ in "directorial style."** Same actor, same script, same role — completely different staging and performance. Yet the final product (Hamster Daily) is functionally identical (19/19 acceptance criteria).

---

## 2. Three Skill Architectures

### 2.1 Superpowers: Process-Oriented

**Design features:**

| Feature | How It Works | Evidence |
|---------|-------------|----------|
| **Hard Gates** | `<HARD-GATE>` tags prevent the Agent from skipping phases. Example: "Do NOT invoke any implementation skill until you have presented a design and the user has approved it." | Agent forced to produce design specs before coding. All three features have archived `.superpowers/sdd/` docs |
| **Anti-Rationalization Table** | 7×2 table predicting Agent excuses: "This is just a simple question" → "Questions are tasks. Check for skills." | Agent cannot bypass skill invocation even for "simple" tasks |
| **Checklist-Driven** | 9-step checklist per phase: Explore → Visual companion → Clarify → Propose → Design → Write doc → Self-review → User review → Transition | Structured, visible progress. Artifacts preserved |
| **Design Artifacts** | `writing-plans` requires plans "a junior engineer could understand" | Only workflow with persistent design documents |

**Strengths:** Complete process, anti-skipping mechanisms, traceable artifacts.
**Weaknesses:** Inflexible — forced full process even on simple tasks. F1 planning produced ~40% overhead (956 lines of plans for 625 lines of code).

### 2.2 Matt Pocock Skills: Primitive-Oriented

**Design features:**

| Feature | How It Works | Evidence |
|---------|-------------|----------|
| **Router Pattern** | `ask-matt` is "a router over the skills in this repo." Defines a main flow with two on-ramps | 41 skills, zero choice confusion |
| **Atomic Primitives** | `implement` is 7 lines. `grilling` core is 3 paragraphs. Each skill does one thing | Short instructions are strictly followed |
| **One-Question-at-a-Time** | "Ask questions one at a time... Asking multiple questions at once is bewildering." | Every grilling question was answered by the user |
| **Fact vs Decision Separation** | "If a fact can be found by exploring the environment, look it up. The decisions, though, are mine." | Agent read case-spec.md proactively, only asked about architecture choices |
| **Parallel Review** | `code-review` spawns two parallel sub-agents for Standards and Spec | Theoretical advantage; not triggered in experiment |
| **Context Hygiene** | Distinguishes "long context" phases from "clean context" phases | Agent didn't follow the clean-context rule — all in one window |

**Strengths:** Highly flexible, fast on simple tasks (F1: 7min), short instructions strictly followed.
**Weaknesses:** No hard gates, routing depends on Agent judgment, grilling wastes tokens when spec is already precise (F1: 661K vs 269K).

### 2.3 Agent Skills: Gate-Oriented SDLC

**Design features:**

| Feature | How It Works | Evidence |
|---------|-------------|----------|
| **Explicit Gates** | "Do not advance to the next phase until the current one is validated." With ASCII flow diagram showing Human approval points | Agent waited for confirmation at each phase |
| **Five-Axis Review** | Code review covers Correctness, Readability, Architecture, Security, Performance | Most comprehensive review framework; not triggered in initial self-review |
| **"When NOT to Use" Sections** | Every skill defines negative space. Example: "Single-line fixes, typo corrections..." | Only workflow that skipped unnecessary steps when spec was clear |
| **Incremental Discipline** | "Implement the smallest complete piece... each increment leaves the system working." With ASCII cycle diagram | In theory enforces small commits; in practice, one commit per feature |
| **UI Engineering Standards** | `frontend-ui-engineering` is the only skill with explicit UI quality criteria | 5/5 readability — highest. Only workflow with reaction text, diary dates |

**Strengths:** Most complete quality system. "When NOT to use" prevents over-engineering. Best UI quality.
**Weaknesses:** Gate enforcement depends on Agent discipline. Long skills selectively ignored. Audit prompt needed to trigger self-review.

---

## 3. Seven Effective Skill Writing Patterns

### 3.1 YAML Frontmatter — The Agent's Routing Table

```yaml
---
name: spec-driven-development
description: Creates specs before coding. Use when starting a new project or 
  feature and no specification exists yet.
disable-model-invocation: true
---
```

**Why effective:** `description` is the **only** basis for the Agent's "should I use this?" decision. `disable-model-invocation: true` (Matt-only) prevents automatic invocation.

### 3.2 Hard Gates — Barriers the Agent Cannot Bypass

```markdown
<HARD-GATE>
Do NOT invoke any implementation skill, write any code, or take any 
implementation action until you have presented a design and the user has approved it.
</HARD-GATE>
```

**Why effective:** Superpowers' most powerful anti-skipping mechanism. Not a suggestion — a rule.

### 3.3 Anti-Rationalization Tables — Predicting Agent Excuses

```markdown
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "Let me explore the codebase first" | Skills tell you HOW to explore. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |
| "The skill is overkill" | Simple things become complex. Use it. |
```

**Why effective:** Pre-empts the 8 most common Agent excuses. Any Agent trying to skip after reading this table "feels" its excuse has already been predicted.

### 3.4 Router Pattern — Solving Skill Selection

```markdown
# Ask Matt
A **flow** is a path through the skills.
1. `/grill-with-docs` — sharpen the idea
2. Branch — can you settle every question? → `/prototype`
3. Branch — multi-session? → `/to-spec` → `/to-tickets` → `/implement`
```

**Why effective:** When skills exceed ~10, the Agent needs help choosing. A router provides a decision tree.

### 3.5 Anti-Pattern Tables — Defining What NOT to Do

Matt's `tdd` skill includes explicit anti-patterns with diagnostic "tells":

```markdown
- **Implementation-coupled** — mocks internal collaborators. 
  The tell: the test breaks when you refactor but behavior hasn't changed.
- **Tautological** — the assertion recomputes the expected value the way the code does.
  Expected values must come from an independent source of truth.
```

**Why effective:** Defines correct behavior from both sides. Each anti-pattern has a **tell** — the Agent can self-diagnose its own mistakes.

### 3.6 "When NOT to Use" — Preventing Over-Application

Agent Skills' unique pattern:

```markdown
**When NOT to use:** Single-line fixes, typo corrections, or changes 
where requirements are unambiguous and self-contained.
```

**Why effective:** Defines the skill's negative space. The Agent checks "use" conditions, then filters through "don't use" conditions. This saved ~400K tokens by preventing unnecessary F1 grilling.

### 3.7 One-Question-at-a-Time — Preventing Information Overload

```markdown
Ask the questions **one at a time**, waiting for feedback on each question 
before continuing. Asking multiple questions at once is bewildering.
```

**Why effective:** Agents tend to fire 3-5 questions at once. Users answer the easiest and skip the rest. One-at-a-time forces engagement with every decision.

---

## 4. Experimental Validation

| Pattern | Used By | Measurable Effect | Data |
|---------|---------|-------------------|------|
| Hard Gates | Superpowers | Design docs exist | 18 commits, archived plans |
| Router | Matt | 41 skills, zero confusion | Auto-routed to grilling→implement |
| Anti-Patterns | Matt (TDD) | TDD still not followed | 0 tests written |
| "When NOT to Use" | Agent Skills | F1 no redundant steps | 6min, 332K (most efficient F1) |
| One-Question-at-a-Time | Matt | All grilling answered | 7/7/5 F1/F2/F3 questions answered |
| Short vs Long | Matt vs Agent Skills | Short has higher compliance | `implement`(7 lines) > `code-review-and-quality`(100+ lines) |
| Five-Axis Review | Agent Skills | Initial self-review still 0 bugs | Review only effective after audit prompt |

---

## 5. Scene Recommendations: When to Use Which

| Scenario | Recommended | Why | Data |
|----------|------------|-----|------|
| **Ambiguous requirements** | Matt | Grilling is best at clarifying | 7+ questions answered per feature |
| **Precise spec exists** | Agent Skills | "When NOT to use" prevents waste | 0 clarification questions, 6min F1 |
| **Quick solo prototype (< 2h)** | Matt or Agent Skills | Superpowers planning overhead too high | 194min vs 51min vs 41min |
| **Team project needing design docs** | Superpowers | Hard gates enforce documentation | Only workflow with archived design specs |
| **Multi-system integration** | Agent Skills | Gate flow + 5-axis review | F3: 23min, 244K tokens |
| **UI quality priority** | Agent Skills | `frontend-ui-engineering` standards | 5/5 readability |
| **Token budget sensitive** | Superpowers | Lowest token usage | 702K total |
| **Incremental commit history needed** | Superpowers | Only workflow with >1 commit per feature | 18 vs 3 vs 3 |

### Suggested Hybrid

```
Requirements:  Matt's grilling (one question at a time)
Design:       Superpowers' brainstorming + writing-plans (leave a paper trail)
Implementation: Agent Skills' incremental-implementation (small commits)
Quality:      Agent Skills' code-review-and-quality (5-axis)
             + Superpowers' verification-before-completion (hard gate)
Delivery:     Agent Skills' shipping-and-launch
```

**Caution:** Hybrid approaches increase token consumption. Pure workflows: 702K–1,549K. Hybrid may reach 1M+. Only for high-complexity, high-quality projects.

---

## 6. How to Write a Good Skill

1. **Write "When NOT to use" first, then "When to use."** Prevents over-application. Agent Skills saved ~400K tokens with this pattern.

2. **Use hard gates at critical decision points.** Human approval gates are the only way to prevent the Agent from skipping verification. Suggestions are not rules.

3. **Provide a router when you have >10 skills.** `ask-matt`'s "flows" concept defines main flow + on-ramps.

4. **Predict the Agent's excuses.** Write an anti-rationalization table. Don't trust Agent self-discipline.

5. **One question at a time.** The Agent will fire 3-5 questions; users will skip. Force one-at-a-time.

6. **Short skills (<20 lines) have higher compliance rates than long ones.** Put core instructions first, details in appendices.

7. **Define "done" with hard criteria.** Not "confirm everything is fine" — write "run `npm run dev` and check these 7 criteria."

8. **Test your skills on real projects.** This experiment was an integration test of three skill architectures. Hard gates work. Anti-pattern tables work but weren't enforced in TDD. "When NOT to use" is the most underrated pattern.
