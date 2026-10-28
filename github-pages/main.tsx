import { createRoot } from "react-dom/client";
import Home from "../app/page";
import { AiBusinessPage } from "../app/AiBusinessPage";
import { SpeakerToolsPage } from "../app/SpeakerToolsPage";
import { ProgramPage } from "../app/ProgramPage";
import { PrivacyPage } from "../app/PrivacyPage";
import { PrivacyNotice } from "../app/PrivacyNotice";
import { getProgram, programs } from "../app/programs-data";
import "./site.css";
import "../app/project-refresh.css";
import "../app/speaker-tools.css";
import "../app/privacy.css";
import "../app/quiz-entry.css";

const baseSegments = import.meta.env.BASE_URL.split("/").filter(Boolean);
const pathSegments = window.location.pathname.split("/").filter(Boolean);
const relativeSegments = pathSegments.slice(baseSegments.length);
const programSlug =
  relativeSegments[0] === "programs" ? relativeSegments[1] : undefined;
const knownProgram = programs.find((program) => program.slug === programSlug);
const isAiBusiness = relativeSegments[0] === "ai-for-business";
const isSpeakerTools = relativeSegments[0] === "speaker-tools";
const isPrivacy = relativeSegments[0] === "legal" && relativeSegments[1] === "privacy";

if (isAiBusiness) {
  document.title = "ИИ для бизнеса — индивидуальные программы · Максим Недельский";
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", "Три практических формата: от первых шагов с нейросетями до прототипа ИИ-агента и проектной трансформации бизнеса.");
} else if (isSpeakerTools) {
  document.title = "Инструменты для спикера — таймер групповой работы · Максим Недельский";
  document.querySelector('meta[name="description"]')?.setAttribute("content", "Таймер для групповых упражнений: время, крупное задание, цифровой отсчёт и полноэкранный показ.");
} else if (isPrivacy) {
  document.title = "Политика конфиденциальности · Максим Недельский";
} else if (knownProgram) {
  document.title = `${knownProgram.title} · Максим Недельский`;
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", knownProgram.description);
}

const page = isAiBusiness
  ? <AiBusinessPage />
  : isSpeakerTools
    ? <SpeakerToolsPage />
    : isPrivacy
    ? <PrivacyPage />
    : knownProgram
    ? <ProgramPage program={getProgram(knownProgram.slug)} />
    : <Home />;
const root = document.getElementById("root")!;

// Static HTML remains available to search engines before JavaScript runs.
// A fresh client render avoids React 19 hydration mismatches in the interactive form.
createRoot(root).render(<>{page}<PrivacyNotice /></>);
