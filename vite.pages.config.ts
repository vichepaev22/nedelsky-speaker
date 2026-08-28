import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { defineConfig, type Plugin } from "vite";
import Home from "./app/page";
import { ProgramPage } from "./app/ProgramPage";
import { programs } from "./app/programs-data";

const siteOrigin = "https://vichepaev22.github.io/nedelsky-speaker";
const outputDirectory = resolve("pages-dist");
const siteName = "Максим Недельский — бизнес-тренер и спикер";
const siteDescription = "Практические выступления и корпоративные семинары об ИИ, сервис-дизайне, партнёрстве и развитии бизнеса.";
const personId = `${siteOrigin}/#maxim-nedelsky`;
const updatedAt = "2026-08-28";

function escapeAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function jsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026");
}

function schemaBlock(data: Record<string, unknown>): string {
  return `<script type="application/ld+json">${jsonLd(data)}</script>`;
}

function personSchema() {
  return {
    "@type": "Person",
    "@id": personId,
    name: "Максим Недельский",
    url: `${siteOrigin}/`,
    image: `${siteOrigin}/images/speaker/maxim-flags-navy.png`,
    jobTitle: ["Бизнес-тренер", "Предприниматель", "Спикер"],
    description: "Предприниматель, эксперт и практик по применению искусственного интеллекта, автоматизации и цифровых инструментов в бизнесе.",
    sameAs: ["https://vk.ru/ndlsky"],
    knowsAbout: [
      "искусственный интеллект в бизнесе",
      "автоматизация бизнес-процессов",
      "сервис-дизайн",
      "клиентский опыт",
      "партнёрство",
      "государственные закупки",
    ],
  };
}

function homeSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      personSchema(),
      {
        "@type": "WebSite",
        "@id": `${siteOrigin}/#website`,
        url: `${siteOrigin}/`,
        name: siteName,
        inLanguage: "ru-RU",
        publisher: { "@id": personId },
      },
      {
        "@type": "ProfilePage",
        "@id": `${siteOrigin}/#webpage`,
        url: `${siteOrigin}/`,
        name: siteName,
        description: siteDescription,
        inLanguage: "ru-RU",
        dateModified: updatedAt,
        mainEntity: { "@id": personId },
        primaryImageOfPage: `${siteOrigin}/images/speaker/maxim-flags-navy.png`,
      },
    ],
  };
}

function programSchema(program: (typeof programs)[number], url: string, image: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      personSchema(),
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: `${program.title} · Максим Недельский`,
        description: program.description,
        inLanguage: "ru-RU",
        dateModified: updatedAt,
        primaryImageOfPage: image,
        mainEntity: { "@id": `${url}#course` },
      },
      {
        "@type": "Course",
        "@id": `${url}#course`,
        name: program.title,
        description: program.description,
        url,
        inLanguage: "ru-RU",
        provider: { "@id": personId },
        courseMode: program.formats.map((format) => `${format.type}: ${format.duration}`),
        audience: {
          "@type": "Audience",
          audienceType: program.audiences.join("; "),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: `${siteOrigin}/` },
          { "@type": "ListItem", position: 2, name: program.title, item: url },
        ],
      },
    ],
  };
}

function metaBlock({
  title,
  description,
  url,
  image,
  schema,
}: {
  title: string;
  description: string;
  url: string;
  image: string;
  schema: Record<string, unknown>;
}): string {
  const safeTitle = escapeAttribute(title);
  const safeDescription = escapeAttribute(description);

  return `<!-- page-meta-start -->
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href="${url}" />
    <link rel="alternate" hreflang="ru" href="${url}" />
    <link rel="alternate" hreflang="x-default" href="${url}" />
    <link rel="sitemap" type="application/xml" href="${siteOrigin}/sitemap.xml" />
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
    ${schemaBlock(schema)}
    <!-- page-meta-end -->`;
}

function withSiteBase(content: string): string {
  return content.replace(/\b(src|href)="\/(?!\/)/g, `$1="/nedelsky-speaker/`);
}

function staticMarkup(content: string): { preloads: string; root: string } {
  const preloadPattern = /<link rel="preload"[^>]*\/>/g;
  const preloads = content.match(preloadPattern)?.join("") ?? "";
  const mainContent = content.replace(preloadPattern, "");

  return {
    preloads: withSiteBase(preloads),
    root: `<div id="root">${withSiteBase(mainContent)}</div>`,
  };
}

function renderStaticPage(template: string, meta: string, content: string): string {
  const rendered = staticMarkup(content);
  return template
    .replace(/<!-- page-meta-start -->[\s\S]*?<!-- page-meta-end -->/, meta)
    .replace("</head>", `${rendered.preloads}</head>`)
    .replace(/<div id="root"><\/div>/, rendered.root);
}

function generateStaticRoutes(): Plugin {
  return {
    name: "generate-github-pages-routes",
    closeBundle() {
      const rootIndexPath = resolve(outputDirectory, "index.html");
      const rootHtml = readFileSync(rootIndexPath, "utf8");
      const homeUrl = `${siteOrigin}/`;
      const homeImage = `${siteOrigin}/images/speaker/maxim-flags-navy.png`;
      const homeHtml = renderStaticPage(
        rootHtml,
        metaBlock({
          title: siteName,
          description: siteDescription,
          url: homeUrl,
          image: homeImage,
          schema: homeSchema(),
        }),
        renderToStaticMarkup(createElement(Home)),
      );

      writeFileSync(rootIndexPath, homeHtml, "utf8");

      for (const program of programs) {
        const directory = resolve(outputDirectory, "programs", program.slug);
        const url = `${siteOrigin}/programs/${program.slug}/`;
        const image = `${siteOrigin}${program.image}`;
        const html = renderStaticPage(
          rootHtml,
          metaBlock({
            title: `${program.title} · Максим Недельский`,
            description: program.description,
            url,
            image,
            schema: programSchema(program, url, image),
          }),
          renderToStaticMarkup(createElement(ProgramPage, { program })),
        );

        mkdirSync(directory, { recursive: true });
        writeFileSync(resolve(directory, "index.html"), html, "utf8");
      }

      writeFileSync(resolve(outputDirectory, "404.html"), homeHtml, "utf8");
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
