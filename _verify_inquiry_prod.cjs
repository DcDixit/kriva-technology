#!/usr/bin/env node
/* Sends ONE labelled test inquiry to production and reports which channel accepted it.
   Run after any change to mail settings:  node _verify_inquiry_prod.cjs
   "channel: gmail" means Google accepted it; still confirm it arrived at hello@krivatechnologies.com. */
(async () => {
  const base = process.argv[2] || "https://krivatechnologies.com";
  const r = await fetch(base + "/api/inquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      name: "KRIVA delivery test - please ignore",
      email: "hello@krivatechnologies.com",
      inquiry_type: "page_inquiry",
      page: "/contact",
      details: "Automated delivery test sent at " + new Date().toISOString() + ". No action needed.",
    }),
  });
  const body = await r.json().catch(() => ({}));
  const sent = r.ok && body.ok === true && body.channel;
  console.log("HTTP", r.status, "| channel:", body.channel || "none", "| browser backup offered:", body.backup ? "yes" : "no");
  console.log(sent ? "PASS: server delivery accepted. Check the inbox." : body.backup ? "SERVER FAILED, but the browser backup is available. Fix the Gmail password." : "FAIL: no channel works. Visitors can only use the mailto fallback.");
  process.exit(sent ? 0 : 1);
})();
