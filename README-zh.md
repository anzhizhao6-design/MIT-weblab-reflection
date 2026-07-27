# Hamster Daily — Edge Extension

> 将 Hamster Daily 搬到浏览器侧边栏。每次打开，看看今天的仓鼠。

## 设计思路

这个扩展和 [主站](https://hamster-daily.onrender.com) 共享同一套后端和数据，但交互完全不同——侧边栏 350px 宽，随手打开、随手关闭，不需要切换标签页。

### 与主站的共享架构

```
┌─────────────────┐     ┌──────────────────┐
│  主站 (main)    │     │  扩展 (extension) │
│  React + Vite   │     │  React + Vite    │
│  localhost:3000 │     │  sidePanel API   │
└───────┬─────────┘     └────────┬─────────┘
        │  共享 API              │  共享 API
        └──────────┬─────────────┘
                   ▼
        ┌──────────────────┐
        │  后端 (main)     │
        │  Express :3001   │
        │  MongoDB Atlas   │
        │  LLM API (JM)    │
        └──────────────────┘
```

**共用内容：**

- **API 全部复用** — `/api/hamsters/random`、`/api/chat`、`/api/visit`、`/api/feed`、`/api/memory`、`/api/users`（其中 `/api/hamsters/:name` 和 CORS 是为了扩展专门加的）
- **数据库共享** — 同一个 MongoDB `hamster_main`。喂食、访问计数、聊天记录在两个平台上实时同步
- **userId 同步** — 打开主站时 Content Script 自动将 UUID 写入扩展存储，侧边栏随后使用同一身份

**不同之处：**

- 扩展 UI 针对 350px 窄屏重新设计（2 列食物、4 条聊天记录、1 条日记可展开）
- 扩展只加载当前仓鼠数据，不是全部 12 只
- 状态保持——关闭侧边栏再打开还是同一只仓鼠

## 安装与使用

### 前提条件

- Node.js ≥ 18
- [后端](https://hamster-daily.onrender.com) 运行中（默认已部署）

### 安装步骤

```bash
# 1. 进入扩展目录
cd extension

# 2. 安装依赖
npm install

# 3. 构建
npm run build

# 4. 在 Edge 中加载
# edge://extensions/ → 打开「开发者模式」→「加载解压缩的扩展」→ 选择 extension/ 文件夹
```

### 日常使用

- 点击浏览器工具栏的 🐹 图标，侧边栏打开
- 如果打开 [主站](https://hamster-daily.onrender.com)，userId 自动同步——两个平台共享身份
- 如果没打开主站，扩展使用自己生成的 UUID（可在主站 Account 面板粘贴同步）

### 开发模式

```bash
cd extension
npm run dev     # 启动 Vite 开发服务器（热更新）
```

然后在 `edge://extensions/` 重新加载扩展。

## 后端接口

所有 API 指向 `https://hamster-daily.onrender.com`：

| 端点                   | 方法 | 用途              | 扩展特有？           |
| ---------------------- | ---- | ----------------- | -------------------- |
| `/api/hamsters/random` | GET  | 随机仓鼠          | 否                   |
| `/api/hamsters/:name`  | GET  | 按名恢复仓鼠      | **是**（为扩展新增） |
| `/api/chat`            | POST | 发送聊天消息      | 否                   |
| `/api/visit`           | POST | 记录访问          | 否                   |
| `/api/feed`            | POST | 记录喂食          | 否                   |
| `/api/memory`          | GET  | 查询访问/喂食计数 | 否                   |
| `/api/users`           | POST | 注册新用户        | 否                   |

### 格式差异说明

主站原先的 API 使用 `hamsterId`（数字）和自定义响应格式。扩展最初基于 Agent Skills 分支（使用 `hamsterName` 字符串），适配为与 main 后端兼容的格式。详见 commit history。

## 技术栈

- **前端**: React 18 + Vite 5
- **扩展 API**: Manifest V3（sidePanel + storage + content scripts）
- **后端**: 复用 main 分支的 Express + MongoDB + LLM API
- **共享数据**: `workshop/src/data/hamsters.js`、`foods.js`、`chatFallback.js`（通过 Vite 别名 `@shared`）

## 已知限制

- **Render 免费休眠** — 15 分钟无请求后服务器休眠，打开扩展前先访问一次 [主站](https://hamster-daily.onrender.com)
- **Content Script 作用域** — userId 同步仅当用户打开 `hamster-daily.onrender.com` 时触发
- **Fallback 聊天** — LLM API 不可用时，扩展退回关键词匹配回复（与主站行为一致）

## 相关链接

- [主站](https://hamster-daily.onrender.com)
- [主站源码 (main)](https://github.com/anzhizhao6-design/MIT-weblab-reflection)
- [Benchmark 实验报告](https://github.com/anzhizhao6-design/MIT-weblab-reflection/tree/main/benchmark)
