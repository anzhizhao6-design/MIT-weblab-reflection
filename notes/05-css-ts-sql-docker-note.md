# web.lab 2026 — Advanced CSS, TS, SQL & Docker Notes

> MIT web.lab IAP 2026 • [Schedule](https://site.weblab.is/schedule) • [YouTube Playlist](https://www.youtube.com/playlist?list=PLVAxjdyIU8_z6iFliCz-n9zqf_ZRsbyPA)

---

## Chapter 12: Advanced CSS

### 12.1 Combinators

Define relationships between selectors:

| Combinator       | Syntax  | Matches                     |
| ---------------- | ------- | --------------------------- |
| Descendant       | `A B`   | Any B anywhere inside A     |
| Child            | `A > B` | Direct children only        |
| Adjacent sibling | `A + B` | First B immediately after A |
| General sibling  | `A ~ B` | All Bs after A              |

### 12.2 Display Types

| Value    | Behavior                                                        |
| -------- | --------------------------------------------------------------- |
| `inline` | Content-sized, no new line                                      |
| `block`  | Full width, starts new line                                     |
| `flex`   | 1D layout; `justify-content` + `flex-direction`                 |
| `grid`   | 2D layout; `grid-template-columns/rows`, `repeat()`, `fr` units |
| `none`   | Removed from layout entirely                                    |

### 12.3 Overflow

Controls content that exceeds parent size: `visible` (default, spills out), `hidden` (clipped), `scroll` (always shows scrollbar), `auto` (scrollbar only when needed).

### 12.4 Animations

```css
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.element {
  animation: fadeIn 0.5s ease-in;
}
```

Timing: `ease`, `ease-in`, `ease-out`, `linear`. `animation-iteration-count: infinite` for loops.

### 12.5 Responsive Design

- Relative units: `em` (parent font), `rem` (root font), `vw/vh` (viewport percentage)
- Media queries: `@media screen and (min-width: 768px) { ... }`
- Breakpoints: 480px → 768px → 1024px → 1200px

### 12.6 Tailwind CSS

Utility-first framework — each class = one CSS property (`p-4`, `bg-blue-500`, `rounded-lg`). Responsive prefixes (`sm:`, `md:`, `lg:`). Compiler removes unused CSS. Custom theming via `@theme`.

---

## Chapter 13: TypeScript

### 13.1 Static vs Dynamic Typing

- **JavaScript:** types checked at **runtime** — bugs surface after code runs
- **TypeScript:** types checked at **compile time** — catches errors before execution

### 13.2 Basic Syntax

```ts
// Primitives (auto-inferred)
let name = "Boba";       // string
let age = 2;             // number

// Custom types
type Hamster = {
  name: string;
  age: number;
  hobby?: string;        // optional with ?
};

// Typed functions
const greet = (name: string): string => `Hello, ${name}!`;

// Async returns Promise<T>
const fetchHamster = async (id: string): Promise<Hamster> => { ... };

// Arrays & enums
let snacks: string[] = ["seed", "carrot"];
enum Mood { Happy, Sleepy, Hungry }
```

### 13.3 Why Use It

- Catches `undefined is not an object` at compile time
- Typed React props/state — no missing or wrong-type props
- Gradual adoption — add to existing JS project file by file
- `tsconfig.json` controls strictness

---

## Chapter 14: Relational Databases (SQL)

### 14.1 When MongoDB Struggles

MongoDB is great for simple docs but complex **relationships** cause pain: data duplication (both sides of a "follow"), 16MB document limit on growing arrays, complex queries needing multiple calls + app logic.

### 14.2 SQL Approach

Store each fact **once**, connect via **foreign keys**:

```
users ————< follows >———— users
   │
   └————< stories
```

**Primary Key** = unique row ID. **Foreign Key** = points to PK in another table.

### 14.3 Basic SQL

```sql
-- Read (JOIN connects tables)
SELECT content, username FROM stories
JOIN users ON users.user_id = stories.author_id
WHERE created_at > '2026-01-01'
ORDER BY created_at DESC LIMIT 10;

-- Create / Update / Delete
INSERT INTO stories (author_id, content) VALUES (1, 'Hello!');
UPDATE users SET username = 'new' WHERE user_id = 1;  -- ⚠️ always WHERE
DELETE FROM follows WHERE follower_id = 1;
```

**Clause order:** `SELECT → FROM → JOIN → WHERE → ORDER BY → LIMIT`

### 14.4 MongoDB vs SQL

| Use MongoDB          | Use SQL                     |
| -------------------- | --------------------------- |
| Flexible schema      | Stable schema               |
| Simple relationships | Many-to-many relationships  |
| Nested documents     | Complex cross-table queries |
| Fast writes          | Data integrity is critical  |

---

## Chapter 15: Docker

### 15.1 The Problem

"It works on my machine!" — different OS, wrong dependencies, version mismatches. Docker packages app + all dependencies into one portable unit.

### 15.2 Key Concepts

| Term           | What                                    |
| -------------- | --------------------------------------- |
| **Dockerfile** | Recipe — instructions to build an image |
| **Image**      | Package with binaries, libraries, OS    |
| **Container**  | Running instance of an image            |

### 15.3 Multi-Stage Build

```dockerfile
# Stage 1: Build (has compilers, dev tools)
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build       # → client/dist

# Stage 2: Runtime (minimal, secure)
FROM node:18-slim
COPY --from=builder /app/client/dist ./client/dist
COPY package.json ./
RUN npm ci --omit-dev                  # production deps only
CMD ["node", "server/server.js"]
```

Build stage is heavy; runtime stage is light. `client/dist` is the production React build — static HTML/CSS/JS served by one server instead of two dev servers.

### 15.4 Deployment on Render

1. New Web Service → connect GitHub repo
2. Build: `npm install && npm run build` / Start: `npm start`
3. Set env vars (MONGO_SRV, SESSION_SECRET) in Render Dashboard
4. Push → auto-redeploys

Secrets in `.env` (gitignored). Render reads from Dashboard → Environment tab.
