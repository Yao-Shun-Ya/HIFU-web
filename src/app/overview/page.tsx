import type { Metadata } from "next";
import { OverviewView } from "./view";

export const metadata: Metadata = {
  title: "成果总览 · Overview",
  description:
    "临床问题、方法学创新、技术路线、模型性能、六个预测因子与应用场景：一篇论文成果的完整结构化呈现。",
};

export default function OverviewPage() {
  return <OverviewView />;
}
