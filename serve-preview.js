#!/usr/bin/env node
/** Local preview with clean-URL rewrites matching production paths. */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { FILE_MAP } = require("./_crawl_links.js");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 5177);
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
  if (FILE_MAP[clean]) return FILE_MAP[clean];
  if (clean.startsWith("/services/")) {
    const slug = clean.split("/").pop();
    const f = `kriva-service-${slug}.html`;
    if (fs.existsSync(path.join(ROOT, f))) return f;
  }
  if (clean.startsWith("/shared/")) return clean.slice(1);
  if (clean.endsWith(".html") || clean.includes(".")) return clean.replace(/^\//, "");
  return null;
}

const server = http.createServer((req, res) => {
  const raw = req.url || "/";
  const pathOnly = decodeURIComponent(raw.split("?")[0].split("#")[0]);
  const qs = raw.includes("?") ? raw.slice(raw.indexOf("?")) : "";
  // Match vercel.json trailingSlash:false — redirect /about/ → /about
  if (pathOnly.length > 1 && pathOnly.endsWith("/")) {
    res.writeHead(308, { Location: pathOnly.replace(/\/+$/, "") + qs });
    res.end();
    return;
  }
  const mapped = resolveUrl(raw);
  if (!mapped) {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h1>404</h1><p>No rewrite for " + String(req.url) + "</p>");
    return;
  }
  const filePath = path.join(ROOT, mapped);
  if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/plain" });
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
