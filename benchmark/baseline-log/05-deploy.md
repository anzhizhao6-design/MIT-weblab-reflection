# 05 — Deployment

> **Date:** 2026-07-21
> **Platform:** Render
> **URL:** https://hamster-daily.onrender.com

---

## Goal

Deploy the full-stack Hamster Daily app to a public URL so anyone can access it.

---

## Specification

- Platform: Render (free tier)
- Frontend: Vite React build → served as static files by Express
- Backend: Express on `process.env.PORT`
- Database: MongoDB Atlas (cloud, already in use)
- All API routes proxy to Express directly (no Vite dev proxy in production)
- Auto-deploy on `git push`

---

## AI Workflow

Requirement → Production build setup (Express serves dist/ + SPA catch-all) → Render account setup → First deploy failed (vite not found) → Fixed: moved vite to dependencies → Second deploy failed (MongoDB IP whitelist) → Fixed: allowed all IPs in Atlas → Deploy successful.

---

## Implementation Summary

**Files modified (2):**
- `server/index.js` — added `express.static(dist/)` + `express.static(public/)` + SPA catch-all route (`app.get('*', ...)`)
- `package.json` — moved `vite` and `@vitejs/plugin-react` from `devDependencies` → `dependencies`; added `"start": "node server/index.js"`

**Render config:**
- Build Command: `npm run build`
- Start Command: `npm start`
- Root Directory: `workshop`
- Environment Variables: `MONGO_SRV`, `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL`

**How it works in production:**
```
Browser → render.com → Express (:PORT)
                         ├── /api/*    → API routes
                         ├── /hamsters/* → static photos
                         └── /*        → dist/index.html (React SPA)
```

---

## Review & Testing

**Problems encountered:**
1. `vite: not found` — Render's `NODE_ENV=production` skips `devDependencies`. Fixed by moving vite to regular `dependencies`.
2. `MongoDB SSL error / IP whitelist` — Atlas blocked Render's IP. Fixed by adding `0.0.0.0/0` (allow all) in Atlas Network Access.

**Verification:**
- `https://hamster-daily.onrender.com` → HomePage loads ✅
- `https://hamster-daily.onrender.com/hamster` → HamsterPage loads ✅
- Chat works with LLM API ✅
- Memory (visit/feed counts) persists ✅
- Auto-deploy on `git push` confirmed ✅

---

## Reflection

### What worked well?
Express serving both API and static files is the standard production pattern. No need for separate frontend/backend deployment. Auto-deploy on push is frictionless.

### What required manual intervention?
Two deployment blockers: devDependencies not installing and MongoDB IP whitelist. Both are one-time config issues, not code problems.

### What would I change next time?
Add a `NODE_ENV=production` check in the Express config to skip dev-only middleware. Set `NPM_CONFIG_PRODUCTION=false` in Render env vars to avoid the devDependencies issue entirely (alternative to moving packages).

### Would this workflow be suitable for a larger project?
Yes — Render is the standard web.lab deployment platform. For production apps, you'd add a custom domain and HTTPS.

---

## Metrics

| Metric | Value |
|--------|-------|
| Deployment attempts | 3 |
| Code changes for deploy | 2 files |
| Platform config issues | 2 |
| Estimated deploy time | 20 min |
