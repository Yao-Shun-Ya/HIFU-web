# AM-HIFU 难度预测 · 成果网站

论文《基于 MRI 及临床特征预测子宫腺肌病超声引导 HIFU 消融难度的列线图模型构建与验证》的
**成果展示 + 在线诊断（术前风险评估）** 网站。

核心不是把论文截图搬上网，而是把 **图3 列线图重写为可计算、可分享、可审计的网页实现**：
首页与「研究方法 / 结果与证据」呈现队列、方法学与验证结果，
`/assessment` 提供与列线图完全等价的交互式评估工具。

## 快速开始

本仓库根目录即 `web/`（Next.js 项目根）。

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 生产构建（全站静态预渲染）
npm run start
```

## 文档

**完整技术手册：[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)** ——
技术选型理由、逐文件结构、渲染与构建、设计令牌与 CSS 架构、动效体系与降级矩阵、
手写 SVG 图表教程、双语实现、可访问性、SEO、健壮性降级、真实浏览器回归（CDP）、
故障排查表、部署教程（Vercel / Nginx / Docker / 静态托管）、CI、二次开发 Cookbook。

部署只需一个环境变量（构建期生效）：

```bash
NEXT_PUBLIC_SITE_URL=https://your.domain npm run build
```

它驱动 canonical、Open Graph、`/robots.txt`、`/sitemap.xml` 的基址；未设置时回退到占位域名。

## 页面

| 路由 | 内容 |
| --- | --- |
| `/` | 首页：仅一屏 Hero（核心结论 + 关键指标）+ 进入工具的入口卡片 |
| `/overview` | **成果总览**：01 临床问题 → 02 创新点 → 03 技术路线 → 04 模型性能 → 05 六个预测因子 → 06 应用场景 |
| `/assessment` | **诊断功能**：6 个术前因子输入 → 总分 → 高难度概率、风险仪表、因子贡献、针对性建议、可交互列线图 |
| `/methods` | 研究设计与对象、消融难度量化（表1 + 公式）、LASSO 双阶筛选、三重验证 |
| `/results` | 队列流程、ROC / 校准 / DCA / 森林图、原始图1与图3、局限性 |
| `/about` | 模型参数表、等价 Logistic 形式、使用边界、技术实现、参考文献 |

## 技术栈

- **Next.js 16（App Router、Turbopack、`cacheComponents`）+ React 19 + TypeScript 严格模式**
- **Tailwind CSS v4**：设计令牌写在 CSS 自定义属性里，浅色/深色主题零闪烁
  - Hero 区随主题切换：浅色主题为浅底 + 品牌色光晕（`--hero-*` 令牌），深色主题保持深色；示意图配色同样走令牌
- **Motion（Framer Motion v12）**：仅用于导航指示条与移动端菜单等交互反馈
- **纯 SVG 手绘统计图表**：列线图、ROC、校准曲线、DCA、森林图、风险仪表，无图表库依赖
- 揭示动画为 **纯 CSS（IntersectionObserver + transition）**，并对 `prefers-reduced-motion` 与无 JS 场景提供回退
- **中英双语**：导航栏 `中 / EN` 切换，语言写入 `<html data-locale>` + `localStorage`，切换不重新加载、不改变路由

## 双语实现（`src/lib/bi.ts` / `src/lib/i18n.tsx`）

- 文案有两种写法：内联 `L("中文", "English")`，或数据层的 `Bi = { zh, en }`（用 `T()` 解析）；
  论文专有名词、统计口径与参考文献保持原文。
- 语言状态放在 `<html data-locale>`：`layout.tsx` 内联脚本在首屏绘制前读取 `localStorage["khy-locale"]`，
  组件用 `useSyncExternalStore` 读取（服务端快照恒为 `zh`），因此 **无 hydration 警告、无 FOUC**。
- 代价：渲染文案的页面组件为客户端组件，故每个路由拆成
  `page.tsx`（服务端，导出 `metadata`）+ `view.tsx`（客户端，渲染内容），全站仍是静态预渲染。

## 模型实现与可复现性

单一来源：`src/lib/model.ts`。

论文正文未给出完整回归系数表，因此参数由 **图3 列线图刻度逆向标定**：

- 每 1 总分对应 logit 变化 `logitPerPoint = 0.050766`
- `logit = 0`（概率 50%）对应总分 `zeroLogitPoints = 178.71`
- 各因子分值取自列线图刻度（年龄 <35：37.95；子宫体积：0.1 分/cm³；腹壁厚度：1.803 分/mm；
  Kishi II/III/IV：15.27 / 4.89 / 27.33；T2WI 高信号：36.04；T1WI 明显强化：18.26）

由此 `logit = 0.050766 × (总分 − 178.71)`，与列线图读数完全等价。
若日后取得论文完整系数表，只需替换 `COEFFICIENTS`，全站工具与图表自动同步。

统计图表（ROC / 校准 / DCA）为 **示意图**：由论文报告的 AUC（0.903 / 0.923）与事件率经
二正态模型（`src/lib/stats.ts`）生成，并非原始数据重算；图中同时标注论文报告的区间
（如 DCA 净获益训练集约 5%–80%、验证集约 5%–75%）。

## 输入与状态

- 全部计算在浏览器本地完成，不上传、不保存任何患者数据
- 输入状态同步到 URL（`?age=&volume=&wall=&kishi=&t2=&t1=`），可直接分享或打印

## 使用边界

输出为 **技术难度风险分层**，不预测疗效或并发症；模型来自单中心回顾性队列，仅完成内部验证，
尚缺外部与前瞻性验证；概率超出列线图 Risk 轴（约 0.1–0.9）属外推。
任何治疗决策须由具备 HIFU 资质的临床团队作出。
