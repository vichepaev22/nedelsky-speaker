import type { Metadata } from "next";
import { ProgramPage } from "../../ProgramPage";
import { getProgram } from "../../programs-data";

export const metadata: Metadata = {
  title: "Партнёрство как основа взаимодействия",
  description: "Практическая программа о доверии, ролях, договорённостях и устойчивых партнёрских проектах.",
};

export default function PartnershipPage() {
  return <ProgramPage program={getProgram("partnership")} />;
}
