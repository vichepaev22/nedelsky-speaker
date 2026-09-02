import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const outputRoot = new URL("../pages-dist/", import.meta.url);
const siteUrl = "https://vichepaev22.github.io/nedelsky-speaker";

test("builds a complete GitHub Pages artifact", async () => {
  await Promise.all([
    access(new URL(".nojekyll", outputRoot)),
    access(new URL("404.html", outputRoot)),
    access(new URL("images/speaker/maxim-navy.png", outputRoot)),
    access(new URL("logos/sber.png", outputRoot)),
    access(new URL("logos/nash-buduschee.jfif", outputRoot)),
    access(new URL("logos/rosmolodezh-granty.jfif", outputRoot)),
    access(new URL("logos/moy-biznes.jpg", outputRoot)),
    access(new URL("robots.txt", outputRoot)),
    access(new URL("sitemap.xml", outputRoot)),
    access(new URL("llms.txt", outputRoot)),
  ]);

  const assets = await readdir(new URL("assets/", outputRoot));
  assert.ok(assets.some((file) => file.endsWith(".js")));
  assert.ok(assets.some((file) => file.endsWith(".css")));
});

test("uses the repository base path for scripts and styles", async () => {
  const html = await readFile(new URL("index.html", outputRoot), "utf8");
  assert.match(html, /\/nedelsky-speaker\/assets\/.+\.js/);
  assert.match(html, /\/nedelsky-speaker\/assets\/.+\.css/);
  assert.ok(html.includes(`${siteUrl}/`));
  assert.match(html, /<h1>Знания, которые/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /"@type":"Person"/);
  assert.match(html, /href="\/nedelsky-speaker\/programs\/ai-business\//);
  assert.match(html, /Фонд «Наше Будущее»/);
  assert.match(html, /Росмолодёжь\.Гранты/);
  assert.match(html, /Организаторам/);
  assert.match(html, /Подобрать формат/);
  assert.match(html, /4–6 часов/);
  assert.match(html, /class="mobile-menu"/);
  assert.doesNotMatch(html, /Для e-mail-заявок достаточно/);
  assert.ok(
    html.indexOf('id="programs"') < html.indexOf('id="partners"'),
    "programs should appear before the partner block",
  );
});

for (const [slug, title] of [
  ["ai-business", "ИИ для роста бизнеса"],
  ["service-design", "Сервис-дизайн и клиентский опыт"],
  ["partnership", "Партнёрство как основа взаимодействия"],
  ["procurement", "Госзакупки как инструмент развития бизнеса"],
]) {
  test(`generates shareable static route ${slug}`, async () => {
    const html = await readFile(
      new URL(`programs/${slug}/index.html`, outputRoot),
      "utf8",
    );
    assert.ok(html.includes(`<title>${title}`));
    assert.ok(html.includes(`${siteUrl}/programs/${slug}/`));
    assert.match(html, /property="og:image"/);
    assert.match(html, /<h1>/);
    assert.match(html, /"@type":"Course"/);
    assert.match(html, /"@type":"BreadcrumbList"/);
  });
}
