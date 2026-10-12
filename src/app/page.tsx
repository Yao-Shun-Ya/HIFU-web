import type { Metadata } from "next";
import { HomeView } from "./home-view";
import { SITE } from "@/lib/data";

export const metadata: Metadata = {
  title: `${SITE.title} · Pre-op Nomogram`,
  description:
    "基于 MRI 与临床特征的子宫腺肌病 US-guided HIFU 高消融难度列线图模型：486 例单中心队列，训练集 AUC 0.903、内部验证 AUC 0.923，含可交互术前风险评估工具。",
};

export default function Home() {
  return <HomeView />;
}
