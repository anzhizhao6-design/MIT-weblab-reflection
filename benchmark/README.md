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

> 实验完成后填写。

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
