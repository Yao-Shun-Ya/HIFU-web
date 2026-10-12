# 技术手册 · ARCHITECTURE

> 本文只讲 **这个网站本身怎么搭、怎么写、怎么调、怎么部署**，不讲它承载的专业内容。
> 目标读者：想接手 / 二次开发 / 复刻这套做法的人。
> 阅读方式：第 1–3 节建立全局认知；第 4–10 节是逐层实现细节（含踩坑记录）；
> 第 11–13 节是质量与降级；第 14–17 节是测试、排障、部署与二次开发教程。

---

## 0. 工程目标（一切取舍的出发点）

这套代码的所有决策都服务于 6 条硬性目标。评审任何改动时，先问它是否伤害其中任何一条：

| # | 目标 | 具体含义 | 落地手段 |
| --- | --- | --- | --- |
| G1 | **首屏即可用** | 无 JS、慢网、脚本被拦截时，内容必须完整可读 | 全站静态预渲染；动效全部 CSS 驱动；`<noscript>` 兜底 |
| G2 | **零闪烁** | 主题、语言在首帧就正确，不得出现「先白后黑」「先中文后英文」 | `layout.tsx` 内联脚本在 `<head>` 里同步改 `<html>` |
| G3 | **可交互但不炫技** | 动效服务于信息层级，且尊重系统偏好 | `prefers-reduced-motion` 全局开关；只动 `transform` / `opacity` |
| G4 | **可审计** | 页面上每个数字都能追溯到代码里的一个常量 | `src/lib/` 单一数据源；图表与计算共用同一批常量 |
| G5 | **可访问** | 键盘、读屏、对比度、焦点顺序都要过关 | skip link、`:focus-visible`、`aria-live`、语义标签 |
| G6 | **可托管到任意角落** | 不依赖任何服务端能力 | 全部路由 `○ (Static)`；`robots/sitemap` 也是构建期产物 |

---

## 1. 技术选型与理由

### 1.1 依赖清单（生产依赖只有 6 个）

```jsonc
{
  "next": "16.4.0",              // App Router + Turbopack + RSC
  "react": "19.3.0",             // useSyncExternalStore 等
  "react-dom": "19.3.0",
  "clsx": "^2.1.1",              // 条件类名
  "tailwind-merge": "^3.7.0",    // 同名工具类后者覆盖前者
  "lucide-react": "^1.55.0",     // 图标（tree-shakable，单图标约 0.3KB）
  "motion": "^14.1.0"            // 仅用于 3 处：导航药片、分段控件、移动菜单
}
```

开发依赖关键点：`tailwindcss@4` + `@tailwindcss/turbopack`（Tailwind 官方 Turbopack 加载器）、
`typescript@5`、`eslint@9` + `eslint-config-next@16`。

### 1.2 为什么是这些，而不是「更流行」的组合

| 常见做法 | 本项目做法 | 理由 |
| --- | --- | --- |
| `shadcn/ui` + Radix | 手写 `ui.tsx`（178 行）里的 9 个原语 | 展示型站点的组件形态高度定制；手写才能完全掌控焦点与动效 |
| `recharts` / `echarts` | **手写 SVG 图表**（8 个组件） | 需要精确复刻论文图形的排版语言；hover / 动画 / 无障碍全部可控，且首屏无图表库 JS |
| `framer-motion` 全站动画 | **CSS-first**：`@keyframes` + IntersectionObserver，JS 只写 CSS 变量 | JS 动画在 SSR 首屏不生效，也无法用一行 CSS 关掉；Motion 只留给「跨元素共享布局」 |
| `next-intl` / `i18next` | 60 行的 `useLocale()` + `Bi` 类型 | 双语是**内容属性**而非运行时需求；框架只增加体积与 hydration 风险 |
| `zustand` / Redux | 无状态库 | 全站唯一的跨组件状态是语言与主题，它们属于 DOM，用 `useSyncExternalStore` 订阅 DOM 最省事且天然无闪烁 |
| CSS-in-JS | Tailwind v4 + 少量 `@utility` | 静态站点最友好：零运行时、构建期裁剪、`@theme` 直接产出 CSS 变量 |
| `next/font` 引入中文字体 | **不引入**中文字体 | 中文 webfont 动辄 3–8MB，与 G1 冲突；西文用 `Inter` / `Geist Mono` 自托管 |

### 1.3 版本相关的注意事项

- **Next 16 + `cacheComponents: true`**：把整棵路由树在构建期冻结为静态 HTML。
  任何对 `cookies()` / `headers()` 的误用会在构建期报错，而不是悄悄退化成动态页。
- **Tailwind v4** 没有 `tailwind.config.js`，主题全部写在 CSS 里（`@theme inline`）。
  注意 `dark:` 变体默认跟随 `prefers-color-scheme`；本项目用
  `@custom-variant dark (&:where(.dark, .dark *));` 改回「class 驱动」。
- **React 19**：`useEffect` 里同步 state 会被 `react-hooks/set-state-in-effect` 警告。
  本项目在 `useInView` / `ThemeToggle` / `useEased` 三处做了**带注释的定点豁免**，而不是全局关规则。

---

## 2. 目录结构逐文件解读

```
web/
├── next.config.ts            cacheComponents / partialPrefetching / Turbopack 的 CSS 规则
├── tsconfig.json             strict + "@/*" 别名 + moduleResolution: bundler
├── eslint.config.mjs         ESLint 9 扁平配置（core-web-vitals + typescript）
├── docs/ARCHITECTURE.md      本文
├── public/
│   └── figures/*.png         原始图片（只作为「可查原图」的静态资源）
└── src/
    ├── app/
    │   ├── layout.tsx        根布局：字体 / metadata / JSON-LD / 内联引导脚本 / noscript 兜底
    │   ├── globals.css       设计令牌 + 工具类 + 全部 keyframes（629 行，见第 4 节）
    │   ├── page.tsx          首页（服务端壳）→ home-view.tsx
    │   ├── {overview,assessment,results,methods,about}/
    │   │   ├── page.tsx      只 export metadata，然后渲染 view
    │   │   └── view.tsx      真正的页面（客户端组件，因为要 useLocale）
    │   ├── not-found.tsx     404（保持品牌语言）
    │   ├── icon.svg          站点图标
    │   ├── opengraph-image.tsx  next/og 生成的 1200×630 分享图
    │   ├── robots.ts / sitemap.ts   构建期产出的元数据路由
    ├── components/
    │   ├── site/             Nav Footer Hero HifuVisual Reveal motion ui LangToggle ThemeToggle
    │   ├── charts/           8 个手写 SVG 图表 + helpers.ts + hover.tsx（命中检测与读数框）
    │   └── assessment/       AssessmentClient（编排）+ Controls + RiskGauge + ContributionBars
    └── lib/
        ├── bi.ts             双语原语：type Bi = { zh; en }
        ├── i18n.tsx          useLocale / useMetaSync（订阅 <html data-locale>）
        ├── data.ts           站点文案与结构化内容（全部 Bi）
        ├── model.ts          计算内核：分值映射、GEOMETRY、evaluate()、示例病例
        ├── stats.ts          erf / Phi / PhiInv / logit / ROC / 校准 / DCA 采样
        └── utils.ts          cn() + pct()
```

**约定：`page.tsx` 薄、`view.tsx` 厚。**
`page.tsx` 是服务端组件，负责 `export const metadata`；`view.tsx` 标 `"use client"`，
因为要调用 `useLocale()`。这样 metadata 保持服务端能力，交互逻辑集中一处，
「哪些文件会进客户端 bundle」也一目了然。

---
## 3. 渲染模型与构建

### 3.1 全站是静态的

`npm run build` 的产物是 13 条 `○ (Static)` 路由：

```
/  /_not-found  /about  /assessment  /icon.svg  /methods
/overview  /results  /robots.txt  /sitemap.xml  /opengraph-image
```

意味着：没有 Server Action、没有 Route Handler、没有运行时数据获取。
部署时既可以交给任意 CDN，也可以用 `next start` 起一个纯静态 Node 进程（见第 16 节）。

### 3.2 `next.config.ts` 三行配置各自做什么

```ts
const nextConfig: NextConfig = {
  cacheComponents: true,     // 构建期冻结整棵树；出现动态访问即构建报错
  partialPrefetching: true,  // 路由切换只传 RSC 增量，不重传整页外壳
  turbopack: {
    rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } },
  },
};
```

- `partialPrefetching` 与自绘动效配合得很好：`<main>` 里的内容被替换时，
  `Nav` / `Footer` / 背景层完全不重挂载，因此不会出现「切页时导航闪一下」。
- Turbopack 的 CSS 规则把 `.css` 交给 Tailwind 加载器。这是 Tailwind v4 + Turbopack 的官方接法，
  好处是 **dev 下改 CSS 是增量热更新**，不需要 PostCSS 配置。

### 3.3 怎么确认「页面真的是静态的」

```bash
npm run build | tail -20        # 看 Route (app) 表格，全部应是 ○ (Static)
curl -sI http://localhost:3000/overview | grep -i cache-control
```

如果某页意外变成 `ƒ (Dynamic)`，先检查：
是否在服务端组件里调用了 `cookies()` / `headers()` / `await request` / `new Date()`（构建期求值会引入不确定性）。
**本项目刻意不写 `new Date()`**（页脚年份是硬编码常量），否则每次构建 HTML 都会变，
CDN 缓存与 diff 都会失稳。

### 3.4 客户端边界（谁进了浏览器 bundle）

只有 4 类文件带 `"use client"`：

1. `*/view.tsx`（要用 `useLocale`）
2. `components/site/*` 中的交互件（Nav / Footer / Hero / Reveal / motion / LangToggle / ThemeToggle）
3. `components/charts/*`、`components/assessment/*`（要挂事件与 rAF）
4. `lib/i18n.tsx`

`lib/model.ts`、`lib/stats.ts`、`lib/data.ts` 没有 `"use client"`，
但它们被客户端组件 import，所以同样会被打进 bundle——这是有意的：**计算必须在浏览器里发生**
（滑杆一动就要重算），同时它们也是纯函数、无副作用，服务端渲染时同样能跑，
于是首屏 HTML 里已经包含计算结果（例如默认状态下的总分与概率），水合前后数值一致。

---

## 4. 设计系统与 CSS 架构（`globals.css` 629 行）

整个样式系统只有 **一个文件**，按 6 个区块组织，顺序即层叠优先级：

```
1  @import "tailwindcss"          + @custom-variant dark
2  :root / .dark                  设计令牌（两套主题）
3  @theme inline                  把令牌暴露成 Tailwind 工具类
4  html / body / main / a11y      全局基础
5  @utility ...                   自定义工具类（surface / glass / sheen / spot / tilt / reveal ...）
6  @keyframes + @media            动画与降级（reduced-motion / print）
```

### 4.1 令牌：一套变量，两套主题

```css
:root {
  --bg: #f4f7fb;  --surface: #ffffff;  --fg: #0b1220;  --muted: #55657d;
  --line: #e3e9f2; --line-strong: #cfd9e8;
  --brand: #0f9d8f; --brand2: #12b3a6; --brand-soft: ...;
  --mid: #c9860b;  /* 警示 / 中等强度 */
  --e-out: cubic-bezier(0.22, 1, 0.36, 1);   /* 入场 */
  --e-inout: cubic-bezier(0.65, 0, 0.35, 1); /* 往返 */
  --e-soft: cubic-bezier(0.16, 0.84, 0.44, 1);
}
.dark { /* 同名变量整套覆盖 */ }
```

**教学点：把缓动函数也做成令牌。** 全站动效之所以「像一个设计师做的」，
很大程度上是因为只有 3 条缓动曲线在反复使用，而不是各处随手写 `ease`。

`@theme inline` 再把它们变成工具类：

```css
@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-brand: var(--brand);
  --font-sans: var(--font-inter);
  --font-mono: var(--font-geist-mono);
}
```

于是 `bg-surface`、`text-brand`、`border-line-strong` 这些类会**引用 CSS 变量**而不是写死色值：
切换 `.dark` 时不需要重编译，也不需要 `dark:` 前缀写满每个颜色类。
只有确实需要「深色下换结构/换装饰」的地方才用 `dark:`。

### 4.2 `@utility` 与层叠：一个必须知道的坑

Tailwind v4 的 `@utility` 生成的规则位于 `utilities` **层**内。
未分层的普通 CSS 特异性高于任何分层规则，因此：

```css
@utility reveal     { opacity: 0; transform: translateY(26px); }
@utility reveal-in  { opacity: 1; transform: none; }   /* 同类同层，靠源码顺序取胜 */
```

这两条同层、同特异性，`reveal-in` 写在后面所以能覆盖 `reveal`。
但**变体**（如 `reveal` 的 `mask` / `blur` 变体）如果写成普通规则就会盖过 `reveal-in`，
导致元素永远停在初始态。所以变体一律包在 `:where()` 里，把特异性压到 0：

```css
:where([data-v="mask"]) { clip-path: inset(0 0 100% 0); }
.reveal-in:where([data-v="mask"]) { clip-path: inset(-40% -40% -40% -40%); }
```

> 经验法则：**任何「按属性切换的初始态」都用 `:where()` 包起来**，让状态类永远能赢。

### 4.3 氛围层：让纯色不廉价

| 工具类 | 效果 | 实现要点 |
| --- | --- | --- |
| `surface` | 卡片底 + 描边 + 极长程阴影 | 阴影用 `color-mix(in oklab, ...)`，深色下自动变浓 |
| `glass` | 导航/浮层的毛玻璃 | `backdrop-filter: blur() saturate()` + 半透明底色 |
| `grain-layer` | 全屏胶片颗粒 | 内联 SVG `feTurbulence` 作 `background-image`，`mix-blend-mode: overlay`，`pointer-events: none` |
| `hero-grid` | 透视网格背景 | 两条 `repeating-linear-gradient` + `mask-image` 渐隐 |
| `spot` | 卡片跟随指针的光斑与描边辉光 | `::before` 用 `radial-gradient(circle at var(--mx) var(--my))`，JS 只写两个变量 |
| `sheen` | 主按钮上的光扫 | `::after` 斜向渐变 + `translateX` 动画，仅在 `:hover` 播放 |
| `tilt` | 卡片 3D 姿态 | `rotateX(var(--rx)) rotateY(var(--ry)) translate3d(var(--tx), var(--ty), 0)` |

**教学点：JS 不参与绘制。** 所有「跟随指针」的效果，JS 的职责只有一个——
在 `requestAnimationFrame` 里给元素写 `--mx/--my/--rx/--ry`。绘制、缓动、降级全交给 CSS。
这样 `prefers-reduced-motion` 里一行 `.spot::after { opacity: 0 }` 就能干净关掉。

## 5. 动效体系（CSS-first）

### 5.1 三条铁律

1. **能写 CSS 就不写 JS 动画。** JS 动画在 SSR 首屏不存在，且无法被 `prefers-reduced-motion` 一行关掉。
2. **只动 `transform` / `opacity` / `clip-path` / `filter`。** 不碰 `width/height/top/left/margin`，避免 layout 抖动。
3. **JS 只写 CSS 变量或数字。** 需要连续数值（滚动进度、count-up、缓动插值）才用 `requestAnimationFrame`，
   并且一律 rAF 节流 + 只在可见时运行。

### 5.2 揭示动画：`Reveal` 组件 + IntersectionObserver

```tsx
// src/components/site/Reveal.tsx（46 行）
export function Reveal({ children, variant = "up", index = 0, step = 70, className, style }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={cn("min-w-0", className)}>          {/* 外层：只负责被观测 */}
      <div data-v={variant}
           className={cn("reveal h-full", inView && "reveal-in")}  {/* 内层：承载过渡 */}
           style={{ ...style, transitionDelay: `${Math.min(index, 10) * step}ms` }}>
        {children}
      </div>
    </div>
  );
}
```

- 初始态由 `.reveal` 提供，进入视口后加 `.reveal-in`，**过渡写在 CSS 里**（`transition` 时长 0.75–0.95s）。
- `transitionDelay` 按 `index` 递增（上限 10 档），实现同组元素的错峰入场。
- 6 种变体：`up`（默认）/ `left` / `right` / `scale` / `blur` / `mask`（线性遮罩上掀）。
- `useInView` 是**一次性**观测：`rootMargin: "-60px 0px"`（提前 60px 触发），`threshold: 0.01`，
  触发后立即 `unobserve`。观测失败（极老浏览器 / 元素已在视口外）时回退为直接显示。

> **踩坑实录（值得记住）**：最初 `mask` 变体的元素永远不出现。
> 原因：**Chromium 的 IntersectionObserver 会把目标元素自身的 `clip-path` 计入可见面积**。
> `clip-path: inset(0 0 100% 0)` 使可见面积为 0，于是回调只触发一次且 `isIntersecting: false`，
> 之后再也不触发。修法就是上面的**「观测层 / 动画层拆成两个节点」**：
> 外层永不被裁剪，内层负责被遮罩。
> 副作用一度让图表 SVG「点不动」——被裁剪的元素同样不参与命中测试。

### 5.3 数字动效

| 工具 | 用途 | 实现 |
| --- | --- | --- |
| `CountUp` | 首屏关键指标从 0 滚到目标值 | rAF + `1-(1-p)**3` 缓动，时长 900–1150ms，只在 `inView` 后启动 |
| `useEased(value, ms)` | 输入变化时，读数**平滑趋近**新值（仪表、总分、列线图位置） | 每次 `value` 变化启动一段 rAF 插值；`aria-label` 用**真值**，只有显示用插值 |
| `ScrollProgress` | 顶部进度条 | 写 `--sp`（0–1），CSS `transform: scaleX(var(--sp))`；`scrollTop <= 8` 时不写，省掉无意义重绘 |
| `PageTransition` | 路由切换时 `<main>` 内容淡入上移 | `<div key={pathname} className="page-in">`，纯 CSS 动画 |

> **踩坑实录**：`PageTransition` 用 `animation: page-in 0.5s both` 时，
> `fill-mode: both` 让动画结束后仍保留 **identity transform**（`matrix(1,0,0,1,0,0)`），
> 而任何非 `none` 的 transform 都会创建 containing block——
> 结果页面里 `position: fixed` 的 toast 被定位到了「整页底部」而不是视口底部。
> 修法：`fill-mode` 改成 `backwards`（只保留起始态），并且 toast 走 `createPortal(document.body)` 双保险。

### 5.4 降级矩阵（这是「顶级」与「花哨」的分水岭）

| 环境 | 期望行为 | 实现 |
| --- | --- | --- |
| `prefers-reduced-motion: reduce` | 全部动画关闭，内容 100% 可见，无位移 | `@media (prefers-reduced-motion: reduce)` 里：`animation: none`、`.reveal` 复位、`.tilt{transform:none}`、`.spot::after{opacity:0}`、`scroll-behavior: auto`，并给 `*,*::before,*::after` 一条兜底（`animation-duration: 1ms`） |
| 禁用 JavaScript | 内容完整、图表完整、无空白卡片 | `<noscript><style>.reveal{opacity:1;transform:none;filter:none;clip-path:none}</style></noscript>`；图表是纯 SVG，入场动画是 CSS，因此照常显示 |
| 打印 | 去掉氛围层与阴影 | `@media print` 隐藏 `.grain-layer` / `.spot::*` / `.no-print` |
| 键盘用户 | 焦点可见、顺序合理 | `:focus-visible` 统一焦点环；`.skip-link` 首个可聚焦元素 |

---

## 6. 交互组件规格

### 6.1 导航（`Nav.tsx`）

- **吸顶 + 形变**：`useScrolled(12)` 在滚过 12px 后把高度从 `h-16` 收到 `h-14`，
  同时给玻璃层加上 `border-line` 与长程阴影；过渡写在 `transition-[border-color,box-shadow,backdrop-filter]`。
- **活动路由药片**：`motion.span` + `layoutId="nav-pill"`，跨 `<Link>` 共享布局，
  切页时药片**飞**到新的活动项（spring: stiffness 380 / damping 32）。这是全站最值得保留的 Motion 用法。
- **非活动项的下划线**：`scale-x-0 → group-hover:scale-x-100`，`origin-left`，只动 transform。
- **移动菜单**：`AnimatePresence` + `height: 0 → auto`，内部链接按 `i * 45ms` 错峰 `rise`。
- **路由变化自动收起**：在渲染期比较 `lastPath !== pathname` 并 `setOpen(false)`
  （React 19 官方推荐的「渲染期派生状态」写法，避免多一次 effect 往返）。

### 6.2 分段控件（`Controls.tsx` 的 `Segmented`）

```tsx
<span ref={...} className="relative">
  {options.map((o) => (
    <button aria-pressed={active}>
      {active && <motion.span layoutId={`seg-pill-${uid}`} className="absolute inset-0 ..." />}
      ...
    </button>
  ))}
</span>
```

- `useId()` 生成 `layoutId`，**同页多个分段控件互不串门**（否则药片会在两个控件之间乱飞）。
- 药片是**活动按钮的子元素**——写测试脚本时选择器要按这个结构来找。

### 6.3 滑杆

`input[type=range]` 的原生外观用 CSS 完全重绘：
轨道用 `linear-gradient` 按 `--p`（百分比）分段上色，thumb 用 `box-shadow` 做外环，
`:hover` / `:active` 放大 thumb。数值气泡加 `whitespace-nowrap`，防止窄屏换行。

### 6.4 卡片与光斑

`Card` 的 `hover` 属性决定是否加 `card-hover spot`：
`card-hover` 负责 `translateY(-2px)` + 阴影增强，`spot` 负责指针光斑。
`useSpotlight()` 在 rAF 里写 `--mx/--my`，离开时把变量归零而不是删除，避免闪回。

## 7. 手写 SVG 图表教程（`charts/`）

8 个图表组件全部是**手写 SVG**，共享两个工具模块：

```
helpers.ts   makeScale(d0,d1,r0,r1)  线性比例尺
             linePath / areaPath     折线与面积 path
             ticks(from,to,step)     刻度
hover.tsx    useChartHover(W,H)      指针 → viewBox 坐标（rAF 节流）
             nearestByX(pts, x)      最近点命中
             Readout(...)            图内读数框
```

### 7.1 坐标系纪律：像素空间与数据空间必须分开命名

这是本项目在图表上**唯一但致命的坑**。
`useChartHover` 返回的是 **viewBox 像素坐标**（例如 x ∈ [0,340]），
而 `nearestByX` 比较的是点对象上的 `x` 字段。如果点对象存的是**数据值**（例如 x ∈ [0,1]），
比较结果永远命中最后一个点——读数会恒定显示 `1.000 / 0.000`，而且看不出任何报错。

正确写法（`RocCurve.tsx`）：

```ts
const pts = curve.map((p) => ({
  x: sx(p.x),        // 像素：命中测试用
  y: sy(p.y),        // 像素：画十字准星用
  fpr: p.x,          // 数据：读数用
  tpr: p.y,          // 数据：读数用
}));
```

> 规则：**字段名即坐标系**。`x/y` 永远是像素，`fpr/tpr/pred/obs/model` 永远是数据。

### 7.2 悬停交互的标准配方

```tsx
const { pos, handlers } = useChartHover(W, H);
<svg viewBox={`0 0 ${W} ${H}`} {...handlers}>
  {/* 透明命中层：保证空白处也能收到 pointermove */}
  <rect width={W} height={H} fill="transparent" />
  {pos && <g pointerEvents="none">
    <line className="crosshair" x1={pos.x} x2={pos.x} ... />
    <circle cx={nearest.x} cy={nearest.y} r={3.5} />
    <Readout x={pos.x} y={pos.y} W={W} lines={[{k:"灵敏度", v:fm(nearest.tpr)}, ...]} />
  </g>}
</svg>
```

要点：
- **读数框宽度按字形估算**，CJK 与全角标点按双宽计：
  `ch.charCodeAt(0) > 0x2e7f ? 9.6 : 5.6`。用「字符数 × 固定宽」会让中英混排的标签与数值撞在一起。
- 读数框**自动翻边**：指针在右半区时框放到左侧；纵向夹在 `[6, H-h-6]`，永不溢出画布。
- 读数框 `pointerEvents="none"`，否则它会挡住指针形成「抖动死区」。
- 加 `filter: drop-shadow(...)` 让读数框浮起来，而不是靠更粗的描边。

### 7.3 表格型图表（森林图）的行高亮

用 SVG 的 `group` 机制，一行一个 `<g className="group/row">`：

```tsx
<g className="group/row">
  <title>OR 2.50（95%CI 1.61–3.88）</title>        {/* 原生 tooltip + 读屏 */}
  <rect className="fill-transparent group-hover/row:fill-[color-mix(in_oklab,var(--brand)_10%,transparent)]" />
  <circle className="group-hover/row:scale-[1.06]" />
</g>
```

一行代码同时得到：整行 wash、标记放大、原生 tooltip。配一行页脚提示「悬停查看 95%CI」。

### 7.4 让「数值变化」变成位移动画

列线图与仪表不用 JS 补间动画，而是给元素挂 `.glide`（`transition: transform .6s var(--e-out)`），
再用 React 写 `style={{ transform: "translateX(Npx)" }}`。
数值更新 → transform 变化 → CSS 负责补间。读屏与真值仍用原始数字。

---

## 8. 数据与算法分层（`lib/`）

```
bi.ts     双语原语（type Bi / bi() / pick()）
data.ts   纯内容：文案、卡片数组、流程步骤、参考文献 —— 全部 Bi
model.ts  计算内核：常量 + 纯函数 + 示例病例
stats.ts  数学工具：erf / Phi / PhiInv / logit / expit + 曲线采样
utils.ts  cn() / pct()
```

### 8.1 单一数据源纪律

页面上每个数字都来自 `model.ts` 的导出常量（`MODEL_META` / `GEOMETRY` / `POINTS` / `COEFFICIENTS` / `OR_TABLE`）。
图表、卡片、文案、复制出去的文本摘要共用同一批常量，因此不可能出现
「图上是 0.903、正文写 0.90」。改一处，全站同步。

### 8.2 「逆向标定」作为一种工程手法

站点需要复刻一张**只有图片、没有公式**的图形化标尺。做法是把它参数化成三个常数：

```ts
export const GEOMETRY = {
  logitPerPoint: 0.050766,   // 每 1 分对应的对数优势增量
  zeroLogitPoints: 178.71,   // 概率 = 0.5 时的总分
  fullScale: 100,            // 分值轴满量程
} as const;
```

有了这三行，「分值 → 概率」「概率 → 位置」两个方向都能算，
于是同一份 `GEOMETRY` 既能驱动**正向计算**（输入 → 总分 → 概率），
也能驱动**反向刻度**（概率轴上的刻度线画在哪）。
并在 UI 与 `MODEL_META.source` 里明确标注「由刻度逆向标定」——**可审计（G4）比好看更重要**。

### 8.3 曲线是**模拟**的，并且明说

`stats.ts` 用二元正态假设从 AUC 反推 ROC（`separation = √2 · Φ⁻¹(AUC)`），
再据此生成校准曲线与决策曲线的采样。它们形状正确、可交互，但**不是原始数据**。
因此每个这类图表都在标题或脚注里写「示意图」，并给出模拟得到的阈值区间范围。

> 教学点：做「展示型」可视化时，**区分三档可信度**并在 UI 上标注：
> ① 原始数值（照抄）② 由原始数值可推导（可算）③ 为可视化而生成的模拟（示意图）。

## 9. 双语（i18n）实现

### 9.1 状态放在 DOM 里，而不是 React 里

```tsx
// lib/i18n.tsx
function currentLocale(): Locale {
  if (typeof document === "undefined") return "zh";
  return document.documentElement.dataset.locale === "en" ? "en" : "zh";
}
export function useLocale() {
  const locale = useSyncExternalStore(subscribe, currentLocale, () => "zh");
  ...
}
```

- 真值来源是 `<html data-locale>`，由 `layout.tsx` 的**内联脚本**在首屏渲染前写入（读 `localStorage`）。
- `getServerSnapshot` 固定返回 `"zh"`，与服务端 HTML 里的 `data-locale="zh"` 一致 → **水合零失配**。
- 切换语言时 `setLocale` 改 DOM 属性 + 写 `localStorage` + 通知订阅者 → 全站组件即时重渲染，
  不需要路由跳转、不需要重新请求、不需要 `next-intl` 的 provider。
- `suppressHydrationWarning` 只加在 `<html>` 上（内联脚本改的就是它），范围最小化。

### 9.2 文案写法：`L()` 与 `Bi`

```tsx
const { L, T } = useLocale();
<h1>{L("成果总览", "Overview")}</h1>                 // 行内二元组
{FACTORS.map((f) => <p>{T(f.name)}</p>)}             // 数据层里的 Bi 对象
```

`lib/bi.ts` 只有 9 行：`type Bi = { zh: string; en: string }`、`bi()`、`pick()`。
好处：双语和数据结构天然长在一起，`data.ts` 里一个数组就是双语内容，
TS 会强制你两个语言都填（缺一个就是类型错误）。

### 9.3 服务端外壳里的双语

`layout.tsx` 是服务端组件，不能用 `useLocale()`。这类地方用 **CSS 切换**：

```html
<a class="skip-link"><span class="only-zh">跳到主要内容</span><span class="only-en">Skip to main content</span></a>
```

```css
[data-locale="en"] .only-zh { display: none; }
:where(:not([data-locale="en"])) .only-en { display: none; }
```

### 9.4 路由标题与描述

- 标题采用「中文 · English」并列写法（如 `成果总览 · Overview`），
  因此**不需要**在客户端覆盖 `document.title`，SEO 与浏览器标签都只有一份。
- `description` 随语言变化，由 `useMetaSync()` 在水合后与每次切换后同步一次 `<meta name="description">`。

### 9.5 常见坑

| 症状 | 原因 | 修法 |
| --- | --- | --- |
| 切语言后某块文字不变 | 该组件是服务端组件，或用了硬编码字符串 | 把该块搬进 `"use client"` 的 `view.tsx`，或改用 `only-zh/only-en` |
| 水合警告 | 服务端 snapshot 与 HTML 不一致 | `getServerSnapshot` 必须与 `<html data-locale>` 默认值一致 |
| 英文页仍有中文 | 设计保留：英文页会显示中文变量名作为**交叉引用**（论文里的原文名） | 需要时按 `T()` 分支，别误删 |

---

## 10. 主题系统

```
初始：内联脚本 → localStorage.theme ?? prefers-color-scheme → <html class="dark">
切换：ThemeToggle 改 class + 写 localStorage + setState（只用于 aria 文案）
图标：CSS 驱动 —— <Sun class="hidden dark:block" /> <Moon class="dark:hidden" />
```

- **无闪烁**：脚本在 `<head>` 里同步执行，早于首帧绘制。
- **图标不依赖 JS**：用 `dark:` 变体切换两个图标，禁用 JS 时也有正确图标
  （早期版本用 `mounted` 状态判断，结果禁用 JS 时按钮是个空圆圈）。
- **`themeColor` 跟随主题**：`export const viewport` 里给 light / dark 各一套颜色，
  移动端浏览器地址栏与站点 UI 一致。

---

## 11. 可访问性清单（已实现项）

| 项 | 实现 |
| --- | --- |
| 跳过导航 | `<a href="#main" class="skip-link">`，`:focus` 时才滑入视口 |
| 焦点可见 | `:focus-visible` 统一 2px 焦点环 + 2px offset；不用 `outline: none` |
| 实时播报 | 评估结果区 `<p class="sr-only" role="status" aria-live="polite">` 播报「总分 93 分，高消融难度概率 1.2%」 |
| 状态语义 | 分段控件 `aria-pressed`；导航活动项 `aria-current="page"`；主题按钮 `aria-pressed` + 双语 `aria-label` |
| 图表可读 | 每个 SVG 有 `role="img"` + `aria-label`；森林图每行有 `<title>`；读数框 `pointerEvents="none"` 不干扰 |
| 图形替代 | 原始图片有 `alt`；纯装饰层 `aria-hidden="true"`（网格、光晕、颗粒、光斑） |
| 语义结构 | `header / nav / main / section / footer`；标题层级不跳级 |
| 对比度 | 令牌在两套主题下分别校验过正文/次要文本对比度；`--mid` 在浅色下特意压深（`#c9860b`） |

---

## 12. SEO、分享与元数据

- `metadataBase` 读 `process.env.NEXT_PUBLIC_SITE_URL`（部署时只需配一个变量）。
- `title.template` 统一后缀；`alternates.canonical` 指定规范地址。
- `robots.ts` / `sitemap.ts` 是**元数据路由**：构建期产出 `/robots.txt`、`/sitemap.xml`，
  两者都用同一个 base 变量，不会与 canonical 打架。
- `opengraph-image.tsx` 用 `next/og`（Satori）在构建期渲染 1200×630 PNG。
  **限制**：Satori 不带中文字体，所以分享图上的文字刻意用英文；
  若要中文，需要把字体文件放进项目并用 `fonts: [{ data: buffer }]` 传入。
- JSON-LD（`Dataset`）写在 `layout.tsx`，静态可见，不依赖 JS。
- 分享链接：评估工具把当前输入序列化进 query（`?age=...&kishi=IV`），
  打开链接即复原现场；`window.history.replaceState` 保持 URL 与状态同步（不触发路由）。

## 13. 健壮性与降级（把「意外」当成需求来写）

### 13.1 复制到剪贴板：三级降级

`navigator.clipboard.writeText` 会在这些情况下失败：非安全上下文（http）、权限被拒、
无用户激活、旧浏览器。因此：

```ts
let ok = false;
try {
  if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); ok = true; }
} catch { ok = false; }
if (!ok) {                                  // 兜底：隐藏 textarea + execCommand
  const ta = document.createElement("textarea");
  ta.value = text; ta.setAttribute("readonly", "");
  ta.style.cssText = "position:fixed;top:-1000px;opacity:0";
  document.body.appendChild(ta); ta.select();
  ok = document.execCommand("copy"); ta.remove();
}
setCopied(ok);                              // 成功/失败都要有反馈，绝不静默
setTimeout(() => setCopied(null), ok ? 1800 : 3400);
```

**关键观念：任何「浏览器 API 调用」都必须有失败分支和用户反馈。**
静默失败的按钮是「不顶级」的最常见原因。

### 13.2 `position: fixed` 的隐形杀手

祖先只要满足以下任一条件，`fixed` 就不再相对视口：
`transform` 非 `none`（**包括动画 fill 后的 identity matrix**）、`filter`、`backdrop-filter`、
`will-change: transform`、`contain: paint`、`perspective`。

本项目的对策：
1. 覆盖层组件（toast、对话框）一律 `createPortal(..., document.body)`；
2. 入场动画的 `fill-mode` 用 `backwards` 而不是 `both`（动画结束后 transform 回到 `none`）。

### 13.3 横向溢出：动效引起的

`left/right` 揭示变体会把元素平移 26px，窄屏下足以撑出横向滚动条。
对策是一行：`main { overflow-x: clip; }`。
**用 `clip` 而不是 `hidden`**：`hidden` 会创建滚动容器（影响 sticky 与程序化滚动），
`clip` 只裁剪绘制，不产生滚动容器。

### 13.4 其他

- 所有 `localStorage` 访问都在 `try/catch` 内（Safari 无痕模式会抛异常）。
- 内联引导脚本整体包 `try/catch`，脚本出错也只是退回默认主题/语言。
- 外推保护：当结果落在模型支持范围之外时，UI 主动显示警告卡片，而不是假装精确。

---

## 14. 质量保障：类型 + Lint + **真实浏览器回归**

### 14.1 三道静态关卡

```bash
npx tsc --noEmit                 # 类型
npx eslint "src/**/*.{ts,tsx}"   # 规则（含 react-hooks 新规则）
npm run build                    # 构建 + 静态化（13 条路由）
```

### 14.2 用 CDP 做视觉与交互回归（可复用脚本）

静态检查无法证明「卡片真的出现了」「hover 真的出读数」「toast 真的在视口里」。
本项目用 Node + Chrome DevTools Protocol 驱动 Edge（Node 24 自带全局 `WebSocket`，零依赖）：

```bash
# 1) 启动带调试端口的浏览器
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
"$EDGE" --headless=new --remote-debugging-port=9344 \
  --user-data-dir="%TEMP%/edcdp" &
```

```js
// cdp.mjs —— 连接并封装常用动作
export async function attach(port = 9344) {
  const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const ws = new WebSocket(list.find((t) => t.type === "page").webSocketDebuggerUrl);
  let id = 0; const pending = new Map();
  const send = (m, p = {}) => new Promise((res, rej) => {
    id += 1; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method: m, params: p }));
  });
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const q = pending.get(m.id); pending.delete(m.id);
      m.error ? q.rej(new Error(JSON.stringify(m.error))) : q.res(m.result); }
  });
  await new Promise((r) => ws.addEventListener("open", r));
  const js = async (expr) => (await send("Runtime.evaluate",
    { expression: expr, returnByValue: true, awaitPromise: true })).result?.value;
  const setup = async (w, h, dpr, theme, locale, motion = "no-preference") => {
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: dpr, mobile: false });
    await send("Emulation.setEmulatedMedia", { features: [
      { name: "prefers-color-scheme", value: theme },
      { name: "prefers-reduced-motion", value: motion }] });
    await send("Emulation.setScriptExecutionDisabled", { value: motion === "nojs" });
    await js(`localStorage.setItem('khy-locale','${locale}'),1`);
  };
  const go = async (path) => { await send("Page.navigate", { url: "http://localhost:3127" + path });
    await new Promise((r) => setTimeout(r, 1400)); };
  return { send, js, setup, go, ws };
}
```

**回归矩阵（本项目实际跑过的断言）**：

| 断言 | 表达式 | 期望 |
| --- | --- | --- |
| 无横向溢出 | `documentElement.scrollWidth - clientWidth` | `0` |
| 揭示动画都触发 | `[...document.querySelectorAll('.reveal')].filter(e => !e.classList.contains('reveal-in')).length` | `0` |
| 没有隐藏内容 | `.reveal` 中 `getComputedStyle(e).opacity < 0.9` 的数量 | `0` |
| 双语生效 | `body.innerText` 里 CJK 字符数 | 中文页 441–1745；英文页 4–25 |
| 图表可命中 | 真实 `Input.dispatchMouseEvent{type:"mouseMoved"}` 后读数框存在 | 有读数文本 |
| 覆盖层在视口内 | toast 的 `getBoundingClientRect().y` | 落在视口高度内 |

覆盖组合：6 条路由 × 中/英 × 深/浅 ×（桌面 1440 / 移动 390）+ `prefers-reduced-motion: reduce` + 禁用 JS + 404。

### 14.3 CDP 的三个实操陷阱

1. **`scrollIntoView` 后立刻取 rect 会拿到旧值**——页面有 `scroll-behavior: smooth`。
   用 `behavior: "instant"` 再 `sleep(650)`。
2. **`deviceScaleFactor: 2` 下截图可能滞后**，做 hover 验证时用 `dpr = 1`。
3. **元素被裁剪就不可能命中**：`clip-path` 面积为 0 的元素不参与 hit-testing，
   「hover 没反应」常常是上游动画 bug 的**症状**。

---

## 15. 故障排查表（症状 → 根因 → 修法）

| 症状 | 根因 | 修法 |
| --- | --- | --- |
| 某些卡片完全不出现，且点不动 | 元素自身 `clip-path` 把可见面积压成 0，IntersectionObserver 永不触发 | 观测层与动画层分离（见 5.2） |
| `fixed` 的 toast / 对话框跑到页面底部 | 祖先有 transform（含动画 fill 后的 identity matrix） | `createPortal` + 动画 `fill-mode: backwards` |
| 页面出现 6px 横向滚动条 | 揭示动画的横向位移在窄屏溢出 | `main { overflow-x: clip }` |
| 图表读数恒定不变 | 命中测试比较了数据坐标与像素坐标 | 字段名区分坐标系（见 7.1） |
| 中英混排的读数框文字重叠 | 按字符数估算宽度 | 按字形宽度估算，CJK 记双宽 |
| 切页后导航闪一下 | 整页重挂载 | `partialPrefetching` + 外壳放在路由树之外 |
| 首屏主题/语言闪一下 | 引导脚本在渲染后才执行 | 脚本写进 `<head>` 内联同步执行 |
| 禁用 JS 后全站空白 | 内容靠 JS 注入或靠 JS 才可见 | 内容全部 SSR；`<noscript>` 复位 `.reveal` |
| 深色下阴影看不见 | 阴影色写死为黑色低透明度 | 用 `color-mix(in oklab, var(--fg) X%, transparent)` 让阴影随主题翻转 |
| 构建后 HTML 每次都变 | 服务端组件里用了 `new Date()` / `Math.random()` | 常量或构建期固定值 |
| 分享图没有中文 | Satori 不带中文字体 | 内置字体文件并传 `fonts`，或分享图用英文 |
| `npm run dev` 下 CSS 不生效 | Tailwind 加载器没挂到 Turbopack 规则 | 检查 `next.config.ts` 的 `turbopack.rules` |

---

## 16. 部署教程

### 16.1 需要配的环境变量

| 变量 | 用途 | 出现位置 |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | canonical / OG / robots / sitemap 的基址 | `layout.tsx`、`robots.ts`、`sitemap.ts` |

> `NEXT_PUBLIC_` 前缀意味着它会被**内联进客户端 bundle**，因此**必须在构建时**提供，
> 运行时改无效。换域名 = 改变量 + 重新构建。

### 16.2 方案 A：Vercel（零配置）

```bash
npm i -g vercel
vercel link          # 关联仓库
vercel env add NEXT_PUBLIC_SITE_URL production
vercel --prod
```

优点：`partialPrefetching`、`_rsc` 增量预取、图片优化开箱可用。

### 16.3 方案 B：自己的服务器（Node + 反向代理）

```bash
npm ci --omit=dev
npm run build
NODE_ENV=production NEXT_PUBLIC_SITE_URL=https://example.com npm run start -p 3000
```

Nginx 反代（全站是静态页，缓存可以放心拉长）：

```nginx
server {
  listen 443 ssl http2;
  server_name example.com;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
  # 构建产物指纹文件名，可永久缓存
  location /_next/static/ {
    proxy_pass http://127.0.0.1:3000;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }
}
```

systemd 守护：

```ini
# /etc/systemd/system/hifuweb.service
[Unit]
Description=AM-HIFU web
After=network.target
[Service]
WorkingDirectory=/srv/hifuweb/web
Environment=NODE_ENV=production
Environment=NEXT_PUBLIC_SITE_URL=https://example.com
ExecStart=/usr/bin/npm run start -p 3000
Restart=always
[Install]
WantedBy=multi-user.target
```

### 16.4 方案 C：Docker

```dockerfile
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_SITE_URL=https://example.com
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN npm run build

FROM node:24-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 3000
CMD ["npm", "run", "start", "-p", "3000"]
```

```bash
docker build --build-arg NEXT_PUBLIC_SITE_URL=https://example.com -t hifuweb .
docker run -d -p 3000:3000 --restart unless-stopped hifuweb
```

### 16.5 方案 D：纯静态托管（GitHub Pages / Cloudflare Pages / 对象存储）

本项目**没有**服务端能力需求，理论上适合 `output: "export"`。但要注意：

- 元数据路由（`robots.ts` / `sitemap.ts`）与 `opengraph-image.tsx` 在导出模式下会
  产出静态文件，但 `next start` 不再适用，需要用任意静态服务器。
- `partialPrefetching` 在纯静态托管下退化为普通 RSC 预取（功能不受影响，只是没有增量优化）。
- 若走这条路，记得设 `images.unoptimized` 与 `trailingSlash: true`，
  并为 404 准备 `404.html`。

因此**推荐 A/B/C**；纯静态托管作为备选（例如只想要一个镜像站点时）。

### 16.6 上线检查清单

- [ ] `NEXT_PUBLIC_SITE_URL` 已设为正式域名，`/sitemap.xml` 与 `/robots.txt` 里的地址正确
- [ ] `curl -sI /` 返回 200，`/_next/static/*` 带 `immutable`
- [ ] OG 图能被抓取：`curl -sI /opengraph-image`
- [ ] 移动端 390px 无横向滚动；深/浅两套都过一遍
- [ ] 禁用 JS 打开一次，内容完整
- [ ] 分享链接（带 query 的评估结果）在无痕窗口能复原
- [ ] `npm run build` 全绿，路由表仍是 13 条 `○ (Static)`

---

## 17. 持续集成（GitHub Actions）

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push: { branches: [main] }
  pull_request:
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 24, cache: npm }
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npx eslint "src/**/*.{ts,tsx}"
      - run: npm run build
      - name: 冒烟测试（全站应静态且无溢出）
        run: |
          npm run start -p 3127 &
          sleep 5
          for r in / /overview /results /methods /about /assessment /robots.txt /sitemap.xml; do
            code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3127$r")
            echo "$r -> $code"; test "$code" = 200
          done
```

把第 14 节的 CDP 脚本放进 CI 也是可行的（`apt install` 一个 Chromium，加 `--headless=new`），
这样「揭示动画没触发」这类视觉回归会被自动拦下——**这是本项目目前最值得补的一块自动化**。

---

## 18. 性能与预算

| 指标 | 现状 / 目标 | 为什么能做到 |
| --- | --- | --- |
| 路由类型 | 13 条全静态 | 无服务端数据依赖 |
| 首屏 HTML | 含全部正文与图表 | 图表是 SVG，动效是 CSS |
| 图表库体积 | 0 KB | 手写 SVG |
| 动画库体积 | 仅 Motion（3 处用途） | CSS-first |
| 中文字体 | 0 KB | 系统字体栈 |
| 图片 | 仅 2 张原始图（`public/figures`） | 其余全是矢量 |
| 目标 LCP | < 1.2s（桌面）/ < 2.0s（4G） | 静态 + 无阻塞字体（`display: swap`） |

自查手段：

```bash
# 构建产物里的 JS 体积
du -sh .next/static/chunks/*.js | sort -h | tail -10
# 用 Lighthouse（Edge/Chrome 均可）
npx lighthouse http://localhost:3127/ --only-categories=performance,accessibility,seo --form-factor=mobile
```

**注意 `next/font` 的构建期行为**：`Inter` / `Geist_Mono` 在**构建时**下载并自托管。
CI 若处于离线环境会构建失败——要么放行字体域名，要么改用 `next/font/local` 并内置字体文件。

---

## 19. 二次开发 Cookbook

### 19.1 新增一个页面

```
src/app/faq/page.tsx     export metadata（标题用「中文 · English」并列）
src/app/faq/view.tsx     "use client" + useLocale()，用 Section / Eyebrow / Heading / Card 组装
src/lib/data.ts          新页面的文案，全部用 bi()
src/lib/data.ts          SITE.nav 里加一条 { href: "/faq", label: bi("常见问题","FAQ") }
src/app/sitemap.ts       ROUTES 里加 "faq"
```

导航、页脚、sitemap、语言切换都会自动跟上——**因为它们都读同一份 `SITE.nav`**。

### 19.2 新增一个双语字段

```ts
export const FACTORS = [
  { name: bi("年龄 < 35 岁", "Age < 35 y"), pts: bi("38 分", "38 pts") },
];
```

渲染处 `{T(f.name)}`。漏填任一语言 → 类型错误，构建失败（这正是想要的）。

### 19.3 新增一个图表

1. 在 `lib/stats.ts` 里加采样函数（返回数据空间坐标）；
2. 在 `components/charts/` 新建组件：`makeScale` 映射到像素 → 画 path/axis/label；
3. 需要悬停就复用 `useChartHover` + `nearestByX` + `Readout`，
   **点对象里同时保留像素字段（x/y）与数据字段**；
4. 加 `role="img"` + `aria-label`；示意图要在标题里写「示意图」。

### 19.4 新增一段入场动效

优先加一个 `reveal` 变体而不是写 JS：

```css
:where([data-v="flip"]) { transform: perspective(800px) rotateX(-18deg); opacity: 0; }
.reveal-in:where([data-v="flip"]) { transform: none; opacity: 1; }
```

```tsx
<Reveal variant="flip" index={2}>...</Reveal>
```

记得在 `@media (prefers-reduced-motion)` 与 `<noscript>` 里复位。

### 19.5 换一套品牌色

只改 `:root` / `.dark` 里的 `--brand`、`--brand2`、`--brand-soft`（两套各一遍）。
所有 `bg-brand` / `text-brand` / `color-mix(... var(--brand) ...)` 自动跟随。
唯一例外：图形里表示「热区」的固定色是刻意与主题解耦的，需要单独改。

---

## 20. 附录

### 20.1 路由表

| 路由 | 说明 |
| --- | --- |
| `/` | 首页：Hero + 一个 CTA 卡片（其余内容在 `/overview`） |
| `/overview` | 长文式成果总览（六个编号章节） |
| `/assessment` | 交互式评估工具（可分享链接、可打印） |
| `/results` | 图表与证据区 |
| `/methods` | 方法学 |
| `/about` | 参数表、等价形式、使用边界、技术实现 |
| `/robots.txt` `/sitemap.xml` `/opengraph-image` `/icon.svg` | 元数据路由 |
| 任意其他路径 | `not-found.tsx` |

### 20.2 常用命令

```bash
npm run dev       # 开发（Turbopack）
npm run build     # 生产构建（静态化）
npm run start     # 预览生产构建
npm run lint      # ESLint
npx tsc --noEmit  # 类型检查
npx prettier --write src   # 可选：格式化（项目未内置 prettier 配置，默认 80 列，慎用）
```

### 20.3 术语

| 术语 | 含义 |
| --- | --- |
| RSC | React Server Components；服务端渲染的组件，不进客户端 bundle |
| `layoutId` | Motion 的共享布局标识，两个元素同 id 时切换会「飞」过去 |
| 揭示（reveal） | 元素进入视口时才播放的入场过渡 |
| 令牌（token） | 以 CSS 变量形式集中管理的设计值（颜色、缓动、字体） |
| 逆向标定 | 从图形刻度反推出可计算的参数（见 8.2） |
| 外推（extrapolation） | 输入落在模型支持范围之外；UI 必须显式警告 |
| 氛围层 | 不参与交互、只提升质感的装饰层（颗粒、光晕、网格） |

### 20.4 这份文档的维护约定

改动下列任一项时，**必须同步更新本文**：
依赖清单、`next.config.ts`、设计令牌、`reveal` 变体、图表命中约定、环境变量、部署方式。
文档与代码不同步，是「看起来不专业」的第一来源。
