import type { Metadata } from "next";
import { AboutView } from "./view";

export const metadata: Metadata = {
  title: "关于与声明 · About",
  description: "模型参数来源、可复现性说明、使用边界、伦理与参考文献。",
};

export default function AboutPage() {
  return <AboutView />;
}
