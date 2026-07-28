# Code Reuse Judge

> AI judge rubric for assessing whether a workflow reused prior features' code or rewrote from scratch.

## Scoring

| Verdict | Definition |
|---------|-----------|
| Yes | Extended existing components without rewriting. Changes are additive (new props, new sections, new routes). |
| No | Rewrote significant portions of previously working code. Deleted and replaced files instead of modifying. |
| N/A | First feature — no prior code to reuse. |

## What to Check

1. **File modifications vs. replacements:** Did the workflow modify existing files (`M` in git diff) or delete-and-recreate (`D` + `A`)?
2. **Component structure:** If F1 created `HamsterCard.jsx`, did F2 modify it or create a new `HamsterCardV2.jsx`?
3. **Shared utilities:** Did F2/F3 reuse F1's data files (`hamsters.js`, `foods.js`) or recreate them?
4. **CSS changes:** Are CSS changes targeted additions, or complete rewrites?

## Instructions to AI Judge

Review the git diff between the prior feature's final commit and the current feature's final commit.

Output format:
```
Verdict: Yes/No/N/A

Evidence:
- Kept HamsterCard.jsx, added ProfileCard as new component (Yes pattern)
- Modified hamsters.js: added diary field, preserved all existing data (Yes pattern)
- Rewrote HamsterPage.css entirely instead of adding new rules (No pattern)

Confidence: High/Medium/Low
```
