# Hamster Case Specification

> 每个 workflow 收到这份完全相同的 spec。不可修改。

---

## 项目背景

做一个"Today's Hamster"网站。用户每天打开网页能看到一只随机仓鼠，可以喂食、看日记、和它聊天，仓鼠会记住你的访问记录。

初始状态（`benchmark-baseline`）：一个纯 HTML/CSS 原型——两个圆角卡片 + 仓鼠 emoji。

---

## F1: HomePage + Random Hamster

**目标：** 项目能跑，两个页面，随机选仓鼠。

**验收标准：**
- React + Vite 项目启动成功（`npm run dev`）
- `/` 显示 HomePage：大圆角卡片，`home.jpg` 做背景，左边文字 "Meet Today's Hamster"，右边箭头 → 可点击
- `/hamster` 显示 HamsterPage：随机选一只仓鼠，展示照片（圆形）、名字、年龄、性格、食物、爱好、简介
- 12 只仓鼠数据文件，每只包含：`name, age, personality, favouriteFood, hobby, bio, image, catchphrase, moodBoost`
- "Visit Another" 按钮切换到另一只随机仓鼠
- 顶部导航栏：品牌名 "Hamster Daily" + Home + Today's Hamster 链接
- 移动端自动变为纵向堆叠布局

---

## F2: Feed + Food Tray + LLM Chat

**目标：** 仓鼠日记 + 交互式喂食 + 心情系统 + AI 聊天。

**验收标准：**
- **Diary:** "{name}'s Diary" 标题，3 条短帖子
- **Food Tray:** 12 个食物按钮（emoji + 名字），最爱食物有金色边框
- **Mood 系统:** hover 在不同食物上达到时限 → mood 下降 + 反应；点击最爱食物 → mood 按 `moodBoost` 升高 + 反应；心情进度条 0-100，分五档（Hungry → Overjoyed）；性格影响 moodBoost（Gluttonous +15、Shy +5、Picky +4 等）
- **Chat:** 聊天框（消息历史、用户气泡、仓鼠气泡）；通过 LLM API 生成回复（OpenAI 兼容）；每只仓鼠独立 System Prompt（性格/食物/爱好/口头禅）；对话历史上下文（最近 6 条）；输入为空时发送按钮禁用，Enter 键发送；API 不可用时退回关键词回复

---

## F3: Database + Persistent Memory

**目标：** 数据迁移到云数据库 + 仓鼠记住你。

**验收标准：**
- MongoDB Atlas 连接（Mongoose），集合：`hamsters, feed_posts, users, conversations, hamster_memory`
- `npm run db:seed` 导入 12 只仓鼠 + 36 条日记
- API 端点：`GET /api/hamsters/random`、`POST /api/chat`、`POST /api/visit`、`POST /api/feed`、`GET /api/memory`、`POST /api/users`、`GET /api/users/:id`
- `.env` 存储敏感信息（MONGO_SRV, LLM_API_KEY 等），`.gitignore` 排除 `.env`
- 每次访问记录一次 visit，每次喂食记录一次 feed
- Profile 卡片显示 "Visited X times" 和 "Fed X times"
- 聊天时仓鼠能引用记忆（System Prompt 注入访问/喂食数据）
- 浏览器 UUID 身份（localStorage）+ Account 面板（显示 ID、复制、粘贴切换设备）

---

## 全局约束

- JavaScript（非 TypeScript）
- React 18 + Vite + Express
- 无第三方认证库（UUID 自建）
- 所有密钥在 `.env`，不提交
- 移动端友好

---

## 6. Experiment Fixtures

### 6.1 Project Structure

- React application root: `workshop/`
- Asset directory: `workshop/public/hamsters/`
- The `workshop/` directory does not exist in the baseline — the Agent must create it
- Provided assets (13 files) must be placed in `workshop/public/hamsters/` before the experiment begins:
  - `home.jpg`
  - `Biscuit.jpg`, `Boba.jpg`, `Churro.jpg`, `Cookie.jpg`, `Dumpling.jpg`, `Maple.jpg`, `Mochi.jpg`, `Peanut.jpg`, `Pudding.jpg`, `Sesame.jpg`, `Snowball.jpg`, `Tofu.jpg`

### 6.2 Asset Rules

- All three workflows must use the same provided assets
- **If the provided asset file exists, it must be used.** Using a placeholder when the asset exists fails the asset criterion
- The placeholder (200×200 `#f0e6d3` solid color + 🐹 emoji centered) may only be used when the provided file is missing or unreadable
- **Forbidden**: web search, AI image generation, remote image URLs

### 6.3 12 Foods

Each food has a stable `id` for logic matching; `label` + `emoji` are for display:

| id | label | emoji |
|----|-------|-------|
| `sunflower-seeds` | Sunflower Seeds | 🌻 |
| `strawberries` | Strawberries | 🍓 |
| `broccoli` | Broccoli | 🥦 |
| `carrots` | Carrots | 🥕 |
| `apples` | Apples | 🍎 |
| `sweet-corn` | Sweet Corn | 🌽 |
| `peanuts` | Peanuts | 🥜 |
| `blueberries` | Blueberries | 🫐 |
| `sweet-potato` | Sweet Potato | 🍠 |
| `cinnamon-oats` | Cinnamon Oats | 🥣 |
| `cucumber` | Cucumber | 🥒 |
| `banana-chips` | Banana Chips | 🍌 |

Hamster `favouriteFood` is matched to a food by `id`, not by label string comparison.

### 6.4 Personality → moodBoost Mapping

Each hamster's `moodBoost` is derived **exclusively** from its `personality` field using this table. No other personality values are allowed.

| Personality | moodBoost | Hamsters |
|-------------|-----------|----------|
| Gluttonous 🍽️ | +15 | Boba, Sesame |
| Shy 😳 | +5 | Mochi, Pudding |
| Energetic ⚡ | +12 | Tofu |
| Chill 😌 | +8 | Dumpling, Snowball |
| Chaotic 💫 | +15 | Peanut, Churro |
| Picky 🤔 | +4 | Cookie, Maple |
| Friendly 🥰 | +12 | Biscuit |

---

## 7. F2 Fixed Rules

### 7.1 Mood System

- Mood range: **0–100**, clamped — values must never go below 0 or above 100
- **Initial mood: 50** for every hamster at the start of each session
- Eating favourite food: **+moodBoost** (derived from personality per §6.4)
- Eating non-favourite food: **+3**

### 7.2 Hover Penalty

- A food button applies a **-5 mood penalty once** after 2 continuous seconds of hover
- It must **not** apply repeatedly during the same hover session
- Leaving and re-entering the button starts a new hover session
- **Clicking or leaving the button before 2 seconds cancels the pending penalty** — no mood change occurs

### 7.3 Mood Levels

| Range | Level |
|-------|-------|
| 0–19 | Hungry 😡 |
| 20–39 | Sad 😢 |
| 40–59 | Neutral 😐 |
| 60–79 | Happy 😊 |
| 80–100 | Overjoyed 🤩 |

### 7.4 Fallback Chat (LLM API unavailable)

Fallback is triggered when any of these conditions occur:
- API key is missing
- Network error
- Request timeout (>10 seconds)
- API returns non-2xx status
- Response body is invalid or missing expected content

Matching rules:
- Case-insensitive
- Input is trimmed; leading/trailing spaces and punctuation are ignored
- Substring matching is used
- If multiple intents match, priority is: **food > play > mood > greeting > default**
- Fallback output must be **deterministic**: same hamster + same input always produces the same response

| Priority | Intent | Trigger substrings | Response template |
|----------|--------|--------------------|--------------------|
| 1 | food | food, eat, hungry, feed, 吃, 饿 | `"{name} loves {favouriteFood}! {catchphrase}"` |
| 2 | play | play, wheel, run, fun, 玩, 跑 | `"{name} spent all morning {hobby}. Best day!"` |
| 3 | mood | mood, happy, sad, how are you, feeling, 心情 | `"{name} is feeling {personality} today!"` |
| 4 | greeting | hello, hi, hey, good morning, 你好 | `"Oh! You're back! {name} missed you! {catchphrase}"` |
| 5 | default | *(anything else)* | `"{name} is busy {hobby} right now. Leave a seed and come back later!"` |

Template variables (`{name}`, `{favouriteFood}`, `{catchphrase}`, `{hobby}`, `{personality}`) are populated from the currently displayed hamster's data. The `{personality}` field includes the emoji (e.g., `"Shy 😳"`).

### 7.5 F2 Backend Boundary

- F2 introduces the Express backend required to proxy LLM requests
- The API key must **never** be exposed to frontend code — all LLM calls go through the backend
- F3 extends this backend with MongoDB persistence and user memory

---

## 8. F3 Environment

### 8.1 MongoDB

- All three workflows use the **same** MongoDB Atlas cluster
- Database name comes from an environment variable (`MONGODB_DB_NAME`) — **must not be hardcoded**
- Database names per workflow:
  - `hamster_superpowers`
  - `hamster_matt_skills`
  - `hamster_agent_skills`
- Each workflow starts with an empty database. Test data from previous runs must be cleared before the run begins
- Required collections: `hamsters`, `users`, `conversations`, `hamster_memories`, `feed_posts`

### 8.2 LLM API（Application — 仓鼠聊天功能）

This is the LLM used by the hamster chat feature, **not** the coding agent.

- Base URL: `https://jmapi.jaguarmicro.com/v1`
- Endpoint: `POST /chat/completions`（OpenAI-compatible）
- Model: `deepseek-v4-pro`
- API key environment variable: `LLM_API_KEY`
- Request timeout: **10 seconds**
- Response content path: `choices[0].message.content`

### 8.3 External Failure

- Network outage, API quota exhaustion, authentication failure, or Atlas outage is recorded as `external_failure` — **not** as an implementation bug
- The Agent may retry, but each external failure occurrence must be logged separately
