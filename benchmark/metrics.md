# Evaluation Metrics

> 每个 workflow × 每个 feature 记录以下指标。

---

## 1. 效率

| 指标                    | 怎么测                                                   | 单位 |
| ----------------------- | -------------------------------------------------------- | ---- |
| Wall-clock time         | 第一个正式 prompt → 用户独立验收所有 acceptance criteria | 分钟 |
| User messages           | 用户发送的消息数                                         | 条   |
| Agent responses         | Agent 完成的响应数                                       | 条   |
| Clarification questions | 开始实现前 Agent 提出的澄清性问题数                      | 个   |
| Retry cycles            | 验证失败后又进行了一轮实现尝试的次数                     | 次   |

> **注意：** Agent 思考时间不记录。Claude Code（VS Code extension）不暴露可靠的内部推理耗时，若无法获取则填 N/A。

---

## 2. 成本

| 指标          | 怎么测            | 单位   |
| ------------- | ----------------- | ------ |
| Input tokens  | Agent session log | tokens |
| Output tokens | Agent session log | tokens |
| Total tokens  | Input + Output    | tokens |

---

## 3. 代码产出

| 指标       | 怎么测                 | 单位 |
| ---------- | ---------------------- | ---- |
| 新增行数   | `git diff --stat`      | 行   |
| 删除行数   | `git diff --stat`      | 行   |
| 新增文件数 | `git diff --name-only` | 个   |
| 修改文件数 | `git diff --name-only` | 个   |
| Bug 数     | 验证阶段发现的独立问题 | 个   |

> Bug 按独立根因计数。同一问题导致多次验证失败记为 retry cycles，不重复计 bug（除非根因不同）。详见 experiment-protocol.md。

---

## 4. 人工介入

| Level | 含义 |
|:-----:|------|
| 0 | No human input beyond approving required workflow checkpoints |
| 1 | Human answered requirement or environment clarification questions |
| 2 | Human suggested debugging direction or corrected the implementation plan |
| 3 | Human directly edited code, commands, configuration, or tests |

> **重要：** 正常 workflow checkpoint 批准（如 Superpowers 要求用户 approve spec）属于 Level 0，不算人工介入。

**备注记录具体原因：** "F3 阶段 CSS 金边不生效，提示了 specificity 问题（Level 2）"、"F5 阶段 Mongoose schema 缺少 id 字段，用户指出后修复（Level 2）"

---

## 5. 质量

| 指标              | 怎么测                                 | 标准                         |
| ----------------- | -------------------------------------- | ---------------------------- |
| 能否运行          | `npm run dev` / `node server/index.js` | 启动成功 / 启动失败          |
| Spec pass rate    | 逐条对照 case-spec.md 验收标准         | `passed / total`（如 `7/8`） |
| Regression count  | 已完成的 feature 是否被新 feature 破坏 | 数字（0 = 无 regression）    |
| 代码可读性        | 主观评估                               | 1-5 分                       |

---

## 6. 恢复能力

| 指标                           | 记录方式 |
| ------------------------------ | -------- |
| Agent 是否自动修复了自己的错误 | 是 / 否  |
| 是否改变过方案（re-plan）      | 是 / 否  |
| 是否重复犯同一个错误（≥2 次）  | 是 / 否  |

---

## 7. Context 利用

| 指标                                    | 记录方式         |
| --------------------------------------- | ---------------- |
| 是否主动参考了项目文档（README, notes） | 是 / 否          |
| 是否复用了之前 feature 的代码           | 是 / 否          |
| 如果没有，Agent 解释了为什么另起炉灶    | 是 / 否 / 不适用 |

---

## 数据表

`results.csv` 格式：

```csv
workflow,feature,start_time,end_time,time_min,user_messages,agent_responses,clarification_questions,retry_cycles,input_tokens,output_tokens,total_tokens,lines_added,lines_deleted,files_added,files_modified,bugs,human_intervention_level,run_success,spec_pass_count,spec_total,regression_count,readability,auto_fixed,replanned,repeated_mistake,used_docs,reused_code,external_failure,notes
```

> **Token 记录说明：** 若 Claude Code（VS Code extension）不暴露可靠的 per-session token 数据，`input_tokens`、`output_tokens`、`total_tokens` 填 `N/A`。在 `notes` 字段注明原因（如 `"VS Code extension did not expose per-session usage"`）。不可估算。
