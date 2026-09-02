import { createRoot, hydrateRoot } from "react-dom/client";
import Home from "../app/page";
import { ProgramPage } from "../app/ProgramPage";
import { getProgram, programs } from "../app/programs-data";
import "./site.css";

const baseSegments = import.meta.env.BASE_URL.split("/").filter(Boolean);
const pathSegments = window.location.pathname.split("/").filter(Boolean);
const relativeSegments = pathSegments.slice(baseSegments.length);
const programSlug =
  relativeSegments[0] === "programs" ? relativeSegments[1] : undefined;
const knownProgram = programs.find((program) => program.slug === programSlug);

if (knownProgram) {
  document.title = `${knownProgram.title} · Максим Недельский`;
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", knownProgram.description);
}

const page = knownProgram ? <ProgramPage program={getProgram(knownProgram.slug)} /> : <Home />;
const root = document.getElementById("root")!;

// The home page hydrates its static form. Program pages keep SEO-ready HTML in
// the document source and render client-side to avoid a React 19 text mismatch.
if (knownProgram) {
  createRoot(root).render(page);
} else {
  hydrateRoot(root, page);
}
