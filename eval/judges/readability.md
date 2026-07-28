# Readability Judge

> AI judge rubric for code readability. Provide the complete diffs + scoring criteria to an independent model. The same rubric produces consistent scores across projects.

## Scoring Criteria (1–5)

| Score | Definition |
|-------|-----------|
| 1 | Unreadable — no consistent naming, no file structure, dense blocks |
| 2 | Poor — some structure but inconsistent, hard to follow |
| 3 | Acceptable — functional but has layout/alignment issues |
| 4 | Good — clean naming, logical structure, minor issues only |
| 5 | Excellent — idiomatic, well-organized, easy to navigate cold |

## Sub-Dimensions (weighted average)

| Dimension | Weight | What to Check |
|-----------|--------|---------------|
| Naming | 25% | Variables, functions, files use descriptive names. No `x`, `data`, `temp`. |
| Structure | 25% | Components are in separate files. No 300+ line single files. Directory mirrors feature boundaries. |
| Formatting | 15% | Consistent indentation. No mixed tabs/spaces. Line length ≤ 120. |
| Comments | 15% | Non-obvious logic has comments. No dead code left commented out. |
| DRY | 20% | No repeated logic blocks. Shared code is extracted. CSS class reuse. |

## Instructions to AI Judge

You are an independent code reviewer. Assess the provided code diff on the 5 sub-dimensions above.

For each sub-dimension:
- Give a score (1–5)
- Provide **2–3 specific examples** from the code as evidence
- Mention the file and line or component name

Output format:
```
Naming: 4/5
- Good: "HamsterCard" component clearly named
- Issue: variable "d" used in map() callback (should be "hamster")

...
Final Score: X/5
```

**Important:** Do NOT evaluate whether the code works. Only evaluate readability. Do NOT compare to other implementations. Score against the rubric, not against each other.
