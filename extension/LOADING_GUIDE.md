# Hamster Daily — Edge Sidebar Extension

## How to Load

### Prerequisites

1. Node.js installed (v18+)
2. MongoDB connection configured in `workshop/.env`
3. LLM API key configured in `workshop/.env` (optional — chat falls back to local responses if unavailable)

### Step 1: Install Dependencies

```bash
# In workshop/
cd workshop
npm install

# In extension/
cd ../extension
npm install
```

### Step 2: Seed the Database (first time only)

```bash
cd workshop
npm run db:seed
```

This populates MongoDB with the 12 hamsters. Skip if already done for the website.

### Step 3: Start the Backend

```bash
cd workshop
npm run dev:server
```

The server starts on `http://localhost:3001`. You can also run `npm run dev` to start both the Vite dev server (for the website) and the backend together.

### Step 4: Build the Extension

```bash
# From workshop/
npm run build:extension

# Or from extension/
cd extension
npm run build
```

Build output goes to `extension/dist/sidepanel/`.

### Step 5: Load in Edge

1. Open Edge browser
2. Navigate to `edge://extensions/`
3. Enable **Developer mode** (toggle in bottom-left or top-right)
4. Click **Load unpacked**
5. Select the `extension/` folder (the one containing `manifest.json`)
6. The Hamster Daily icon should appear in your toolbar

### Step 6: Use the Extension

1. Click the Hamster Daily icon in the toolbar
2. The side panel opens on the right side (~350px wide)
3. You should see a random hamster with its photo, personality, and mood bar

## Configuration

All configuration is in `workshop/.env`:

```
LLM_API_KEY=sk-...           # LLM API key (optional)
LLM_BASE_URL=https://...     # LLM API endpoint
LLM_MODEL=deepseek-v4-pro    # Model name
MONGO_SRV=mongodb+srv://...  # MongoDB connection string
MONGODB_DB_NAME=hamster_main # Database name
```

The extension does NOT have its own `.env`. All secrets stay on the backend.

## Architecture

```
extension/
├── manifest.json          # MV3 manifest
├── service-worker.js      # Side panel open/close + userId relay
├── content-script.js      # Reads userId from Hamster Daily website
├── sidepanel/             # React app source
│   ├── index.html
│   ├── main.jsx
│   ├── App.jsx            # Root component
│   ├── App.css            # Global styles (350px optimized)
│   ├── hooks/
│   │   └── useHamster.js  # Core logic hook
│   └── components/
│       ├── HamsterCard.jsx  # Photo + name + personality + mood
│       ├── MoodBar.jsx      # Mood progress bar
│       ├── FoodTray.jsx     # 2-column food grid
│       ├── ChatBox.jsx      # 4-message chat
│       ├── DiaryEntry.jsx   # Latest diary, expandable
│       ├── ProfileCard.jsx  # Visit/Fed counts
│       └── StatusOverlay.jsx # Loading/error/backend-down
├── vite.config.js         # Build config with aliases to workshop/src
└── dist/                  # Build output (loaded into Edge)
```

## Known Limitations

1. **Icons are placeholder**: The extension icons are copies of `home.jpg` (not properly sized). Replace with proper 16px/48px/128px PNG icons for production.

2. **No chat history persistence across reloads**: Chat messages reset when the side panel is closed. Only the current hamster name is persisted. Full chat history could be restored from `/api/conversations` but is not implemented.

3. **userId sync requires website to be open**: The content script only runs on `localhost:3000`. If the user has never visited the Hamster Daily website, the extension generates its own userId which won't share data with the website. Workaround: open the website once to sync userId, then the extension reuses it.

4. **Hamster photos load from localhost:3001**: If the backend is down, hamster photos won't display (just the 120px circle border). The rest of the UI handles this gracefully.

5. **No "first-time" animation**: The main website has intro animations; the side panel is immediate.

6. **Mood resets to 50 each time the side panel opens**: The mood is session-only and doesn't persist.

## Unresolved Issues

1. **Extension CSP restarts**: The side panel page reloads from scratch each time the panel is opened — there is no way to keep a React app alive when the panel is closed in MV3. State is preserved via localStorage.

2. **Vite dev watch mode not tested**: `npm run dev:extension` runs `vite build --watch` which should auto-rebuild on changes, but this hasn't been fully tested in the extension workflow.

3. **Express 5 compatibility**: The backend uses Express 5 (beta). Some middleware behaviors may differ from Express 4.

## Testing Checklist

- [ ] Edge loads extension without errors at `edge://extensions/`
- [ ] Clicking toolbar icon opens ~350px side panel
- [ ] Hamster photo is 120px circle
- [ ] Name, personality, mood bar visible
- [ ] Food tray: 2 columns, 12 buttons, clickable
- [ ] Favourite food gives moodBoost, others give +3
- [ ] Hover 2s on a food = -5 mood penalty
- [ ] Chat: LLM replies in character (or fallback works)
- [ ] Chat: displays max 4 messages
- [ ] Visit/Fed counts display and increment
- [ ] Diary: latest 1 entry, expandable on click
- [ ] Backend-down shows "Please run npm run dev" message
- [ ] Close and reopen → same hamster persists
- [ ] "Visit Another" loads a different hamster
- [ ] No horizontal scrollbar at 350px width
- [ ] No CSP violations in DevTools console
