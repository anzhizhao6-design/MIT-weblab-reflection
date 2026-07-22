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
