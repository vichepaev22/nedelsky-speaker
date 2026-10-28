import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const outputRoot = new URL("../cloudflare-dist/", import.meta.url);
const siteUrl = "https://nedelsky.pages.dev";

test("privacy route describes the actual two-field VK workflow and is linked from every footer", async () => {
  const policy = await readFile(new URL("legal/privacy/index.html", outputRoot), "utf8");
  assert.match(policy, /Недельский Максим Владимирович/);
  assert.match(policy, /nedelsky-privacy-notice/);
  assert.match(policy, /180 дней/);
  assert.match(policy, /Автоматической отправки сообщения нет/);
  assert.doesNotMatch(policy, /Андрейский|ИНН|ОГРНИП|incube/i);
  for (const path of ["index.html", "ai-for-business/index.html", "speaker-tools/index.html", ...["ai-business", "service-design", "partnership", "procurement"].map(slug => `programs/${slug}/index.html`)]) {
    const html = await readFile(new URL(path, outputRoot), "utf8");
    const footer = html.match(/<footer[\s\S]*?<\/footer>/)?.[0];
    assert.ok(footer?.includes('href="/legal/privacy/"'), `Missing policy in ${path}`);
    assert.match(footer, /О cookies/);
  }
});

test("home contact has two fields on the left and compact two-row navigation", async () => {
  const home = await readFile(new URL("index.html", outputRoot), "utf8");
  const contact = home.match(/<section class="contact-section"[\s\S]*?<\/section>/)?.[0];
  assert.ok(contact.indexOf('<form') < contact.indexOf('class="contact-intro"'));
  assert.deepEqual([...contact.matchAll(/name="([^"]+)"/g)].map(match => match[1]), ["topic", "details"]);
  assert.match(contact, /Что хотите получить, какой вопрос хотите задать/);
  assert.doesNotMatch(contact, /lead-name|lead-company|Написать сразу в VK|form-divider/);
  assert.equal((home.match(/class="footer-nav-row"/g) || []).length, 2);
});

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
  // The quiz intentionally lives on GitHub; Cloudflare assets remain at its own root.
  assert.doesNotMatch(html, /(?:src|href)="\/nedelsky-speaker\//);
  assert.ok(html.includes('href="https://vichepaev22.github.io/nedelsky-speaker/ai-quiz/"'));
});

test("homepage keeps section navigation and accessible headings in initial HTML", async () => {
  const html = await readFile(new URL("index.html", outputRoot), "utf8");
  assert.match(html, /aria-label="Основная навигация"/);
  assert.match(html, /aria-label="Навигация по разделам сайта"/);
  for (const anchor of ["partners", "projects", "programs", "cases", "about", "organizers", "contact", "top"]) {
    assert.ok(html.includes(`href="#${anchor}"`), `Missing navigation to #${anchor}`);
  }
  assert.doesNotMatch(html, /работыс сильными|которыеуже стали|нужнопереходить|собратьподходящий/);
  assert.match(html, /alt="Максим Недельский с микрофоном на макете сайта спикера"/);
});

test("generates the AI services route at the Cloudflare domain root", async () => {
  const html = await readFile(new URL("ai-for-business/index.html", outputRoot), "utf8");
  assert.match(html, /<title>ИИ для бизнеса — индивидуальные программы/);
  assert.ok(html.includes(`${siteUrl}/ai-for-business/`));
  assert.match(html, /href="\/ai-for-business\/\?product=ai-practice#details-ai-practice"/);
  assert.match(html, /ИИ-старт: инструменты и план действий/);
  assert.match(html, /ИИ-практика: от запросов до агентов/);
  assert.match(html, /ИИ-трансформация: процессы, упаковка, команда/);
  assert.match(html, /7(?:\u00a0|\s)000 ₽/);
  assert.match(html, /"@type":"Service"/);
  assert.match(html, /vk\.ru\/ndlsky/);
  assert.doesNotMatch(html, /\/nedelsky-speaker\/|Заявка отправлена|Telegram|WhatsApp/i);
});

test("AI landing offers outcomes and working product anchors without a required inquiry form", async () => {
  const html = await readFile(new URL("ai-for-business/index.html", outputRoot), "utf8");
  assert.match(html, /ИИ для бизнеса —/);
  assert.match(html, /Какой формат/);
  assert.doesNotMatch(html, /<form\b|clipboard|Подготовить заявку/i);
  for (const slug of ["ai-start", "ai-practice", "ai-transformation"]) {
    const article = html.match(new RegExp(`<article[^>]*id="product-${slug}"[\\s\\S]*?</article>`))?.[0];
    assert.ok(article, `Missing product ${slug}`);
    assert.ok(article.indexOf("Что вы получите") < article.indexOf("ai-product-facts"));
    assert.match(article, /href="https:\/\/vk\.ru\/ndlsky"/);
    assert.ok(html.includes(`?product=${slug}#product-${slug}`));
    assert.ok(html.includes(`id="details-${slug}"`));
  }
  assert.match(html, /class="ai-mobile-cta"/);
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
  assert.match(robots, /User-agent: OAI-SearchBot\s+Allow: \//);
});

test("AI page answers business-fit questions in initial HTML", async () => {
  const html = await readFile(new URL("ai-for-business/index.html", outputRoot), "utf8");
  assert.match(html, /Как понять, где ИИ полезен именно моему бизнесу\?/);
  assert.match(html, /Вы внедряете готовую систему или учите пользоваться ИИ\?/);
  assert.match(html, /Промышленная разработка и интеграции согласуются отдельно/);
});

test("speaker tools are a direct, discoverable route linked from the homepage", async () => {
  const [home, tools, sitemap] = await Promise.all([
    readFile(new URL("index.html", outputRoot), "utf8"),
    readFile(new URL("speaker-tools/index.html", outputRoot), "utf8"),
    readFile(new URL("sitemap.xml", outputRoot), "utf8"),
  ]);
  assert.match(home, /href="\/speaker-tools\/"[^>]*>Инструменты для спикера/);
  assert.ok(tools.includes(`${siteUrl}/speaker-tools/`));
  assert.match(tools, /role="timer"[^>]*>15:00/);
  assert.match(tools, /Задание для группы/);
  assert.match(tools, /Старт на весь экран/);
  assert.match(sitemap, /\/speaker-tools\//);
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
