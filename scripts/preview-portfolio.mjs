import { createServer } from "node:http";
import { readFileSync, statSync } from "node:fs";
import { resolve, sep, extname } from "node:path";

// Loopback only. Both compiled mirrors can be checked without publishing anything.
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".json": "application/json", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml" };
createServer((request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
    const github = path.startsWith("/nedelsky-speaker/");
    const root = resolve(github ? "pages-dist" : "cloudflare-dist");
    let target = resolve(root, `.${github ? path.slice("/nedelsky-speaker".length) : path}`);
    if (target !== root && !target.startsWith(root + sep)) throw new Error("Outside preview");
    if (statSync(target).isDirectory()) target = resolve(target, "index.html");
    response.writeHead(200, { "Content-Type": types[extname(target)] ?? "application/octet-stream", "Cache-Control": "no-store" });
    response.end(readFileSync(target));
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain" }); response.end("Not found");
  }
}).listen(4191, "127.0.0.1", () => console.log("Portfolio preview: http://127.0.0.1:4191/about/ and /nedelsky-speaker/about/"));
