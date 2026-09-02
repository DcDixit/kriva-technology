const http = require("http");
const { FILE_MAP } = require("./_crawl_links.js");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 5177);
const routes = new Set(Object.keys(FILE_MAP));
for (const f of fs.readdirSync(__dirname).filter((x) => /^kriva-service-.*\.html$/i.test(x))) {
  routes.add(`/services/${f.replace(/^kriva-service-/, "").replace(/\.html$/i, "")}`);
}

function get(urlPath) {
  return new Promise((resolve) => {
    const req = http.get({ hostname: "127.0.0.1", port: PORT, path: urlPath, timeout: 5000 }, (res) => {
      res.resume();
      resolve({ path: urlPath, status: res.statusCode });
    });
    req.on("error", (e) => resolve({ path: urlPath, status: 0, err: e.message }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ path: urlPath, status: 0, err: "timeout" });
    });
  });
}

(async () => {
  const results = [];
  for (const r of [...routes].sort()) {
    results.push(await get(r));
  }
  // also probe a few known bad paths
  results.push(await get("/does-not-exist"));
  const bad = results.filter((r) => r.status !== 200 && r.path !== "/does-not-exist");
  const expected404 = results.find((r) => r.path === "/does-not-exist");
  console.log("checked", results.length - 1, "routes");
  console.log("failures", bad.length);
  for (const b of bad) console.log(b.status, b.path, b.err || "");
  console.log("intentional missing status", expected404 && expected404.status);
  if (bad.length) process.exit(1);
})();
