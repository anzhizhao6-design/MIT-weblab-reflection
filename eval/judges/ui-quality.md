# UI Quality Judge

> AI judge rubric for visual/UX quality. Provide screenshots + scoring criteria to an independent model (multimodal).

## Scoring Criteria (1–5)

| Score | Definition |
|-------|-----------|
| 1 | Broken layout — elements overlap, invisible content, horizontal scroll on mobile |
| 2 | Functional but unpolished — mismatched alignment, poor spacing, inconsistent fonts |
| 3 | Acceptable — works but has visible layout issues (e.g., sections misaligned, uneven gaps) |
| 4 | Good — clean layout, consistent spacing, minor visual quirks only |
| 5 | Excellent — polished, intuitive layout, attention to detail (dates, tooltips, transitions) |

## Sub-Dimensions (weighted average)

| Dimension | Weight | What to Check |
|-----------|--------|---------------|
| Layout | 30% | Elements are aligned. No broken grids. Consistent spacing between sections. |
| Spacing & Padding | 20% | Even padding within cards. No text touching edges. Adequate white space. |
| Visual Hierarchy | 20% | Important elements (hamster photo, name, mood) are visually prominent. Less important info is secondary. |
| Color Consistency | 15% | Color palette is consistent. No random accent colors. Mood bar colors match emotion. |
| Mobile Adaptation | 15% | At 375px viewport: content stacks vertically, no horizontal scroll, readable font sizes. |

## Instructions to AI Judge

You are an independent UI reviewer. Assess the provided screenshots on the 5 sub-dimensions above.

For each sub-dimension:
- Give a score (1–5)
- Provide **2–3 specific visual observations** as evidence
- Reference the screenshot filename

Output format:
```
Layout: 4/5
- Good: food tray and chat box are clearly separated
- Issue: diary section width doesn't match the hamster card above it (screenshot-1.png)

...
Final Score: X/5
```
