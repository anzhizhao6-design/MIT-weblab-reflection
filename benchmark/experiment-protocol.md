# Experiment Protocol

> 三套 workflow 必须遵守的同一份实验规则。冻结后不可修改，除非三轮实验全部作废重跑。

---

## 1. Controlled Variables

| 变量 | 固定值 |
|------|--------|
| Baseline commit | `37c159d` |
| Case specification | `benchmark/case-spec.md`（冻结版本） |
| Evaluation metrics | `benchmark/metrics.md`（冻结版本） |
| Coding Agent Model | Claude Code 实际使用的 Claude 模型（实验开始前通过 `/status` 记录） |
| Application LLM Model | `deepseek-v4-pro`（仓鼠聊天功能调用的 JMAPI 模型） |
| Claude Code version | 实验开始前记录 |
| Workflow / Skills version | commit hash 或安装时可见版本号，实验开始前记录 |
| Computer & network | 同一台机器、同一网络 |
| Assets | `workshop/public/hamsters/` 下 13 个文件 |
| LLM endpoint | `https://jmapi.jaguarmicro.com/v1` |
| MongoDB cluster | 同一个 Atlas cluster |

> **Coding Agent Model** 是写 React、后端、数据库的 Claude 模型。**Application LLM Model** 是 F2 仓鼠聊天功能调用的 JMAPI 模型。两者不同，不可混淆。

---

## 2. Branches

每个 workflow 一个独立分支，从同一个 baseline commit 分出：

```
37c159d (baseline)
    │
    ├── workflow/superpowers
    ├── workflow/matt-skills
    └── workflow/agent-skills
```

每个分支使用**全新的 Claude Code session**，不跨分支复用 context。

---

## 3. Timing

- **Start**: 正式 feature prompt 发送的时间
- **End**: 用户独立逐项验证所有 acceptance criteria 全部通过的时间
  - Agent 声称"完成"不算结束 — 用户必须自己启动项目、逐项检查、确认通过后才停止计时
  - 若验证发现问题，计时继续，直到修复并重新验收通过

**Included（计入 wall-clock）：**
- Agent 阅读与输出时间
- 用户阅读、回答与审批时间
- 文件修改、命令运行、测试与修复时间
- 正式 prompt 发出后的依赖安装时间（`npm install` 等）

**Excluded（不计入）：**
- Workflow/plugin 的首次安装与配置
- 创建 baseline、实验分支和冻结 benchmark 文档
- 实验开始前统一准备 assets、API credentials 和数据库环境的时间

每个 feature 单独计时，完成后立即记录。

---

## 4. Feature Execution Order

每个 workflow 按顺序实现 3 个 Feature，不可跳跃：

```
F1 (Home + Random Hamster)
  → F2 (Feed + Food Tray + LLM Chat)
    → F3 (Database + Persistent Memory)
```

规则：
- 完成 F1 → 记录 metrics → commit → 开始 F2
- 完成 F2 → 记录 metrics → commit → 开始 F3
- 完成 F3 → 记录 metrics → commit → 实验结束
- 每个 feature 之间不 squash、不 rebase

---

## 5. Human Intervention Rules

- **Do not** manually edit implementation code unless necessary
- Normal workflow checkpoint approvals（如 Superpowers 的 spec 批准）属于 Level 0
- 每次介入必须记录：feature、level、具体原因

| Level | Meaning |
|:-----:|---------|
| 0 | No human input beyond approving required workflow checkpoints |
| 1 | Human answered requirement or environment clarification questions |
| 2 | Human suggested debugging direction or corrected the implementation plan |
| 3 | Human directly edited code, commands, configuration, or tests |

参考格式：`"F3 阶段 CSS 金边不生效，提示了 specificity 问题（Level 2）"`

---

## 6. Bug Definition

Bug 仅当以下情况之一成立时计数：
- An acceptance criterion in case-spec.md fails
- Build or runtime fails（`npm run dev` 报错、页面白屏、编译错误等）
- An existing completed feature regresses（新 feature 破坏了旧 feature 的验收标准）

**计数规则：**
- One underlying issue = one bug，即使它导致多次验证失败
- 同一个问题修复后再次出现 → 记为 retry cycle，不是新 bug（除非根因不同）
  - 例：同一个 CSS import 错误导致页面刷新失败 3 次 → Bug: 1, Retry cycles: 2

**不计入 bug：**
- Styling preferences not written in the spec
- External failures（网络、API quota、auth、Atlas 故障）→ 记入 `external_failure`

---

## 7. External Failure

以下情况记为 `external_failure`，不计入 bug：
- Network outage
- LLM API quota exhaustion
- LLM API authentication failure
- MongoDB Atlas outage
- Any non-2xx response from external services

每次 external failure 单独记录，Agent 可以 retry。

---

## 8. Data Recording

每次完成一个 feature，在 `benchmark/results.csv` 中追加一行。

CSV 字段：

```
workflow,feature,start_time,end_time,time_min,user_messages,agent_responses,clarification_questions,retry_cycles,input_tokens,output_tokens,total_tokens,lines_added,lines_deleted,files_added,files_modified,bugs,human_intervention_level,run_success,spec_pass_count,spec_total,regression_count,readability,auto_fixed,replanned,repeated_mistake,used_docs,reused_code,external_failure,notes
```

最终数据量：3 workflows × 3 features = **9 行**。

**Token 记录说明：**
- 若 Claude Code（VS Code extension）不暴露可靠的 per-session token 数据，`input_tokens`、`output_tokens`、`total_tokens` 填 `N/A`
- 在 `notes` 字段注明 token measurement source（如 `"VS Code extension did not expose per-session usage"`）
- 不可估算或从其他来源推断
- **Token 横向比较规则：** 只有在三个 workflow 的 token 数据来自同一测量来源和范围时，才进行横向排名。若数据来源不一致（如 Superpowers 能看到 token 而 Matt Skills 看不到），token 数据仅做描述性记录，不参与排名

**results.csv 汇总规则：**
- 实验期间，每个 workflow 分支在自己的 `benchmark/results.csv` 中追加 3 行（F1/F2/F3）
- 三轮实验全部完成后，将 9 行数据汇总到 main 分支的 `benchmark/results.csv` 作为 canonical 版本
- 实验期间不要将一个 workflow 分支 merge 到另一个

---

## 9. Commit Message Convention

每个 feature 完成后 commit，格式：

```
feat(F1): <workflow-name> — <brief summary>
feat(F2): <workflow-name> — <brief summary>
feat(F3): <workflow-name> — <brief summary>
```

示例：
```
feat(F1): superpowers — HomePage + Random Hamster
```

---

## 10. Freeze Rule

**本文件、case-spec.md、metrics.md 冻结后不可修改。**

如需修改，必须：
1. 作废所有已完成的实验数据
2. 更新文档版本号
3. 所有三个 workflow 从新的 frozen baseline 重新开始
