# web.lab 2026 — APIs, Node & DB Notes

> MIT web.lab IAP 2026 • [Schedule](https://site.weblab.is/schedule)

---

## Chapter 4: HTTP & APIs

### 4.1 Client ↔ Server

|             | Frontend         | Backend                   |
| ----------- | ---------------- | ------------------------- |
| **Runs on** | Browser          | Server computer           |
| **Tech**    | React, HTML, CSS | Node.js, Express, MongoDB |

Browser sends **requests** → server sends **responses**. All via **HTTP**.

### 4.2 HTTP Structure

**Request:** Method + URL(+params) + Headers + Body
**Response:** Status Code + Headers + Body

| Method | Action | Status | Meaning           |
| ------ | ------ | ------ | ----------------- |
| GET    | Read   | 2xx    | Success ✅        |
| POST   | Create | 4xx    | Your fault        |
| PUT    | Update | 5xx    | Server's fault 💥 |
| DELETE | Delete |        |                   |

> GET uses `?key=value` params; POST sends JSON in the body.

### 4.3 APIs

An **API** is a set of HTTP endpoints a server exposes. Same URL, different method = different action:

- `GET /api/comments` → fetch all
- `POST /api/comment` → create one

---

## Chapter 5: Promises & Async/Await

### 5.1 The Problem

API calls take time. If code blocks, the browser freezes. **Promises** solve this:

```js
get("/api/stories")
  .then((stories) => console.log(stories))
  .catch((err) => console.log("Failed!", err));
// Code here runs immediately — doesn't wait
```

Promise states: **pending → fulfilled** | **pending → rejected**

### 5.2 Async/Await

Cleaner syntax, same thing:

```js
const load = async () => {
  const stories = await get("/api/stories"); // waits here
};
```

**Rules:** `await` only in `async` functions. `async` always returns a Promise.

```js
// Slow: 8s (sequential)
const a = await f1();
const b = await f2();

// Fast: 5s (parallel — both start immediately)
const p1 = f1();
const p2 = f2();
const a = await p1;
const b = await p2;
```

---

## Chapter 6: Node.js & Express

### 6.1 Node.js

Runs JS outside the browser. npm manages packages. `package.json` lists dependencies; `node_modules/` holds installed code (don't git push).

### 6.2 Express

The standard Node.js server framework:

```js
const app = express();
app.get("/api/test", (req, res) => res.send("Hello!"));
app.listen(3000);
```

### 6.3 Middleware

Functions that run between request and handler. Like an assembly line — **order matters**:

```js
app.use(express.json()); // parse body
app.use((req, res, next) => {
  // logger
  console.log(req.url);
  next();
});
```

> Specific routes first, catch-all (`*`) last, error handler at the very end.

---

## Chapter 7: MongoDB

### 7.1 Why a Database?

Server variables → lost on restart. Text files → slow, conflict-prone. Databases solve all of this.

### 7.2 MongoDB Basics

**Document database** (NoSQL) — stores JSON-like objects. Flexible schema, natural fit with JS.

| Level      | Example                     |
| ---------- | --------------------------- |
| Database   | Catbook                     |
| Collection | Stories                     |
| Document   | `{ _id: 3, content: "hi" }` |

### 7.3 MongoDB Atlas

Cloud-hosted MongoDB. Data replicated across 3 machines — one dies, another takes over. No need to run anything locally.

**Flow:** `Frontend → Express → MongoDB Atlas`

---

### 7.4 Takeaways

1. **Client → Server → DB** — three tiers
2. **Promises/async** keep the UI responsive
3. **Express** routes + middleware handle requests
4. **MongoDB Atlas** stores data persistently in the cloud
