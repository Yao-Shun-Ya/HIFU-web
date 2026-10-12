import type { Metadata } from "next";
import { MethodsView } from "./view";

export const metadata: Metadata = {
  title: "研究方法 · Methods",
  description: "研究设计、消融难度量化标准、变量筛选与模型验证流程。",
};

export default function MethodsPage() {
  return <MethodsView />;
}
