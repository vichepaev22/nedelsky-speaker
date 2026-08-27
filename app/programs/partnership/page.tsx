import type { Metadata } from "next";
import { ProgramPage } from "../../ProgramPage";
import { getProgram } from "../../programs-data";

export const metadata: Metadata = {
  title: "Партнёрство как основа взаимодействия",
  description: "Практическая программа о доверии, ролях, договорённостях и устойчивых партнёрских проектах.",
  openGraph: {
    url: "/programs/partnership",
    title: "Партнёрство как основа взаимодействия",
    description: "От общей идеи и первого проекта — к доверию, договорённостям и устойчивому развитию.",
    images: [{ url: "/images/speaker/maxim-coral.png", width: 1023, height: 1537, alt: "Максим Недельский — программа о партнёрстве" }],
  },
};

export default function PartnershipPage() {
  return <ProgramPage program={getProgram("partnership")} />;
}
