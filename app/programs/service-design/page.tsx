import type { Metadata } from "next";
import { ProgramPage } from "../../ProgramPage";
import { getProgram } from "../../programs-data";

export const metadata: Metadata = {
  title: "Сервис-дизайн и клиентский опыт",
  description: "Практическая программа о клиентском пути, ожиданиях, эмоциях и сервисной модели бизнеса.",
};

export default function ServiceDesignPage() {
  return <ProgramPage program={getProgram("service-design")} />;
}
