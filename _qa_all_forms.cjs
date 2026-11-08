#!/usr/bin/env node
/* Submits every form on every page in a real browser against a stubbed /api/inquiry. Sends no email.
   Each form must: block an empty submit, post its page, show success on 200, and show a working
   email fallback on 502.
   Usage: PORT=5199 node _qa_all_forms.cjs   (CHROME_PATH optional) */
const fs = require("fs");
const puppeteer = require("puppeteer");

const BASE = process.env.BASE || `http://localhost:${process.env.PORT || 5199}`;
const routes = JSON.parse(fs.readFileSync("vercel.json", "utf8"))
  .rewrites.filter((r) => r.destination.endsWith(".html") && !r.source.includes(":"))
  .map((r) => r.source);

const fill = (page, form) =>
  page.evaluate((id) => {
    const f = document.getElementById(id);
    f.classList.remove("sent");
    f.querySelectorAll("input,select,textarea").forEach((el) => {
      if (el.type === "hidden" || el.closest(".hp") || el.name === "website_hp") return;
      if (el.tagName === "SELECT") {
        const o = [...el.options].find((x) => x.value);
        if (o) el.value = o.value;
      } else if (el.type === "email") el.value = "qa@example.com";
      else if (el.type === "url") el.value = "https://example.com";
      else if (el.type === "checkbox" || el.type === "radio") el.checked = true;
      else if (el.type !== "file") el.value = "QA test";
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }, form);

const submit = (page, form) =>
  page.evaluate((id) => {
    const f = document.getElementById(id);
    const b = f.querySelector('[type="submit"]');
    if (b.scrollIntoView) b.scrollIntoView({ block: "center", behavior: "instant" });
    b.click();
  }, form);

(async () => {
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ["--no-sandbox"] });
  let mode = "ok";
  const posted = [];
  let total = 0;
  const failures = [];

  for (const route of routes) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.setRequestInterception(true);
    page.on("request", (r) => {
      if (r.url().includes("/api/inquiry") && r.method() === "POST") {
        posted.push(r.postData() || "");
        return r.respond(
          mode === "ok"
            ? { status: 200, contentType: "application/json", body: '{"ok":true,"channel":"qa"}' }
            : { status: 502, contentType: "application/json", body: '{"ok":false,"error":"qa"}' }
        );
      }
      // Never let the browser backup channels send real email during QA.
      if (/formsubmit.co|api.web3forms.com/.test(r.url())) return r.abort();
      if (/googletagmanager|google-analytics|clarity/.test(r.url())) return r.abort();
      r.continue();
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(BASE + route, { waitUntil: "load", timeout: 60000 });
    const forms = await page.$$eval("main form, form", (fs) => [...new Set(fs)].filter((f) => f.id).map((f) => f.id));
    if (errors.length) failures.push(`${route}: script error: ${errors[0]}`);

    for (const form of forms) {
      total++;
      const label = `${route} #${form}`;
      const state = () =>
        page.evaluate((id) => {
          const f = document.getElementById(id);
          const scope = f.closest("section") || f.parentElement.parentElement;
          const vis = (el) => el && getComputedStyle(el).display !== "none" && el.getBoundingClientRect().height > 0;
          const text = scope.innerText || "";
          return {
            invalid: f.querySelectorAll('[aria-invalid="true"]').length,
            success: /thank you|has been (sent|submitted)|received/i.test(text) && (f.classList.contains("sent") || !vis(f) || [...scope.querySelectorAll(".inq-done.on,.done.on,.success.on,[data-done].on")].some(vis)),
            mail: [...scope.querySelectorAll('a[href^="mailto:"]')].some((a) => a.href.includes("subject=") && vis(a)),
          };
        }, form);

      /* Empty submit must be blocked. */
      const before = posted.length;
      await submit(page, form);
      await new Promise((r) => setTimeout(r, 150));
      const empty = await state();
      if (posted.length !== before) failures.push(`${label}: empty submit reached the server`);
      if (!empty.invalid) failures.push(`${label}: empty submit showed no field errors`);

      /* 502 must show the email fallback and must not claim success. */
      mode = "fail";
      await fill(page, form);
      await submit(page, form);
      await new Promise((r) => setTimeout(r, 500));
      const failed = await state();
      if (posted.length === before) failures.push(`${label}: valid submit never posted`);
      if (failed.success) failures.push(`${label}: claimed success on a 502`);
      if (!failed.mail) failures.push(`${label}: no email fallback on a 502`);

      /* 200 must show success and record the page. */
      mode = "ok";
      const n = posted.length;
      await submit(page, form);
      await new Promise((r) => setTimeout(r, 500));
      const ok = await state();
      if (posted.length === n) failures.push(`${label}: retry after failure never posted`);
      if (!ok.success) failures.push(`${label}: no success message on a 200`);
      const body = posted[posted.length - 1] || "";
      if (!/"page"/.test(body) && !/page=/.test(body)) failures.push(`${label}: submission does not record its page`);
    }
    if (route === "/contact" && forms.length < 2) failures.push("/contact: expected both forms");
    await page.close();
  }
  await browser.close();
  console.log(`routes ${routes.length} | forms tested ${total} | failures ${failures.length}`);
  failures.forEach((f) => console.log("FAIL " + f));
  process.exit(failures.length ? 1 : 0);
})();
