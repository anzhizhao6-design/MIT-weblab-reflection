# web.lab 2026 — HTML & CSS Notes

> MIT web.lab IAP 2026 • [Schedule](https://site.weblab.is/schedule) • [YouTube Playlist](https://www.youtube.com/playlist?list=PLVAxjdyIU8_z6iFliCz-n9zqf_ZRsbyPA)

---

## Chapter 1: HTML & CSS

### 1.1 The Big Picture

| Layer      | Analogy       | Technology     |
| ---------- | ------------- | -------------- |
| Structure  | Bones         | **HTML**       |
| Appearance | Skin          | **CSS**        |
| Behavior   | Muscles/Brain | **JavaScript** |

- **HTML** describes the content and structure of a page.
- **CSS** controls how it looks.
- Web design fundamentally = **nested boxes** — boxes inside boxes.

---

### 1.2 HTML

#### Basic Document

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Page Title</title>
  </head>
  <body>
    <h1>Main Heading</h1>
    <p>A paragraph.</p>
  </body>
</html>
```

- `<!DOCTYPE html>` — tells browser to use latest HTML version
- `<html>` — root element wrapping everything
- `<head>` — metadata (title, CSS links, scripts); **not visible** on the page
- `<body>` — all visible content

#### Common Tags

| Tag                              | Purpose                                         |
| -------------------------------- | ----------------------------------------------- |
| `<h1>`–`<h6>`                    | Headings                                        |
| `<p>`                            | Paragraph                                       |
| `<div>`                          | Generic **block** container (no default style)  |
| `<span>`                         | Generic **inline** container (no default style) |
| `<a href="...">`                 | Hyperlink                                       |
| `<img src="..." alt="...">`      | Image (self-closing)                            |
| `<ul>` / `<ol>` + `<li>`         | Unordered / ordered lists                       |
| `<nav>`, `<section>`, `<footer>` | Semantic containers                             |

> **Block** (`<div>`) starts on a new line and takes full width. **Inline** (`<span>`) stays in the flow.

#### Nesting Rule

Tags must be properly nested — never cross them!

#### Attributes

Extra info added to opening tags: `<tag attr="value">Content</tag>`

- `href` — destination URL for links
- `src` — file path for images (relative to the HTML file)
- `alt` — text fallback for images (critical for **accessibility** and SEO)
- `class`, `id` — hooks for CSS targeting

#### Semantic HTML

Prefer meaningful tags over generic `<div>`s:

```html
<!-- ❌ -->
<div class="nav">...</div>
<!-- ✅ -->
<nav>...</nav>
```

**Why:** screen readers, keyboard navigation, SEO (web crawlers), and code readability. Use `<div>` only for pure styling wrappers.

#### `id` vs `class`

|              | `id`             | `class`               |
| ------------ | ---------------- | --------------------- |
| Uniqueness   | One per document | Reusable              |
| Per element  | One              | Many: `class="a b c"` |
| CSS selector | `#name`          | `.name`               |

> **Rule of thumb: only use classes for CSS styling** — more reusable, less specificity headaches.

---

### 1.3 CSS

#### Ruleset Structure

```css
selector {
  property: value;
}
```

#### Selectors & Specificity

```css
div { ... }       /* element — least specific */
.info { ... }     /* class */
#unique { ... }   /* id — most specific */
```

When rules conflict: **`#id > .class > element`**. Use classes to keep specificity flat.

#### Linking CSS

```html
<head>
  <link rel="stylesheet" href="style.css" />
</head>
```

---

### 1.4 Key CSS Concepts

#### The Box Model

Every element is a box: **content → padding → border → margin**

- **Content** — the actual text/image
- **Padding** — space inside the border (shows background color)
- **Border** — the edge
- **Margin** — space outside (transparent)

Inspect it: right-click → "Inspect Element" in browser dev tools.

#### Margin/Padding Shorthand (TRBL)

```css
margin: 10px; /* all 4 sides */
margin: 10px 20px; /* top/bottom | left/right */
margin: 10px 20px 30px; /* top | sides | bottom */
margin: 10px 20px 30px 40px; /* top → right → bottom → left (clockwise) */
```

#### 8pt Grid System

All spacing = multiples of **8px**.

#### CSS Variables

```css
:root {
  --primary: #3498db;
}
.nav {
  color: var(--primary);
}
```

Names **must** start with `--`. Define in `:root` for global access. Change once, updates everywhere.

#### Utility Classes

Single-purpose classes, prefixed with `u-`:

```css
.u-textCenter {
  text-align: center;
}
```

#### Border Radius

```css
border-radius: 8px; /* rounded corners */
border-radius: 50%; /* perfect circle (for square images) */
```

#### Flexbox

The go-to layout tool. Enable on a container, then control its children:

```css
.container {
  display: flex;
}
.child {
  flex-grow: 1; /* fill available space */
}
```

Think in terms of **containers and subcontainers**. Learning tools: [Flexbox Froggy](https://flexboxfroggy.com), [CSS-Tricks Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/).

---

### 1.5 Takeaways

1. **HTML = nested boxes.** Every page is boxes inside boxes.
2. **CSS = rules.** Each rule says "these boxes look like this."
3. **Use semantic HTML** for accessibility and SEO.
4. **Style with classes**, not IDs — flat specificity, easier to maintain.
5. **The box model** (content → padding → border → margin) is layout 101.
6. **CSS variables** in `:root` keep your design consistent.
7. **Flexbox** for layout. MDN for reference (not W3Schools).
