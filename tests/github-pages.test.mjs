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
  });
}
