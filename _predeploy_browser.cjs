/* One-off predeploy browser checks. Uses installed Chrome. */
const puppeteer = require("puppeteer");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://127.0.0.1:5199";

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  const fail = [];

  await page.setViewport({ width: 390, height: 844 });
  for (const path of ["/", "/markets/au", "/markets", "/contact", "/services/web-development", "/solutions/trucking-logistics"]) {
    await page.goto(BASE + path, { waitUntil: "networkidle2", timeout: 45000 });
    const m = await page.evaluate(() => ({
      over: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      h1: document.querySelectorAll("h1").length,
      book: !!document.querySelector('a[href="/contact#book"], a[href*="/contact#book"]'),
      brief: !!document.querySelector('a[href="/contact#brief"], a[href*="/contact#brief"]'),
    }));
    if (m.over > 1) fail.push(path + " mobile overflow " + m.over);
    if (m.h1 !== 1) fail.push(path + " h1 " + m.h1);
    if (!m.book || !m.brief) fail.push(path + " missing CTA book=" + m.book + " brief=" + m.brief);
  }

  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(BASE + "/?ga_debug=1", { waitUntil: "networkidle2", timeout: 45000 });
  const cta = await page.evaluate(() => {
    const a = document.querySelector('a[href="/contact#book"]');
    if (!a) return { error: "no book link" };
    a.addEventListener("click", (e) => e.preventDefault(), { capture: true, once: true });
    a.click();
    const hits = [];
    for (const x of window.dataLayer || []) {
      if (x && x[0] === "event" && x[1] === "cta_click") hits.push(x[2]);
    }
    return { hits: hits.length };
  });
  if (!cta.hits) fail.push("cta_click did not fire with ga_debug=1");

  await page.goto(BASE + "/contact?ga_debug=1", { waitUntil: "networkidle2", timeout: 45000 });
  const lead = await page.evaluate(() => {
    const form = document.getElementById("briefForm") || document.querySelector("form");
    window.dispatchEvent(new CustomEvent("kriva:lead", { detail: { type: "fit_call", form_id: "predeploy-check" } }));
    const leads = [];
    for (const x of window.dataLayer || []) {
      if (x && x[0] === "event" && x[1] === "generate_lead") leads.push(x[2]);
    }
    return { form: !!form, leads: leads.length, type: leads[0] && leads[0].lead_type };
  });
  if (!lead.form) fail.push("contact form missing");
  if (lead.leads < 1 || lead.type !== "fit_call") fail.push("generate_lead missing " + JSON.stringify(lead));

  const formCheck = await page.evaluate(() => {
    const f = document.getElementById("briefForm") || document.querySelector("form");
    if (!f) return { error: "no form" };
    const required = [...f.querySelectorAll("input,select,textarea")].filter((x) => x.required && x.type !== "hidden");
    f.reportValidity();
    return { required: required.length, valid: f.checkValidity() };
  });
  if (!formCheck.required || formCheck.valid) fail.push("empty form should be invalid " + JSON.stringify(formCheck));

  await browser.close();
  if (fail.length) {
    console.log("FAIL");
    console.log(fail.join("\n"));
    process.exit(1);
  }
  console.log("browser checks PASS");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
