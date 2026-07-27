# Skill Design Analysis

> 通过对比 Superpowers、Matt Pocock Skills、Agent Skills 三个 workflow 的源码和实验表现，分析 skill 是什么、怎么写、三种架构的优劣。

---

## 1. Skill vs Agent：基础概念

三个 workflow 跑完后，这个概念必须厘清：

| 概念 | 定义 | 类比 | 实验中的对应 |
|------|------|------|------------|
| **Skill** | 一段独立的指令文本，告诉 AI "什么时候用、做什么、做到什么标准" | 剧本 | 一个 `SKILL.md` 文件 |
| **Agent** | 运行中的 Claude Code session——读取 skill、理解上下文、执行指令 | 演员 | F1/F2/F3 对话窗口中的 Claude |
| **Workflow** | 一组 skill 的组织方式和调用逻辑——"先做什么、后做什么、怎么衔接" | 导演 | Superpowers / Matt / Agent Skills |

**核心洞察：三个 workflow 的差异本质是"导演风格"的差异。** 同一个演员拿到同一个剧本同一个角色，走位和表演方式完全不同——而你得到的最终产品（Hamster Daily）在功能上却完全一致（19/19）。

---

## 2. 三种 Skill 架构深度对比

### 2.1 Superpowers：流程驱动（Process-Oriented）

**Skill 目录：**
```
using-superpowers (入口)
    ↓
brainstorming → writing-plans → executing-plans → verification-before-completion
    (subagent-driven-development, test-driven-development, finishing-a-development-branch, ...)
```

**设计特征：**

| 特征 | Skill 源码表现 | 效果 |
|------|---------------|------|
| **硬性关卡 (Hard Gates)** | `<HARD-GATE>` 标签包裹的指令阻止 Agent 跳过阶段。例：brainstorming 中 "Do NOT invoke any implementation skill until you have presented a design and the user has approved it." | Agent 被迫在写代码前产出完整设计文档。F1 F2 F3 各有 `.superpowers/sdd/` 下的 design spec + implementation plan |
| **防偷懒反驳表** | `using-superpowers` 几乎由此驱动。7×2 表格："This is just a simple question" → "Questions are tasks. Check for skills." / "The skill is overkill" → "Simple things become complex. Use it." / "I'll just do this one thing first" → "Check BEFORE doing anything." | Agent 无法绕过 skill 调用。即使在简单的 F1 也走了完整 brainstorm → plan → execute 流程 |
| **Checklist 驱动** | `brainstorming` 含 9 步 checklist：Explore → Visual companion → Clarify → Propose → Design → Write doc → Self-review → User review → Transition。每步有明确的 DONE 标准 | 执行过程结构化，进度可见。产物留存（`.superpowers/sdd/` 下的所有 brief/report） |
| **设计文档产出** | `writing-plans` 要求 plan "写成初级工程师都能看懂"。产出在 `docs/superpowers/specs/` 和 `plans/` | 实验后仍可回溯每个决策。这是其他两个 workflow 没有的 |
| **子代理工单** | `subagent-driven-development` 支持将独立任务分派给并行 sub-agent | 实验中未显著使用（5-7 个任务大多是顺序依赖的） |
| **验证前不结束** | `verification-before-completion` 要求 "run verification commands and confirm output before making any success claims; evidence before assertions always" | 但实验中只跑了 `npx vite build`——构建验证不等于功能验证 |

**架构优势：**
- 流程完整，每个环节有防偷懒机制。产物可追溯。
- 适合复杂多步骤任务（项目搭建、重构、迁移）。

**架构劣势：**
- 灵活性低。F1（一个简单的 React scaffold + 两个页面）被迫走完整流程。planning 产出占 F1 代码量的 ~40%（956 行 plan + 141 行 design vs 625 行 Matt 代码）。
- 验证机制浅——`verification-before-completion` 写了正确的原则但 Agent 仅用 build 替代了 runtime test。

### 2.2 Matt Pocock Skills：原语驱动（Primitive-Oriented）

**Skill 目录（41 个 skill）：**
```
ask-matt (路由器 / 导航)
    ↓
[需求阶段] grill-me / grilling / grill-with-docs → to-spec → to-tickets
[执行阶段] implement → tdd → code-review
[辅助原语] diagnosing-bugs, research, wayfinder, prototype, domain-modeling, ...
[质量原语] code-review, batch-grill-me, qa
```

**设计特征：**

| 特征 | Skill 源码表现 | 效果 |
|------|---------------|------|
| **路由器模式** | `ask-matt` 是 "a router over the skills in this repo"。定义了 main flow：grill → spec → tickets → implement，以及两个 on-ramps。 "You don't remember every skill, so ask." | 解决 41 个 skill 的选择困难。Agent 会自动找正确的 skill |
| **原子原语** | `implement` 只有 7 行指令。`grilling` 核心指令仅 3 段。每个 skill 做一件事且只做一件事 | Agent 严格遵守短指令。`implement` 的 "Use /tdd... Run typechecking... Use /code-review... Commit your work" 全部被执行 |
| **一问一答面试** | `grilling`: "Ask the questions one at a time, waiting for feedback on each question before continuing. Asking multiple questions at once is bewildering." | 实验中 Agent 每次只问一个问题。避免了 Superpowers 那样一次抛出一堆选项 |
| **事实 vs 决策分离** | `grilling`: "If a fact can be found by exploring the environment, look it up rather than asking me. The decisions, though, are mine." | Agent 主动读取 `case-spec.md` 和项目文件，只问架构选择 |
| **并行审查** | `code-review` 用两个并行 sub-agent 分别审查 Standards 和 Spec。"Both axes run as parallel sub-agents so they don't pollute each other's context, then this skill aggregates their findings." | 理论优势——两个独立视角。实验中未触发 |
| **上下文卫生** | 区分 "长上下文" 阶段和 "洁净上下文" 阶段。grill→spec→tickets 在同一窗口；每个 `/implement` 开新窗口 | 避免了上下文污染。但 Matt F1/F2/F3 都在同一窗口——没有遵守这个规则 |
| **TDD 内建** | `tdd`: 定义 "什么是好测试"、"seam（测试边界）在哪"、反模式表、"Red before green" 规则 | 但实验中 Agent 没有写任何测试。TDD skill 被调用了但测试被跳过了 |
| **诊断循环** | `diagnosing-bugs` 包含 10 种反馈循环构建方法（failing test → curl → CLI → headless browser → replay trace → ...），按优先级排序。核心信条："Build a tight feedback loop. Be aggressive. Be creative. Refuse to give up." | 实验中没有 hard bug 需要这个 skill——F3 的 bug 都是用户观察到的行为问题 |

**架构优势：**
- 高度灵活，按需组合。F1/F2 极快（7min/10min）。
- grilling 在需求模糊时极有价值——一次一个问题，质量高。
- 短指令被严格遵守。长指令（如 code-review 的两轴审查）被部分忽略。

**架构劣势：**
- 路由依赖 Agent 判断。"什么时候用什么 skill" 是隐式的。
- 没有硬性关卡。Agent 可以在不跑测试的情况下声称 "完成"。
- 有精确 spec 时 grilling 浪费 token（Matt F1: 661K vs Superpowers 269K）。

### 2.3 Agent Skills：门控 SDLC（Gate-Oriented）

**Skill 目录（24 个 skill）：**
```
[需求] interview-me → spec-driven-development
[计划] planning-and-task-breakdown → api-and-interface-design
[执行] incremental-implementation → test-driven-development → frontend-ui-engineering
[质量] code-review-and-quality (5 轴) → debugging-and-error-recovery → code-simplification
[交付] shipping-and-launch → git-workflow-and-versioning
```

**设计特征：**

| 特征 | Skill 源码表现 | 效果 |
|------|---------------|------|
| **显式门控** | `spec-driven-development`: "Do not advance to the next phase until the current one is validated." 附带 ASCII 流程图 `SPECIFY ──→ PLAN ──→ TASKS ──→ IMPLEMENT`，每个阶段标注 `Human` 审批点 | Agent 在每个阶段等待确认。F1/F2/F3 都在开始编码前做了 plan 展示 |
| **五轴审查** | `code-review-and-quality`: 审查覆盖 Correctness、Readability、Architecture、Security、Performance。审批标准："Approve when it improves overall code health, even if it isn't perfect." | 理论最完整。但实验中初始自评声称 0 bugs——5 轴审查未被有效触发 |
| **"何时不用"段** | 每个 skill 有 "When NOT to use" 段。例：`spec-driven-development` "Single-line fixes, typo corrections..." | 防止过度应用。Agent Skills 是唯一没有在 F1 做无意义前置步骤的 workflow |
| **增量执行纪律** | `incremental-implementation`: "Implement the smallest complete piece... each increment leaves the system in a working, testable state. Avoid implementing an entire feature in one pass." + ASCII 循环图 | 理论上强制小步提交。但实验中 Agent Skills 和 Matt 一样——每 feature 一次 commit |
| **后退机制** | `debugging-and-error-recovery`: "Systematic root-cause debugging. Use when tests fail, builds break, behavior doesn't match expectations." + 回退检查清单 | Agent 在 F3 修复 7 个 bug 时表现出了系统性诊断能力 |
| **UI 工程标准** | `frontend-ui-engineering`: "Builds production-quality, accessible, responsive user-facing UIs." — 这是唯一一个有 UI 质量标准的 workflow | Agent Skills 的 UI 质量最高（5/5 readability），且是唯一产生文字反应的 |

**架构优势：**
- 最完整的质量保证体系。5 轴审查 + 增量实现 + 门控流程。
- "何时不用" 防止过度工程化。在 spec 精确时跳过不必要的步骤。
- UI 质量标准带来了可感知的质量差异——用户评分 5/5。

**架构劣势：**
- 和 Superpowers 同样的弱点——验证门控依赖 Agent 自觉。未被外部强制执行。
- 长 skill（如 `code-review-and-quality` 上百行）被 Agent 选择性忽略。短 skill 的遵守率反而更高。

---

## 3. Skill 写作技术：有效的 7 种模式

通过逐行阅读三个 workflow 的 SKILL.md 源码，提取出以下经过实验验证的 skill 写作技术：

### 3.1 YAML 前置元数据——Agent 的"路由表"

```yaml
---
name: spec-driven-development
description: Creates specs before coding. Use when starting a new project, feature, 
  or significant change and no specification exists yet.
disable-model-invocation: true   # 禁止 Agent 自动调用，只能显式 / 指令触发
---
```

**为什么有效：** `description` 是 Agent 决定"是否使用这个 skill"的**唯一依据**。写得不精确，Agent 就会在错误时机调用。`disable-model-invocation: true` 是 Matt 特有的机制——让 skill 只响应显式命令而非 Agent 自行判断。

**实验验证：** Agent Skills 的 `spec-driven-development` description 精确列出了触发条件（"requirements are unclear, ambiguous, or only exist as a vague idea"）。当 case-spec 已经精确时，Agent 正确地跳过了 grilling 阶段。

### 3.2 硬性关卡——Agent 无法绕过的屏障

```markdown
<HARD-GATE>
Do NOT invoke any implementation skill, write any code, scaffold any project, 
or take any implementation action until you have presented a design and the user 
has approved it.
</HARD-GATE>
```

**为什么有效：** 这是 Superpowers 最有效的防偷懒机制。`<HARD-GATE>` 标签在系统层面阻止 Agent 跳步——不是建议，是规则。

**实验验证：** Superpowers 是唯一在 commit 前产出完整设计文档的 workflow（`.superpowers/sdd/` 下有 design spec + implementation plan）。其他两个 workflow 的 plan 是 Agent 在对话中口述的，没有文件留存。

### 3.3 理性化反驳表——预判 Agent 的偷懒借口

```markdown
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |
| "The skill is overkill" | Simple things become complex. Use it. |
| "This doesn't count as a task" | Action = task. Check for skills. |
```

**为什么有效：** 预判了 Agent 最可能找的 8 种借口，每种给出一个字的反驳。任何 Agent 在看到这张表后试图跳过 skill 调用都会"感觉"到自己的借口已经被预判了。

**实验验证：** Superpowers 的 F1 不是"简单"的——3,513 行代码——但因为 `using-superpowers` 强制 Agent 走了完整流程，最终成果包括验证过的 spec 对齐。

### 3.4 路由器模式——解决 skill 选择困难

```markdown
# Ask Matt
A **flow** is a path through the skills. Most paths run along one **main flow**, 
and two **on-ramps** merge onto it.

## The main flow: idea → ship
1. `/grill-with-docs` — sharpen the idea by interview
2. Branch — can you settle every question in conversation? → `/prototype`
3. Branch — is this a multi-session build? → `/to-spec` → `/to-tickets` → `/implement`
```

**为什么有效：** 当 skill 数量超过 ~10 个时，Agent 需要帮助选择。路由器提供了决策树——"如果你有 codebase 用 grill-with-docs，没有用 grill-me"。分支逻辑用 `/handoff` 桥接跨 session 上下文。

**实验验证：** Matt 有 41 个 skill，实验中没有出现"Agent 不知道该用哪个"的问题。对比 Superpowers（~10 个 skill）和 Agent Skills（24 个）——它们用流程顺序而非路由器解决同样的问题。

### 3.5 反模式表——告诉 Agent 什么不该做

Matt 的 `tdd` skill 包含一个反模式表：

```markdown
## Anti-patterns
- **Implementation-coupled** — mocks internal collaborators, tests private methods. 
  The tell: the test breaks when you refactor but behavior hasn't changed.
- **Tautological** — the assertion recomputes the expected value the way the code does. 
  Expected values must come from an independent source of truth.
- **Horizontal slicing** — writing all tests first, then all implementation. 
  Work in vertical slices instead.
```

**为什么有效：** 正反两面定义正确行为。Agent 不仅知道"做什么"也知道"不做什么"。每个反模式有明确的 **tell**（识别信号）——Agent 可以在自己犯错时自我诊断。

**实验验证：** 实验中 TDD 没有被有效执行——三个 workflow 都没有写测试。但反模式表本身是正确的写法。问题不在 skill 写作而在执行。

### 3.6 "何时不用"段——防止过度应用

Agent Skills 每个 skill 的独特设计：

```markdown
**When NOT to use:** Single-line fixes, typo corrections, or changes 
where requirements are unambiguous and self-contained.
```

**为什么有效：** 定义了 skill 的**负空间**（negative space）。Agent 在匹配到"用"的条件后，会再检查"不用"的条件——双重过滤。

**实验验证：** Agent Skills 是唯一没有在 F1 做无意义 grilling 的 workflow。Matt F1 在有精确 spec 的情况下走了 grilling 浪费了 400K token。这不是 skill 质量问题——Matt 的 `grilling` 没有 "When NOT to use" 段。

### 3.7 一问一答纪律——防止信息过载

```markdown
Ask the questions **one at a time**, waiting for feedback on each question 
before continuing. Asking multiple questions at once is bewildering.
```

**为什么有效：** Agent 有一种倾向——一次抛出 3-5 个问题。用户会挑最简单的回答，跳过复杂的。一问一答强制 Agent 等待每个回答，确保每个决策都被充分讨论。

**实验验证：** Matt 的 F1 grilling 问了 7 个问题，每个用户都回答了。Superpowers F1 的 brainstorming 问了 3 个问题，但每次是多选项而非单一问题。Agent Skills F1 只问了 0 个问题——它判断 spec 已经足够清晰。

---

## 4. 实验数据对照：哪种写法更有效？

| 写作技术 | 哪个 workflow 用了 | 可测量的效果 | 数据 |
|---------|-------------------|-------------|------|
| 硬性关卡 | Superpowers | 有设计文档留存 | 18 commits，有 `<HARD-GATE>` |
| 路由器 | Matt | 41 个 skill 无选择困难 | F1 自动路由到 grilling → implement |
| 反模式表 | Matt (TDD) | TDD 仍未被遵守 | 0 个测试 |
| "何时不用"段 | Agent Skills | F1 无冗余步骤 | Agent Skills F1: 6min, 332K（最简洁） |
| 一问一答 | Matt | 用户回答了所有 grilling 问题 | 7/7/5 F1/F2/F3 grilling 问题被回答 |
| 短指令 vs 长指令 | Matt vs Agent Skills | 短指令遵守率更高 | `implement` (7行) > `code-review-and-quality` (上百行) |
| 五轴审查 | Agent Skills | 初始自评仍为 0 bugs | 审查在 prompt 触发后才生效 |

---

## 5. 实践建议：如何写一个好 Skill

1. **先写 "When NOT to use"，再写 "When to use"。** 防止 Agent 把小任务复杂化。Agent Skills 用这个模式省了 ~400K token。

2. **在关键决策点用硬性关卡。** Human approval gate 是唯一能阻止 Agent 跳过验证的方法。建议不是强制——Agent 会把建议当作可选项。

3. **Skill 超过 10 个请提供路由器。** `ask-matt` 的 "flows" 概念值得借鉴——定义 main flow + on-ramps，让 Agent 知道自己该走哪条路径。

4. **预判 Agent 的偷懒行为。** 写一张反驳表，不要信任 Agent 的自我约束。Superpowers 的 using-superpowers skill 是一张表驱动的 Agent 行为矫正器。

5. **一问一答。** Agent 一次抛出一堆问题时，用户会跳过。Matt 的 grilling 格式证明这是有效的——每个问题都被认真回答。

6. **短 skill（<20 行）的遵守率高于长 skill。** Agent 对 `implement`（7 行）的执行比 `code-review-and-quality`（上百行）更忠实。长 skill 的细节容易被 Agent 选择性忽略——把核心指令放在前面，细节放附录。

7. **定义 "完成" 的硬标准。** 不要写 "确认一切正常"——写 "运行 `npm run dev` 并检查以下 7 个标准"。Superpowers 的 verification-before-completion 写了正确的原则，但 Agent 用 `npx vite build` 替代了功能验证——因为原则是软的。

8. **Skill 写好后要测试。** 本次实验本质上是**对 skill 的集成测试**——Agent 拿着 skill 去完成一个真实项目。试验发现：硬性关卡有效、反模式表有效但在 TDD 场景未能强制执行、"何时不用"段是最被低估的设计。这些只能在真实任务中发现。

---

## 6. 场景适配：什么时候用什么 Workflow

基于实验数据，按项目特征推荐：

| 场景特征 | 推荐 Workflow | 理由 | 实验数据 |
|---------|-------------|------|---------|
| **需求模糊，需要先理清** | Matt Skills | grilling 一问一答最擅长澄清需求 | F1 grilling 7 个问题全部被回答，方案在编码前确定 |
| **需求精确（如已有 spec 文档）** | Agent Skills | "何时不用" 段防止冗余步骤；无需 grilling | Agent Skills F1 0 clarification questions，6min 完成 |
| **单人快速原型（< 2h）** | Matt 或 Agent Skills | Superpowers 的 planning 开销太大 | Superpowers 194min vs Matt 51min vs Agent Skills 41min |
| **团队协作、需要设计文档留存** | Superpowers | 硬性关卡强制产出 design spec + plan | 唯一有 `.superpowers/sdd/` 和 `docs/superpowers/specs/` 的 workflow |
| **多系统集成（前端 + 后端 + DB）** | Agent Skills | 门控流程 + 5 轴审查覆盖更多维度 | F3: 23min, 244K tokens（最快），7 bugs（最多但 4 个自发现） |
| **UI 质量优先** | Agent Skills | `frontend-ui-engineering` skill 是唯一有 UI 标准的 | 5/5 readability，唯一有文字反应、diary 日期等细节 |
| **预算敏感（token 最少）** | Superpowers | 最低 token 消耗 | 702K total tokens（Matt: 1,549K, Agent Skills: 735K） |
| **需要增量 commit 历史** | Superpowers | 唯一 commit 数 > 1 的 workflow | 18 commits vs Matt/Agent Skills 各 3 commits |
| **CI/CD 或自动化验收环境** | Agent Skills | 有 `ci-cd-and-automation` + `shipping-and-launch` | 内置部署和 CI 支持（本次实验未测试） |

### 混合使用的建议

三个 workflow 不是互斥的。从实验中提取的最佳组合：

```
需求阶段：Matt 的 grilling（一问一答，澄清模糊需求）
    ↓
设计阶段：Superpowers 的 brainstorming + writing-plans（产出留存文档）
    ↓
实现阶段：Agent Skills 的 incremental-implementation（小步提交）
    ↓
质量阶段：Agent Skills 的 code-review-and-quality（5 轴审查）
         + Superpowers 的 verification-before-completion（硬性关卡）
    ↓
交付阶段：Agent Skills 的 shipping-and-launch
```

**但要小心：** 混合使用会增加 token 消耗。本实验的纯 workflow token 消耗：Superpowers 702K | Agent Skills 735K | Matt 1,549K。混合工作流可能达到 1M+ tokens。仅在项目复杂度高、质量要求高时推荐。
