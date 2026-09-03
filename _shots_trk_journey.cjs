const puppeteer = require("puppeteer");
const OUT = "_shots/trk-fix";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);

  async function reveal() {
    await page.evaluate(() => {
      document.querySelectorAll("[data-r],[data-s],[data-mask]").forEach((el) => {
        el.classList.add("in", "on", "vis");
        el.style.opacity = "1";
        el.style.transform = "none";
      });
    });
    await new Promise((r) => setTimeout(r, 400));
  }

  for (const [w, h, tag] of [[1440, 900, "d"], [768, 900, "t"], [390, 800, "m"]]) {
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    await page.goto("http://localhost:5177/solutions/trucking-logistics", { waitUntil: "networkidle2" });
    await reveal();
    const el = await page.$("#journey");
    if (!el) throw new Error("missing #journey");
    await el.screenshot({ path: `${OUT}/journey-${tag}.png` });
    console.log("wrote", `${OUT}/journey-${tag}.png`);
  }

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
