const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const BASE = "https://krivatechnologies.com";
const OUT = path.join(__dirname, "_live_review");
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  "C:/Users/Admin/AppData/Local/Temp/cursor-sandbox-cache/16707ef7c44c882f85b17ee0a63b4218/puppeteer/chrome/win64-152.0.7977.42/chrome-win64/chrome.exe";

const pages = ["/", "/contact", "/about", "/work", "/solutions/trucking-logistics", "/this-page-is-missing-xyz"];
const viewports = [
  { name: "mobile", w: 390, h: 844 },
  { name: "tablet", w: 768, h: 1024 },
  { name: "desktop", w: 1440, h: 900 },
];

(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--window-size=1440,900"],
  });

  const findings = [];
  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1 });
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    for (const p of pages) {
      const res = await page.goto(BASE + p, { waitUntil: "networkidle2", timeout: 45000 });
      await page.evaluate(() => {
        document.querySelectorAll("[data-r],[data-s],[data-mask]").forEach((el) => {
          el.classList.add("in");
          el.style.opacity = "1";
          el.style.transform = "none";
        });
      });
      await new Promise((r) => setTimeout(r, 350));
      const info = await page.evaluate(() => {
        const overflowX = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth;
        const offenders = [...document.querySelectorAll("body *")]
          .filter((el) => el.getBoundingClientRect().width > window.innerWidth + 2)
          .slice(0, 8)
          .map((el) => el.tagName + "." + (el.className || "").toString().slice(0, 40));
        const small = [...document.querySelectorAll("p,a,button,span,td,th,label,caption,figcaption,dt,dd")]
          .filter((el) => {
            const cs = getComputedStyle(el);
            const size = parseFloat(cs.fontSize);
            const t = (el.innerText || "").trim();
            return t.length > 1 && size > 0 && size < 12 && cs.visibility !== "hidden" && cs.display !== "none";
          })
          .slice(0, 10)
          .map((el) => `${el.className.toString().slice(0, 28) || el.tagName}:${parseFloat(getComputedStyle(el).fontSize).toFixed(1)}`);
        const taps = [...document.querySelectorAll("a.btn, .burger, .nav-cta a, input, select, textarea, .sheet-toggle")]
          .map((el) => {
            const r = el.getBoundingClientRect();
            return { t: (el.innerText || el.getAttribute("aria-label") || el.id || "").replace(/\s+/g, " ").slice(0, 28), h: Math.round(r.height), w: Math.round(r.width) };
          })
          .filter((x) => x.h > 0 && x.h < 44);
        const hasDribbble = !!document.querySelector('a[href*="dribbble.com"]');
        const hasX = !!document.querySelector('a[href*="x.com/krivatechnologies"]');
        const book20 = (document.body.innerText || "").includes("Book a 20-minute");
        const tableW = [...document.querySelectorAll("table")].map((t) => Math.round(t.getBoundingClientRect().width));
        const thead = document.querySelector(".c-table thead");
        const hdr = document.querySelector(".nav-cta .btn.sm");
        const kpi = document.querySelector(".kpi span");
        const promise = document.querySelector(".ct-promise b");
        const trust = document.querySelector(".hero-trust");
        return {
          overflowX,
          offenders,
          small,
          taps,
          hasDribbble,
          hasX,
          book20,
          tableW,
          theadDisplay: thead ? getComputedStyle(thead).display : null,
          hdrBtn: hdr
            ? { h: Math.round(hdr.getBoundingClientRect().height), fs: parseFloat(getComputedStyle(hdr).fontSize) }
            : null,
          kpiFs: kpi ? parseFloat(getComputedStyle(kpi).fontSize) : null,
          promiseFs: promise ? parseFloat(getComputedStyle(promise).fontSize) : null,
          trustFs: trust ? parseFloat(getComputedStyle(trust).fontSize) : null,
          h1: (document.querySelector("h1") || {}).innerText,
        };
      });
      const shot = `${vp.name}${p.replace(/\W+/g, "_") || "_home"}.png`;
      await page.screenshot({ path: path.join(OUT, shot), fullPage: false });
      if (p === "/") {
        await page.evaluate(() => {
          const el = document.querySelector(".console") || document.querySelector(".hero-visual");
          if (el) el.scrollIntoView({ block: "center" });
        });
        await new Promise((r) => setTimeout(r, 200));
        await page.screenshot({
          path: path.join(OUT, `${vp.name}_home_console.png`),
          fullPage: false,
        });
      }
      findings.push({ vp: vp.name, path: p, status: res && res.status(), ...info, shot });
    }
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, "findings.json"), JSON.stringify(findings, null, 2));
  for (const f of findings) {
    const flag = f.overflowX > 8 || f.tableW.some((w) => w > (f.vp === "mobile" ? 390 : 9999) - 8);
    console.log(
      [f.vp, f.path, "st=" + f.status, "ox=" + f.overflowX, "tables=" + f.tableW.join(","), "dribbble=" + f.hasDribbble, "book20=" + f.book20, "small=" + f.small.length, "taps<" + f.taps.length]
        .join(" | ")
    );
    if (f.offenders.length) console.log("  wide:", f.offenders.join(" ; "));
    if (f.small.length) console.log("  small:", f.small.join(" | "));
    if (f.taps.length) console.log("  short taps:", JSON.stringify(f.taps));
    if (flag) console.log("  FLAG overflow/table");
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
