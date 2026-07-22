# Benchmark Plan

---

## 1. 实验目标

用同一个 Hamster Daily 项目，测试三种 AI 辅助开发工作流的效率、成本和质量差异。

**核心问题：** 同样的需求、同样的初始代码，哪个 workflow 用更少的 token/时间/人工介入完成？

---

## 2. 实验设计

### 2.1 控制变量

| 变量     | 固定值                                                     |
| -------- | ---------------------------------------------------------- |
| 模型     | 同一个（Claude Code）                                      |
| 初始代码 | `benchmark-baseline` 分支（只有 HTML/CSS 原型 + 项目结构） |
| 需求     | 同一份 `case-spec.md`                                      |
| 开发环境 | 同一台机器                                                 |

**唯一变量：** 使用的 AI 辅助开发工作流（Superpowers / Matt Pocock / Agent Skills）。

### 2.2 Feature 顺序

每个 workflow 按顺序实现 3 个 Feature，不可跳跃：

```
F1 (Home + Random Hamster)
→ F2 (Feed + Food + LLM Chat)
→ F3 (Database + Memory)
```

```

Feature 之间有依赖——F2 依赖 F1（需要仓鼠数据和页面结构），F3 依赖 F2（需要聊天和喂食的 API + 前端组件）。
```

### 2.3 实验流程

```
1. git checkout benchmark-baseline
2. git checkout -b workflow/superpowers(或 matt-skills / agent-skills)
3. 按 case-spec.md 实现 F1
4. 记录 metrics
5. 重复 Step 3-4，完成 F2→F3
6. 对所有三个 workflow 重复
```

---

## 3. Git 分支策略

```
baseline-v1 (tag)
    │
    ├── workflow/superpowers
    ├── workflow/matt-skills
    └── workflow/agent-skills
```

每个分支从同一个 baseline tag 分出。实验结束后用 `git diff` 精确统计代码改动。

---

## 4. 数据记录

每次完成一个 Feature，在 `results.csv` 里填一行。最终形成 3 workflows × 3 features = 9 行数据。

详见 [metrics.md](metrics.md)。
