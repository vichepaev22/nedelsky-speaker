import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { exportVerified, normalizeEvidenceUrl } from "../scripts/portfolio-export.mjs";

const register = JSON.parse(readFileSync(new URL("../content/evidence-register.json", import.meta.url)));
const published = JSON.parse(readFileSync(new URL("../app/portfolio-public.json", import.meta.url)));
test("public evidence is a reproducible allowlist, not the internal register", () => {
  assert.equal(register.sources.length, 28);
  assert.equal(published.length, 19);
  assert.deepEqual(published, exportVerified(register));
  for (const source of published) {
    assert.ok(source.verifiedAt && source.eventGroupId && source.role);
    assert.equal("notes" in source, false);
    assert.equal("verification" in source, false);
    assert.equal("status" in source, false);
    assert.ok(!["S05", "S06", "S12", "S17", "S19", "S22", "S23", "S24", "S26"].includes(source.id));
  }
});
test("duplicate events are grouped and authorship is conservative", () => {
  assert.equal(new Set(published.map(source => source.eventGroupId)).size, 14);
  assert.deepEqual(published.filter(source => source.type === "author_work").map(source => source.id), ["S01"]);
  assert.equal(published.find(source => source.id === "S21").publishedAt, undefined);
  assert.equal(published.find(source => source.id === "S21").year, undefined);
});
test("export refuses unreviewed and duplicate sources", () => {
  const first = register.sources.find(source => source.status === "verified");
  assert.throws(() => exportVerified({ sources: [{ ...first, verification: "" }] }), /Unreviewed/);
  assert.throws(() => exportVerified({ sources: [first, { ...first, id: "duplicate" }] }), /Duplicate/);
  assert.throws(() => normalizeEvidenceUrl("http://example.com"), /HTTPS/);
  assert.equal(normalizeEvidenceUrl("https://example.com/a?before=4&utm_source=x&gclid=y#part"), "https://example.com/a?before=4#part");
});

for (const [directory, base] of [["pages-dist", "/nedelsky-speaker"], ["cloudflare-dist", ""]]) {
  test(`${directory}: profile content, source links and canonical identity are in initial HTML`, () => {
    const html = readFileSync(new URL(`../${directory}/about/index.html`, import.meta.url), "utf8");
    assert.match(html, /<html lang="ru"/);
    assert.match(html, /<h1[^>]*>Максим/);
    for (const anchor of ["biography", "materials", "speaking", "media", "projects", "timeline", "about-contact"]) assert.ok(html.includes(`id="${anchor}"`));
    for (const source of published) assert.ok(html.includes(`data-source-id="${source.id}"`), source.id);
    assert.ok(html.includes(`href="${base}/ai-for-business/"`));
    assert.match(html, /rel="canonical" href="https:\/\/nedelsky.pages.dev\/about\/"/);
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])["@graph"];
    assert.equal(graph.filter(item => item["@type"] === "Person").length, 1);
    assert.equal(graph.find(item => item["@type"] === "ProfilePage").mainEntity["@id"], "https://nedelsky.pages.dev/#maxim-nedelsky");
    const works = graph.filter(item => item["@type"] === "CreativeWork");
    assert.equal(works.length, 19);
    assert.equal(works.filter(item => item.author).length, 1);
    for (const source of published) assert.ok(works.find(work => work["@id"] === source.url));
    assert.ok(!html.includes("Source not verified"));
    const home = readFileSync(new URL(`../${directory}/index.html`, import.meta.url), "utf8");
    assert.ok(home.includes(`href="${base}/about/"`));
    for (const path of ["index.html", "ai-for-business/index.html", "programs/service-design/index.html"]) {
      const page = readFileSync(new URL(`../${directory}/${path}`, import.meta.url), "utf8");
      const schema = JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
      assert.equal(schema["@graph"].find(item => item["@type"] === "Person")["@id"], "https://nedelsky.pages.dev/#maxim-nedelsky");
    }
    assert.ok(readFileSync(new URL(`../${directory}/sitemap.xml`, import.meta.url), "utf8").includes("https://nedelsky.pages.dev/about/"));
    const assets = readdirSync(new URL(`../${directory}/assets/`, import.meta.url)).filter(file => file.endsWith(".js")).map(file => readFileSync(new URL(`../${directory}/assets/${file}`, import.meta.url), "utf8")).join("\n");
    for (const source of register.sources.filter(source => source.status !== "verified")) assert.ok(!assets.includes(source.url), `Internal source leaked: ${source.id}`);
  });
}
