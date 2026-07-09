# web.lab 2026 — JS & React Notes

> MIT web.lab IAP 2026 • [Schedule](https://site.weblab.is/schedule) • [YouTube Playlist](https://www.youtube.com/playlist?list=PLVAxjdyIU8_z6iFliCz-n9zqf_ZRsbyPA)

---

## Chapter 2: JavaScript

### 2.1 The Basics

JavaScript makes pages **interactive** — responds to clicks, keystrokes, and other user actions. It's not related to Java.

**Five primitive types:** `Boolean`, `Number`, `String`, `null`, `undefined`

**`const` by default, `let` when needed, never `var`** (var is function-scoped and bug-prone).

**Always `===` (triple equals):** `==` does type coercion — `2 == "2"` is `true` (bad). `2 === "2"` is `false` (correct).

---

### 2.2 Arrays & Objects

```js
// Arrays — ordered, zero-indexed
let foods = ["seed", "carrot"];
foods.push("berry"); // add to end
foods[0]; // "seed"

// Objects — key:value pairs (like Python dicts)
let boba = { name: "Boba", food: "seed", mood: "happy" };
boba.name; // dot notation
const { name, mood } = boba; // destructuring
```

**Copying:** Objects/arrays are compared by **reference**, not value. Two identical objects are never `===`. Use the spread operator to copy:

```js
const arr2 = [...arr1];
const obj2 = { ...obj1 };
```

---

### 2.3 Functions & Callbacks

**Arrow functions:** `(params) => { body }`

```js
const greet = (name) => `Hello, ${name}!`; // shorthand (implicit return)
```

**Functions are values** — you can pass them as arguments. A function passed this way is a **callback**:

```js
const sayGoodbye = () => console.log("Bye!");
setTimeout(sayGoodbye, 5000); // calls sayGoodbye after 5 seconds
```

> Pass the function itself (`sayGoodbye`), not the result of calling it (`sayGoodbye()`).

---

### 2.4 `map` & `filter`

These replace manual loops. Neither mutates the original array.

```js
const doubled = [1, 2, 3].map((n) => n * 2); // [2, 4, 6]
const big = [1, 2, 3, 4].filter((n) => n > 2); // [3, 4]
```

---

### 2.5 JS Takeaways

1. **`const` default, `let` if needed, never `var`**
2. **Always `===`**
3. **Spread (`...`) to copy** arrays/objects
4. **Functions are values** — the foundation of callbacks
5. **`map` + `filter`** for array operations

---

## Chapter 3: React

### 3.1 Why React

Vanilla JS means massive repetitive code for complex UIs. React solves this with **components** — reusable "custom HTML tags" that bundle HTML, CSS, and JS together.

---

### 3.2 Components, Props & State

A component is a **function** that takes `props` as input and returns **JSX**:

```jsx
const Comment = (props) => (
  <div className="comment">
    <h3>{props.author}</h3>
    <p>{props.content}</p>
  </div>
);
```

**JSX rules:** `className` not `class`, wrap in `()`, use `{}` to embed JavaScript.

**Props** flow one way — parent → child. They are **immutable** in the child.

**State (`useState`)** is mutable component memory. When it changes, React re-renders:

```jsx
const [isLiked, setIsLiked] = useState(false);
// Always use the setter — never assign directly!
```

> **States STAY, Props PASS.** State lives in a component; props are passed down.

**Lifting state up:** when siblings need the same state, move it to their shared parent. React doesn't allow passing state between siblings.

---

### 3.3 Component Lifecycle

Every component: **Mount** → **Update** (loop) → **Dismount**

Each transition: **Trigger → Render → Commit**

- **Trigger:** initial render, state/prop change, or ancestor re-render
- **Render:** React runs the function → creates **Virtual DOM** (a JS copy of the real DOM)
- **Commit:** React diffs Virtual DOM vs Real DOM, updates only what changed

The Virtual DOM is what makes React fast — it avoids touching the real DOM unnecessarily.

---

### 3.4 `useEffect`

For code that needs to sync with things **outside React** (APIs, timers, DB):

```jsx
useEffect(() => {
  // runs when deps change
}, [dep1, dep2]);
```

| Deps        | When                           |
| ----------- | ------------------------------ |
| `[a, b]`    | On mount + when a or b changes |
| `[]`        | Only on mount                  |
| _(omitted)_ | Every render                   |

**Always clean up** intervals and listeners:

```jsx
useEffect(() => {
  const timer = setInterval(..., 1000);
  return () => clearInterval(timer);   // on dismount
}, []);
```

---

### 3.5 Common Patterns

```jsx
// Conditional rendering
{
  isLoading ? <p>Loading...</p> : <p>Content</p>;
}

// Rendering arrays — always provide a unique key
{
  posts.map((post) => <Post key={post.id} {...post} />);
}
```

---

### 3.6 React Takeaways

1. **Components = reusable functions** returning JSX
2. **Props down, state up** — lift shared state to the parent
3. **Always use the setter** — `setX(v)`, never `x = v`
4. **State is async** — use `setX(old => new)` for dependent updates
5. **`useEffect` for side effects** — always clean up timers/listeners
6. **Virtual DOM** keeps React fast by minimizing real DOM changes
