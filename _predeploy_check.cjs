const fs = require("fs");
const { publicPages } = require("./shared/site");

const pages = publicPages();
const issues = [];
const need = ["en-us", "en-gb", "en-ae", "en-ca", "en-au", "x-default"];

for (const p of pages) {
  const html = fs.readFileSync(p.file, "utf8");
  const canon = (html.match(/<link rel="canonical" href="([^"]+)"/i) || [])[1];
  if (canon !== p.url) issues.push("canonical " + p.path + " got " + (canon || "none"));
  const h1 = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1 !== 1) issues.push("h1 " + p.path + " count " + h1);
  if (!html.includes("G-FHG12KTF8C")) issues.push("ga " + p.path);
  if (!html.includes("/shared/analytics.js")) issues.push("analytics.js " + p.path);
  if (p.path.startsWith("/markets")) {
    for (const h of need) {
      if (!html.includes('hreflang="' + h + '"')) issues.push("hreflang " + h + " missing on " + p.path);
    }
    if (!html.includes("/contact#book")) issues.push("cta book " + p.path);
    if (!html.includes("/contact#brief")) issues.push("cta brief " + p.path);
  }
}

const au = fs.readFileSync("kriva-market-au.html", "utf8");
if (/Canadian teams/.test(au)) issues.push("au page still says Canadian teams");
if (!au.includes("Australian teams")) issues.push("au title missing");
const vf = fs.readFileSync("googlea62b91d40c65d7c7.html", "utf8").trim();
if (vf !== "google-site-verification: googlea62b91d40c65d7c7.html") issues.push("verification file content");
const sm = fs.readFileSync("sitemap.xml", "utf8");
const locs = sm.match(/<loc>/g) || [];
if (locs.length !== pages.length) issues.push("sitemap count " + locs.length + " vs pages " + pages.length);
if (!sm.includes("https://krivatechnologies.com/markets/au")) issues.push("sitemap missing au");
const analytics = fs.readFileSync("shared/analytics.js", "utf8");
if (!analytics.includes("send('generate_lead'")) issues.push("generate_lead missing");
if (!analytics.includes("MEASUREMENT_ID = 'G-FHG12KTF8C'")) issues.push("measurement id");

const http = require("http");
function get(urlPath) {
  return new Promise((resolve) => {
    const req = http.get({ hostname: "127.0.0.1", port: 5199, path: urlPath, timeout: 8000 }, (res) => {
      res.resume();
      resolve(res.statusCode);
    });
    req.on("error", () => resolve(0));
    req.on("timeout", () => { req.destroy(); resolve(0); });
  });
}
(async () => {
  const paths = pages.map((p) => (p.path === "/" ? "/" : p.path)).concat(["/googlea62b91d40c65d7c7.html", "/sitemap.xml", "/robots.txt"]);
  const bad = [];
  for (const pth of paths) {
    const st = await get(pth);
    if (st !== 200) bad.push(st + " " + pth);
  }
  if (bad.length) issues.push(...bad.map((b) => "http " + b));
  console.log("http checked", paths.length);
console.log("pages", pages.length);
if (issues.length) {
  console.log("FAIL", issues.length);
  console.log(issues.join("\n"));
  process.exit(1);
}
console.log("SEO/GA static checks: PASS");
})().catch((e) => { console.error(e); process.exit(1); });
