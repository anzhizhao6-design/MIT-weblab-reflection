# Hamster Daily — Development Log

> Complete journey from zero to a full-stack hamster interaction website. Built while learning through MIT Web.Lab.

## Phase 1: HTML & CSS (Frontend Prototype)

- Built the initial two-card layout with hamster emoji
- Learned CSS Flexbox, border-radius, box-shadow
- Responsive design fundamentals: `@media` queries, mobile-first

## Phase 2: JavaScript & React

- Migrated static HTML to React 18 + Vite
- Component architecture: Navbar, HomePage, HamsterPage
- React Router for client-side navigation
- State management with `useState`, `useCallback`, `useEffect`
- 12 hamster data objects with personalities, bios, catchphrases

## Phase 3: Node.js, APIs & Databases

- Express backend with REST API design
- MongoDB Atlas + Mongoose schemas and models
- Environment variable management (`.env`)
- Seeding scripts for database initialization
- CRUD operations for users, hamsters, conversations, memories

## Phase 4: LLM Integration & Chat

- OpenAI-compatible API integration for hamster chat
- System prompt engineering per hamster personality
- Keyword-based fallback system when API is unavailable
- Conversation history context injection

## Phase 5: Authentication & Deployment

- UUID-based user identity via `localStorage`
- Account panel with copy/paste device switching
- Render.com deployment with environment variable configuration
- Git workflow: branching, committing, pushing to production

## Key Learnings

1. **Start simple, layer complexity**: HTML prototype → React → API → Database → LLM → Deploy
2. **Environment variables are not optional**: `.env` + `.gitignore` from day one
3. **Test manually, then automate**: Every feature verified by hand before considering test automation
4. **AI workflows differ dramatically**: See the [benchmark results](benchmark/README.md) for a quantified comparison
