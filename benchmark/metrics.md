# Evaluation Metrics

> 每个 workflow × 每个 feature 记录以下指标。

---

## 1. 效率

| 指标           | 怎么测                                 | 单位 |
| -------------- | -------------------------------------- | ---- |
| 总耗时         | 从发第一个 prompt 到 feature 验收通过  | 分钟 |
| Prompt 轮数    | 用户 ↔ Agent 的交互次数                | 次   |
| Agent 思考时间 | Agent 内部推理耗时（不含用户阅读时间） | 分钟 |

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
| 修改文件数 | `git diff --name-only` | 个   |
| Bug 数     | 验证阶段发现的问题     | 个   |

---

## 4. 人工介入

**二值判断 + 备注：**

| 级别 | 含义                         |
| :--: | ---------------------------- |
|  0   | Agent 独立完成，无需任何帮助 |
|  1   | 需要人工介入                 |

**备注记录具体原因：** "F3 阶段 CSS 金边不生效，提示了 specificity 问题"、"F5 阶段 Mongoose schema 缺少 id 字段，用户指出后修复"

---

## 5. 质量

| 指标              | 怎么测                                 | 标准                         |
| ----------------- | -------------------------------------- | ---------------------------- |
| 能否运行          | `npm run dev` / `node server/index.js` | 启动成功 / 启动失败          |
| 是否符合 spec     | 逐条对照 case-spec.md                  | 全部通过 / 部分通过 / 未通过 |
| 是否有 regression | 已完成的 feature 是否被新 feature 破坏 | 无 / 有（具体哪个 feature）  |
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
workflow,feature,time_min,prompt_turns,think_time_min,input_tokens,output_tokens,total_tokens,lines_added,files_modified,bugs,human_intervention,run_success,spec_pass,regression,readability,auto_fixed,replanned,repeated_mistake,used_docs,reused_code,notes
```
