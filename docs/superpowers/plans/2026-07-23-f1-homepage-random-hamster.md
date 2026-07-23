# F1: HomePage + Random Hamster — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React + Vite front-end with HomePage (`/`) and HamsterPage (`/hamster`), 12 hamster dataset, random selection, and mobile-responsive layout.

**Architecture:** Vite + React 18 SPA with react-router-dom v6. Hamster data in a static JS module. Plain CSS per component. No backend — purely client-side.

**Tech Stack:** React 18, Vite 5, react-router-dom 6, plain CSS

## Global Constraints

- JavaScript (not TypeScript)
- React 18 + Vite
- No backend in F1 (Express not needed yet)
- 12 hamsters with fields: `name, age, personality, favouriteFood, hobby, bio, image, catchphrase, moodBoost`
- `favouriteFood` must use food `id` from spec §6.3 (e.g., `sunflower-seeds`)
- `personality` must be one of 7 values from spec §6.4
- `moodBoost` derived from personality per spec §6.4 table
- Image paths: `/hamsters/<Name>.jpg`
- Mobile-friendly (`max-width: 768px` breakpoint)
- API key NEVER exposed to frontend code

---

### Task 1: Scaffold React + Vite project

**Files:**
- Create: `workshop/package.json`
- Create: `workshop/vite.config.js`
- Create: `workshop/index.html`
- Create: `workshop/src/main.jsx`
- Create: `workshop/src/App.jsx`
- Create: `workshop/src/App.css`

**Interfaces:**
- Produces: Running dev server on `npm run dev`

- [ ] **Step 1: Write package.json**

```json
{
  "name": "hamster-daily",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.23.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.4.0"
  }
}
```

- [ ] **Step 2: Write vite.config.js**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
});
```

- [ ] **Step 3: Write index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hamster Daily</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Write main.jsx**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 5: Write minimal App.jsx**

```jsx
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/hamster" element={<div>Hamster</div>} />
      </Routes>
    </div>
  );
}

export default App;
```

- [ ] **Step 6: Write App.css (reset + base styles)**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #fdf6ec;
  color: #4a3728;
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
```

- [ ] **Step 7: Install dependencies and verify dev server starts**

Run: `cd workshop && npm install`
Expected: dependencies install without errors

Run: `cd workshop && npm run dev`
Expected: Vite dev server starts on port 3000, opens browser, shows "Home" or "Hamster" text at their routes

- [ ] **Step 8: Commit**

```bash
git add workshop/package.json workshop/vite.config.js workshop/index.html workshop/src/
git commit -m "feat: scaffold React + Vite project with react-router-dom"
```

---

### Task 2: Create hamster data module

**Files:**
- Create: `workshop/src/data/hamsters.js`

**Interfaces:**
- Produces: `hamsters` — array of 12 hamster objects, each with `{ name, age, personality, favouriteFood, hobby, bio, image, catchphrase, moodBoost }`
- Produces: `foods` — array of 12 food objects `{ id, label, emoji }` from spec §6.3

- [ ] **Step 1: Write hamster data**

```js
// 12 foods from spec §6.3
export const foods = [
  { id: 'sunflower-seeds', label: 'Sunflower Seeds', emoji: '🌻' },
  { id: 'strawberries', label: 'Strawberries', emoji: '🍓' },
  { id: 'broccoli', label: 'Broccoli', emoji: '🥦' },
  { id: 'carrots', label: 'Carrots', emoji: '🥕' },
  { id: 'apples', label: 'Apples', emoji: '🍎' },
  { id: 'sweet-corn', label: 'Sweet Corn', emoji: '🌽' },
  { id: 'peanuts', label: 'Peanuts', emoji: '🥜' },
  { id: 'blueberries', label: 'Blueberries', emoji: '🫐' },
  { id: 'sweet-potato', label: 'Sweet Potato', emoji: '🍠' },
  { id: 'cinnamon-oats', label: 'Cinnamon Oats', emoji: '🥣' },
  { id: 'cucumber', label: 'Cucumber', emoji: '🥒' },
  { id: 'banana-chips', label: 'Banana Chips', emoji: '🍌' },
];

// 12 hamsters — personality and moodBoost from spec §6.4
const hamsters = [
  {
    name: 'Biscuit',
    age: 1,
    personality: 'Friendly 🥰',
    favouriteFood: 'sunflower-seeds',
    hobby: 'collecting tiny twigs',
    bio: 'Biscuit is the friendliest hamster in the bunch! She loves meeting new people and will always run up to say hello.',
    image: '/hamsters/Biscuit.jpg',
    catchphrase: 'You\'re my favorite human!',
    moodBoost: 12,
  },
  {
    name: 'Boba',
    age: 2,
    personality: 'Gluttonous 🍽️',
    favouriteFood: 'cinnamon-oats',
    hobby: 'taste-testing everything in sight',
    bio: 'Boba has never met a snack he didn\'t like. His cheeks are legendary — they can hold more food than any other hamster in the colony.',
    image: '/hamsters/Boba.jpg',
    catchphrase: 'Just one more bite... maybe two!',
    moodBoost: 15,
  },
  {
    name: 'Churro',
    age: 1,
    personality: 'Chaotic 💫',
    favouriteFood: 'banana-chips',
    hobby: 'rearranging his bedding at 3 AM',
    bio: 'Nobody knows what Churro will do next — least of all Churro. He runs in zigzags and hides treats in the most unexpected places.',
    image: '/hamsters/Churro.jpg',
    catchphrase: 'Wheeee! Where am I going? Nobody knows!',
    moodBoost: 15,
  },
  {
    name: 'Cookie',
    age: 2,
    personality: 'Picky 🤔',
    favouriteFood: 'blueberries',
    hobby: 'inspecting every piece of food before eating',
    bio: 'Cookie has impossibly high standards. She\'ll sniff a sunflower seed from twelve different angles before deciding if it\'s worthy.',
    image: '/hamsters/Cookie.jpg',
    catchphrase: 'Hmm... I suppose this will do.',
    moodBoost: 4,
  },
  {
    name: 'Dumpling',
    age: 1,
    personality: 'Chill 😌',
    favouriteFood: 'sweet-potato',
    hobby: 'napping in cozy corners',
    bio: 'Dumpling takes life at exactly one speed: relaxed. He believes every day should include at least three naps and a good stretch.',
    image: '/hamsters/Dumpling.jpg',
    catchphrase: 'Zzz... five more minutes...',
    moodBoost: 8,
  },
  {
    name: 'Maple',
    age: 2,
    personality: 'Picky 🤔',
    favouriteFood: 'strawberries',
    hobby: 'organizing food by color and size',
    bio: 'Maple treats her food bowl like an art gallery. Everything must be arranged just so before she\'ll even consider a nibble.',
    image: '/hamsters/Maple.jpg',
    catchphrase: 'This presentation is simply unacceptable.',
    moodBoost: 4,
  },
  {
    name: 'Mochi',
    age: 1,
    personality: 'Shy 😳',
    favouriteFood: 'sweet-corn',
    hobby: 'peeking out from behind the wheel',
    bio: 'Mochi is a soft little soul who takes time to warm up to new friends. But once she trusts you, she\'ll share her secret stash of corn kernels.',
    image: '/hamsters/Mochi.jpg',
    catchphrase: 'Oh! You see me? *hides*',
    moodBoost: 5,
  },
  {
    name: 'Peanut',
    age: 2,
    personality: 'Chaotic 💫',
    favouriteFood: 'peanuts',
    hobby: 'digging escape tunnels that lead nowhere',
    bio: 'Peanut has an inexplicable obsession with his namesake. He\'ll do backflips for a peanut and has been caught trying to swim in the peanut jar.',
    image: '/hamsters/Peanut.jpg',
    catchphrase: 'PEANUTS! Did someone say PEANUTS?!',
    moodBoost: 15,
  },
  {
    name: 'Pudding',
    age: 1,
    personality: 'Shy 😳',
    favouriteFood: 'cucumber',
    hobby: 'drawing tiny patterns in the sand',
    bio: 'Pudding is a gentle artist who communicates through sand drawings. She\'s quiet but her heart is as big as her round little body.',
    image: '/hamsters/Pudding.jpg',
    catchphrase: '... *draws a heart in the sand* ...',
    moodBoost: 5,
  },
  {
    name: 'Sesame',
    age: 2,
    personality: 'Gluttonous 🍽️',
    favouriteFood: 'apples',
    hobby: 'stuffing both cheeks until perfectly round',
    bio: 'Sesame treats his cheeks like a work of art — perfectly symmetrical pouches are his pride and joy. He\'s been known to smuggle an entire apple slice in one go.',
    image: '/hamsters/Sesame.jpg',
    catchphrase: 'Look at these cheeks! Masterpieces!',
    moodBoost: 15,
  },
  {
    name: 'Snowball',
    age: 1,
    personality: 'Chill 😌',
    favouriteFood: 'broccoli',
    hobby: 'meditating on top of the exercise wheel',
    bio: 'Snowball doesn\'t use the wheel for running — she sits on top of it and contemplates the meaning of seeds. She\'s the zen master of the hamster world.',
    image: '/hamsters/Snowball.jpg',
    catchphrase: 'The wheel turns, but the hamster stays still.',
    moodBoost: 8,
  },
  {
    name: 'Tofu',
    age: 1,
    personality: 'Energetic ⚡',
    favouriteFood: 'carrots',
    hobby: 'setting land-speed records on the wheel',
    bio: 'Tofu is a blur of white fluff and determination. She\'s been clocked at speeds that shouldn\'t be physically possible for a creature with legs that short.',
    image: '/hamsters/Tofu.jpg',
    catchphrase: 'FASTER! The wheel must go FASTER!',
    moodBoost: 12,
  },
];

export default hamsters;
```

- [ ] **Step 2: Commit**

```bash
git add workshop/src/data/hamsters.js
git commit -m "feat: add 12 hamster data entries with foods from spec §6.3 and personalities from §6.4"
```

---

### Task 3: Create Navbar component

**Files:**
- Create: `workshop/src/components/Navbar.jsx`
- Create: `workshop/src/components/Navbar.css`
- Modify: `workshop/src/App.jsx`

**Interfaces:**
- Consumes: React Router context (use `<Link>`)
- Produces: `<Navbar />` component — renders navigation bar with brand "Hamster Daily" and links

- [ ] **Step 1: Write Navbar.jsx**

```jsx
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">🐹 Hamster Daily</Link>
      <div className="navbar-links">
        <Link
          to="/"
          className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
        >
          Home
        </Link>
        <Link
          to="/hamster"
          className={`navbar-link ${location.pathname === '/hamster' ? 'active' : ''}`}
        >
          Today's Hamster
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
```

- [ ] **Step 2: Write Navbar.css**

```css
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  background-color: #fff7e8;
  border-bottom: 2px solid #e8d5b0;
}

.navbar-brand {
  font-size: 1.4rem;
  font-weight: 700;
  color: #8b5e3c;
  text-decoration: none;
}

.navbar-links {
  display: flex;
  gap: 24px;
}

.navbar-link {
  text-decoration: none;
  color: #8b5e3c;
  font-size: 1rem;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.navbar-link:hover {
  background-color: #f0d9a8;
}

.navbar-link.active {
  background-color: #e8c57a;
  font-weight: 600;
}

@media (max-width: 768px) {
  .navbar {
    padding: 12px 16px;
    flex-wrap: wrap;
  }

  .navbar-brand {
    font-size: 1.1rem;
  }

  .navbar-links {
    gap: 12px;
  }

  .navbar-link {
    font-size: 0.9rem;
    padding: 4px 8px;
  }
}
```

- [ ] **Step 3: Update App.jsx to include Navbar**

```jsx
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/hamster" element={<div>Hamster</div>} />
      </Routes>
    </div>
  );
}

export default App;
```

- [ ] **Step 4: Verify Navbar renders**

Run: `cd workshop && npm run dev`
Expected: Navbar visible at top with "🐹 Hamster Daily" brand, "Home" and "Today's Hamster" links. Active link highlights.

- [ ] **Step 5: Commit**

```bash
git add workshop/src/components/Navbar.jsx workshop/src/components/Navbar.css workshop/src/App.jsx
git commit -m "feat: add Navbar with brand and navigation links"
```

---

### Task 4: Create HomePage component

**Files:**
- Create: `workshop/src/pages/HomePage.jsx`
- Create: `workshop/src/pages/HomePage.css`
- Modify: `workshop/src/App.jsx`

**Interfaces:**
- Consumes: React Router (`<Link>` to `/hamster`)
- Produces: `<HomePage />` — hero card with `home.jpg` background

- [ ] **Step 1: Write HomePage.jsx**

```jsx
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  return (
    <main className="homepage">
      <Link to="/hamster" className="homepage-card">
        <div className="homepage-overlay">
          <div className="homepage-text">
            <h1>Meet Today's Hamster</h1>
          </div>
          <div className="homepage-arrow">
            <span className="arrow-icon">→</span>
          </div>
        </div>
      </Link>
    </main>
  );
}

export default HomePage;
```

- [ ] **Step 2: Write HomePage.css**

```css
.homepage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
}

.homepage-card {
  width: 100%;
  max-width: 800px;
  height: 400px;
  border-radius: 24px;
  background-image: url('/hamsters/home.jpg');
  background-size: cover;
  background-position: center;
  text-decoration: none;
  overflow: hidden;
  display: block;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s, box-shadow 0.3s;
}

.homepage-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

.homepage-overlay {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 48px;
}

.homepage-text h1 {
  color: #fff;
  font-size: 2.8rem;
  font-weight: 700;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.4);
}

.homepage-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow-icon {
  font-size: 3.5rem;
  color: #fff;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.4);
  animation: bob 1.5s ease-in-out infinite;
}

@keyframes bob {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(8px); }
}

@media (max-width: 768px) {
  .homepage {
    padding: 16px;
  }

  .homepage-card {
    height: 300px;
    border-radius: 16px;
  }

  .homepage-overlay {
    flex-direction: column;
    justify-content: center;
    padding: 24px;
    text-align: center;
    gap: 24px;
  }

  .homepage-text h1 {
    font-size: 1.8rem;
  }

  .arrow-icon {
    font-size: 2.5rem;
    animation: bob-vertical 1.5s ease-in-out infinite;
  }

  @keyframes bob-vertical {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(8px); }
  }
}
```

- [ ] **Step 3: Update App.jsx to use HomePage**

```jsx
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';

function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/hamster" element={<div>Hamster</div>} />
      </Routes>
    </div>
  );
}

export default App;
```

- [ ] **Step 4: Verify HomePage renders**

Run: `cd workshop && npm run dev`
Expected: `/` shows a large rounded card with home.jpg background, dark overlay, left text "Meet Today's Hamster", right arrow → that bounces. Entire card is clickable, navigates to `/hamster`.

- [ ] **Step 5: Commit**

```bash
git add workshop/src/pages/HomePage.jsx workshop/src/pages/HomePage.css workshop/src/App.jsx
git commit -m "feat: add HomePage with home.jpg background and arrow link"
```

---

### Task 5: Create HamsterPage component

**Files:**
- Create: `workshop/src/pages/HamsterPage.jsx`
- Create: `workshop/src/pages/HamsterPage.css`
- Modify: `workshop/src/App.jsx`

**Interfaces:**
- Consumes: `hamsters` from `../data/hamsters.js`, `foods` from `../data/hamsters.js`
- Produces: `<HamsterPage />` — displays random hamster with all details and "Visit Another" button

- [ ] **Step 1: Write HamsterPage.jsx**

```jsx
import { useState, useCallback } from 'react';
import hamsters, { foods } from '../data/hamsters';
import './HamsterPage.css';

function getRandomHamster() {
  const index = Math.floor(Math.random() * hamsters.length);
  return hamsters[index];
}

function getFoodInfo(foodId) {
  return foods.find((f) => f.id === foodId) || { label: foodId, emoji: '' };
}

function HamsterPage() {
  const [hamster, setHamster] = useState(() => getRandomHamster());

  const handleVisitAnother = useCallback(() => {
    setHamster(getRandomHamster());
  }, []);

  const food = getFoodInfo(hamster.favouriteFood);

  return (
    <main className="hamster-page">
      <div className="hamster-card">
        <div className="hamster-photo-wrapper">
          <img
            src={hamster.image}
            alt={hamster.name}
            className="hamster-photo"
          />
        </div>

        <div className="hamster-info">
          <h2 className="hamster-name">{hamster.name}</h2>
          <p className="hamster-catchphrase">"{hamster.catchphrase}"</p>

          <div className="hamster-details">
            <div className="detail-item">
              <span className="detail-label">Age</span>
              <span className="detail-value">{hamster.age}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Personality</span>
              <span className="detail-value">{hamster.personality}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Favourite Food</span>
              <span className="detail-value">{food.emoji} {food.label}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Hobby</span>
              <span className="detail-value">{hamster.hobby}</span>
            </div>
          </div>

          <p className="hamster-bio">{hamster.bio}</p>

          <button className="visit-another-btn" onClick={handleVisitAnother}>
            Visit Another
          </button>
        </div>
      </div>
    </main>
  );
}

export default HamsterPage;
```

- [ ] **Step 2: Write HamsterPage.css**

```css
.hamster-page {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
}

.hamster-card {
  display: flex;
  gap: 40px;
  background: #fff;
  border-radius: 24px;
  padding: 40px;
  max-width: 750px;
  width: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  align-items: center;
}

.hamster-photo-wrapper {
  flex-shrink: 0;
}

.hamster-photo {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #e8d5b0;
}

.hamster-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hamster-name {
  font-size: 1.8rem;
  font-weight: 700;
  color: #6b3a2a;
}

.hamster-catchphrase {
  font-style: italic;
  color: #8b7355;
  font-size: 1rem;
}

.hamster-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 24px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #b8a080;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 1rem;
  color: #4a3728;
  font-weight: 500;
}

.hamster-bio {
  font-size: 0.95rem;
  color: #5c4a38;
  line-height: 1.6;
  margin-top: 4px;
}

.visit-another-btn {
  align-self: flex-start;
  margin-top: 8px;
  padding: 10px 24px;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background-color: #d4956b;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
}

.visit-another-btn:hover {
  background-color: #c17f53;
  transform: scale(1.03);
}

.visit-another-btn:active {
  transform: scale(0.97);
}

@media (max-width: 768px) {
  .hamster-page {
    padding: 16px;
  }

  .hamster-card {
    flex-direction: column;
    padding: 24px;
    gap: 24px;
    text-align: center;
  }

  .hamster-photo {
    width: 180px;
    height: 180px;
  }

  .hamster-details {
    grid-template-columns: 1fr;
    text-align: left;
  }

  .hamster-name {
    font-size: 1.5rem;
  }

  .visit-another-btn {
    align-self: center;
  }
}
```

- [ ] **Step 3: Update App.jsx to use HamsterPage**

```jsx
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import HamsterPage from './pages/HamsterPage';

function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/hamster" element={<HamsterPage />} />
      </Routes>
    </div>
  );
}

export default App;
```

- [ ] **Step 4: Verify HamsterPage renders**

Run: `cd workshop && npm run dev`
Expected:
- `/hamster` shows a random hamster with circular photo, name, catchphrase, age, personality, favourite food (with emoji), hobby, bio
- "Visit Another" button is visible
- Clicking "Visit Another" switches to another random hamster
- Card looks good — white background, rounded corners, proper spacing
- Mobile view: card stacks vertically

- [ ] **Step 5: Verify complete flow**

Run through the full user journey:
1. Open `/` → see HomePage card with "Meet Today's Hamster" and arrow
2. Click card → navigate to `/hamster`
3. See a random hamster with all details
4. Click "Visit Another" → different hamster appears
5. Use Navbar links to go Home and back

- [ ] **Step 6: Commit**

```bash
git add workshop/src/pages/HamsterPage.jsx workshop/src/pages/HamsterPage.css workshop/src/App.jsx
git commit -m "feat: add HamsterPage with random hamster display and Visit Another button"
```

---

## Self-Review Checklist

Before handing off for execution, I will verify:

1. **Spec coverage** — all F1 acceptance criteria mapped to tasks:
   - React + Vite starts → Task 1
   - `/` HomePage → Task 4
   - `/hamster` HamsterPage → Task 5
   - 12 hamster data → Task 2
   - "Visit Another" button → Task 5
   - Navbar → Task 3
   - Mobile layout → CSS in Tasks 3, 4, 5

2. **No placeholders** — all steps have complete code

3. **Type consistency** — `hamster.favouriteFood` (camelCase) matches spec; `foods` export consistent; import paths correct
