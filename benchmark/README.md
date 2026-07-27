# Workflow Benchmark

> 用同一个仓鼠项目（Hamster Daily）测试三种 AI 辅助开发工作流的效率和质量。

---

## 三种 Workflow

| Workflow | 一句话 | 像什么 |
|------|------|------|
| **A: Superpowers** | 前期指定详细 plan，之后 Agent 自主执行、自查、修 bug、交差 | 一个只管验收的 contractor |
| **B: Matt Pocock Skills** | 写任何代码之前连环追问直到需求完全清晰，然后 TDD 开发 | 一个爱追问的 senior dev |
| **C: Agent Skills** | 完整 SDLC 流程：需求→方案→开发→测试→review→上线，每步有防偷懒检查 | 一个 PM + Tech Lead + QA 团队 |

---

## 核心区别

> ⚠️ **Pre-experiment Hypotheses** — 以下内容基于各 workflow 文档的初步分析，不是实验结论。正式结果见实验后的 Observed Results。

| | Superpowers | Matt Pocock | Agent Skills |
|------|------|------|------|
| **前期负担** | 重——brainstorm 阶段要和你来回讨论 | 重——grilling 连环追问 | 中——spec 阶段定义需求 |
| **中间烦你吗** | 几乎不（spec 定好就自己跑） | 可能（追问贯穿全程） | 每阶段结束让你确认 |
| **防偷懒机制** | plan 强制写成"初级工程师都能看懂" | grilling 不确认不写代码 | 每 skill 有 Rationalizations 表 + Red Flags |
| **适合什么** | 需求明确后放手不管 | 需求模糊需要先理清 | 要质量保证 + 团队标准化 |

---

## 实验设计

所有三个 workflow 从同一个 `benchmark-baseline` 分支出发，实现完全相同的 Feature。每个 Feature 单独记录数据。

详见：[plan.md](plan.md) · [case-spec.md](case-spec.md) · [metrics.md](metrics.md)

---

## Observed Results

> Experiment completed 2026-07-24. Full data in `results.csv`. Session logs in `runs/`. Screenshots in `screenshots/`.

### Summary

| Workflow | Time | Tokens | Bugs | Human Int. | Build | Key Strength |
|---|---|---|---|---|---|---|
| **Superpowers** | 194min | 702K | 4 | Level 2 (F3) | ✅ | Lowest tokens, cleanest commits |
| **Matt Skills** | 51min | 1,549K | 3 | Level 2 (F3) | ✅ | Fastest F1/F2, effective grilling |
| **Agent Skills** | 41min | 735K | 7* | Level 0 | ✅ | Fastest overall, self-healing |

> \*Agent Skills: 7 bugs total — 3 found by user during manual testing, 4 found by Agent during post-implementation audit. Superpowers and Matt were not given the same audit prompt.

### Per-Feature Comparison

| Workflow | F1 Time | F1 Tokens | F1 Bugs | F1 Int. | F2 Time | F2 Tokens | F2 Bugs | F2 Int. | F3 Time | F3 Tokens | F3 Bugs | F3 Int. |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **Superpowers** | 38min | 269K | 0 | 0 | 38min | 187K | 0 | 0 | 118min | 246K | 4 | 2 |
| **Matt Skills** | 7min | 661K | 0 | 0 | 10min | 121K | 0 | 0 | 34min | 767K | 3 | 2 |
| **Agent Skills** | 6min | 332K | 0 | 0 | 12min | 159K | 0 | 0 | 23min | 244K | 7\* | 0 |

### Key Findings

1. **All workflows passed 19/19 acceptance criteria** — zero functional difference in final output.
2. **Complexity amplifies differences**: F1/F2 were close; F3 separated the workflows dramatically (23min vs 118min).
3. **No workflow self-detected bugs during initial implementation**: All three claimed zero bugs in self-reviews. User found bugs in all three workflows during acceptance testing (Superpowers: 4, Matt: 3, Agent Skills: 3). Agent Skills later found 4 additional bugs when prompted to self-audit.
4. **Token efficiency ≠ speed**: Matt used 2.2× more tokens than Superpowers but finished 3.8× faster. Token count measures conversation verbosity, not wall-clock time.
5. **Commits as a workflow signature**: Superpowers committed 18 times (incremental); Matt and Agent Skills committed 3 times (one per feature). Both approaches produced correct code.

---

## 目录结构

```
benchmark/
├── README.md               ← 你在这里
├── plan.md                 ← 实验设计
├── case-spec.md            ← Feature 精确定义
├── metrics.md              ← 评价指标
├── baseline-log/           ← 原始项目的开发日志
├── workflow-notes/         ← 三个 workflow 的深入分析
├── results.csv             ← 实验数据
└── runs/                   ← 每次实验的 session log
```
