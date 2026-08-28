import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { programs } from "./app/programs-data";

const siteOrigin = "https://vichepaev22.github.io/nedelsky-speaker";
const outputDirectory = resolve("pages-dist");

function escapeAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function metaBlock({
  title,
  description,
  url,
  image,
}: {
  title: string;
  description: string;
  url: string;
  image: string;
}): string {
  const safeTitle = escapeAttribute(title);
  const safeDescription = escapeAttribute(description);

  return `<!-- page-meta-start -->
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="ru_RU" />
    <meta property="og:site_name" content="Максим Недельский — бизнес-тренер и спикер" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${image}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${image}" />
    <!-- page-meta-end -->`;
}

function generateStaticRoutes(): Plugin {
  return {
    name: "generate-github-pages-routes",
    closeBundle() {
      const rootIndexPath = resolve(outputDirectory, "index.html");
      const rootHtml = readFileSync(rootIndexPath, "utf8");
      const metaPattern = /<!-- page-meta-start -->[\s\S]*?<!-- page-meta-end -->/;

      for (const program of programs) {
        const directory = resolve(outputDirectory, "programs", program.slug);
        const url = `${siteOrigin}/programs/${program.slug}/`;
        const image = `${siteOrigin}${program.image}`;
        const html = rootHtml.replace(
          metaPattern,
          metaBlock({
            title: `${program.title} · Максим Недельский`,
            description: program.description,
            url,
            image,
          }),
        );

        mkdirSync(directory, { recursive: true });
        writeFileSync(resolve(directory, "index.html"), html, "utf8");
      }

      writeFileSync(resolve(outputDirectory, "404.html"), rootHtml, "utf8");
      writeFileSync(resolve(outputDirectory, ".nojekyll"), "", "utf8");
    },
  };
}

export default defineConfig({
  root: "github-pages",
  base: "/nedelsky-speaker/",
  publicDir: resolve("public"),
  plugins: [react(), generateStaticRoutes()],
  build: {
    outDir: outputDirectory,
    emptyOutDir: true,
  },
});
