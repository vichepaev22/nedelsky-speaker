import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const outputRoot = new URL("../cloudflare-dist/", import.meta.url);
const siteUrl = "https://nedelsky.pages.dev";

test("builds a complete Cloudflare Pages artifact at the domain root", async () => {
  await Promise.all([
    access(new URL("404.html", outputRoot)),
    access(new URL("favicon.svg", outputRoot)),
    access(new URL("images/speaker/maxim-navy.png", outputRoot)),
    access(new URL("robots.txt", outputRoot)),
    access(new URL("sitemap.xml", outputRoot)),
    access(new URL("llms.txt", outputRoot)),
    access(new URL("ai-for-business/index.html", outputRoot)),
  ]);

  const html = await readFile(new URL("index.html", outputRoot), "utf8");
  const assets = await readdir(new URL("assets/", outputRoot));

  assert.ok(assets.some((file) => file.endsWith(".js")));
  assert.ok(assets.some((file) => file.endsWith(".css")));
  assert.match(html, /(?:src|href)="\/assets\/.+\.(?:js|css)/);
  assert.match(html, /href="\/programs\/ai-business\//);
  assert.ok(html.includes(`${siteUrl}/`));
  assert.match(html, /<h1>Знания, которые/);
  assert.match(html, /application\/ld\+json/);
  assert.doesNotMatch(html, /\/nedelsky-speaker\//);
});

test("generates the AI services route at the Cloudflare domain root", async () => {
  const html = await readFile(new URL("ai-for-business/index.html", outputRoot), "utf8");
  assert.match(html, /<title>ИИ для бизнеса — индивидуальные программы/);
  assert.ok(html.includes(`${siteUrl}/ai-for-business/`));
  assert.match(html, /href="\/ai-for-business\/\?product=ai-practice#ai-contact"/);
  assert.match(html, /ИИ-старт: инструменты и план действий/);
  assert.match(html, /ИИ-практика: от запросов до агентов/);
  assert.match(html, /ИИ-трансформация: процессы, упаковка, команда/);
  assert.match(html, /7(?:\u00a0|\s)000 ₽/);
  assert.match(html, /"@type":"Service"/);
  assert.match(html, /vk\.ru\/ndlsky/);
  assert.doesNotMatch(html, /\/nedelsky-speaker\/|Заявка отправлена|Telegram|WhatsApp/i);
});

test("publishes Cloudflare-specific discovery files", async () => {
  const [robots, sitemap, llms] = await Promise.all([
    readFile(new URL("robots.txt", outputRoot), "utf8"),
    readFile(new URL("sitemap.xml", outputRoot), "utf8"),
    readFile(new URL("llms.txt", outputRoot), "utf8"),
  ]);

  for (const content of [robots, sitemap, llms]) {
    assert.ok(content.includes(siteUrl));
    assert.ok(!content.includes("vichepaev22.github.io"));
  }
});

for (const slug of ["ai-business", "service-design", "partnership", "procurement"]) {
  test(`generates Cloudflare route ${slug}`, async () => {
    const html = await readFile(new URL(`programs/${slug}/index.html`, outputRoot), "utf8");
    assert.ok(html.includes(`${siteUrl}/programs/${slug}/`));
    assert.match(html, /<h1>/);
    assert.match(html, /"@type":"Course"/);
    assert.doesNotMatch(html, /\/nedelsky-speaker\//);
  });
}
