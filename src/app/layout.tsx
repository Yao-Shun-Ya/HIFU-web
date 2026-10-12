import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { PageTransition } from "@/components/site/motion";
import { SITE } from "@/lib/data";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://hifuweb.example.com"),
  title: {
    default: `${SITE.title} · 成果展示`,
    template: `%s · ${SITE.shortTitleEn}`,
  },
  description:
    "基于 MRI 与临床特征的子宫腺肌病 US-guided HIFU 高消融难度列线图模型：486 例单中心队列，训练集 AUC 0.903、内部验证 AUC 0.923，含可交互术前风险评估工具。",
  keywords: [
    "子宫腺肌病",
    "adenomyosis",
    "HIFU",
    "列线图",
    "nomogram",
    "消融难度",
    "术前评估",
    "科创大赛",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: SITE.title,
    description:
      "术前 MRI + 临床特征 → 高消融难度概率：可交互列线图与三重验证（ROC / 校准 / DCA）。",
    type: "website",
    siteName: SITE.shortTitleEn,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: "486 例单中心队列 · AUC 0.903 / 0.923 · 可交互术前风险评估",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#070c14" },
  ],
};

const localeScript = `
try{
  var l=localStorage.getItem('khy-locale');
  if(l==='en'){document.documentElement.dataset.locale='en';document.documentElement.lang='en';}
}catch(e){}
`;

const themeScript = `
try{
  var t=localStorage.getItem('theme');
  var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark',d);
}catch(e){}
`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: SITE.title,
  alternateName: SITE.titleEn,
  description:
    "基于 MRI 与临床特征预测子宫腺肌病超声引导 HIFU 消融难度的列线图模型构建与验证（486 例单中心回顾性队列）。",
  creator: { "@type": "Organization", name: SITE.org },
  dateCreated: "2026",
  temporalCoverage: "2016-03/2024-03",
  measurementTechnique: "MRI, US-guided HIFU ablation, logistic regression, nomogram",
  about: [
    { "@type": "Thing", name: "Adenomyosis" },
    { "@type": "Thing", name: "High-intensity focused ultrasound" },
    { "@type": "Thing", name: "Nomogram" },
  ],
  license: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      data-locale="zh"
      className={`${inter.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: localeScript }} />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <noscript>
          <style>{`.reveal{opacity:1;transform:none;filter:none;clip-path:none}`}</style>
        </noscript>
      </head>
      <body className="min-h-screen">
        <a href="#main" className="skip-link">
          <span className="only-zh">跳到主要内容</span>
          <span className="only-en">Skip to main content</span>
        </a>
        <div aria-hidden="true" className="grain-layer no-print" />
        <Nav />
        <main id="main" className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </body>
    </html>
  );
}
