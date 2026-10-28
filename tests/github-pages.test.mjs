import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const outputRoot = new URL("../pages-dist/", import.meta.url);
const primaryUrl = "https://nedelsky.pages.dev";

test("privacy page and footer links preserve the repository base path", async () => {
  const policy = await readFile(new URL("legal/privacy/index.html", outputRoot), "utf8");
  assert.match(policy, /Недельский Максим Владимирович/);
  assert.match(policy, /href="\/nedelsky-speaker\/legal\/privacy\/"/);
  assert.match(policy, /href="https:\/\/nedelsky.pages.dev\/legal\/privacy\/"/);
  for (const path of ["index.html", "ai-for-business/index.html", "speaker-tools/index.html", "programs/partnership/index.html"]) {
    const html = await readFile(new URL(path, outputRoot), "utf8");
    assert.match(html, /href="\/nedelsky-speaker\/legal\/privacy\/"/);
  }
});

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
    access(new URL("ai-for-business/index.html", outputRoot)),
  ]);

  const assets = await readdir(new URL("assets/", outputRoot));
  assert.ok(assets.some((file) => file.endsWith(".js")));
  assert.ok(assets.some((file) => file.endsWith(".css")));
  assert.ok(assets.some((file) => /^ProgramMotionPlayer-.+\.js$/.test(file)), "animation should be a separate lazy-loaded asset");
});

test("generates the AI services route for GitHub Pages", async () => {
  const html = await readFile(new URL("ai-for-business/index.html", outputRoot), "utf8");
  assert.match(html, /<title>ИИ для бизнеса — индивидуальные программы/);
  assert.ok(html.includes(`${primaryUrl}/ai-for-business/`));
  assert.match(html, /href="\/nedelsky-speaker\/ai-for-business\/\?product=ai-start#details-ai-start"/);
  assert.match(html, /ИИ-старт: инструменты и план действий/);
  assert.match(html, /ИИ-трансформация: процессы, упаковка, команда/);
  assert.match(html, /"@type":"Service"/);
  assert.match(html, /vk\.ru\/ndlsky/);
  assert.doesNotMatch(html, /Заявка отправлена|Telegram|WhatsApp/i);
  assert.match(html, /<link rel="canonical" href="https:\/\/nedelsky\.pages\.dev\/ai-for-business\/"/);
  assert.match(html, /"@id":"https:\/\/nedelsky\.pages\.dev\/#maxim-nedelsky"/);
});

test("uses the repository base path for scripts and styles", async () => {
  const html = await readFile(new URL("index.html", outputRoot), "utf8");
  assert.match(html, /\/nedelsky-speaker\/assets\/.+\.js/);
  assert.match(html, /\/nedelsky-speaker\/assets\/.+\.css/);
  assert.ok(html.includes(`${primaryUrl}/`));
  assert.match(html, /<h1>Знания, которые/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /<link rel="canonical" href="https:\/\/nedelsky\.pages\.dev\/"/);
  assert.match(html, /"@type":"Person"/);
  assert.match(html, /href="\/nedelsky-speaker\/programs\/ai-business\//);
  assert.match(html, /Фонд «Наше Будущее»/);
  assert.match(html, /Росмолодёжь\.Гранты/);
  assert.match(html, /Организаторам/);
  assert.match(html, /Смотреть программу/);
  assert.match(html, /Уточнить формат/);
  assert.doesNotMatch(html, /<link[^>]+(?:preload|modulepreload)[^>]+ProgramMotionPlayer/, "the homepage must not preload the animation runtime");
  assert.match(html, /4–6 часов/);
  assert.match(html, /class="mobile-menu"/);
  assert.doesNotMatch(html, /Для e-mail-заявок достаточно/);
  assert.ok(
    html.indexOf('id="partners"') < html.indexOf('id="projects"') &&
      html.indexOf('id="projects"') < html.indexOf('id="programs"'),
    "partners and the project portfolio should precede programs",
  );
});

test("speaker tools preserve GitHub Pages base paths", async () => {
  const [home, tools] = await Promise.all([
    readFile(new URL("index.html", outputRoot), "utf8"),
    readFile(new URL("speaker-tools/index.html", outputRoot), "utf8"),
  ]);
  assert.match(home, /href="\/nedelsky-speaker\/speaker-tools\/"/);
  assert.ok(tools.includes(`${primaryUrl}/speaker-tools/`));
  assert.match(tools, /role="timer"[^>]*>15:00/);
  assert.match(tools, /href="\/nedelsky-speaker\/#top"/);
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
    assert.ok(html.includes(`${primaryUrl}/programs/${slug}/`));
    assert.match(html, /property="og:image"/);
    assert.match(html, /<h1>/);
    assert.match(html, /Интерактивная (?:модель|схема)|Карта клиентского пути|Система партнёрства|Маршрут закупки/);
    assert.match(html, /class="lab-board"/);
    assert.match(html, /class="lab-poster-compact"/, "mobile poster must exist before animation loads");
    assert.match(html, /Повторить анимацию/);
    assert.match(html, /class="lab-readout-panels"/);
    assert.equal((html.match(/aria-controls="lab-stage-description"/g) || []).length, 4);
    assert.equal((html.match(/aria-controls="format-depth-result"/g) || []).length, 3);
    assert.match(html, /"@type":"Course"/);
    assert.match(html, /"@type":"BreadcrumbList"/);
  });
}
