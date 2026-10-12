import type { Metadata } from "next";
import { AssessmentView } from "./view";

export const metadata: Metadata = {
  title: "术前评估 · Risk Tool",
  description:
    "输入年龄、子宫体积、腹壁厚度、Kishi 分型、T2WI 信号与 T1WI 增强程度，实时得到列线图总分与高消融难度概率。",
};

export default function AssessmentPage() {
  return <AssessmentView />;
}
