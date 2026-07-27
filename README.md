# Hamster Daily — AI Workflow Benchmark

> 用同一个全栈项目测试三种 AI 辅助开发工作流：哪个更快？哪个更省 token？哪个代码更好？
>
> 🌐 **Live Demo**: [hamster-daily.onrender.com](https://hamster-daily.onrender.com)

## 项目

**Hamster Daily** — 一个 React + Vite + Express + MongoDB 的仓鼠互动网站。每天随机展示一只仓鼠，可以喂食、看日记、和它聊天，仓鼠会记住你的访问。

项目灵感来自 **MIT Web.Lab** 课程的全栈开发教学（[课程视频](https://www.youtube.com/playlist?list=PLVAxjdyIU8_z6iFliCz-n9zqf_ZRsbyPA) · [官方课件](https://site.weblab.is/schedule)），从 HTML/CSS 原型一步步演进为完整的前后端应用。开发全过程记录在 [`development-log.md`](development-log.md)。

- 12 只仓鼠，各有性格（Gluttonous 🍽️ / Shy 😳 / Chaotic 💫 ...）
- LLM 驱动的智能聊天，API 不可用时退回关键词匹配
- MongoDB 持久化记忆（访问次数、喂食次数、对话历史）
- 详见：[`benchmark/case-spec.md`](benchmark/case-spec.md)

## 实验：三种 Workflow，同一个 Spec

三个 AI 工作流从**完全相同的起点**（`benchmark-baseline`，只有 HTML 原型 + 13 张图片）出发，实现完全相同的 3 个 Feature：

| | Superpowers | Matt Pocock Skills | Agent Skills |
|---|---|---|---|
| **方法** | 前期 plan → 自主执行 | 连环追问 → TDD | 完整 SDLC：spec→plan→code→test→review |
| **分支** | `workflow/superpowers` | `workflow/matt-skills` | `workflow/agent-skills` |

## 结果一览

| Workflow | 总时间 | 总 Token | 总 Bug | 人工介入 | 综合可读性 | 关键特点 |
|---|---|---|---|---|---|---|
| **Superpowers** | 194min | 702K | 4 | Level 2 | 4/5 | 最低 token、18 次 commit |
| **Matt Skills** | 51min | 1,549K | 3 | Level 2 | 3.7/5 | 最快 F1/F2、grilling 高效 |
| **Agent Skills** | 41min | 735K | 7* | Level 2 | 5/5 | 最快、最优 UI、self-audit 4 bugs |

> \*Agent Skills: 3 bugs 由用户发现，4 bugs 由 Agent 在 post-implementation audit 中自发现。

### 三个 Feature 逐项对比

| Workflow | F1 时间 | F1 Token | F2 时间 | F2 Token | F3 时间 | F3 Token | F3 Bug |
|---|---|---|---|---|---|---|---|
| **Superpowers** | 38min | 269K | 38min | 187K | 118min | 246K | 4 |
| **Matt Skills** | 7min | 661K | 10min | 121K | 34min | 767K | 3 |
| **Agent Skills** | 6min | 332K | 12min | 159K | 23min | 244K | 7\* |

### 核心发现

1. **所有 workflow 都完成了全部 19 条验收标准** — 最终功能完全一致。
2. **复杂度放大差异** — F1/F2 差距很小；F3（数据库 + API + 记忆系统）拉开了显著差距：23min vs 118min。
3. **Token ≠ 速度** — Matt 用了 2.2× 的 token 但快了 3.8×。Agent Skills 用中等 token 达到了最快速度。
4. **没有 workflow 能主动发现 bug** — 三个 workflow 初始自评都声称 0 bugs。所有 bug 均由用户验收测试发现。
5. **Commit 风格反映 workflow 哲学** — Superpowers 提交了 18 次（增量式）；Matt 和 Agent Skills 各提交 3 次（一 feature 一次）。

## 仓库结构

```
MIT-weblab-reflection/
├── README.md                  ← 你在这里（总报告）
├── workshop/                  ← Hamster Daily 完整代码（main 分支）
├── notes/                     ← 开发学习笔记（HTML/CSS → React → Node → DB）
├── benchmark/
│   ├── README.md              ← Benchmark 详细介绍
│   ├── plan.md                ← 实验设计
│   ├── case-spec.md           ← Feature 精确定义（冻结版）
│   ├── metrics.md             ← 评价指标（7 维度）
│   ├── experiment-protocol.md ← 实验执行规则（冻结版）
│   ├── results.csv            ← 9 行实验数据
│   ├── workflow-notes/        ← 三个 workflow 的观察笔记
│   ├── screenshots/           ← 各 workflow 的 UI 截图
│   ├── runs/                  ← 完整 session log（JSONL）
│   └── baseline-log/          ← 原始项目的开发日志
└── development-log.md          ← 项目开发全过程记录
```

## 快速开始

```bash
cd workshop
npm install
npm run dev        # http://localhost:3000
npm run db:seed    # 导入数据库（需要 .env 配置 MongoDB）
```

## 相关文档

- [完整实验报告](benchmark/README.md)
- [Superpowers 观察笔记](benchmark/workflow-notes/superpowers.md)
- [Matt Skills 观察笔记](benchmark/workflow-notes/matt-pocock.md)
- [Agent Skills 观察笔记](benchmark/workflow-notes/agent-skills.md)
- [项目开发全过程](development-log.md)
