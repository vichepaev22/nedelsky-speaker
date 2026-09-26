import { createRoot } from "react-dom/client";
import Home from "../app/page";
import { AiBusinessPage } from "../app/AiBusinessPage";
import { ProgramPage } from "../app/ProgramPage";
import { getProgram, programs } from "../app/programs-data";
import "./site.css";

const baseSegments = import.meta.env.BASE_URL.split("/").filter(Boolean);
const pathSegments = window.location.pathname.split("/").filter(Boolean);
const relativeSegments = pathSegments.slice(baseSegments.length);
const programSlug =
  relativeSegments[0] === "programs" ? relativeSegments[1] : undefined;
const knownProgram = programs.find((program) => program.slug === programSlug);
const isAiBusiness = relativeSegments[0] === "ai-for-business";

if (isAiBusiness) {
  document.title = "ИИ для бизнеса — индивидуальные программы · Максим Недельский";
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", "Три практических формата: от первых шагов с нейросетями до прототипа ИИ-агента и проектной трансформации бизнеса.");
} else if (knownProgram) {
  document.title = `${knownProgram.title} · Максим Недельский`;
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", knownProgram.description);
}

const page = isAiBusiness
  ? <AiBusinessPage />
  : knownProgram
    ? <ProgramPage program={getProgram(knownProgram.slug)} />
    : <Home />;
const root = document.getElementById("root")!;

// Static HTML remains available to search engines before JavaScript runs.
// A fresh client render avoids React 19 hydration mismatches in the interactive form.
createRoot(root).render(page);
