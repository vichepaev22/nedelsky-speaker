import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the speaker landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Максим Недельский/);
  assert.match(html, /Знания, которые/);
  assert.match(html, /ИИ для роста бизнеса/);
  assert.doesNotMatch(html, /Your site is taking shape|Starter Project/i);
});

test("server-renders the AI for business product page", async () => {
  const response = await render("/ai-for-business");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /ИИ для бизнеса —/);
  assert.match(html, /ИИ-старт: инструменты и план действий/);
  assert.match(html, /ИИ-практика: от запросов до агентов/);
  assert.match(html, /ИИ-трансформация: процессы, упаковка, команда/);
  assert.match(html, /7(?:\u00a0|\s)000 ₽/);
  assert.match(html, /vk\.ru\/ndlsky/);
  assert.doesNotMatch(html, /Заявка отправлена|Telegram|WhatsApp/i);
});

test("server-renders speaker tools before JavaScript starts", async () => {
  const response = await render("/speaker-tools");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Таймер/);
  assert.match(html, /role="timer"[^>]*>15:00/);
  assert.match(html, /Задание для группы/);
});

test("server renders about with source text and one stable Person before JavaScript", async () => {
  const redirect = await render("/about/");
  assert.equal(redirect.status, 308);
  assert.ok(redirect.headers.get("location")?.endsWith("/about"));
  const response = await render("/about");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Авторские материалы/);
  assert.match(html, /data-source-id="S28"/);
  assert.match(html, /https:\/\/nedelsky.pages.dev\/about\//);
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
  const nodes = scripts.flatMap(script => script["@graph"] ?? [script]);
  assert.equal(nodes.filter(node => node["@type"] === "Person").length, 1);
  assert.equal(nodes.find(node => node["@type"] === "ProfilePage").mainEntity["@id"], "https://nedelsky.pages.dev/#maxim-nedelsky");
});

for (const [slug, heading] of [
  ["ai-business", "ИИ для роста бизнеса"],
  ["service-design", "Сервис-дизайн и клиентский опыт"],
  ["partnership", "Партнёрство как основа взаимодействия"],
  ["procurement", "Госзакупки как инструмент развития бизнеса"],
]) {
  test(`server-renders program ${slug}`, async () => {
    const response = await render(`/programs/${slug}`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, new RegExp(heading));
    assert.match(html, /class="lab-board"/);
  });
}
