#!/usr/bin/env node
/** Local preview with clean-URL rewrites matching production paths. */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { FILE_MAP } = require("./_crawl_links.js");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 5177);

/** HTML rewrites from vercel.json — keeps local preview aligned with production. */
const VERCEL_REWRITES = (() => {
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8"));
    const map = {};
    for (const r of cfg.rewrites || []) {
      if (!r.source || !r.destination || r.destination.includes(":")) continue;
      if (!r.destination.endsWith(".html")) continue;
      map[r.source] = r.destination.replace(/^\//, "");
    }
    return map;
  } catch {
    return {};
  }
})();

function loadEnvFile(file) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const key = t.slice(0, i).trim();
    if (!key || process.env[key]) continue;
    let val = t.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}
loadEnvFile(".env.local");
loadEnvFile(".env");
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".woff2": "font/woff2",
};

function resolveUrl(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  if (VERCEL_REWRITES[clean]) return VERCEL_REWRITES[clean];
  if (FILE_MAP[clean]) return FILE_MAP[clean];
  if (clean.startsWith("/services/")) {
    const slug = clean.split("/").pop();
    const f = `kriva-service-${slug}.html`;
    if (fs.existsSync(path.join(ROOT, f))) return f;
  }
  // Media assets (two-segment paths under /work/ and /solutions/)
  const workMedia = clean.match(/^\/work\/([^/]+)\/(.+)$/);
  if (workMedia) {
    const f = `media/work/${workMedia[1]}/${workMedia[2]}`;
    if (fs.existsSync(path.join(ROOT, f))) return f;
  }
  const solMedia = clean.match(/^\/solutions\/([^/]+)\/(.+)$/);
  if (solMedia) {
    const f = `media/solutions/${solMedia[1]}/${solMedia[2]}`;
    if (fs.existsSync(path.join(ROOT, f))) return f;
  }
  const insMedia = clean.match(/^\/insights\/(.+)$/);
  if (insMedia && insMedia[1] !== "" && insMedia[1].includes(".")) {
    const f = `media/insights/${insMedia[1]}`;
    if (fs.existsSync(path.join(ROOT, f))) return f;
  }
  if (clean.startsWith("/shared/")) return clean.slice(1);
  if (clean.startsWith("/brand/")) return clean.slice(1);
  if (clean.startsWith("/media/")) return clean.slice(1);
  if (clean.endsWith(".html") || clean.includes(".")) return clean.replace(/^\//, "");
  return null;
}

const server = http.createServer((req, res) => {
  const raw = req.url || "/";
  const pathOnly = decodeURIComponent(raw.split("?")[0].split("#")[0]);
  const qs = raw.includes("?") ? raw.slice(raw.indexOf("?")) : "";
  if (pathOnly === "/api/inquiry") {
    const inquiryPath = require.resolve("./api/inquiry.js");
    delete require.cache[inquiryPath];
    require("./api/inquiry.js")(req, res);
    return;
  }
  // Match vercel.json trailingSlash:false, redirect /about/ → /about
  if (pathOnly.length > 1 && pathOnly.endsWith("/")) {
    res.writeHead(308, { Location: pathOnly.replace(/\/+$/, "") + qs });
    res.end();
    return;
  }
  const mapped = resolveUrl(raw);
  const notFound = path.join(ROOT, "404.html");
  if (!mapped) {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    if (fs.existsSync(notFound)) {
      fs.createReadStream(notFound).pipe(res);
      return;
    }
    res.end("<h1>404</h1><p>No rewrite for " + String(req.url) + "</p>");
    return;
  }
  const filePath = path.join(ROOT, mapped);
  if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    if (fs.existsSync(notFound)) {
      fs.createReadStream(notFound).pipe(res);
      return;
    }
    res.end("Not found");
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log("KRIVA redesign preview → http://localhost:" + PORT + "/");
});
