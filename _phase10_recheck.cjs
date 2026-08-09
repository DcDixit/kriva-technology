/**
 * Focused re-check after /shared/ absolute path fix + work overflow probe.
 */
const path = require("path");
const PORT = Number(process.env.PORT || 5188);
const BASE = `http://127.0.0.1:${PORT}`;

async function main() {
  const candidates = [
    path.join(process.env.TEMP || "", "kriva-p8-pw", "node_modules", "playwright"),
    "playwright",
  ];
  let chromium;
  for (const c of candidates) {
    try {
      ({ chromium } = require(c));
      break;
    } catch (_) {}
  }
  const browser = await chromium.launch({ headless: true });
  const checks = [
    { route: "/solutions/trucking-logistics", width: 1440 },
    { route: "/work/fleetflow-dispatch", width: 1024 },
    { route: "/services/design-systems", width: 375 },
    { route: "/insights", width: 1024 },
    { route: "/work", width: 1024 },
    { route: "/work", width: 900 },
    { route: "/work", width: 1100 },
    { route: "/contact", width: 375 },
  ];
  const out = [];
  for (const c of checks) {
    const page = await browser.newPage({ viewport: { width: c.width, height: 900 } });
    const failed = [];
    const pageErrors = [];
    page.on("requestfailed", (req) => failed.push(req.url()));
    page.on("pageerror", (e) => pageErrors.push(String(e.message || e)));
    page.on("console", (msg) => {
      if (msg.type() === "error") pageErrors.push(msg.text());
    });
    await page.goto(BASE + c.route, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(400);
    if (c.width <= 430) {
      const burger = page.locator("#burger");
      if (await burger.isVisible()) {
        await burger.click({ timeout: 5000 }).catch((e) => pageErrors.push("burger:" + e.message));
        await page.waitForTimeout(300);
      }
    }
    const metrics = await page.evaluate(() => {
      const overflowX = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth;
      const cssOk = [...document.styleSheets].some((s) => (s.href || "").includes("/shared/chrome.css"));
      const offending = [];
      if (overflowX > 1) {
        const all = [...document.querySelectorAll("body *")];
        for (const el of all) {
          const r = el.getBoundingClientRect();
          if (r.right > innerWidth + 1) {
            offending.push({
              tag: el.tagName,
              cls: (el.className || "").toString().slice(0, 80),
              right: Math.round(r.right),
              width: Math.round(r.width),
            });
            if (offending.length >= 8) break;
          }
        }
      }
      return { overflowX, cssOk, offending, h1: document.querySelectorAll("h1").length };
    });
    out.push({ ...c, failed: failed.filter((u) => u.includes("5188")), pageErrors, ...metrics });
    await page.close();
  }
  await browser.close();
  console.log(JSON.stringify(out, null, 2));
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
