# Tasks: Hamster Daily Edge Sidebar Extension

- [ ] **Task 1: Add GET /api/hamsters/:name endpoint**
  - Acceptance: `GET /api/hamsters/Biscuit` returns Biscuit's full hamster document from MongoDB
  - Verify: `curl http://localhost:3001/api/hamsters/Biscuit`
  - Files: `workshop/server/index.js`

- [ ] **Task 2: Add express.static for photos + build:extension scripts**
  - Acceptance: `localhost:3001/hamsters/Biscuit.jpg` serves the image; `npm run build:extension` builds successfully
  - Verify: `curl -I http://localhost:3001/hamsters/Biscuit.jpg` → 200
  - Files: `workshop/server/index.js`, `workshop/package.json`

- [ ] **Task 3: Extension scaffolding (manifest, service worker, icons)**
  - Acceptance: Extension loads in Edge without errors; clicking icon opens empty side panel
  - Verify: `edge://extensions/` → Load Unpacked → no error
  - Files: `extension/manifest.json`, `extension/service-worker.js`, `extension/icons/`

- [ ] **Task 4: Content script for userId bridge**
  - Acceptance: When Hamster Daily website is open, content script reads localStorage userId and sends via runtime message
  - Verify: Console log in service worker shows received userId
  - Files: `extension/content-script.js`

- [ ] **Task 5: Vite build config for side panel**
  - Acceptance: `npm run build:extension` builds React app into `extension/dist/` with correct aliases
  - Verify: Build succeeds, output in extension/dist/
  - Files: `extension/vite.config.js`

- [ ] **Task 6: Side panel entry HTML + main.jsx**
  - Acceptance: index.html loads main.jsx, renders React root, no inline script
  - Verify: Build output has no inline <script> in HTML
  - Files: `extension/sidepanel/index.html`, `extension/sidepanel/main.jsx`

- [ ] **Task 7: StatusOverlay component**
  - Acceptance: Shows loading spinner, backend-down message, or error message based on props
  - Verify: Pass different status props, check rendering
  - Files: `extension/sidepanel/components/StatusOverlay.jsx`, `.css`

- [ ] **Task 8: MoodBar component (adapt from workshop)**
  - Acceptance: Renders mood bar with correct color/label, fits 350px width
  - Verify: Pass mood values 0-100, check 5 mood levels render correctly
  - Files: `extension/sidepanel/components/MoodBar.jsx`, `.css`

- [ ] **Task 9: HamsterCard component**
  - Acceptance: 120px circle photo, name, personality, mood bar, favourite food — all visible at 350px
  - Verify: Render with dummy hamster data, check no horizontal overflow
  - Files: `extension/sidepanel/components/HamsterCard.jsx`, `.css`

- [ ] **Task 10: ProfileCard component**
  - Acceptance: Shows "Visited X times" and "Fed X times", fetches from /api/memory
  - Verify: Render with mock userId + hamsterName, check API call fires
  - Files: `extension/sidepanel/components/ProfileCard.jsx`, `.css`

- [ ] **Task 11: DiaryEntry component**
  - Acceptance: Shows latest 1 diary entry, expandable/collapsible on click
  - Verify: Click to expand, click to collapse
  - Files: `extension/sidepanel/components/DiaryEntry.jsx`, `.css`

- [ ] **Task 12: FoodTray component (adapt from workshop)**
  - Acceptance: 2-column grid, 12 food buttons, click feeds with correct mood change, hover 2s = penalty, reaction text shows
  - Verify: Click favourite food → mood += moodBoost; click non-favourite → mood += 3; hover 2s → mood -= 5
  - Files: `extension/sidepanel/components/FoodTray.jsx`, `.css`

- [ ] **Task 13: ChatBox component (adapt from workshop)**
  - Acceptance: Shows max 4 messages, LLM chat or fallback works, compact input, loading indicator
  - Verify: Send message → LLM reply or fallback; check only 4 messages displayed
  - Files: `extension/sidepanel/components/ChatBox.jsx`, `.css`

- [ ] **Task 14: useHamster hook + App.jsx**
  - Acceptance: Orchestrates all components, handles userId flow, API status check, hamster fetch, state persistence
  - Verify: Full flow works end-to-end
  - Files: `extension/sidepanel/hooks/useHamster.js`, `extension/sidepanel/App.jsx`, `extension/sidepanel/App.css`

- [ ] **Task 15: Integration test + loading guide**
  - Acceptance: All 14 acceptance criteria from spec pass
  - Verify: Manual test checklist in Edge
  - Files: `extension/LOADING_GUIDE.md`
