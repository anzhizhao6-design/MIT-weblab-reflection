# Implementation Plan: Hamster Daily Edge Sidebar Extension

## Dependency Graph

```
Step 1: Backend endpoint ─────────────────────────┐
  GET /api/hamsters/:name                          │
                                                   │
Step 2: Extension scaffolding                      │
  ├── manifest.json                                │
  ├── service-worker.js                            │
  ├── icons/                                       │
  └── content-script.js                            │
                                                   │
Step 3: Vite build config ────────────────────────┤
  extension/vite.config.js                         │
  workshop/package.json (add scripts)              │
                                                   │
Step 4: Side panel HTML entry ────────────────────┤
  sidepanel/index.html                             │
  sidepanel/main.jsx                               │
                                                   │
Step 5: UI Components (parallel-able)              │
  ├── StatusOverlay.jsx + .css                     │
  ├── MoodBar.jsx + .css        (adapt from ws)   │
  ├── HamsterCard.jsx + .css                       │
  ├── ProfileCard.jsx + .css    (adapt from ws)   │
  ├── DiaryEntry.jsx + .css                        │
  ├── FoodTray.jsx + .css       (adapt from ws)   │
  └── ChatBox.jsx + .css        (adapt from ws)   │
                                                   │
Step 6: App.jsx + useHamster hook ─────────────────┘
  Wire components, API calls, state management
                                                   │
Step 7: Integration test
  Load in Edge, verify all acceptance criteria
```

## Implementation Order

### Step 1: Add `GET /api/hamsters/:name` to server/index.js
- **Why first**: Needed for state recovery before UI can work
- **What**: Add route that looks up hamster by name in MongoDB
- **Files**: `workshop/server/index.js`
- **Risk**: Low — one new route, no schema change

### Step 2: Extension scaffolding
- **Why second**: Foundation everything else runs on
- **What**: Create `extension/` with manifest.json, service-worker.js, content-script.js, icons
- **Files**: 4 new files
- **Risk**: Medium — manifest permissions must be correct for CSP + sidePanel

### Step 3: Vite build config
- **What**: `extension/vite.config.js` with React plugin, path aliases to workshop/src/data, copy public assets
- **Files**: 1 new + 1 modified (workshop/package.json)
- **Risk**: Low — standard Vite React config with aliases

### Step 4: Side panel HTML entry
- **What**: index.html + main.jsx (shim for React mount, no inline script)
- **Files**: 2 new
- **Risk**: Low

### Step 5: UI Components
- **What**: All 7 components + CSS files
- **Parallel**: Can build components independently since they have clear props interfaces
- **Adaptation strategy**: Start from workshop originals, strip/adapt for 350px, keep logic intact
- **Files**: ~14 files
- **Risk**: Low-Medium — CSS adaptation for narrow width is key

### Step 6: App.jsx + useHamster hook
- **What**: Root component wiring all pieces together, custom hook for data logic
- **Files**: 2 new
- **Risk**: Medium — state orchestration, API error handling, userId flow

### Step 7: Integration test
- **What**: Load in Edge, run through acceptance checklist
- **Risk**: Low — catch issues from earlier steps

## Key Technical Decisions

### How to share data files without copy-paste
Vite `resolve.alias` in extension's vite.config.js:
```js
resolve: {
  alias: {
    '@shared/hamsters': path.resolve(__dirname, '../workshop/src/data/hamsters.js'),
    '@shared/foods': path.resolve(__dirname, '../workshop/src/data/foods.js'),
    '@shared/chatFallback': path.resolve(__dirname, '../workshop/src/utils/chatFallback.js'),
  }
}
```

### How to handle hamster photos
- Hamster photos live in `workshop/public/hamsters/`
- Extension can't serve them at build time easily
- **Solution**: Hardcode `http://localhost:3001/hamsters/Biscuit.jpg` as base URL, or Vite `publicDir` copies from workshop/public/hamsters
- **Decision**: Use absolute URL to backend (`http://localhost:3001/hamsters/...`) since backend already serves these via Express static. Add `express.static` for public dir if not already there.

Actually, check: workshop server serves from Vite in dev mode (port 5173), backend is on 3001. Photos are in `workshop/public/hamsters/` served by Vite.
- **Better solution**: Add `express.static(path.join(__dirname, '..', 'public'))` to server/index.js so `localhost:3001/hamsters/Biscuit.jpg` works. This makes photos available to extension without depending on Vite dev server.

### userId persistence flow
```
Side Panel opens
  → Check sidepanel localStorage for cached userId
  → If found: use it
  → If not found:
      → Listen for message from content-script
      → If message received (userId from website): use + cache it
      → If no message within 500ms (user not on website):
          → POST /api/users with new UUID → cache it
  → Proceed to load hamster
```

### Mood state
- Each time side panel opens: mood resets to 50 (fresh start)
- FEED action: mood += amount (favourite=moodBoost, other=3), capped at 100
- HOVER_PENALTY: mood -= 5, floor at 0
- Same reducer as workshop/src/pages/HamsterPage.jsx

## Files to Create/Modify

| File | Action | Lines (est.) |
|------|--------|-------------|
| `extension/manifest.json` | CREATE | ~25 |
| `extension/service-worker.js` | CREATE | ~15 |
| `extension/content-script.js` | CREATE | ~20 |
| `extension/icons/icon-16.png` | CREATE | binary |
| `extension/icons/icon-48.png` | CREATE | binary |
| `extension/icons/icon-128.png` | CREATE | binary |
| `extension/vite.config.js` | CREATE | ~30 |
| `extension/sidepanel/index.html` | CREATE | ~12 |
| `extension/sidepanel/main.jsx` | CREATE | ~10 |
| `extension/sidepanel/App.jsx` | CREATE | ~120 |
| `extension/sidepanel/App.css` | CREATE | ~60 |
| `extension/sidepanel/hooks/useHamster.js` | CREATE | ~80 |
| `extension/sidepanel/components/StatusOverlay.jsx` | CREATE | ~25 |
| `extension/sidepanel/components/StatusOverlay.css` | CREATE | ~25 |
| `extension/sidepanel/components/HamsterCard.jsx` | CREATE | ~50 |
| `extension/sidepanel/components/HamsterCard.css` | CREATE | ~50 |
| `extension/sidepanel/components/MoodBar.jsx` | CREATE | ~40 |
| `extension/sidepanel/components/MoodBar.css` | CREATE | ~30 |
| `extension/sidepanel/components/FoodTray.jsx` | CREATE | ~100 |
| `extension/sidepanel/components/FoodTray.css` | CREATE | ~50 |
| `extension/sidepanel/components/ChatBox.jsx` | CREATE | ~100 |
| `extension/sidepanel/components/ChatBox.css` | CREATE | ~60 |
| `extension/sidepanel/components/DiaryEntry.jsx` | CREATE | ~40 |
| `extension/sidepanel/components/DiaryEntry.css` | CREATE | ~25 |
| `extension/sidepanel/components/ProfileCard.jsx` | CREATE | ~35 |
| `extension/sidepanel/components/ProfileCard.css` | CREATE | ~25 |
| `workshop/server/index.js` | MODIFY | +8 |
| `workshop/package.json` | MODIFY | +3 |

