import type { Metadata } from "next";
import { SpeakerToolsPage } from "../SpeakerToolsPage";

export const metadata: Metadata = {
  title: "Инструменты для спикера — таймер групповой работы",
  description: "Бесплатный таймер для групповых упражнений: время, крупное задание, цифровой отсчёт и полноэкранный показ.",
};

export default function Page() {
  return <SpeakerToolsPage />;
}
