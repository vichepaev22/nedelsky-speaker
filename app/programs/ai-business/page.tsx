import type { Metadata } from "next";
import { ProgramPage } from "../../ProgramPage";
import { getProgram } from "../../programs-data";

export const metadata: Metadata = {
  title: "ИИ для роста бизнеса",
  description: "Практическая программа Максима Недельского: от контекст-инжиниринга к процессам, системам и ИИ-агентам.",
};

export default function AiBusinessPage() {
  return <ProgramPage program={getProgram("ai-business")} />;
}
