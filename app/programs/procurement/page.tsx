import type { Metadata } from "next";
import { ProgramPage } from "../../ProgramPage";
import { getProgram } from "../../programs-data";

export const metadata: Metadata = {
  title: "Госзакупки как инструмент развития бизнеса",
  description: "Практическая программа о закупках, работе с заказчиком, 44-ФЗ, 223-ФЗ и стратегии развития B2G-направления.",
};

export default function ProcurementPage() {
  return <ProgramPage program={getProgram("procurement")} />;
}
