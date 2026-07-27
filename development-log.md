# 全栈项目实战简易教程

> 基于 MIT web.lab IAP 2026 课程  
> [课程视频](https://www.youtube.com/playlist?list=PLVAxjdyIU8_z6iFliCz-n9zqf_ZRsbyPA) · [官方课件](https://site.weblab.is/schedule)  
> **在线 demo:** [hamster-daily.onrender.com](https://hamster-daily.onrender.com)

---

## 关于本教程

本教程以 **MIT web.lab 2026 课程大纲**为主线，以 **Hamster Daily** 全栈项目为实战案例，从零搭建一个完整的 Web 应用（React + Express + MongoDB + LLM）。

**阅读方式：**

- 每章先讲"**课程教了什么 → 为什么学这个**"，再用"**Hamster Daily 怎么用的**"展示实际代码
- 课程中的 TypeScript、SQL、Docker 等高级内容即使未在 Hamster Daily 中使用，仍然完整讲解
- 推荐配合 [课程视频](https://www.youtube.com/playlist?list=PLVAxjdyIU8_z6iFliCz-n9zqf_ZRsbyPA) 和 [官方 Schedule](https://site.weblab.is/schedule) 学习

---

## 目录

| Week  | 内容                          | Hamster Daily |
| ----- | ----------------------------- | :-----------: |
| W1    | HTML/CSS, JS, React 基础      |      ✅       |
| W1    | Git, DevTools, 开发环境       |      ✅       |
| W2    | APIs, Node, Express, MongoDB  |      ✅       |
| W2    | Auth, Sockets, Advanced React |     部分      |
| W2-W3 | Advanced CSS, TypeScript, SQL |      ❌       |
| W4    | Docker, Deployment            |      ✅       |

---

## hamster daily项目全景架构

```
┌─────────────────────────────────────────────────────────┐
│                     Browser                             │
│  https://hamster-daily.onrender.com                     │
│  React 18 + Vite + React Router                         │
│  ┌─────────┐  ┌───────────┐  ┌───────────────────────┐  │
│  │ HomePage│  │HamsterPage│  │Components (Navbar,    │  │
│  │    /    │  │  /hamster │  │Feed, FoodTray, Chat…) │  │
│  └─────────┘  └───────────┘  └───────────────────────┘  │
└────────────┬────────────────────────────────────────────┘
             │  HTTP (REST API)
             │  /api/hamsters/random
             │  /api/chat · /api/visit · /api/feed
             │  /api/memory · /api/users
             ▼
┌─────────────────────────────────────────────────────────┐
│               Express Server (Node.js)                  │
│  ┌──────────┐  ┌────────────────────┐                   │
│  │ Routes   │→ │ Services           │                   │
│  │index.js  │  │hamsterService      │                   │
│  │          │  │chatService ────────┤                   │
│  │          │  │memoryService       │                   │
│  └──────────┘  └───────┬────────────┘                   │
│                        │                                │
│         ┌──────────────┼──────────────┐                 │
│         ▼              ▼              ▼                 │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐           │
│  │ MongoDB  │  │ llmProvider  │  │  Static  │           │
│  │  Atlas   │  │  (JMAPI)     │  │  Files   │           │
│  │ (云端DB) │  │  → DeepSeek  │  │ (dist/)  │            │
│  └──────────┘  └──────────────┘  └──────────┘           │
└─────────────────────────────────────────────────────────┘
```

**数据流：** Browser → Express Route → Service → Provider/Model → Response
**部署：** GitHub → Render（auto-deploy on push）→ MongoDB Atlas（云数据库）
**LLM：** chatService 负责"说什么"，llmProvider 负责"找谁说"（`.env` 一行切换）

---

# Week 1: 前端基础

## 1.1 HTML & CSS

### 为什么从这里开始

浏览器只懂三样东西：HTML（结构）、CSS（样式）、JavaScript（行为）。无论你用什么框架，最终输出的都是这三样。理解它们是"为什么 React 要这样设计"的基础。

### HTML：页面的骨架

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Hamster Home</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <h1>Today's Hamster</h1>
    <div class="card">
      <h2>Meet Boba!</h2>
      <p>Hello! I am Boba!</p>
      <img src="boba.jpg" alt="A cute hamster" />
    </div>
  </body>
</html>
```

**关键概念：**

- `<!DOCTYPE html>` — 告诉浏览器用最新 HTML 标准
- `<head>` — 放元数据（页面标题、CSS 链接），不在页面上显示
- `<body>` — 所有看得见的内容
- **Block vs Inline:** `<div>` 会换行、占满宽度；`<span>` 不换行、只占内容宽度
- **语义化标签:** `<nav>`、`<section>`、`<footer>` 代替 `<div class="nav">`——屏幕阅读器、搜索引擎都能读懂

### CSS：页面的皮肤

```css
.card {
  background-color: #fff8f0;
  border: 3px solid #e8a870;
  border-radius: 20px;
  padding: 28px;
  text-align: center;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}
```

**关键概念：**

- **Selector 优先级:** `#id` > `.class` > `element`。用 class 做样式（复用性更好，少冲突）
- **Box Model:** 每个元素就是嵌套的盒子：`content → padding → border → margin`
- **Flexbox:** `display: flex` 是布局神器——一行代码实现横向排列、居中对齐
- **CSS Variables:** `--primary: #e8a870` 定义在 `:root` 里，整个项目统一换色

### Hamster Daily 实例

最初的 Hamster Daily 就是一个纯 HTML/CSS 页面——两个圆角卡片，左边是仓鼠名字和图，右边是信息。我们用的是 Flexbox 两栏布局：

```css
.row {
  display: flex;
  gap: 24px;
  justify-content: center;
}
```

**为什么后来换成 React？** 因为随着功能增多（多只仓鼠、交互式喂食、聊天），纯 HTML 无法做到动态切换内容。这就是 React 解决的问题。

---

## 1.2 Git 工作流

web.lab Lecture 2 和 Lecture 19 讲 Git。它是团队协作和部署的基础。

### 日常命令

```bash
git clone <repo>         # 下载项目
git pull                 # 同步远端更新
git add .                # 暂存所有改动
git commit -m "..."      # 提交一个版本
git push                 # 推送到 GitHub
```

### 协作工作流

```
main ──●──●──●──●──●──●  (稳定版本)
           ↘     ↗
feature    ●──●──●       (开发新功能)
```

- 从 `main` 开 `feature` 分支开发新功能
- 完成后合并回 `main`
- `git push` 触发 Render 自动部署

### 项目中的 Git

Hamster Daily 的所有代码通过 GitHub 管理。每次改动→commit→push→Render 自动部署到线上。如果线上出了问题，`git log` 查历史版本，`git revert` 回滚。

---

## 2. JavaScript 基础

### 为什么学 JS

HTML/CSS 是"静态的"——你写什么，页面就显示什么。JavaScript 让页面"活过来"——点击按钮、输入文字、调用 API，都靠 JS。

### 核心语法

```js
// const 默认，let 改值时用，尽量不用 var
const name = "Boba";
let mood = 50;

// 箭头函数
const greet = (name) => `Hello, ${name}!`;

// 数组方法：map 和 filter 替代手动循环
const foods = ["seed", "carrot", "apple"];
const bigFoods = foods.filter((f) => f.length > 4); // ["carrot", "apple"]
const upperFoods = foods.map((f) => f.toUpperCase()); // ["SEED", "CARROT", "APPLE"]
```

### 异步：Callback 和 Promise

web.lab 强调一个概念：**JavaScript 是异步的**。API 请求需要时间，不能用 `sleep()` 等——会卡住整个页面。

```js
// 阻塞式（JS 不支持，但概念上说明问题）
const data = waitForApiResponse(); // 页面卡死 1 秒

// 非阻塞
fetch("/api/hamsters/random")
  .then((response) => response.json())
  .then((hamster) => console.log(hamster));
// 这行代码立即执行，不等 fetch 完成
```

**为什么要学这个？** 因为后面调用 LLM API 时，仓鼠需要 1-2 秒才能回复——用户不能等页面卡死。Promise 和 async/await 就是解决"怎么等又不卡"的。

---

## 3. React

### 为什么需要 React

用纯 HTML/CSS/JS 做复杂网站时，你需要手动管理大量 DOM 操作：  
"I'm a goofy goober, yeah"  
"you're a goofy goober, yeah"  
"we're all goofy goobers, yeah"

React 的核心理念：**你只管描述"UI 应该长什么样"，React 负责把 DOM 更新到那个状态。**

### Components（组件）

组件就是"自定义 HTML 标签"。每个组件是一个函数，返回 JSX（看起来像 HTML 的 JavaScript）：

```jsx
const HamsterCard = ({ hamster }) => (
  <div className="card">
    <h2>{hamster.name}</h2>
    <img src={hamster.image} alt={hamster.name} />
  </div>
);
```

**组件树的思考方式：**

```
App
├── Navbar
├── HomePage
│   └── Hero
└── HamsterPage
    ├── HamsterAvatar
    ├── Feed
    ├── FoodTray
    └── ChatBox
```

### Props（属性）vs State（状态）

这是 React **最重要**的概念区分：

|              | Props          | State               |
| ------------ | -------------- | ------------------- |
| **谁控制**   | 父组件传入     | 组件自己管理        |
| **可变吗**   | 不可变（只读） | 可变（通过 setter） |
| **变化时**   | 父组件重传新值 | 触发重新渲染        |
| **用在哪里** | 子组件接收数据 | 跟踪用户交互        |

**记忆口诀：** "States STAY（状态留在组件里），Props PASS（属性往下传）。"

### useState

```jsx
const [moodScore, setMoodScore] = useState(50);
//      ↑ 当前值     ↑ setter 函数      ↑ 初始值

// 正确：用 setter
setMoodScore(70);

// 错误：直接赋值——React 不知道你改了，不会重新渲染
moodScore = 70;
```

**关键规则：永远用 setter 函数，永远不要直接赋值。** 因为 React 需要通过 setter 来"知道"状态变了，然后触发重新渲染。

### React 的三个阶段：Trigger → Render → Commit

每次状态变化的背后，React 都经历了三个步骤（Lectures 9-10 的核心内容）：

1. **Trigger（触发）：** 初始渲染、state 变化、prop 变化、或祖先组件重渲染
2. **Render（渲染）：** React 调用组件函数，生成新的 Virtual DOM 树。**注意：state 在这里是"旧值"——setter 只是安排了一次未来的更新**
3. **Commit（提交）：** React 对比新旧 Virtual DOM（diffing），只更新变化的部分到真实 DOM

**这意味着：`setMoodScore(80); console.log(moodScore);` 打印的还是旧值。** 状态更新是异步的——这是新手最常踩的坑。

### Virtual DOM：React 快的秘密

React 维护一棵 JavaScript 对象树（Virtual DOM）。每次状态变化时，React 在内存中比较新旧 Virtual DOM，算出最小 DOM 操作量，然后一次性应用到真实 DOM。直接操作真实 DOM 很慢（每次修改都触发浏览器重排）；Virtual DOM 把这变成了"在 JS 里算完再一次性改"。

### useEffect

`useEffect` 让你在组件渲染后执行代码——最常见的是调用 API 和设置定时器。

```jsx
// 组件第一次加载时记录访问
useEffect(() => {
  fetch('/api/visit', { method: 'POST', body: ... });
}, []);  // 空数组 = 只跑一次
```

**依赖数组规则：**
| `[var1]` | 首次 + var1 变化时 |
| `[]` | 仅首次（mount） |
| 不传 | 每次渲染都跑（很少用） |

### Hamster Daily 中的 React

HamsterPage 里有多个 `useState`：`hamster`（当前仓鼠）、`moodScore`（心情分数）、`reaction`（喂食反应）、`flipped`（卡片翻转状态）。每个都遵循"state 在组件里，通过 setter 更新"的模式。

`useEffect` 用在两处：页面加载时调用 `/api/visit` 记录访问，以及 Auto-scroll 聊天消息。

---

## 4. React 进阶

### useContext：跨组件共享状态

当某个状态被很多组件需要时（比如用户 ID），一层层通过 props 传下去会很痛苦（叫 "prop drilling"）。

```jsx
// 1. 创建
const UserContext = createContext(null);

// 2. 在顶层提供
<UserContext.Provider value={userId}>
  <Navbar />
  <HamsterPage />
</UserContext.Provider>;

// 3. 在任何子组件中使用
const userId = useContext(UserContext);
```

### React Router：前端路由

传统网站"点链接 → 浏览器向服务器请求新页面"。SPA 用的是**客户端路由**——URL 变了，但没有真正的页面刷新：

```jsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/hamster" element={<HamsterPage />} />
</Routes>
```

### Hamster Daily 中的进阶 React

- **React Router** 实现 `/` (Home) 和 `/hamster` (Hamster) 两个页面
- **Context** 目前用 localStorage 替代（user ID 不需要跨组件频繁传递）
- **Lifting state up** — 换仓鼠的 `handleVisitAnother` 在 HamsterPage 中，通过 props 传给 Navbar

---

# Week 2: 后端与全栈

## 5. HTTP 与 API

### 前端如何和后端通信

浏览器（Client）和服务器（Server）之间通过 **HTTP** 通信。一次完整的通信叫做一次"请求-响应"：

```
GET /api/hamsters/random HTTP/1.1
Host: localhost:3001
→
← 200 OK
{"name": "Boba", "age": "6 months", ...}
```

**关键概念：**

- **HTTP Methods:** GET（读）、POST（创建）、PUT（更新）、DELETE（删除）
- **Status Codes:** 2xx 成功、4xx 你的错、5xx 服务器的错
- **GET 用 query params:** `/api/memory?userId=abc&hamsterId=1`
- **POST 用 body:** `{ "message": "hello", "hamsterId": 1 }`

### API 是什么

API = "Application Programming Interface"——服务器暴露的一组 URL 端点，客户端通过它们获取数据或执行操作。

同一个 URL 可以有不同行为，取决于 HTTP 方法：

- `GET /api/hamsters/random` → 随机返回一只仓鼠
- `POST /api/chat` → 发消息给仓鼠，得到回复

### Hamster Daily 的 API

| 端点                   | 方法 | 用途              |
| ---------------------- | ---- | ----------------- |
| `/api/hamsters/random` | GET  | 获取随机仓鼠      |
| `/api/chat`            | POST | 发送聊天消息      |
| `/api/visit`           | POST | 记录访问          |
| `/api/feed`            | POST | 记录喂食          |
| `/api/memory`          | GET  | 查询访问/喂食记录 |
| `/api/users`           | POST | 创建新用户        |
| `/api/users/:id`       | GET  | 检查用户是否存在  |

### 环境变量（.env）

API 密钥、数据库密码这些**绝对不能写在代码里**——一旦提交到 GitHub，任何人都能看到。`.env` 文件就是放这些敏感信息的地方：

```bash
# .env（被 .gitignore 忽略，不会上传到 GitHub）
MONGO_SRV=mongodb+srv://user:password@cluster.mongodb.net/...
LLM_API_KEY=sk-xxxxxxxx
LLM_BASE_URL=https://jmapi.jaguarmicro.com/v1
LLM_MODEL=deepseek-v4-pro
```

代码里通过 `process.env` 读取：

```js
const uri = process.env.MONGO_SRV; // 读数据库地址
await mongoose.connect(uri);
```

**关键规则：**

- `.env` 必须加到 `.gitignore` ——你的 API key 不是给全世界看的
- 部署到 Render 时，在 Dashboard 的 Environment 栏手动填入同样的 key
- 创建一个 `.env.example` 文件（不含真实 key），告诉队友需要哪些变量

---

## 6. Node.js & Express

### 为什么用 Node.js

前端是 JavaScript。如果后端也用 JavaScript（Node.js），你只需要学一门语言。npm（Node Package Manager）让你能安装任何需要的库。

### Express：Node.js 的 Web 框架

Express 帮你处理"监听端口、解析请求、路由分发"这些繁琐的事，你只需要写"收到这个请求时做什么"：

```js
import express from "express";
const app = express();
app.use(express.json()); // 自动解析 JSON body

app.get("/api/hamsters/random", async (req, res) => {
  const hamster = await getRandomHamster();
  res.json(hamster);
});

app.listen(3001);
```

### Middleware（中间件）

中间件在请求到达最终处理函数**之前**运行——像工厂流水线，每站可以检查、修改或拦截请求：

```js
app.use(express.json()); // 第1站：解析 body
app.use((req, res, next) => {
  // 第2站：打日志
  console.log(req.method, req.url);
  next(); // 必须调用 next() 才能继续
});
// 第3站：你的路由处理函数
```

**顺序至关重要！** 特定路由在前，catch-all 在后，错误处理在最末尾。

### Hamster Daily 的后端架构

一个常见的误区是把所有后端代码写在 `index.js` 里——路由、数据库查询、业务逻辑混在一起。我们把后端拆成了三层，每层只做一件事：

```
请求到达
  ↓
index.js (Express 路由)      ← "收请求，转给 service，返回结果"
  ↓
services/                     ← "怎么做"——业务逻辑
  ├── hamsterService.js       ← 查仓鼠、随机选取
  ├── chatService.js          ← 构建 System Prompt、调用 LLM Provider
  └── memoryService.js        ← 记录访问/喂食、查询记忆
  ↓
providers/                    ← "调用谁"——第三方 API
  └── llmProvider.js          ← 封装 OpenAI SDK，统一 chat() 接口
  ↓
models/ + db/database.js     ← Mongoose 数据模型 + MongoDB 连接
```

**每一层的职责边界：**

| 层           | 知道什么                   | 不知道什么                        |
| ------------ | -------------------------- | --------------------------------- |
| `index.js`   | 哪个 URL 对应哪个 service  | 数据库怎么查、LLM 怎么调          |
| `services/`  | 仓鼠的性格、记忆的业务规则 | HTTP 请求格式、Express 的 req/res |
| `providers/` | 如何调用 OpenAI SDK        | 仓鼠是什么、System Prompt 怎么拼  |
| `models/`    | MongoDB 的 collection 结构 | 前端用什么框架、API 怎么暴露      |

这样做的优势不仅是代码清晰——切换任何一层都不会影响其他层。比如把 JMAPI 换成 DeepSeek，只改 `providers/llmProvider.js` 的一行 URL，`services/` 和 `index.js` 完全不需要动。

```
server/
├── index.js            ← Express 路由（收请求→调 service→返回）
├── db/database.js      ← MongoDB 连接
├── models/             ← Mongoose 数据模型（Hamster, User, Conversation...）
├── services/           ← 业务逻辑（查仓鼠、生成回复、记录记忆）
└── providers/          ← LLM API 封装（可切换 OpenAI/Claude/DeepSeek）
```

这种"路由 → Service → Provider → Model"的分层模式是后端开发的标准实践，也是 web.lab 课程中 Catbook 项目的正式写法。

---

## 7. 数据库：MongoDB

### 为什么需要数据库

把数据存成变量：服务器重启 → **全丢**。存成文件：并发写入 → **冲突**。100 万条数据里找一条：文件 → **太慢**。

数据库解决的就是这三个问题：**持久化、并发控制、高效查询**。

### MongoDB vs SQL

web.lab 教两种数据库：

|              | MongoDB（NoSQL）   | PostgreSQL / SQLite（SQL）     |
| ------------ | ------------------ | ------------------------------ |
| **数据结构** | 灵活的 JSON 文档   | 严格的表 + 行 + 列             |
| **Schema**   | 可以随时加字段     | 需要预先定义，修改困难         |
| **关系**     | 嵌套或引用         | JOIN 查询                      |
| **适用场景** | 快速迭代、灵活结构 | 数据一致性要求高、复杂关系查询 |

课程选择 MongoDB 是因为：JSON 格式和 JavaScript 天然兼容，Schema 灵活适合快速迭代。

### MongoDB Atlas

MongoDB 官方提供的**云托管服务**。免费层 500MB——足够小项目用。数据复制到 3 台机器，一台坏了另外两台顶上。你不用在自己的电脑上安装和运行数据库。

### 数据层级

```
Database: HamsterDaily
├── Collection: hamsters     (12 条文档)
├── Collection: users        (用户记录)
├── Collection: conversations (聊天消息)
└── Collection: hamsermemories (访问/喂食记忆)
```

### 为什么用 Mongoose？

```js
const hamsterSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: String,
  age: String,
  personality: String,
  favouriteFood: String,
  hobby: String,
  bio: String,
  image: String,
  catchphrase: String,
  moodBoost: { type: Number, default: 10 },
  feed: [String],
});
```

**为什么用 Mongoose？** 它给 MongoDB 加了一层"Schema 验证"——虽然 MongoDB 本身是 schema-less 的，但实际开发中你希望数据有一定的结构约束，Mongoose 提供了这个。

### 实战经验：本地文件 vs 云数据库

Hamster Daily 的数据存储经历了两个阶段——选择哪个数据库，取决于"部署后数据会丢吗"这个问题。

**第一阶段：sql.js（本地文件）**

为避免原生编译依赖，选用了 `sql.js`（SQLite 的 WebAssembly 版，纯 JavaScript）。但数据存在本地文件 `hamster.db` 中，而 Render 免费层的文件系统是临时的——服务器重启后数据全部丢失。

**第二阶段：MongoDB Atlas（云托管）**

数据迁移到云端，不依赖 Render 的本地磁盘。MongoDB Atlas 免费层 500MB 足够小项目使用，数据自动复制到三台机器：

```js
// 连接字符串（存在 .env 中，不提交到 Git）
MONGO_SRV=mongodb+srv://user:pass@cluster.mongodb.net/...
```

**选数据库的核心问题：** "部署后数据存在哪？服务器重启会丢吗？"

---

## 8. 身份认证（Auth）

### 两个概念

- **Authentication（认证）：** 证明你是谁——"我是 user-abc123"
- **Authorization（授权）：** 你能做什么——"user-abc123 可以读这些数据"

### 核心原则

**永远不要信任客户端。** 假设黑客写了前端代码。所有验证都在服务器端做。

### 密码不能存明文

```js
// 永远不要这样
password: "hunter2";

// 建议：存哈希
passwordHash: "$2b$10$7NkfBv...";
```

哈希函数是**单向的**——能"hash 一次"但不能"反推出原文"。用户登录时，服务器对用户输入的密码做 hash，和数据库里存的 hash 对比。

### Session vs JWT（Token）

|              | Session                         | JWT                                |
| ------------ | ------------------------------- | ---------------------------------- |
| **存储**     | 服务器端的查找表                | 客户端（Token 下载到浏览器）       |
| **流程**     | 登录 → 发 Cookie → 每次请求查表 | 登录 → 发 Token → 每次请求带 Token |
| **安全**     | 敏感数据在服务器                | Token 就是身份，泄露 = 被盗        |
| **使用场景** | 传统 Web 应用                   | 移动 App、微服务、API              |

### Hamster Daily 的做法

没有用密码——用的是 **UUID 身份系统**：

1. 第一次打开网页 → 自动生成一个 `user-xxxx-xxxx` UUID
2. 存在 `localStorage` 里，每次 API 请求自动带上
3. 换设备时 → 复制 UUID，粘贴到 Account 面板 → 数据全恢复

这比 OAuth 简单 100 倍，适合练习项目。真正的产品应该用 Google OAuth 或 JWT。

---

## 9. 实时通信：WebSocket / Socket.IO

### HTTP 的局限

HTTP 是"请求-响应"模型——客户端不问，服务器不能主动推送。聊天、游戏、实时通知都需要服务器能"主动告诉"客户端。

### WebSocket：长连接

```
HTTP:     Client → Request → ... → Response → Client  (断开)
WebSocket: Client ←────────→ Server   (一直连着)
```

### Socket.IO

web.lab 用的是 Socket.IO——它在 WebSocket 之上加了房间、广播、自动重连等功能：

```js
// 服务器：广播
socketManager.getIo().emit("message", newMessage);

// 客户端：监听
socket.on("message", (data) => addMessage(data));
```

### Hamster Daily 为什么没用到

聊天功能不需要实时——用户发消息 → 等仓鼠回复 → 显示。没有多人同时聊天、不需要推送通知。但如果你做"两只仓鼠对话"或"多人聊天室"，Socket 就是必须的。

---

# Week 2-3: 进阶主题

## 10. Advanced CSS

### CSS Combinators（组合选择器）

| 选择器   | 写法    | 匹配                   |
| -------- | ------- | ---------------------- |
| 后代     | `A B`   | A 里面所有 B           |
| 子代     | `A > B` | A 的直接子 B           |
| 相邻兄弟 | `A + B` | A 后面紧挨着的第一个 B |
| 通用兄弟 | `A ~ B` | A 后面所有 B           |

### Grid 布局

Flexbox 是**一维**的（要么行要么列）。Grid 是**二维**的（同时控制行和列）：

```css
.container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr; /* 3 列，中间宽 */
  gap: 20px;
}
```

### CSS Animations

```css
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.card {
  animation: fadeIn 0.5s ease-out;
}
```

`transform` 和 `opacity` 是性能最好的动画属性——它们只触发 GPU Composite，不触发 Layout（重排）。

### 响应式设计

```css
@media screen and (max-width: 768px) {
  .row {
    flex-direction: column;
  }
}
```

桌面端横向排列，移动端纵向堆叠。关键单位：`rem`（相对根字体）、`vw/vh`（视口百分比）。

### Tailwind CSS

Utility-first 框架——每个 class 对应一个 CSS 属性：

```html
<div class="flex gap-4 p-6 bg-white rounded-xl shadow-md">
  <h2 class="text-2xl font-bold text-orange-600">Boba</h2>
</div>
```

优点：不用在 HTML 和 CSS 文件之间来回切换，开发快。编译器会自动删除没用到的 class（bundle 很小）。

### Hamster Daily 的 CSS 策略

我们用的是**纯 CSS（非 Tailwind）**——自己写的 class 名、CSS Variables 管理颜色、Flexbox 布局、`@keyframes` 动画、`@media` 响应式。

**实战踩坑：CSS 覆盖顺序。** 喂食区有一个"最爱食物"的金色边框（`.food-fav { border-color: #fcd34d; }`），但一直不生效。原因：`.food-item` 和 `.food-fav` 的 specificity 相同，而 `.food-item` 在 CSS 文件中写在后面，覆盖了前者。**解决方案：** 改成 `.food-item.food-fav` 提高 specificity，或者把 `.food-fav` 声明移到 `.food-item` 后面。这个 bug 花了 3 轮迭代才发现——CSS 的"后来居上"规则在单文件开发时很容易踩。

---

## 11. TypeScript

### JavaScript 的问题

```js
const hamster = { name: "Boba" };
console.log(hamster.age.length); //  运行时崩溃
// TypeError: Cannot read properties of undefined (reading 'length')
```

JavaScript 不检查类型——你写错了，用户打开页面才崩溃。

### TypeScript 的解决方案

在写代码时就检查类型：

```ts
type Hamster = {
  name: string;
  age: number;
  hobby?: string; // ? = 可选
};

const greet = (hamster: Hamster): string => {
  return `${hamster.name} is ${hamster.age} months old`;
};

greet({ name: "Boba" }); // 编译错误：缺少 age
```

**关键优势：**

- 拼写错误、类型错误在**编译时**就发现——不用等用户踩雷
- React 中 props 有类型保护——不会传错 props
- 可以**渐进式采用**——一个文件一个文件地加，不影响已有 JS 代码

### 为什么 Hamster Daily 没用 TypeScript

初期为了降低复杂度——教程项目先保证能跑。但如果你要把它做成真正的产品，TypeScript 是第一步要加的东西。

---

## 12. 关系型数据库（SQL）

### 什么时候 MongoDB 不够用

MongoDB 擅长存"独立的文档"。但当数据之间关系复杂时，SQL 更合适：

- "Sasha 关注了哪些人？这些人的最新帖子是什么？" → MongoDB 需要多次查询 + 代码拼接；SQL 一条 JOIN 搞定
- 关注者列表不断增长 → MongoDB 文档可能超过 16MB 限制

### SQL 基本语法

```sql
-- 读：JOIN 连接两个表
SELECT content, username
FROM stories
JOIN users ON users.user_id = stories.author_id
WHERE created_at > '2026-01-01'
ORDER BY created_at DESC
LIMIT 10;

-- 增删改
INSERT INTO stories (author_id, content) VALUES (1, 'Hello!');
UPDATE users SET username = 'new_name' WHERE user_id = 1;
DELETE FROM follows WHERE follower_id = 1 AND following_id = 2;
```

**原则：WHERE 子句永远不要省略**——没有 WHERE 的 UPDATE/DELETE 会清空整张表。

### 关键概念

- **Primary Key:** 每行的唯一 ID
- **Foreign Key:** 指向另一张表的 Primary Key
- **JOIN:** 把两张表按关联字段拼成一张临时表
- **Clause 顺序（必须遵守）：** `SELECT → FROM → JOIN → WHERE → ORDER BY → LIMIT`

---

---

# Week 4: 部署与运维

## 13. Docker（容器化）

### "我电脑上能跑啊"问题

你的电脑装了 Node 18，服务器上是 Node 16。你的电脑是 macOS，服务器是 Linux。你装了一个全局依赖，别人没有。

Docker 把**应用 + 所有依赖 + 甚至操作系统的一部分**打包成一个"容器"——在任何机器上运行结果都一样。

### 核心概念

| 术语           | 解释                                |
| -------------- | ----------------------------------- |
| **Dockerfile** | 菜谱——如何构建镜像的指令            |
| **Image**      | 做好的菜——包含代码、依赖、运行时    |
| **Container**  | 正在被吃的菜——正在运行的 Image 实例 |

### Multi-Stage Build（多阶段构建）

```dockerfile
# 阶段 1：构建（重武器——有编译器和 dev 工具）
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

# 阶段 2：运行（轻量——只有生产依赖）
FROM node:18-slim
COPY --from=builder /app/dist ./dist
COPY package.json ./
RUN npm ci --omit-dev
CMD ["node", "server/index.js"]
```

第 1 阶段负责编译 React 代码（重），第 2 阶段只保留必要的运行文件（轻）。最终镜像小很多。

### Hamster Daily 暂未 Docker 化

目前手动 `npm run dev` + `node server/index.js` 启动两个进程。Docker 化后可以用一个命令启动整个应用，部署也更方便。

---

## 14. 部署（Deployment）

### localhost vs 真正的网址

`localhost:5173` — 只有你的电脑能访问。

要让全世界访问，需要把代码放到一台**公网服务器**上。web.lab 用的是 **Render**（render.com，有免费层）。

### 部署的核心问题

1. **前端（React）需要 build。** Vite 把 JSX、CSS、图片编译成纯静态文件（HTML + CSS + JS bundle）
2. **后端（Express）需要在服务器上一直跑。** 不是你的笔记本，是 Render 的服务器
3. **环境变量不能公开。** `.env` 被 gitignore 了，要在 Render Dashboard 里手动设置 `MONGO_SRV`、`LLM_API_KEY`
4. **每次 `git push` 自动重新部署。** 写完推上去就更新

### Render 部署清单

```
1. GitHub 仓库连接 Render
2. Build Command: npm run build
3. Start Command: npm start
4. Root Directory: workshop
5. Environment Variables: MONGO_SRV, LLM_API_KEY, LLM_BASE_URL, LLM_MODEL
6. MongoDB Atlas → Network Access → 0.0.0.0/0 (允许 Render 的 IP)
7. 部署 → https://hamster-daily.onrender.com
```

### 部署常见问题

**`vite: not found`。** Render 默认 `NODE_ENV=production`，`npm install` 跳过 `devDependencies`。如 Vite 放在 `devDependencies` 中，构建会失败。**处理：** 把 `vite` 和 `@vitejs/plugin-react` 移到 `dependencies`。

**MongoDB 连接被拒。** Atlas 默认仅允许白名单 IP 访问。Render 服务器的出口 IP 不在白名单中时，会报 SSL 错误。**处理：** Atlas → Network Access → 添加 `0.0.0.0/0`（开发阶段可放宽；生产环境建议限定 Render 的出口 IP 范围）。

### 异步请求的顺序

Memory 接口的访问计数和实际对话中仓鼠引用的数字可能不一致。原因是 `POST /api/visit`（记录访问）和 `GET /api/memory`（读取记忆）并发发出——写操作尚未完成，读操作已返回旧值。**处理：** 将两个请求串行——等待 visit 完成后再读取 memory，保证写入在前、读取在后。

---

## 15. 未来：LLM 集成与 AI Agent

### 从"关键词匹配"到"LLM Chat"

Hamster Daily 的聊天功能经历了三个阶段：

**阶段 1：** 关键词匹配——`if (message.includes('hello')) return 'Hi!'`
**阶段 2：** JMAPI（OpenAI 兼容）——每只仓鼠有自己的 System Prompt，LLM 理解上下文
**阶段 3（计划中）：** Full Agent —— 仓鼠记住你们的全部历史，有自己的情绪周期

### System Prompt 的设计

```js
function buildSystemPrompt(hamster, memory) {
  return `You are ${hamster.name}, a hamster.
Personality: ${hamster.personality}
Favorite food: ${hamster.favouriteFood}
Catchphrase: "${hamster.catchphrase}"

Your memory with this human:
- They have visited you ${memory.visitCount} times.
- They have fed you ${memory.totalFeeds} times.
- Last visit: ${daysAgo} days ago.

Rules: stay in character, keep replies short and cute.`;
}
```

这就是"Prompt Engineering"——通过精心设计的 System Prompt，让 LLM"扮演"一个特定角色。加上 Memory 数据，仓鼠就能引用过去的事。

### Provider 模式：两层封装，一行切换

Hamster Daily 的 LLM 调用做了两层抽象——`chatService` 负责"说什么"（Business Logic），`llmProvider` 负责"找谁说"（API Adapter）。

```
chatService.js                    llmProvider.js
┌─────────────────────┐          ┌──────────────────────┐
│ buildSystemPrompt() │          │ chat(messages)       │
│ buildMessages()     │──调用──→  │                      │
│ generateReply()     │          │ OpenAI SDK           │
│                     │          │ → JMAPI / DeepSeek   │
│ 知道仓鼠的性格      │          │ 不知道仓鼠是什么     │
└─────────────────────┘          └──────────────────────┘
```

`llmProvider.js` 只暴露一个函数 `chat(messages)`，不关心仓鼠、System Prompt 或业务逻辑。它只做一件事：收 messages → 调 API → 返回 assistant reply。

**切换 LLM 只需要改 `.env`：**

```bash
# JMAPI（当前使用）
LLM_API_KEY=sk-...
LLM_BASE_URL=https://jmapi.jaguarmicro.com/v1
LLM_MODEL=deepseek-v4-pro

# 换成 DeepSeek
LLM_BASE_URL=https://api.deepseek.com/v1
LLM_MODEL=deepseek-chat

# 换成 OpenAI
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-3.5-turbo

# 换成 Claude（需要 Anthropic SDK，但架构相同）
LLM_BASE_URL=https://api.anthropic.com/v1
LLM_MODEL=claude-3-5-sonnet-20241022
```

一次配置，代码零改动。这就是 Provider 模式的价值——把"调用哪个 AI"从"怎么让仓鼠说话"中解耦。

### Prompt Engineering：让 AI 演好角色

Prompt Engineering 不是"写一句话就行了"。Hamster Daily 的实践中有几个关键策略：

**1. 角色定义要具体，不是抽象。**

```
❌ "You are a cute hamster."
✅ "You are Boba, a 6-month-old hamster. Your personality is Gluttonous.
    You have loved food since birth — your cheeks once held 47 sunflower seeds."
```

具体的数据（年龄、性格、经历）比笼统的形容词更能让 LLM 稳定地扮演角色。

**2. 用规则约束行为，而不是期望 LLM "理解"。**

```
❌ "Be cute."
✅ "- Keep replies to 1-3 sentences.
   - Wrap physical actions in parentheses like (squeaks) or (runs on wheel).
   - NEVER use *asterisks* for actions."
```

越是明确的正反例，LLM 越不容易跑偏。我们在 System Prompt 里同时写了"用括号"和"不用星号"，因为单独写一条 LLM 有时会忽略。

**3. 注入记忆数据让对话有连续性。**

仓鼠能说"你上周来看过我 3 次"而不是每次都像第一次见面——因为 `buildSystemPrompt()` 里拼入了 `memory.visitCount` 和 `lastVisit`。

### Memory：让 Agent 记住你

Memory 不只是"存数据"——它是 Agent 的长期记忆系统。Hamster Daily 实现了三层记忆：

| 层级         | 数据               | 存在哪                              | 作用                                     |
| ------------ | ------------------ | ----------------------------------- | ---------------------------------------- |
| **短期**     | 最近 6 条对话      | `conversations` collection          | 聊天上下文，LLM 知道刚才聊了什么         |
| **长期**     | 访问次数、喂食次数 | `hamster_memory` collection         | System Prompt 注入，仓鼠记得"你来过几次" |
| **用户身份** | UUID               | `localStorage` + `users` collection | 跨设备同步，换浏览器数据不丢             |

**短期 + 长期记忆的组合**是当前 AI Agent 的主流方案——短期记忆让对话连贯，长期记忆让 Agent 跨越多次对话记住你。

### Tool Calling：让 Agent 能"做事"

目前的仓鼠只能"说话"——它不能检查当前时间、不能查询天气、不能自己决定喂什么。Tool Calling（也叫 Function Calling）让 LLM 可以调用你的代码：

```js
// 定义"工具"：仓鼠可以调用的函数
const tools = [
  {
    name: "get_current_time",
    description: "Get the current time so I know if it's day or night.",
  },
  {
    name: "get_feeding_stats",
    description: "Check how many times this human has fed me today.",
  },
];

// LLM 的回复不再是纯文本，而是：
// "我想告诉你现在几点" → LLM 返回 function_call: get_current_time
// → 你的代码执行 get_current_time() → "现在是下午 3 点"
// → LLM 说："(runs on wheel excitedly) It's 3pm! Snack time!!"
```

**流程：** User message → LLM decides "I need tool X" → Your code runs tool X → Result fed back to LLM → Final reply

Hamster Daily 目前没有实现 Tool Calling，但这是从"聊天机器人"升级到"Agent"的关键一步——让仓鼠不只是说话，而是能**主动获取信息并做出反应**。

### RAG：让 Agent 能"查资料"

RAG（Retrieval Augmented Generation）= 在调用 LLM 之前，先从你的知识库里搜索相关内容，一起发给 LLM。

**对于仓鼠项目：** 如果有一个"仓鼠知识库"（喂养指南、常见问题），用户问"Boba 能吃葡萄吗？"时，系统先搜索知识库找到答案，再让 LLM 用 Boba 的口吻说出来：

```
User: "Boba, can I feed you grapes?"
  ↓
RAG: search("grapes") → "Hamsters should NOT eat grapes. They are toxic."
  ↓
LLM with RAG context: "(backs away slowly) NO GRAPES!! Those are DANGEROUS
for hamsters!! Please stick to sunflower seeds!!"
```

**和 Memory 的区别：** Memory = "关于这个用户的事"（你来过几次）；RAG = "关于这个世界的事"（仓鼠能吃什么）。

**技术方案（如果以后实现）：** 最简单的 RAG 不需要向量数据库——把仓鼠饲养 FAQ 存成文本文件，用户消息来时做关键词匹配，匹配到的内容拼进 System Prompt。进阶版才需要 embeddings + 向量搜索。

### AI Agent 的成熟度路线

```
关键词匹配 ──→ LLM Chat ──→ + Memory ──→ + Tool Calling ──→ + RAG
 (done)       (done)       (done)        (next)            (future)
```

每一步都建立在前面所有步骤之上。Hamster Daily 目前完成了前三步——距离一个"真正的" AI Agent，还差 Tool Calling 和 RAG。

---

## 实战项目结构

```
workshop/
├── index.html                  ← Vite 入口
├── package.json                ← 项目依赖
├── vite.config.js              ← Vite 配置 + /api 代理
├── .env                        ← 密钥（github 不上传）
├── public/hamsters/            ← 仓鼠照片
├── server/
│   ├── index.js                ← Express API 路由
│   ├── db/database.js          ← MongoDB 连接
│   ├── models/                 ← Mongoose Schema
│   ├── services/               ← 业务逻辑
│   └── providers/              ← LLM 封装
└── src/
    ├── main.jsx                ← React 入口
    ├── App.jsx                 ← 路由
    ├── pages/                  ← HomePage, HamsterPage
    ├── components/             ← Navbar, Feed, FoodTray, ChatBox...
    ├── data/hamsters.js        ← 前端仓鼠数据
    ├── utils/user.js           ← UUID 身份系统
    └── styles.css              ← 所有样式
```

---

## 关键概念速查表

| 概念              | 一句话                           | 在哪章 |
| ----------------- | -------------------------------- | :----: |
| HTML/CSS          | 结构和样式，盒模型，Flexbox      |   1    |
| JS 异步           | Promise, async/await——"等但不卡" |   2    |
| React Component   | 可复用的 UI 块，函数返回 JSX     |   3    |
| Props vs State    | Props 往下传，State 留在组件里   |   3    |
| useState          | 组件级状态管理器                 |   3    |
| useEffect         | 渲染后执行副作用（API、定时器）  |   3    |
| React Router      | 前端多页面，不刷新跳转           |   4    |
| HTTP              | 前端和后端的通信协议             |   5    |
| API               | 服务器暴露的 URL 端点            |   5    |
| Express           | Node.js 的 Web 服务器框架        |   6    |
| Middleware        | 请求处理的流水线                 |   6    |
| MongoDB           | NoSQL 文档数据库，灵活 Schema    |   7    |
| Mongoose          | MongoDB 的 Schema 层             |   7    |
| Auth              | 你是谁 + 能做什么，哈希密码      |   8    |
| Session/JWT       | 保持登录状态的两种方式           |   8    |
| WebSocket         | 服务器主动推送                   |   9    |
| CSS Grid          | 二维布局系统                     |   10   |
| CSS Animation     | @keyframes + transform           |   10   |
| Tailwind          | Utility-first CSS 框架           |   10   |
| TypeScript        | 有类型的 JavaScript              |   11   |
| SQL               | 关系型数据库，JOIN 查询          |   12   |
| Docker            | 容器化，"哪里都能跑"             |   13   |
| Render            | 一键部署平台                     |   14   |
| LLM System Prompt | 让 AI 扮演角色的指令             |   15   |
