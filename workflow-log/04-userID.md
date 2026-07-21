# 04 — User ID (Cross-Device Identity)

> **Date:** 2026-07-17
> **Stack:** Express + MongoDB (existing User model)

---

## Goal

Allow users to bring their hamster data (visit history, feed counts, chat logs) to another browser or device by copying and pasting a unique ID. No passwords, no OAuth.

---

## Specification

- `POST /api/users` — generate a new UUID, return `{ userId }`
- `GET /api/users/:id` — check if a userId exists
- Frontend: show the current user ID (shortened) in the navbar
- Copy button to share ID
- Input to paste an existing ID and switch to it
- All existing memory/chat data automatically follows the ID

---

## AI Workflow

Discussion → User asked about UUID collision → Explained UUID uniqueness + backend dedup → Implementation (2 endpoints, user.js helpers, UserIdPrompt component, navbar integration, CSS) → Review.

---

## Implementation Summary

**Files created (1):**
- `src/components/UserIdPrompt.jsx` — shows ID, copy button, switch input, create new ID button

**Files modified (3):**
- `server/index.js` — added `POST /api/users` and `GET /api/users/:id`
- `src/utils/user.js` — added `setUserId()`, `createNewUser()`, `checkUserId()`
- `src/components/Navbar.jsx` — added `<UserIdPrompt />` on the right side
- `src/styles.css` — added `.user-id-area` styles

---

## Review & Testing

**Verification:**
1. Open page → see `🐹 user-a1b2c3...` in navbar
2. Click 📋 → ID copied to clipboard
3. Click 🔄 → input appears → type an existing ID → OK → ID switches, memory data follows
4. Click + → new ID created via backend
5. Open in another browser → paste the same ID → same visit/feed counts appear

---

## Reflection

### What worked well?
Zero new security concerns — no passwords, just a UUID. The UI is compact and stays out of the way in the navbar. The copy-paste flow is simpler than a login form.

### What required manual intervention?
None — straightforward implementation.

### What would I change next time?
Add a "recently used IDs" dropdown so users don't have to re-paste. Consider a QR code for mobile scanning.

### Would this workflow be suitable for a larger project?
Yes for lightweight identity — but real auth is needed for production.

---

## Metrics

| Metric | Value |
|--------|-------|
| Files created | 1 |
| Files modified | 3 |
| New API endpoints | 2 |
| Implementation iterations | 1 |
| Estimated dev time | 12 min |
