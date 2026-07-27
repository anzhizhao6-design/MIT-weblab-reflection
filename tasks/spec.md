# Spec: Hamster Daily Edge Sidebar Extension

## Objective

将 Hamster Daily 核心体验（随机仓鼠、喂食、聊天）搬到 Edge 浏览器侧边栏。用户点击工具栏图标即可在 ~350px 侧边栏中与今天的仓鼠互动，数据和全屏网站共享同一 MongoDB 后端。

**User Story:**
- 用户在浏览任意网页时，点击工具栏图标 → 侧边栏滑出 → 看到一只随机仓鼠
- 用户可以喂食、看心情变化、和仓鼠聊天
- 访问/喂食计数与 Hamster Daily 网站同步
- 下次打开侧边栏，还是同一只仓鼠（状态保持）

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Extension Framework | Edge Chromium MV3 (compatible Chrome MV3) |
| Side Panel UI | React 18 (独立 bundle，Vite 构建) |
| Data Files | 复用 `workshop/src/data/hamsters.js`, `foods.js`, `utils/chatFallback.js` |
| Backend | 复用 `workshop/server/` (Express + MongoDB + LLM proxy) |
| Backend URL | `http://localhost:3001` |

## Commands

```bash
# Start backend + full website (from workshop/)
npm run dev

# Build extension side panel (from workshop/)
npm run build:extension

# Start extension dev server (from workshop/)
npm run dev:extension

# Load extension in Edge:
# 1. Open edge://extensions/
# 2. Enable "Developer mode"
# 3. "Load unpacked" → select extension/dist/ folder
```

## Project Structure

```
extension/                          # Edge extension root
├── manifest.json                   # MV3 manifest (sidePanel, storage, activeTab)
├── service-worker.js               # Side panel open/close handler
├── content-script.js               # Read userId from Hamster Daily page localStorage
├── sidepanel/                      # Side panel React app
│   ├── index.html                  # Entry HTML (no inline script per CSP)
│   ├── main.jsx                    # React mount point
│   ├── App.jsx                     # Root component (API status check, hamster fetch)
│   ├── App.css                     # Global styles (max-width: 350px)
│   ├── hooks/
│   │   └── useHamster.js           # Custom hook: fetch, mood, feed, visit logic
│   └── components/
│       ├── HamsterCard.jsx         # Photo (120px circle) + name + personality + mood bar
│       ├── HamsterCard.css
│       ├── MoodBar.jsx             # Adapted from workshop (narrower)
│       ├── MoodBar.css
│       ├── FoodTray.jsx            # 2-column grid, smaller buttons
│       ├── FoodTray.css
│       ├── ChatBox.jsx             # 4 recent messages, shorter input
│       ├── ChatBox.css
│       ├── DiaryEntry.jsx          # Latest 1 entry, expandable
│       ├── DiaryEntry.css
│       ├── ProfileCard.jsx         # Visit/Fed counts
│       ├── ProfileCard.css
│       ├── StatusOverlay.jsx       # Loading / backend-down / error states
│       └── StatusOverlay.css
├── shared/                         # Symlinks or import aliases to workshop/src
│   ├── hamsters.js → ../../workshop/src/data/hamsters.js
│   ├── foods.js → ../../workshop/src/data/foods.js
│   └── chatFallback.js → ../../workshop/src/utils/chatFallback.js
├── icons/                          # Extension toolbar icons
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── dist/                           # Build output (loaded into Edge)
```

## Architecture & Data Flow

```
┌──────────────────────────────────────────────────────────┐
│  Edge Browser                                            │
│                                                          │
│  ┌─────────────┐    chrome.runtime     ┌──────────────┐ │
│  │ Service      │◄────────────────────►│ Side Panel   │ │
│  │ Worker       │   sendMessage        │ (React App)  │ │
│  │              │                      │              │ │
│  │ - toolbar    │                      │ - HamsterCard│ │
│  │   onClick →  │                      │ - FoodTray   │ │
│  │   openSide   │                      │ - ChatBox    │ │
│  │   Panel()    │                      │ - MoodBar    │ │
│  └─────────────┘                      │ - DiaryEntry │ │
│                                        │ - ProfileCard│ │
│                                        └──────┬───────┘ │
│                                               │          │
│  ┌─────────────┐                              │          │
│  │ Content      │   chrome.runtime             │          │
│  │ Script       │──sendMessage────────►       │          │
│  │              │   {userId: "xxx"}           │          │
│  │ - runs on    │                              │          │
│  │   localhost   │                             │          │
│  │   :3000      │                              │          │
│  └─────────────┘                              │          │
│                                               │          │
└───────────────────────────────────────────────┼──────────┘
                                                │
                                    fetch() to localhost:3001
                                                │
                        ┌───────────────────────▼──────────┐
                        │  Backend (localhost:3001)         │
                        │  - /api/hamsters/random           │
                        │  - /api/visit                     │
                        │  - /api/feed                      │
                        │  - /api/memory                    │
                        │  - /api/chat                      │
                        │  - /api/conversations             │
                        └───────────────────────────────────┘
```

### userId 共享流程（方案 A）

1. Content Script 注入到 `localhost:3000`（Hamster Daily 网站页面）
2. Content Script 读取 `window.localStorage` 中的 userId
3. 通过 `chrome.runtime.sendMessage({type: 'USER_ID', userId})` 发送
4. Service Worker 转发给 Side Panel
5. Side Panel 收到后存入自己的 `localStorage` 作为 fallback
6. 如果用户没打开网站，Side Panel 使用自己 localStorage 中缓存的 userId
7. 如果完全没有 userId，Side Panel 调用 `/api/users` 创建新的并缓存

### 状态保持

- Side Panel 关闭时 React 状态会丢失（panel 页面被卸载）
- 解决方案：**仓鼠名存到 side panel 的 localStorage**
- 重新打开时：如果 localStorage 有仓鼠名 → 直接 fetch 该仓鼠数据；如果没有 → fetch random
- Mood 重置为 50（每次打开重新开始）
- Chat 消息从 `/api/conversations` 恢复最近 4 条

## UI Layout (~350px wide)

```
┌──────────────────────────────────┐
│  🐹 Hamster Daily                │  ← header
├──────────────────────────────────┤
│       ┌──────────┐               │
│       │  🐹      │               │  ← 120px circle photo
│       │  Photo   │               │
│       └──────────┘               │
│        Biscuit                   │  ← name
│     Friendly 🥰                  │  ← personality
│  ═══════════════════             │  ← mood bar
│  ████████░░░░░░░░░ 72/100       │
│     🥕 Favourite: Carrots       │
├──────────────────────────────────┤
│  👣 Visited 5 times  🍽️ Fed 3  │  ← ProfileCard
├──────────────────────────────────┤
│  📖 Latest Diary                  │
│  ▸ "Practiced my welcome..."    │  ← expandable
├──────────────────────────────────┤
│  🍽️ Food Tray                   │
│  ┌──────────┬──────────┐        │
│  │ 🌻 Seeds │ 🍓 Berry │        │  ← 2-col grid
│  ├──────────┼──────────┤        │
│  │ 🥦 Broc  │ 🥕 Carrot│        │
│  ├──────────┼──────────┤        │
│  │ ...      │ ...      │        │
│  └──────────┴──────────┘        │
│  "Biscuit loves Carrots! 😍"    │  ← reaction text
├──────────────────────────────────┤
│  💬 Chat                         │
│  ┌──────────────────────────┐   │
│  │ Hamster: Welcome friend! │   │  ← max 4 messages
│  │ You: Hi!                 │   │
│  └──────────────────────────┘   │
│  ┌──────────────────┬──────┐   │
│  │ Message...       │ Send │   │  ← compact input
│  └──────────────────┴──────┘   │
├──────────────────────────────────┤
│     [Visit Another Hamster]     │
└──────────────────────────────────┘
```

## API Endpoints (Reused)

All fetches go to `http://localhost:3001`:

| Method | Endpoint | Use |
|--------|----------|-----|
| GET | `/api/hamsters/random` | Fetch random hamster + `/api/hamsters/:name` for specific |
| POST | `/api/users` | Ensure userId exists |
| GET | `/api/users/:id` | Get user stats |
| POST | `/api/visit` | Record visit (body: `{userId, hamsterName}`) |
| POST | `/api/feed` | Record feed (body: `{userId, hamsterName, foodId, isFavourite, moodChange}`) |
| GET | `/api/memory` | Get visit/feed counts (query: `?userId=&hamsterName=`) |
| POST | `/api/chat` | LLM chat (body: `{messages, hamster, userId}`) |
| POST | `/api/conversations` | Save chat to DB |

**Note:** Need to add a new endpoint or modify `/api/hamsters/random` to accept `?name=` to fetch a specific hamster by name. Currently the API only supports random via aggregation. Alternatively, add `GET /api/hamsters/:name`.

## Code Style

Follow existing workshop conventions:

- React functional components with hooks
- CSS modules via separate `.css` files (matching existing pattern)
- `useCallback` for event handlers passed as props
- `useReducer` for mood state (same reducer as workshop)
- Fetch API with try/catch, no axios

Naming: PascalCase components, camelCase functions, kebab-case CSS classes.

## Testing Strategy

### Manual Test Checklist (per component)

1. **Load extension**: Edge `edge://extensions/` → Load Unpacked → verify icon appears
2. **Open side panel**: Click icon → side panel opens ~350px wide
3. **Hamster display**: Photo shows (120px circle), name, personality, mood bar at 50
4. **Backend down**: Stop server → open side panel → shows "Please start the server (npm run dev)" not white screen
5. **Feed**: Click food → mood changes correctly (favourite = moodBoost, other = +3)
6. **Hover penalty**: Hover food 2s → mood -5
7. **Chat LLM**: Type message → LLM replies in character
8. **Chat fallback**: Stop LLM → chat still works with fallback responses
9. **Visit count**: Open side panel → refresh website → visit count incremented on both
10. **Feed count**: Feed in side panel → refresh website → feed count synced
11. **State persistence**: Close side panel → reopen → same hamster (name persisted)
12. **Narrow layout**: No horizontal scrollbar at 350px width
13. **Diary expand**: Click latest diary → expands to show full content
14. **Visit Another**: Click button → new random hamster loads

## Boundaries

### Always do:
- All JS in external files (no inline script per CSP)
- All API calls to `http://localhost:3001` declared in manifest `host_permissions`
- Fetch with loading/error/empty states
- Use existing workshop data files via path aliases (don't copy-paste)
- Test each component manually after writing

### Ask first:
- Adding new npm dependencies
- Modifying workshop/server/ code
- Changing the manifest permissions set
- Adding new API endpoints

### Never do:
- Expose API keys in extension code
- Use `innerHTML` or `eval`
- Hardcode user data
- Assume the backend is always running
- Use inline event handlers (`onclick="..."` in HTML)

## Success Criteria

1. Edge loads extension without errors in `edge://extensions/`
2. Clicking toolbar icon opens ~350px side panel with hamster
3. Hamster photo is 120px circle, name + personality + mood bar visible
4. Food tray is 2-column grid, each button clickable, mood changes per spec
5. Chat works (LLM or fallback), shows max 4 recent messages
6. Visit/Fed counts display and increment across side panel and website
7. Diary shows latest 1 entry, expandable on click
8. Closing and reopening side panel preserves the same hamster
9. Backend-down state shows friendly message, not white screen
10. No horizontal scrollbar at 350px width
11. No CSP violations in console

## Open Questions

- ~~userId 共享机制？~~ → 方案 A (Content Script 桥接)
- 是否需要 `GET /api/hamsters/:name` 新端点？→ 需要，用于按名查询仓鼠（状态恢复时用）
- 扩展 icons 用哪个？→ 用现有 public/hamsters/home.jpg 生成各尺寸 icon
