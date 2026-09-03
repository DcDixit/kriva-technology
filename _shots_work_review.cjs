const puppeteer = require("puppeteer");
const fs = require("fs");
const OUT = "_shots/work-review";
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    args: ["--no-sandbox"],
  });

  for (const [w, h, tag] of [
    [1440, 900, "d"],
    [768, 900, "t"],
    [390, 844, "m"],
  ]) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" },
    ]);
    await page.goto("http://localhost:5177/work", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });
    await page.evaluate(() => {
      document
        .querySelectorAll("[data-r],[data-s],[data-mask],[data-shot]")
        .forEach((el) => {
          el.classList.add("in");
          el.style.opacity = "1";
          el.style.transform = "none";
        });
    });
    await new Promise((r) => setTimeout(r, 300));

    const metrics = await page.evaluate(() => {
      const main = document.querySelector("main");
      const kids = [...main.children].filter(
        (el) => el.tagName !== "SCRIPT" && getComputedStyle(el).display !== "none"
      );
      const rows = [];
      for (let i = 0; i < kids.length; i++) {
        const el = kids[i];
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        let gapBelow = null;
        if (i < kids.length - 1) {
          const n = kids[i + 1].getBoundingClientRect();
          gapBelow = Math.round(n.top - r.bottom);
        }
        rows.push({
          tag: el.tagName.toLowerCase(),
          id: el.id || "",
          cls: (el.className || "").toString().slice(0, 80),
          h: Math.round(r.height),
          padT: cs.paddingTop,
          padB: cs.paddingBottom,
          margT: cs.marginTop,
          margB: cs.marginBottom,
          gapBelow,
        });
      }
      return rows;
    });
    console.log("\n===", tag, "===");
    for (const m of metrics) {
      console.log(
        `${m.tag}${m.id ? "#" + m.id : ""} ${(m.cls || "").split(" ")[0]} h=${m.h} pad=${m.padT}/${m.padB} marg=${m.margT}/${m.margB} gap→=${m.gapBelow}`
      );
    }

    await page.screenshot({ path: `${OUT}/full-${tag}.png`, fullPage: true });
    // viewport hero + next
    await page.screenshot({ path: `${OUT}/above-${tag}.png` });
    await page.close();
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
