/**
 * Phase 10 responsive overflow QA (Playwright). Read-only; reports only.
 * Run: PLAYWRIGHT_BROWSERS_PATH=0 node _phase10_responsive.cjs
 */
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 5188);
const BASE = `http://127.0.0.1:${PORT}`;
const WIDTHS = [320, 375, 430, 768, 1024, 1440];
const PAGES = [
  "/",
  "/solutions/trucking-logistics",
  "/solutions/saas",
  "/services",
  "/services/design-systems",
  "/work",
  "/work/fleetflow-dispatch",
  "/insights",
  "/contact",
  "/about",
  "/careers",
  "/industries",
  "/faq",
];

async function main() {
  const candidates = [
    process.env.PLAYWRIGHT_MODULE,
    path.join(process.env.TEMP || "", "kriva-p8-pw", "node_modules", "playwright"),
    path.join(process.env.TEMP || "", "kriva-p10-pw", "node_modules", "playwright"),
    "playwright",
  ].filter(Boolean);
  let chromium;
  let lastErr;
  for (const c of candidates) {
    try {
      ({ chromium } = require(c));
      break;
    } catch (e) {
      lastErr = e;
    }
  }
  if (!chromium) throw lastErr || new Error("playwright not found");
  const browser = await chromium.launch({ headless: true });
  const results = [];
  const consoleErrors = [];

  for (const route of PAGES) {
    for (const width of WIDTHS) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const pageErrors = [];
      const failed = [];
      page.on("pageerror", (e) => pageErrors.push(String(e.message || e)));
      page.on("console", (msg) => {
        if (msg.type() === "error") pageErrors.push(msg.text());
      });
      page.on("requestfailed", (req) => {
        failed.push({ url: req.url(), err: req.failure() && req.failure().errorText });
      });
      try {
        const res = await page.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 20000 });
        await page.waitForTimeout(350);
        // open mobile sheet at narrow widths
        if (width <= 430) {
          const burger = await page.$("#burger");
          if (burger) {
            await burger.click();
            await page.waitForTimeout(400);
          }
        }
        const metrics = await page.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          const overflowX = Math.max(doc.scrollWidth, body.scrollWidth) - window.innerWidth;
          const nav = document.getElementById("nav");
          const sheet = document.getElementById("sheet");
          const chapters = document.getElementById("chapters");
          const ids = [...document.querySelectorAll("[id]")].map((el) => el.id);
          const idCounts = {};
          for (const id of ids) idCounts[id] = (idCounts[id] || 0) + 1;
          const dupIds = Object.entries(idCounts).filter(([, n]) => n > 1);
          const imgs = [...document.images].map((img) => ({
            src: img.currentSrc || img.src,
            alt: img.getAttribute("alt"),
            complete: img.complete,
            naturalWidth: img.naturalWidth,
          }));
          return {
            overflowX,
            navCount: document.querySelectorAll("nav.nav, #nav").length,
            footerCount: document.querySelectorAll("footer").length,
            sheetOpen: !!(sheet && !sheet.hidden && nav && nav.classList.contains("open")),
            chaptersDisplay: chapters ? getComputedStyle(chapters).display : null,
            dupIds,
            brokenImgs: imgs.filter((i) => i.complete && i.naturalWidth === 0 && i.src && !i.src.startsWith("data:")),
            missingAlt: imgs.filter((i) => i.alt === null),
            h1: document.querySelectorAll("h1").length,
          };
        });
        const row = {
          route,
          width,
          status: res && res.status(),
          overflowX: metrics.overflowX,
          pageErrors,
          failed,
          ...metrics,
        };
        results.push(row);
        if (pageErrors.length) consoleErrors.push({ route, width, pageErrors });
        if ((metrics.overflowX || 0) > 1 || pageErrors.length || failed.length) {
          process.stdout.write(`! ${route}@${width} ox=${metrics.overflowX}\n`);
        } else {
          process.stdout.write(".");
        }
      } catch (e) {
        results.push({ route, width, error: String(e.message || e) });
      }
      await page.close();
    }
  }

  await browser.close();

  const overflows = results.filter((r) => (r.overflowX || 0) > 1);
  const errors = results.filter((r) => (r.pageErrors && r.pageErrors.length) || r.error || (r.failed && r.failed.length));
  const summary = {
    checked: results.length,
    overflowIssues: overflows.map((r) => ({ route: r.route, width: r.width, overflowX: r.overflowX })),
    runtimeIssues: errors.map((r) => ({
      route: r.route,
      width: r.width,
      pageErrors: r.pageErrors,
      failed: r.failed,
      error: r.error,
    })),
    consoleErrors,
  };
  fs.writeFileSync(path.join(__dirname, "_phase10_responsive_results.json"), JSON.stringify({ summary, results }, null, 2));
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
