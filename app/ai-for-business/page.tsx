import type { Metadata } from "next";
import { AiBusinessPage } from "../AiBusinessPage";

export const metadata: Metadata = {
  title: "ИИ для бизнеса — индивидуальные программы",
  description:
    "Три практических формата Максима Недельского: от первых шагов с нейросетями до прототипа ИИ-агента и проектной трансформации бизнеса.",
};

export default function Page() {
  return <AiBusinessPage />;
}
