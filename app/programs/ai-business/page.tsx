import type { Metadata } from "next";
import { ProgramPage } from "../../ProgramPage";
import { getProgram } from "../../programs-data";

export const metadata: Metadata = {
  title: "ИИ для роста бизнеса",
  description: "Практическая программа Максима Недельского: от контекст-инжиниринга к процессам, системам и ИИ-агентам.",
  openGraph: {
    url: "/programs/ai-business",
    title: "ИИ для роста бизнеса",
    description: "От контекст-инжиниринга к процессам, системам и первым агентным сценариям.",
    images: [{ url: "/images/speaker/maxim-navy.png", width: 1023, height: 1537, alt: "Максим Недельский — программа об ИИ для бизнеса" }],
  },
};

export default function AiBusinessPage() {
  return <ProgramPage program={getProgram("ai-business")} />;
}
