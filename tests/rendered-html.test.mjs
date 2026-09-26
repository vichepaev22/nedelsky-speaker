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
  assert.match(html, /ИИ для вашего бизнеса/);
  assert.match(html, /ИИ-старт: инструменты и план действий/);
  assert.match(html, /ИИ-практика: от запросов до агентов/);
  assert.match(html, /ИИ-трансформация: процессы, упаковка, команда/);
  assert.match(html, /7(?:\u00a0|\s)000 ₽/);
  assert.match(html, /vk\.ru\/ndlsky/);
  assert.doesNotMatch(html, /Заявка отправлена|Telegram|WhatsApp/i);
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
