# Eval Platform

> ⚠️ 本文档是 `eval/README.md`，为便于 GitHub 展示放到分支根目录。平台入口为 `eval/evaluate.js`。

> 项目无关的 AI 工作流自动化评估平台。换项目时只替换 `spec-checkers/<project>/`，其余直接复用。

## 快速开始

```bash
# 1. 启动被测项目网站
cd workshop && npm run dev

# 2. 运行评估（自动探测端口、读配置、跑 checker）
node eval/evaluate.js --workflow=superpowers --no-judge

# 3. 带 AI Judge 评分
node eval/evaluate.js --workflow=superpowers
```

## 三层架构

### 1. Spec Checkers（客观层）

每条验收标准 → 一个可执行 checker，返回 `{ pass: boolean, detail: string }`。

| 类型 | 说明 | 示例 |
|------|------|------|
| `static` | 文件扫描、代码正则匹配 | 检查 `package.json` 是否有 React 依赖 |
| `browser` | Puppeteer 打开页面检查 DOM | `page.goto('/hamster')` → 检查是否显示仓鼠名 |

当前 `hamster/` 项目有 19 个 checker（F1: 7, F2: 4, F3: 8）。浏览器 checker 用系统 Edge（`puppeteer-core`），无需下载 Chromium。

### 2. Data Parsers（数据层）

全自动从源文件提取，无需人工记录：

| Parser | 输入 | 输出 | 换项目 |
|--------|------|------|--------|
| `token-parser.js` | Session JSONL | `{ input_tokens, output_tokens, total_tokens }` | 否 |
| `git-parser.js` | `git diff` | `{ lines_added, lines_deleted, files_added, files_modified, commits }` | 否 |
| `session-parser.js` | Session JSONL | `{ user_messages, agent_responses, clarification_questions }` | 否 |

### 3. AI Judge（主观层）

独立 LLM（非编码 Agent）根据 rubric 打分。每次评分附带 2-3 句具体证据。

| Judge | 评估维度 | 评分方式 |
|-------|---------|---------|
| `readability.md` | 5 维：命名 (25%)、结构 (25%)、格式 (15%)、注释 (15%)、DRY (20%) | 1-5 分 |
| `ui-quality.md` | 5 维：布局、间距、视觉层级、色彩、移动适配 | 1-5 分 |
| `code-reuse.md` | 对比两个 Feature 的 diff | Yes / No / N/A + 证据 |

Judge 支持 DeepSeek、OpenAI 或任何 OpenAI-compatible 的 API。首次运行时交互式输入 key（也可设 `LLM_API_KEY` 环境变量跳过）。

## 目录结构

```
eval/
├── evaluate.js            ← 主入口：checkers → parsers → judge → CSV
├── eval-config.json       ← 注册 workflow（session 路径、baseline commit），运行用 --workflow=
├── spec-checkers/
│   └── hamster/           ← 19 条验收标准（F1: 7, F2: 4, F3: 8）
├── parsers/
│   ├── token-parser.js
│   ├── git-parser.js
│   └── session-parser.js
├── judges/
│   ├── readability.md     ← rubric: 命名/结构/格式/注释/DRY
│   ├── ui-quality.md      ← rubric: 布局/间距/层级/色彩/移动
│   ├── code-reuse.md      ← rubric: Yes/No/N/A + 证据
│   └── call.js            ← 调外部 LLM API
└── output/
    └── results.csv        ← 自动生成的评估行
```

## 已验证结果

平台在三个 workflow 上产出与人工记录高度一致的评分：

| Workflow | F1 | F2 | F3 | Token | Readability (AI) |
|----------|----|----|----|-------|-----------------|
| Superpowers | 7/7 | 4/4 | 8/8 | 702K | 4/5 |
| Matt Skills | 5/7 | 4/4 | 5/8 | 1,549K | 4/5 |
| Agent Skills | 5/7 | 1/4 | 7/8 | 491K* | 4/5 |

> \*Agent Skills: F3 session log 为 `.md` 格式，JSONL 仅覆盖 F1+F2。

### 与人工记录对比

| 指标 | 人工 | 平台 | 一致性 |
|------|------|------|--------|
| Token | 手动从 JSONL 提取 | 自动解析 | ✅ 完全一致 (702K / 1,549K) |
| Spec 合规 | 逐条手动验收 | 自动化 checker | ✅ 方向一致 |
| Readability | 主观打分 | AI Judge + rubric | ≈ 平台偏保守 (全 4/5) |
| 耗时 | ~10min/workflow | ~30s/workflow | ⚡ 20× 加速 |

## 换项目

1. 把被测项目代码放到 `workshop/`（或指定路径）
2. 在 `spec-checkers/` 下新建 `<project>/` 文件夹
3. 编写该项目每个 Feature 的 checker
4. 在 `eval-config.json` 注册 workflow 的 session 路径和 baseline commit
5. 其余无需修改——parser、judge、evaluate.js 均为项目无关

## 已知限制

- **浏览器 checker 需要被测项目本地运行**（`npm run dev`）
- **MongoDB checker 需要数据库连接**（种子数据需预先导入）
- **AI Judge 需要独立 API key**（建议和编码 Agent 使用不同模型保证公平）
- **Puppeteer 在受限环境可能无法安装**——此时仅静态 checker 可用
