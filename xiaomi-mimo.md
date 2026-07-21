# MiMo 首页技术调研报告

> **调研对象:** https://mimo.xiaomi.com/  
> **调研日期:** 2026-07-16  
> **调研方式:** Edge DevTools (Elements、Network、Sources、Coverage、Lighthouse、Performance) + WebFetch 静态分析

---

## 1. 调研目标

分析 MiMo 首页的前端技术栈、页面结构和动画实现方式，为后续登录页的技术选型提供参考。本次调研**只做技术分析，不实现页面**。

---

## 2. 调研方法

### 2.1 DevTools 面板

| 面板                  | 用途                        | 实际发现                                                                                                                                                                            |
| --------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Elements / Styles** | DOM 层级、CSS 属性          | class 名全部为哈希格式（CSS Modules）；`position: absolute`、`overflow: hidden`、`clip-path: polygon(...)`、`pointer-events: none`、`z-index` 分层；发现大量 `--tw-*` CSS Variables |
| **Network**           | JS chunk、字体、图片、CDN   | 7 个 JS chunk、19 条请求；`lib-react.xxx.js`、`lib-router.xxx.js`；MiSans 字体；小米 CDN；gzip 压缩；图片主要为 PNG                                                                 |
| **Sources**           | 搜索关键词，定位动画库      | 详见下表                                                                                                                                                                            |
| **Coverage**          | JS/CSS 代码使用率           | JS 使用率 47%，CSS 使用率仅 4.4%                                                                                                                                                    |
| **Lighthouse**        | 性能、无障碍、最佳实践、SEO | Performance 62 / Accessibility 79 / Best Practices 100 / SEO 82                                                                                                                     |
| **Performance**       | 录制 18s 运行时性能         | CLS=0、GPU Timeline 持续活跃、无 Long Task                                                                                                                                          |
| **Console**           | DOM 节点统计                | `document.getElementsByTagName('*').length` → 889 个节点                                                                                                                            |

### 2.2 Sources 关键词搜索结果

| 关键词                                |            搜索结果             | 结论                                     |
| ------------------------------------- | :-----------------------------: | ---------------------------------------- |
| `requestAnimationFrame`               |              存在               | rAF 在 bundle 中，但未通过断点定位调用链 |
| `IntersectionObserver`                |             0 结果              | **页面不使用 IntersectionObserver**      |
| `@keyframes`                          | 11 处（`styles.7e3f6c41.css`）  | CSS Animation 确认使用                   |
| `animation`                           |          13 处（同上）          | 同上                                     |
| `transition`                          |       125 条（4 个文件）        | CSS transition 大量使用                  |
| `framer`                              | 2 处（`lib-react.a6be410a.js`） | **Framer Motion 确认使用**               |
| `gsap`                                |             0 结果              | 未使用 GSAP                              |
| `prefers-reduced-motion`              |    1 处（`4752.785c307.js`）    | 无障碍动画降级已考虑                     |
| `three` / `pixi` / `anime` / `lottie` |            均 0 结果            | 无 3D/Canvas 动画库                      |

**重要提示:** Sources 搜索到 `requestAnimationFrame` 只能证明代码中存在该 API，**不能直接等同于它负责了背景文字滚动**，除非通过断点定位到调用栈。

---

## 3. 页面与 DOM 结构

### 3.1 整体架构

MiMo 是一个**单页应用（SPA）**，使用 hash 路由（`/#paper`、`/#blog`、`/#joinUs`），支持中英文双语（`/zh/` 路径前缀）。静态资源托管在小米 CDN（`cdn.cnbj1.fds.api.mi-img.com`）。

**渲染模式：** 禁用 JavaScript 后页面仍显示导航栏、背景和中文标题（英文标题消失），首屏 HTML 由服务端预渲染（SSR 或 SSG，可能为 Next.js）。_[已确认]_

**DOM 规模：** 整页仅 **889 个 DOM 节点**。对于包含 Hero 背景动画（大量 `<span>` 重复）的页面，这个数字非常轻量——通常类似复杂度的 SPA 在 2000-5000 之间。_[已确认]_

### 3.2 Hero 区域（桌面端）

```
Hero
├── heroBackground
│   └── textPattern          ← 不是图片 / Canvas / SVG
│       ├── patternRow       ← 多行重复
│       │   ├── <span>M I M O</span>
│       │   ├── <span>M I M O</span>
│       │   ├── <span>M I M O</span>
│       │   └── ...          ← 同一行内重复多次
│       └── patternRow × N   ← 多行，视觉上覆盖整个背景
├── h1 "你好，我是 MiMo"      ← 主标题层
├── altTitleLayer             ← 备选标题（可能英文版）
└── Cards                     ← 模型展示卡片
```

**关键发现:** 背景完全由 HTML `<span>` 元素重复构成。_[已确认]_

### 3.3 Hero 区域（移动端）— 两套完全不同的设计

桌面端和移动端**不是简单的响应式缩放，而是两套独立的 UI 方案**。_[已确认]_

| 视图                      | Hero 表现                                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 桌面端（≥1024px）         | MIMO 背景文字横向滚动 + "你好，我是 MiMo" 标题 + 模型卡片横向排列                                                    |
| 移动端 iPhone 14（390px） | **背景滚动完全消失**；标题不显示；卡片变为 **3D flip card**，点击以水平中心轴翻转，背面显示 "Welcome to my homepage" |

**技术分析:** 桌面端用大屏幕做视觉冲击（动画 + 卡片），移动端砍掉所有重动画，改用 3D flip card 交互。移动端的 DOM 不包含背景 `<span>` 结构——这也是 889 个节点如此轻量的关键原因。React 组件可能通过 `matchMedia` 或 Framer Motion 的响应式 API 检测宽度，渲染完全不同的子组件。flip card 依赖 CSS `transform: rotateY()` + `perspective` + `backface-visibility: hidden`。_[推测]_

### 3.4 其他区域

- **模型展示卡片** — 三个横向排列的图片卡片（MiMo-V2.5-Pro、MiMo-V2.5、MiMo-V2.5-TTS）
- **Build with MiMo** — 两个链接卡片（Web Demo、API Access）
- **论文 / 博客列表** — 编号列表样式（01-08 / 01-12），与招聘卡片复用同一组件模式
- **Join Us** — 六张招聘卡片

---

## 4. 技术栈分析

### 4.1 已确认

| 技术                                              | 证据来源                                                          |
| ------------------------------------------------- | ----------------------------------------------------------------- |
| React                                             | Network → `lib-react.a6be410a.js`                                 |
| React Router                                      | Network → `lib-router.xxx.js`                                     |
| **Framer Motion**                                 | Sources 搜索 `framer` → `lib-react.a6be410a.js` 中 2 处           |
| **Tailwind CSS**                                  | Styles 面板 → 大量 `--tw-*` CSS Variables（`--tw-bg-opacity` 等） |
| **CSS Modules**                                   | Elements 面板 → 所有 class 名为哈希格式（如 `_card_x7k2f`）       |
| CSS `@keyframes`（11 处）、`transition`（125 处） | Sources 搜索 → `styles.7e3f6c41.css`                              |
| MiSans 字体（Regular / Medium / Semibold / Bold） | Network → Fonts                                                   |
| 小米 CDN                                          | Network → 域名 `cdn.cnbj1.fds.api.mi-img.com`                     |
| gzip 压缩                                         | Network → `content-encoding: gzip`                                |
| 7 个 JS chunk（路由级 code-splitting）            | Network → JS 文件数                                               |
| `clip-path: polygon(...)`                         | Elements → Styles 面板                                            |
| `requestAnimationFrame`                           | Sources 搜索                                                      |
| `prefers-reduced-motion`                          | Sources 搜索 → 1 处                                               |
| SSR / SSG 预渲染                                  | 禁用 JS 后首屏内容仍可见                                          |
| **CLS=0、GPU 合成、无 Long Task**                 | Performance 面板录制 18s                                          |

### 4.2 未使用（已排除）

| 技术                                       | 证据                                    |
| ------------------------------------------ | --------------------------------------- |
| IntersectionObserver                       | Sources 搜索 0 结果                     |
| GSAP / Three.js / Pixi / anime.js / Lottie | Sources 搜索均 0 结果                   |
| brotli 压缩                                | Network → 仅 gzip，无 br                |
| 字体 preload                               | Network → 未发现 `<link rel="preload">` |
| WebP/AVIF 图片                             | Network → 主要为 PNG                    |

### 4.3 CSS 方案：Tailwind CSS + CSS Modules

`--tw-*` 变量是 Tailwind CSS 的标志——用于控制透明度等动态值。哈希 class 名是 CSS Modules 的构建产物——每个类名生成唯一哈希，实现组件级样式隔离。两者组合使用：Tailwind 提供 utility class 和设计系统约束，CSS Modules 提供样式隔离。_[已确认]_

### 4.4 尚未确认

| 项目                                 | 说明                                                       |
| ------------------------------------ | ---------------------------------------------------------- |
| 构建工具（Vite / Webpack / Next.js） | SSR 暗示可能为 Next.js，`doc_build/static/` 路径不足以确认 |
| rAF 具体控制哪段动画                 | 需断点定位调用栈                                           |
| Framer Motion 具体负责哪些组件       | 2 处引用对应组件未定位                                     |
| HTTP 协议版本（h2/h3）               | Network → Protocol 列未查看                                |
| `Cache-Control` 策略                 | Network → Response Headers 未验证                          |

---

## 5. 动画效果逐项分析

### 5.1 Hero 背景 — MIMO 文字滚动

**效果:** "M I M O" 重复文字在背景中横向无限循环滚动，多行以不同速度移动，形成视差层次感。**仅在桌面端显示，移动端完全移除。**

**实现分析:** CSS 使用 `position: absolute`、`pointer-events: none`、`overflow: hidden` _[已确认]_ 将背景层剥离。`requestAnimationFrame()` 存在于源码中，配合 `transform: translateX()` _[推测]_ 逐帧更新每行偏移。另一种可能是 CSS `@keyframes` + `animation`，不同 `animation-duration` 和 `delay` 也可产生异步滚动。JS 禁用后鼠标移动时文字仍有视觉变化（可能为 CSS `:hover` 局部响应），整体滚动在 JS 禁用后是否持续未验证。

**复杂度:** 中等。

### 5.2 标题文字入场

**效果:** "你好，我是 MiMo" 逐字/逐行淡入，伴随上移。**仅桌面端显示。**

**实现分析:** CSS `@keyframes` 和 `animation` 已确认（11/13 处）。Framer Motion 也已确认。标题入场可能是 CSS Animation（`animation-delay` 级联），也可能是 Framer Motion 的 `animate` + `staggerChildren`。两者均有证据。

**复杂度:** 低。

### 5.3 卡片 Hover

**效果:** 鼠标悬停时卡片上浮、阴影加深、箭头 `→` 微移。

**实现分析:** CSS `transition` 已确认 125 处。`:hover` + `transform: translateY()` + `box-shadow` + `transition` [推测具体值] 是标准纯 CSS 实现。

**复杂度:** 低。

### 5.4 卡片滚动入场（Scroll Reveal）

**效果:** 卡片滚动到可视区域时从下方淡入。

**实现分析:** IntersectionObserver **不存在**。Framer Motion 已确认——scroll reveal 最可能由 `whileInView` API 实现，声明式触发，无需手动 Observer。

**复杂度:** 中低。

### 5.5 移动端 Flip Card

**效果:** 移动端卡片点击后以水平中心轴翻转，背面显示文字。**桌面端不存在此交互。**

**实现分析:** CSS `transform: rotateY(180deg)` + `perspective` + `backface-visibility: hidden` + `transition`。_[推测]_

**复杂度:** 中低。

### 5.6 clip-path 形状裁剪

**效果:** 部分元素使用不规则多边形裁剪。

**实现分析:** CSS `clip-path: polygon(...)` _[已确认]_。配合 `transition` 在 hover/scroll 时改变形状。

**复杂度:** 低。

### 5.7 动画技术总览

| 动画               | 实现方式                                        |  确认度  |
| ------------------ | ----------------------------------------------- | :------: |
| 背景 MIMO 滚动     | rAF + translateX，或 CSS @keyframes，或两者结合 | 部分确认 |
| 标题入场           | CSS @keyframes 或 Framer Motion                 | 部分确认 |
| 卡片 hover         | CSS :hover + transition                         |   确认   |
| 卡片 scroll reveal | Framer Motion `whileInView`                     |   确认   |
| 移动端 flip card   | CSS 3D transform                                |   推测   |
| clip-path          | CSS clip-path                                   |   确认   |

---

## 6. 性能与可访问性

### 6.1 Performance 面板

录制约 18 秒 _[已确认]_：

- **CLS = 0** — 页面无任何布局偏移
- **GPU Timeline 持续活跃** — 未观察到明显 Layout 和 Long Task，动画大概率以 `transform` / `opacity` 等 GPU 友好属性实现，未触发持续的 Layout/Paint 循环。
- **Main Thread 无 Long Task** — 无持续阻塞，帧率稳定
- 动画主要走 `transform` + `opacity` + Composite 路径 [推测，基于无 Layout/Paint 循环的观察]

**评价:** 动画性能优秀。CLS=0 + 无 Long Task + GPU Timeline 活跃，团队对动画的渲染路径有明确把控。

### 6.2 Lighthouse (Desktop)

| 指标           | 分数 | 主要扣分原因                                          |
| -------------- | :--: | ----------------------------------------------------- |
| Performance    |  62  | JS bundle 偏大（最大 chunk 679 kB）、CSS 95.6% 未使用 |
| Accessibility  |  79  | 未深入分析                                            |
| Best Practices | 100  | 无扣分                                                |
| SEO            |  82  | 未深入分析                                            |

### 6.3 Coverage（代码使用率）

| 类型         |  使用率  | 说明                                          |
| ------------ | :------: | --------------------------------------------- |
| 总体         |   47%    | 689 kB / 1.5 MB                               |
| CSS          | **4.4%** | 全站样式集中打包，首页只用到极少部分          |
| React Router |  12.9%   | 路由级 code-splitting 存在但 chunk 内裁剪不够 |

7 个 JS chunk 说明已做路由级拆分，但 Coverage 显示 chunk 内部仍有 53% 未使用——尤其 React Router 87.1% 未使用，按路由更精细地拆分 chunk 有优化空间。

### 6.4 资源优化

- 压缩: gzip（非 brotli）_[已确认]_
- 字体: 未 preload _[已确认]_
- 图片: 主要为 PNG，未使用 WebP/AVIF _[已确认]_
- 缓存: `Cache-Control` 未验证 _[尚未确认]_

### 6.5 可访问性

- `prefers-reduced-motion` 在 bundle 中引用（1 处）_[已确认]_
- 禁用 JS 后首屏骨架可见（SSR/SSG）_[已确认]_
- 移动端砍掉所有持续动画，本身降低了低性能设备的负担

---

## 7. 已确认 / 推测 / 未确认

### A. 已确认

- React + React Router
- Framer Motion
- Tailwind CSS + CSS Modules
- CSS `@keyframes`（11 处）、`transition`（125 处）
- 小米 CDN + MiSans 字体 + gzip 压缩
- 7 个 JS chunk（路由级 code-splitting）
- 背景由 HTML `<span>` 构成
- `clip-path: polygon(...)`、`position: absolute`、`overflow: hidden`、`pointer-events: none`
- `requestAnimationFrame` 存在于 bundle 中
- `prefers-reduced-motion` 无障碍支持
- SSR/SSG 预渲染
- CLS=0、GPU 合成、无 Long Task
- DOM 仅 889 个节点
- 桌面端与移动端是两套独立 Hero 设计
- IntersectionObserver / GSAP / Three.js 不存在

### B. 推测

- rAF 负责背景滚动（存在但未定位调用链）
- Framer Motion `whileInView` 负责 scroll reveal（库已确认，API 为推测）
- 移动端 flip card 使用 CSS 3D transform
- `transform: translateX()` / `translateY()` 用于位移动画

### C. 尚未确认

- 构建工具具体类型（SSR 暗示可能为 Next.js）
- rAF 调用栈和对应动画
- Framer Motion 具体控制哪些组件
- HTTP 协议版本（h2/h3）
- `Cache-Control` 策略
- 页面失焦后动画行为

---

## 8. 进一步验证清单

- Sources 中给 `requestAnimationFrame` 设断点，观察调用栈
- Performance 录制中搜索 "Layout" 事件，确认是否完全走 Composite
- Device Toolbar 录制移动端 flip card 交互的 FPS
- Animations 面板查看 CSS animation 时间轴
- 开启 `prefers-reduced-motion: reduce`（Rendering 面板），验证降级策略
- Network 查看 Protocol 列（h2/h3）和 `Cache-Control`
- HTML 源码搜索 `__NEXT_DATA__` 确认 SSR 框架
- 字体 `font-display` 策略

---

## 9. 总结

### 技术栈全景

**React + React Router + Framer Motion + Tailwind CSS + CSS Modules + MiSans 字体 + 小米 CDN。** 无 3D/Canvas 库。

### 动画策略

CSS transition / @keyframes 做主流动画 + Framer Motion 做 scroll reveal + 背景滚动可能由 rAF 与 CSS Animation 共同完成（rAF 存在但未定位调用链）。IntersectionObserver 完全不用——Framer Motion 的声明式 `whileInView` 替代了手动 Observer。

### 桌面/移动端分离

不是响应式缩放，是两套独立 Hero。桌面端用背景动画做视觉冲击，移动端砍掉所有重动画，换成 3D flip card。移动端 DOM 不含背景 `<span>`——这也是仅 889 个节点的关键原因。

### 优点

CLS=0、GPU 合成、无 Long Task；DOM 轻量；Tailwind + CSS Modules 架构规范；7 chunk code-splitting；SSR/SSG 预渲染；`prefers-reduced-motion` 无障碍支持。

### 缺点

CSS 95.6% 未使用（全站样式集中打包）；JS 53% 未使用；图片为 PNG 非 WebP；字体未 preload；gzip 非 brotli；Lighthouse 62 分。

### 对后续开发的启示

轻量动画策略可复用：**背景装饰用 rAF 做连续滚动 + 卡片出入场用 Framer Motion `whileInView` + 微交互用纯 CSS transition，无需额外动画依赖**。桌面/移动端分离策略也值得借鉴——移动端不要只是缩小桌面版，而是重新设计交互。

---

### 附录：对登录页的技术建议

> 以下基于本次调研结论，提出技术选型建议，供后续负责登录页开发的同事参考。具体实现方案不在本次调研范围内。

**建议保留的技术方案：**

| 技术 | 理由 |
|------|------|
| React + React Router | 团队已有经验，MiMo 验证了该组合在品牌页面的可行性 |
| Framer Motion | 入场动画和 scroll reveal 的声明式方案，比手动 IntersectionObserver 更内聚 |
| Tailwind CSS | utility-first 开发效率高，`--tw-*` 变量提供设计系统约束 |
| CSS transition | 所有微交互（hover、按钮、input focus）用纯 CSS，不引入 JS 开销 |
| `prefers-reduced-motion` | 从项目一开始就加入无障碍动画降级 |

**不建议照搬的做法：**

| MiMo 的做法 | 建议改为 | 原因 |
|------------|---------|------|
| 全站 CSS 集中打包（首页 95.6% 未使用） | 登录页按需加载 CSS | 登录页功能单一，不需要全站样式 |
| PNG 图片 | WebP（带 PNG fallback） | 传输体积更小 |
| 字体未 preload | `link rel="preload"` 关键字体 | 首屏渲染更快 |
| gzip 压缩 | brotli（如果 CDN 支持） | 相同文件再省 15-20% |

**技术分工建议（供参考）：**

| 层级 | 建议方案 | 负责 |
|------|---------|------|
| 背景装饰动画 | CSS @keyframes 或 rAF 自建（参考 MiMo 背景滚动思路） | 动画 |
| 标题 / 卡片入场 | Framer Motion `animate` + `staggerChildren` | 动画 |
| 按钮 / 输入框交互 | CSS `:hover` + `transition` | 样式 |
| 登录表单状态 | React Context 或 `useState` | 逻辑 |
| API 通信 | `fetch` 或 axios | 逻辑 |

**注意:** 以上为技术选型建议，具体实现需根据登录页的实际设计稿和交互需求调整。
