import type { Metadata } from "next";
import { ProgramPage } from "../../ProgramPage";
import { getProgram } from "../../programs-data";

export const metadata: Metadata = {
  title: "Сервис-дизайн и клиентский опыт",
  description: "Практическая программа о клиентском пути, ожиданиях, эмоциях и сервисной модели бизнеса.",
  openGraph: {
    url: "/programs/service-design",
    title: "Сервис-дизайн и клиентский опыт",
    description: "Как создавать ценность, эмоции и инновации через реальный путь клиента.",
    images: [{ url: "/images/speaker/maxim-coral.png", width: 1023, height: 1537, alt: "Максим Недельский — программа о клиентском опыте" }],
  },
};

export default function ServiceDesignPage() {
  return <ProgramPage program={getProgram("service-design")} />;
}
