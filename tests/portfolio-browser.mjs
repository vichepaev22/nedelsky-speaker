import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
const reports = [];
mkdirSync("outputs/geo", { recursive: true });
try {
  for (const mirror of ["", "/nedelsky-speaker"]) {
    for (const width of [320, 390, 768, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      const page = await context.newPage();
      const errors = [];
      const warnings = [];
      const failed = [];
      page.on("pageerror", error => errors.push(error.message));
      page.on("console", message => { if (message.type() === "error") errors.push(message.text()); if (message.type() === "warning") warnings.push(message.text()); });
      page.on("response", response => { if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`); });
      await page.goto(`http://127.0.0.1:4191${mirror}/about/`);
      await page.locator(".profile-filter").waitFor();
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator("[data-source-id]").count(), 19);
      assert.equal(await page.locator("h1").count(), 1);
      const layout = await page.evaluate(() => ({ viewport: innerWidth, width: document.documentElement.scrollWidth, overflow: [...document.querySelectorAll(".profile-shell *")].filter(el => { const b = el.getBoundingClientRect(); return b.width > 0 && (b.right > innerWidth + 1 || b.left < -1); }).map(el => `${el.tagName}.${el.className}`) }));
      assert.ok(layout.width <= width && !layout.overflow.length, JSON.stringify(layout));
      // Flex items stretch vertically, so check no-wrap and sufficient inline space instead.
      assert.ok(await page.locator(".profile-timeline li > b").evaluateAll(nodes => nodes.every(node => getComputedStyle(node).whiteSpace === "nowrap" && node.scrollWidth <= node.clientWidth)));
      // Normal keyboard path: first Tab reveals skip-link; Enter reaches biography.
      await page.keyboard.press("Tab");
      assert.equal(await page.locator(":focus").textContent(), "Перейти к содержанию");
      await page.keyboard.press("Enter");
      assert.ok(page.url().endsWith("#biography"));
      const mobileMenu = page.locator(".mobile-menu");
      if (await mobileMenu.locator("summary").isVisible()) {
        await mobileMenu.locator("summary").click();
        await mobileMenu.getByRole("link", { name: "Материалы", exact: true }).click();
        assert.equal(await mobileMenu.getAttribute("open"), null);
        assert.ok(page.url().endsWith("#materials"));
      }
      await page.getByRole("button", { name: "ИИ", exact: true }).click();
      assert.equal(await page.locator("[data-source-id]").count(), 2);
      assert.equal(await page.getByRole("button", { name: "ИИ", exact: true }).getAttribute("aria-pressed"), "true");
      await page.getByRole("button", { name: "Все темы", exact: true }).click();
      assert.equal(await page.locator("[data-source-id]").count(), 19);
      const invalidLinks = await page.evaluate(() => [...document.querySelectorAll("a[href^='#']")].filter(a => !document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a => a.hash));
      assert.deepEqual(invalidLinks, []);
      assert.equal(await page.locator(".profile-specialties a").first().getAttribute("href"), `${mirror}/ai-for-business/`);
      // Visit internal CTA normally, then verify the program rather than sending any form.
      await page.locator(".profile-specialties a").first().click();
      await page.getByRole("heading", { name: /ИИ для бизнеса/ }).waitFor();
      await page.goto(`http://127.0.0.1:4191${mirror}/about/`);
      await page.locator(".profile-filter").waitFor();
      const notice = page.getByRole("button", { name: /Понятно|Принять/ }).first();
      if (await notice.isVisible()) await notice.click();
      await page.screenshot({ path: `outputs/geo/${mirror ? "github" : "cloudflare"}-${width}.png`, fullPage: true });
      if (!mirror && width === 1440) await page.screenshot({ path: "outputs/geo/about-desktop-preview.png" });
      if (width === 390 || width === 1440) {
        await page.getByRole("link", { name: "Посмотреть кейс" }).click();
        assert.ok(page.url().endsWith("#certificate-register"));
        const card = page.locator("#certificate-register");
        await card.getByRole("heading", { name: "Учёт справок клиентов" }).waitFor();
        assert.match(await card.textContent(), /DeepSeek/);
        const box = await card.boundingBox();
        assert.ok(box && box.x >= 0 && box.x + box.width <= width);
        const menu = page.locator(".site-header .mobile-menu");
        if (await menu.locator("summary").isVisible()) {
          await menu.locator("summary").click();
          await menu.getByRole("link", { name: "О спикере", exact: true }).click();
        } else {
          await page.locator(".site-header .desktop-nav").getByRole("link", { name: "О спикере", exact: true }).click();
        }
        await page.locator(".profile-filter").waitFor();
        assert.ok(page.url().endsWith(`${mirror}/about/`));
        await page.goto(`http://127.0.0.1:4191${mirror}/#about`);
        await page.getByRole("link", { name: "Подробнее о спикере" }).click();
        await page.locator(".profile-filter").waitFor();
        assert.ok(page.url().endsWith(`${mirror}/about/`));
      }
      assert.deepEqual(errors, [], "Console/page errors");
      assert.deepEqual(warnings, [], "Console warnings");
      assert.deepEqual(failed, [], "Failed HTTP responses");
      reports.push({ mirror: mirror || "/", width, errors, warnings, failed, overflow: layout.overflow, sources: 19, filter: "passed", keyboardSkip: "passed", internalCTA: "passed" });
      await context.close();
    }
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 900 } });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:4191${mirror}/about/`);
    assert.equal(await page.locator("[data-source-id]").count(), 19);
    await page.locator(".profile-specialties a").first().click();
    assert.ok(page.url().includes("/ai-for-business/"));
    assert.equal(await page.locator("h1").count(), 1);
    reports.push({ mirror: mirror || "/", javaScriptEnabled: false, sources: 19, internalCTA: "passed" });
    await context.close();
  }
  writeFileSync("outputs/geo/browser-results.json", JSON.stringify(reports, null, 2));
  console.log(JSON.stringify(reports, null, 2));
} finally { await browser.close(); }
