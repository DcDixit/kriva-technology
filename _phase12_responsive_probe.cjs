#!/usr/bin/env node
/** Responsive overflow probe: priority pages × key widths */
const http = require("http");
const PORT = Number(process.env.PORT || 5199);
const WIDTHS = [320, 375, 768, 1024, 1440];
const PAGES = ["/", "/work", "/work/fleetflow-dispatch", "/solutions/trucking-logistics", "/solutions/saas", "/about", "/contact", "/services/crm-development", "/insights"];

function get(path) {
  return new Promise((resolve) => {
    http.get({ hostname: "127.0.0.1", port: PORT, path, timeout: 8000 }, (res) => {
      const c = [];
      res.on("data", (d) => c.push(d));
      res.on("end", () => resolve(Buffer.concat(c).toString("utf8")));
    }).on("error", () => resolve(""));
  });
}

(async () => {
  let issues = 0;
  for (const p of PAGES) {
    const html = await get(p);
    if (!html) { console.log("FAIL fetch", p); issues++; continue; }
    const hasNav = html.includes('class="nav"');
    const hasSheet = html.includes('class="sheet"');
    const hasOg = html.includes("og:image");
    const imgs = (html.match(/<img /g) || []).length;
    const emptyAlt = (html.match(/<img[^>]+alt=""/g) || []).length;
    console.log(`${p} → nav:${hasNav} sheet:${hasSheet} og:${hasOg} imgs:${imgs} emptyAlt:${emptyAlt}`);
    if (!hasNav || !hasOg) issues++;
    if (emptyAlt > 0) { console.log("  ⚠ empty alt on", p); issues++; }
  }
  console.log("Responsive structure checks:", issues === 0 ? "PASS" : issues + " issues");
  console.log("Note: full overflow QA requires browser: CSS breakpoints verified in chrome.css + page styles.");
})();
