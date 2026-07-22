# 00 — Project Baseline

> **Project:** Hamster Daily
> **Stack:** React 18 + Vite / Node.js + Express
> **Date:** 2026-07-13

---

## 1. Project Overview

A "Today's Hamster" web app — users meet a random hamster each day, feed it via an interactive food tray with per-personality mood reactions, and chat with it through a backend API.

---

## 2. Current Architecture

```
Frontend (localhost:5173)          Backend (localhost:3001)
├── HomePage (/)                   server/index.js
├── HamsterPage (/hamster)         ├── GET /api/hamsters/random
│   ├── HamsterAvatar              └── POST /api/chat
│   ├── Feed
│   ├── FoodTray (mood system)
│   └── ChatBox (→ backend)
├── data/hamsters.js (12 hamsters)
└── components/ (Navbar, etc.)
```

Vite proxies `/api` requests to Express. No database — data lives in JS files. Chat uses keyword-based replies; API integration placeholder is commented in the backend.

---

## 3. Implemented Features

- Two-page routing (Home + Hamster) with React Router
- Random hamster selection with "Meet Another" button
- 12 hamsters with unique photos, personalities, bios, and daily feed posts
- Food tray with hover-based mood changes (per-personality timing and reactions)
- Mood progress bar (0–100) with 5 tiers (Hungry → Overjoyed)
- Keyword-based hamster chat via backend API
- Responsive layout with mobile fallback

---

## 4. Baseline Workflow

The project was developed together with Claude Code across 4 sessions:

1. **HTML/CSS prototype** — static cards, flexbox layout, image iteration (SVG → emoji → photos)
2. **Single-page React** — Vite setup, useState-based mood and feed system, FoodTray with hover timers
3. **Multi-page + backend** — React Router, Express server, ChatBox connected to API
4. **Personality polish** — per-characteristic mood boosts, overjoyed reactions, cleanup

Each phase followed: user provides plan → AI implements in steps → user tests → refinement rounds.

---

## 5. Lessons Learned

- Image handling took 3 iterations — local assets are more reliable than external URLs.
- ~5 refinement rounds per major feature is normal; first output is rarely final.

---

## 6. Future Tasks

| Task        | Description                                         |
| ----------- | --------------------------------------------------- |
| Backend API | Expand chat to use an LLM API (OpenAI/Claude)       |
| SQLite      | Replace JS data files with a lightweight database   |
| Memory      | Track hamster visit counts and conversation history |
| Deployment  | Deploy frontend + backend to Render                 |

---

## 7. Purpose

This project serves as a controlled baseline for comparing AI-assisted development workflows. The same Hamster Daily project will be re-implemented using different approaches (Agent Skills, structured specs, etc.) to evaluate which workflow produces better results with fewer iterations. Goal + Specification remain constant across all workflows; only the AI interaction pattern changes.
