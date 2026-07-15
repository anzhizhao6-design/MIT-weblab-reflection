# web.lab 2026 — React Patterns, Auth, Sockets & Deploy Notes

> MIT web.lab IAP 2026 • [Schedule](https://site.weblab.is/schedule) • [YouTube Playlist](https://www.youtube.com/playlist?list=PLVAxjdyIU8_z6iFliCz-n9zqf_ZRsbyPA)

---

## Chapter 8: Advanced React

### 8.1 useContext

**Problem:** prop drilling — passing state through every intermediate component even when they don't use it.

**Solution:** Context lets a parent share with all descendants directly:

```jsx
const UserContext = createContext(null);

<UserContext.Provider value={userId}>
  <Navbar />
</UserContext.Provider>;

// Anywhere deep in the tree:
const userId = useContext(UserContext);
```

> `useState` = one component's memory. `useContext` = a "book" the parent writes, all children read.

### 8.2 React Router

Client-side routing — no server request on navigation:

```jsx
<Route path="/" element={<App />}>
  <Route index element={<Feed />} />
  <Route path="profile/:userId" element={<Profile />} />
</Route>
```

| Concept       | Purpose                              |
| ------------- | ------------------------------------ |
| `<Outlet />`  | Placeholder for matched child route  |
| `:param`      | Dynamic URL segment (`/profile/123`) |
| `useParams()` | Read `:userId` from URL              |

---

## Chapter 9: Auth

### 9.1 Core Idea

**Authentication** = who you are. **Authorization** = what you can do.

**Golden rule: Never trust the client.** Always verify on the server.

### 9.2 Passwords: Hash, Don't Store

```js
// ❌ Never store plaintext
password: "hunter2";

// ✅ Store hash
passwordHash: "$2b$10$7NkfBv...";
```

Hash functions are **one-way** — can't reverse. Server compares: `hash(input) === storedHash`.

web.lab shortcut: **Use Google Sign-In.** Let Google handle passwords.

### 9.3 Sessions vs JWT

After login, how does the server remember you?

|               | Session           | JWT                         |
| ------------- | ----------------- | --------------------------- |
| **Storage**   | Server-side table | Client (the token itself)   |
| **Sent via**  | Cookie (auto)     | Manually in headers         |
| **Security**  | Data on server    | Token is proof — don't leak |
| **Structure** | ID → lookup       | `header.payload.signature`  |

**Flow:** Login → server creates session → `Set-Cookie` → browser auto-attaches cookie on every request.

---

## Chapter 10: Sockets

### 10.1 Why HTTP Isn't Enough

HTTP is **request-response**: server can't push data on its own. For chat/games/live updates, you need the server to say "hey, new message!" without waiting to be asked.

### 10.2 WebSockets (Socket.IO)

A **persistent, bidirectional connection** — like a phone line instead of letters:

```js
// Server: broadcast to all
socketManager.getIo().emit("message", data);

// Client: listen
socket.on("message", (data) => addMessage(data));
```

Server can target all clients (broadcast) or specific ones (DM). Clients are always listening.

---

## Chapter 11: Deployment

### 11.1 What It Is

Your app runs on `localhost` — only you. Deployment = someone else runs your `server.js` publicly. web.lab uses **Render** (free): `yourapp.onrender.com`.

### 11.2 Secrets: .env

Never commit keys/passwords to git:

```
# .env (in .gitignore!)
MONGO_SRV=mongodb+srv://...
SESSION_SECRET=random
```

```js
require("dotenv").config();
const url = process.env.MONGO_SRV;
```

Set same vars in Render Dashboard → Environment. Render auto-redeploys on `git push`.

### 11.3 Deploy Checklist

1. Render: New → Web Service → connect GitHub repo
2. Build: `npm install && npm run build` / Start: `npm start`
3. Set env vars (MONGO_SRV, SESSION_SECRET)
4. Add Render URL to Google Cloud credentials
5. Push → auto-deploy

---

### 11.4 Takeaways

1. **useContext** skips prop drilling; **React Router** handles client-side pages
2. **Hash passwords** or use OAuth; verify everything server-side
3. **Sessions** (cookies) remember login state
4. **Sockets** = live server↔client for chat/games
5. **.env** for secrets; **Render** for deployment
