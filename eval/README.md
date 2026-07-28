# Eval Platform

> 项目无关的 AI 工作流自动化评估平台。换项目时只替换 `spec-checkers/<project>/`，其余可直接复用。

## 目录结构

```
eval/
├── README.md
├── spec-checkers/          ← 验收标准自动化（唯一项目相关部分）
│   └── <project>/          ← 每个被测项目一个文件夹
│       ├── f1-checkers.js
│       ├── f2-checkers.js
│       └── f3-checkers.js
├── judges/                 ← AI 评委 rubric（项目无关）
│   ├── readability.md
│   ├── ui-quality.md
│   └── code-reuse.md
├── parsers/                ← 数据提取器（项目无关）
│   ├── token-parser.js
│   ├── git-parser.js
│   └── session-parser.js
├── evaluate.js             ← 主入口
└── output/                 ← 生成报告
    └── results.csv
```

## 三层设计

### 1. Spec Checkers（客观层）
每条验收标准 → 一个可执行 checker，返回 pass/fail。
```js
// 示例：F1 checker
{ id: "f1-navbar", description: "顶部导航栏", check: () => pageHas(".navbar") }
```

### 2. Data Parsers（数据层）
自动从 session JSONL / git diff 提取 token、代码量、消息数。
换项目时无需修改。

### 3. AI Judges（主观层）
独立模型 + rubric 打分。每个评分附带 2-3 句证据。
换项目时 rubric 可直接复用。

## 使用方式

```bash
node eval/evaluate.js --project=hamster --workflow=superpowers --feature=F1
```

输出：控制台报告 + `eval/output/results.csv` 追加一行。

## 换项目

1. 把被测项目代码放到 `workshop/`（或指定路径）
2. 在 `spec-checkers/` 下新建 `<project>/` 文件夹
3. 编写该项目每个 Feature 的 checker
4. 其余无需修改
