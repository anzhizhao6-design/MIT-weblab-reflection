# F1: HomePage + Random Hamster — Design Spec

**Date:** 2026-07-23
**Status:** Approved
**Scope:** F1 only — HomePage + Random Hamster display

---

## 1. Goal

React + Vite project that displays a landing page (`/`) and a random hamster showcase page (`/hamster`), with mobile-responsive layout.

## 2. Architecture

- **Framework:** React 18 + Vite
- **Routing:** react-router-dom v6 (`BrowserRouter`)
- **Styling:** Plain CSS (one file per component + shared `App.css`)
- **No backend** in F1 — purely client-side

## 3. Route Map

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | `HomePage` | Landing card with `home.jpg` background |
| `/hamster` | `HamsterPage` | Random hamster showcase |

## 4. Component Tree

```
App
├── Navbar          ← "Hamster Daily" | Home | Today's Hamster
└── <Routes>
    ├── HomePage    ← big rounded card, home.jpg bg
    └── HamsterPage ← random hamster details + "Visit Another"
```

## 5. Data — `src/data/hamsters.js`

Single JS file exporting an array of 12 hamster objects:

| Field | Type | Constraint |
|-------|------|------------|
| `name` | string | matches image filename (Biscuit, Boba, etc.) |
| `age` | number | arbitrary (1-3) |
| `personality` | string | one of 7 from spec §6.4 |
| `favouriteFood` | string | food `id` from spec §6.3 |
| `hobby` | string | free text |
| `bio` | string | short intro (1-2 sentences) |
| `image` | string | `/hamsters/{Name}.jpg` |
| `catchphrase` | string | unique per hamster |
| `moodBoost` | number | derived strictly from personality per spec §6.4 |

### Personality → moodBoost Mapping (spec §6.4)

| Personality | moodBoost | Hamsters |
|-------------|-----------|----------|
| Gluttonous 🍽️ | +15 | Boba, Sesame |
| Shy 😳 | +5 | Mochi, Pudding |
| Energetic ⚡ | +12 | Tofu |
| Chill 😌 | +8 | Dumpling, Snowball |
| Chaotic 💫 | +15 | Peanut, Churro |
| Picky 🤔 | +4 | Cookie, Maple |
| Friendly 🥰 | +12 | Biscuit |

### Food IDs (spec §6.3)

`sunflower-seeds`, `strawberries`, `broccoli`, `carrots`, `apples`, `sweet-corn`, `peanuts`, `blueberries`, `sweet-potato`, `cinnamon-oats`, `cucumber`, `banana-chips`

## 6. Random Selection Logic

- On `/hamster` mount: `Math.floor(Math.random() * 12)` picks a random index
- "Visit Another" button: re-rolls, may produce the same hamster (simple random, no dedup)

## 7. UI Details

### HomePage (`/`)
- Large rounded card (`border-radius: 24px` or similar)
- Background: `home.jpg` (cover, center)
- Left side: large text "Meet Today's Hamster"
- Right side: arrow "→" acting as a `<Link to="/hamster">`
- Dark overlay on background for text readability

### HamsterPage (`/hamster`)
- Hamster photo: circular (`border-radius: 50%`), 200-250px
- Display fields: name, age, personality, food, hobby, bio
- "Visit Another" button: onClick → re-roll random hamster
- Food label displayed using spec §6.3 mapping (show label + emoji)

### Navbar
- Brand: "Hamster Daily" (left-aligned)
- Links: "Home" (`/`), "Today's Hamster" (`/hamster`)

### Mobile (`max-width: 768px`)
- HomePage card: vertical stack (text on top, arrow below)
- HamsterPage: vertical stack
- Navbar: links remain inline, smaller font

## 8. File Structure

```
workshop/
├── index.html
├── package.json
├── vite.config.js
├── .env
├── public/hamsters/   (13 images — already present)
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── components/
    │   ├── Navbar.jsx
    │   └── Navbar.css
    ├── pages/
    │   ├── HomePage.jsx
    │   ├── HomePage.css
    │   ├── HamsterPage.jsx
    │   └── HamsterPage.css
    └── data/
        └── hamsters.js
```

## 9. Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.x"
}
```

Dev dependencies: `vite`, `@vitejs/plugin-react`

## 10. What F1 Does NOT Include

- No feeding, food tray, mood system (F2)
- No chat, LLM integration (F2)
- No backend, Express, MongoDB (F3)
- No database, user accounts (F3)
- No localStorage persistence
