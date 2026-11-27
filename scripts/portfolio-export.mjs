import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function normalizeEvidenceUrl(value) {
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error("Evidence needs HTTPS");
  for (const key of [...url.searchParams.keys()]) {
    if (/^utm_|^(fbclid|gclid)$/i.test(key)) url.searchParams.delete(key);
  }
  return url.href;
}

export function exportVerified(register) {
  const seen = new Set();
  const ids = new Set();
  const fields = ["id", "title", "publisher", "type", "topics", "publishedAt", "year", "role", "summary", "claimIds", "verifiedAt", "eventGroupId", "format", "sourceKind"];
  return register.sources.filter(source => source.status === "verified").map(source => {
    if (!source.verifiedAt || !source.verification || !source.eventGroupId) throw new Error(`Unreviewed source ${source.id}`);
    const url = normalizeEvidenceUrl(source.url);
    if (seen.has(url) || ids.has(source.id)) throw new Error(`Duplicate source ${source.id}`);
    seen.add(url); ids.add(source.id);
    return { ...Object.fromEntries(fields.filter(key => source[key] !== undefined).map(key => [key, source[key]])), url };
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const register = JSON.parse(readFileSync(new URL("../content/evidence-register.json", import.meta.url), "utf8"));
  const output = JSON.stringify(exportVerified(register), null, 2) + "\n";
  const target = new URL("../app/portfolio-public.json", import.meta.url);
  if (process.argv.includes("--check")) {
    if (readFileSync(target, "utf8") !== output) throw new Error("Run node scripts/portfolio-export.mjs after editorial review");
  } else {
    writeFileSync(target, output);
  }
  console.log(`Portfolio export: ${JSON.parse(output).length} reviewed sources`);
}
