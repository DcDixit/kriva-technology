#!/usr/bin/env node
/* Conversion QA against the local preview. /api/inquiry and analytics hosts are intercepted, so no
   email is sent and GA4 receives nothing. ?ga_debug=1 lets the lead code run so it can be counted.
   Usage: node _qa_journey.cjs   (needs `npm run preview` on 5177) */
const puppeteer = require("puppeteer");
const fs = require("fs");
const BASE = "http://localhost:5177";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const { FILE_MAP } = require("./_crawl_links.js");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = { pass: 0, fail: [] };
const ok = (name, cond, extra = "") => { if (cond) results.pass++; else results.fail.push(name + (extra ? " :: " + extra : "")); };

async function page(b, apiMode) {
  const p = await b.newPage();
  await p.setViewport({ width: 1280, height: 900 });
  p.__posts = [];
  await p.setRequestInterception(true);
  p.on("request", (r) => {
    const u = r.url();
    if (/googletagmanager|google-analytics|clarity\.ms/.test(u)) return r.respond({ status: 204, body: "" });
    if (u.endsWith("/api/inquiry") && r.method() === "POST") {
      p.__posts.push(JSON.parse(r.postData() || "{}"));
      if (apiMode === "fail") return r.respond({ status: 502, contentType: "application/json", body: JSON.stringify({ ok: false, error: "x" }) });
      return r.respond({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, channel: "gmail" }) });
    }
    r.continue();
  });
  return p;
}
const leads = (p) => p.evaluate(() => (window.dataLayer || []).filter((d) => d && d[0] === "event" && d[1] === "generate_lead").length);

async function fill(p, sel) {
  await p.evaluate((sel) => {
    const f = document.querySelector(sel);
    const set = (el, v) => { el.value = v; el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true })); };
    f.querySelectorAll("input,select,textarea").forEach((el) => {
      if (el.type === "hidden" || el.name === "website_hp" || !el.required) return;
      if (el.tagName === "SELECT") { el.selectedIndex = 1; el.dispatchEvent(new Event("change", { bubbles: true })); }
      else if (el.type === "email") set(el, "qa@example.com");
      else if (el.type === "checkbox" || el.type === "radio") { el.checked = true; el.dispatchEvent(new Event("change", { bubbles: true })); }
      else set(el, "QA test text for the form.");
    });
  }, sel);
}

(async () => {
  const b = await puppeteer.launch({ headless: "new", executablePath: CHROME, args: ["--no-sandbox"] });

  // 1. The journey a first-time visitor takes
  {
    const p = await page(b);
    const errs = [];
    p.on("pageerror", (e) => errs.push(e.message));
    await p.goto(BASE + "/?ga_debug=1", { waitUntil: "networkidle2" });
    ok("journey: H1 states the offer", /trucking/i.test(await p.$eval("h1", (e) => e.textContent)));
    await p.click('.k-path[href="/solutions/freight-broker-software"]');
    await p.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {});
    ok("journey: solution page opens", p.url().endsWith("/solutions/freight-broker-software"), p.url());
    await p.click('.k-actions a.btn[href="#inquire"]');
    await sleep(500);
    ok("journey: CTA reaches the form", await p.$eval("#pageInquiry", (f) => { const r = f.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }));
    await p.click("#pageInquiry button[type=submit]");
    await sleep(200);
    ok("journey: empty submit blocked", p.__posts.length === 0);
    await fill(p, "#pageInquiry");
    await p.click("#pageInquiry button[type=submit]");
    await sleep(600);
    ok("journey: backend received the inquiry", p.__posts.length === 1);
    ok("journey: page recorded", p.__posts[0] && p.__posts[0].page === "/solutions/freight-broker-software", JSON.stringify(p.__posts[0]));
    ok("journey: confirmation shown", await p.$eval(".inq-done", (e) => e.classList.contains("on")));
    ok("journey: no JS errors", errs.length === 0, errs.join("; "));
    await p.close();
  }

  // 2. Lead tracking: fires on success only, never on failure, never twice
  {
    const p = await page(b);
    await p.goto(BASE + "/?ga_debug=1", { waitUntil: "networkidle2" });
    await p.evaluate(() => sessionStorage.clear());
    ok("lead: none before submit", (await leads(p)) === 0);
    await fill(p, "#homeInquiry");
    await p.click("#homeInquiry button[type=submit]");
    await sleep(800);
    ok("lead: one after success", (await leads(p)) === 1, String(await leads(p)));
    await p.evaluate(() => window.dispatchEvent(new CustomEvent("kriva:lead", { detail: { type: "fit_call", form_id: "homeInquiry" } })));
    await sleep(200);
    ok("lead: duplicate suppressed", (await leads(p)) === 1, String(await leads(p)));
    await p.close();

    const q = await page(b, "fail");
    await q.goto(BASE + "/?ga_debug=1", { waitUntil: "networkidle2" });
    await q.evaluate(() => sessionStorage.clear());
    await fill(q, "#homeInquiry");
    await q.click("#homeInquiry button[type=submit]");
    await sleep(800);
    ok("lead: none when delivery fails", (await leads(q)) === 0);
    const fail = await q.$eval("#homeInquiry .inq-fail", (e) => ({ on: e.classList.contains("on"), mail: !!e.querySelector('a[href^="mailto:"]') }));
    ok("failure: visible message with email fallback", fail.on && fail.mail, JSON.stringify(fail));
    await q.close();
  }

  // 3. Contact page forms
  for (const [hash, form, btn, done] of [["#book", "#fitForm", "#fitSubmitBtn", "#fitDone"], ["#brief", "#briefForm", "#submitBtn", null]]) {
    const p = await page(b);
    await p.goto(BASE + "/contact?ga_debug=1" + hash, { waitUntil: "networkidle2" });
    await p.evaluate(() => sessionStorage.clear());
    await fill(p, form);
    await p.click(btn);
    await sleep(900);
    ok(`contact ${form}: backend received it`, p.__posts.length === 1, String(p.__posts.length));
    ok(`contact ${form}: one lead`, (await leads(p)) === 1, String(await leads(p)));
    if (done) ok(`contact ${form}: confirmation`, await p.$eval(done, (e) => getComputedStyle(e).display !== "none"));
    await p.close();
  }

  // 4. Every other form on every page
  const routes = Object.keys(FILE_MAP);
  for (const f of fs.readdirSync(".").filter((x) => /^kriva-service-.*\.html$/.test(x))) { const r = "/services/" + f.replace(/kriva-service-|\.html/g, ""); if (!routes.includes(r)) routes.push(r); }
  let forms = 0, noForm = [];
  for (const r of routes) {
    if (r === "/contact") continue;
    const p = await page(b);
    await p.goto(BASE + r, { waitUntil: "domcontentloaded" });
    await sleep(250);
    const sel = await p.evaluate(() => { const f = document.querySelector("form.inq-form"); return f ? "#" + f.id : null; });
    if (!sel) { noForm.push(r); await p.close(); continue; }
    forms++;
    await fill(p, sel);
    await p.$eval(sel + " button[type=submit]", (x) => x.click());
    await sleep(350);
    ok(`form ${r}: submits`, p.__posts.length === 1, String(p.__posts.length));
    ok(`form ${r}: records page`, p.__posts[0] && p.__posts[0].page, JSON.stringify(p.__posts[0] || {}).slice(0, 100));
    ok(`form ${r}: confirmation`, await p.evaluate(() => { const d = document.querySelector(".inq-done"); return d && d.classList.contains("on"); }));
    await p.close();
  }
  await b.close();
  console.log(`forms exercised: ${forms}; routes with no on-page form: ${noForm.join(", ") || "none"}`);
  console.log(`PASS ${results.pass}  FAIL ${results.fail.length}`);
  results.fail.forEach((x) => console.log(" - " + x));
  process.exit(results.fail.length ? 1 : 0);
})();
