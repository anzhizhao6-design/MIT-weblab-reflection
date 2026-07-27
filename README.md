# Hamster Daily — Edge Extension

> Bring your daily hamster to the browser sidebar. One click, instant serotonin.

## Why This Exists

The [main site](https://hamster-daily.onrender.com) is great, but you have to switch tabs. This extension puts the hamster in your sidebar — 350px wide, always one click away. Feed, chat, and check your daily hamster without leaving your current page.

### Shared Architecture with Main

```
┌─────────────────┐     ┌──────────────────┐
│  Website (main)  │     │  Extension        │
│  React + Vite    │     │  React + Vite     │
│  port 3000       │     │  sidePanel API    │
└───────┬─────────┘     └────────┬─────────┘
        │   Shared API            │   Shared API
        └──────────┬─────────────┘
                   ▼
        ┌──────────────────┐
        │  Backend (main)   │
        │  Express :3001    │
        │  MongoDB Atlas    │
        │  LLM API (JM)     │
        └──────────────────┘
```

**Shared:**
- **API** — `/api/hamsters/random`, `/api/chat`, `/api/visit`, `/api/feed`, `/api/memory`, `/api/users` (two endpoints added for the extension: `/api/hamsters/:name` and CORS middleware)
- **Database** — same MongoDB `hamster_main`. Feed counts, visits, and chat history sync in real time
- **userId** — Content Script reads the website's localStorage UUID and writes it to extension storage. Same identity on both platforms

**Different:**
- UI redesigned for 350px (2-column food grid, 4-message chat, 1 expandable diary entry)
- Loads only the current hamster, not all 12
- State preserved across sidebar open/close

## Installation

### Prerequisites
- Node.js ≥ 18
- [Backend](https://hamster-daily.onrender.com) running (deployed by default)

### Steps

```bash
# 1. Enter extension directory
cd extension

# 2. Install dependencies
npm install

# 3. Build
npm run build

# 4. Load in Edge
# edge://extensions/ → enable "Developer mode" → "Load unpacked" → select extension/ folder
```

### Usage

- Click the 🐹 icon in the toolbar to open the sidebar
- Open the [main site](https://hamster-daily.onrender.com) to auto-sync your userId
- Without the main site, the extension generates its own UUID (sync it later via the Account panel)

### Development

```bash
cd extension
npm run dev     # Vite dev server with hot reload
```

Then reload the extension in `edge://extensions/`.

## API Endpoints

All requests target `https://hamster-daily.onrender.com`:

| Endpoint | Method | Purpose | Extension-specific? |
|----------|--------|---------|-------------------|
| `/api/hamsters/random` | GET | Random hamster | No |
| `/api/hamsters/:name` | GET | Restore hamster by name | **Yes** (added for extension) |
| `/api/chat` | POST | Send chat message | No |
| `/api/visit` | POST | Record visit | No |
| `/api/feed` | POST | Record feed | No |
| `/api/memory` | GET | Query visit/feed counts | No |
| `/api/users` | POST | Register new user | No |

## Tech Stack

- **Frontend**: React 18 + Vite 5
- **Extension API**: Manifest V3 (sidePanel + storage + content scripts)
- **Backend**: Shared with main branch — Express + MongoDB + LLM API
- **Shared data**: `workshop/src/data/hamsters.js`, `foods.js`, `chatFallback.js` via Vite alias `@shared`

## Known Limitations

- **Render free tier sleep** — server hibernates after 15min of inactivity. Visit the [main site](https://hamster-daily.onrender.com) first to wake it
- **Content Script scope** — userId sync only triggers on `hamster-daily.onrender.com`
- **Fallback chat** — reverts to keyword matching when LLM API is unavailable (same behavior as the website)

## Links

- [Main site](https://hamster-daily.onrender.com)
- [Source code (main)](https://github.com/anzhizhao6-design/MIT-weblab-reflection)
- [Benchmark report](https://github.com/anzhizhao6-design/MIT-weblab-reflection/tree/main/benchmark)
