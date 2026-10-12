import type { Metadata } from "next";
import { ResultsView } from "./view";

export const metadata: Metadata = {
  title: "结果与证据 · Results",
  description: "队列流程、变量筛选、列线图、ROC / 校准 / DCA 验证结果与研究局限。",
};

export default function ResultsPage() {
  return <ResultsView />;
}
