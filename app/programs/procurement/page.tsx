import type { Metadata } from "next";
import { ProgramPage } from "../../ProgramPage";
import { getProgram } from "../../programs-data";

export const metadata: Metadata = {
  title: "Госзакупки как инструмент развития бизнеса",
  description: "Практическая программа о закупках, работе с заказчиком, 44-ФЗ, 223-ФЗ и стратегии развития B2G-направления.",
  openGraph: {
    url: "/programs/procurement",
    title: "Госзакупки как инструмент развития бизнеса",
    description: "Как понимать систему закупок, работать с заказчиком и выстраивать стратегию участия.",
    images: [{ url: "/images/speaker/maxim-flags-navy.png", width: 1537, height: 1023, alt: "Максим Недельский — программа о госзакупках" }],
  },
};

export default function ProcurementPage() {
  return <ProgramPage program={getProgram("procurement")} />;
}
