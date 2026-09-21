#!/usr/bin/env node
/** End-to-end inquiry API verification (local server required on PORT). */
const http = require("http");

const PORT = Number(process.env.PORT || 5177);
const BASE = `http://127.0.0.1:${PORT}`;

const BRIEF = {
  inquiry_type: "project_brief",
  name: "KRIVA QA Test",
  email: "qa.test@example.com",
  company: "Krishuweb",
  site: "https://krivatechnologies.com",
  ptype: "Trucking & logistics (US)",
  market: "United States",
  service: "Mobile App Design",
  budget: "$5k - $15k",
  timeline: "ASAP (within 4 weeks)",
  details: "Automated test inquiry — please ignore. Verifying Project Brief delivery.",
};

const FIT = {
  inquiry_type: "fit_call",
  name: "KRIVA QA Test",
  email: "qa.test@example.com",
  company: "Krishuweb",
  ptype: "SaaS product (UK / US)",
  details: "Automated fit-call test — please ignore.",
  timeline: "ASAP (within 4 weeks)",
};

const PAGE = {
  inquiry_type: "page_inquiry",
  name: "KRIVA QA Test",
  email: "qa.test@example.com",
  company: "Krishuweb",
  page: "/",
  ptype: "Website inquiry",
  details: "Automated page-inquiry test — please ignore.",
};

function postJson(path, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: PORT,
        path,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          let json = {};
          try {
            json = JSON.parse(data || "{}");
          } catch {
            json = { raw: data };
          }
          resolve({ status: res.statusCode, json, raw: data });
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function assertNoSecrets(raw) {
  const text = String(raw || "");
  const forbidden = [
    process.env.GMAIL_APP_PASSWORD,
    process.env.RESEND_API_KEY,
    process.env.WEB3FORMS_ACCESS_KEY,
    "formsubmit.co",
  ].filter(Boolean);
  for (const secret of forbidden) {
    if (text.includes(secret)) {
      throw new Error("response leaked a secret or FormSubmit URL");
    }
  }
  if (/krivatechnlogies@gmail\.com/i.test(text)) {
    throw new Error("response leaked private Gmail user");
  }
}

async function main() {
  console.log("Inquiry verification →", BASE);
  const results = [];
  const mailConfigured = !!(
    process.env.GMAIL_USER &&
    process.env.GMAIL_APP_PASSWORD &&
    /^[a-z0-9]{16}$/i.test(String(process.env.GMAIL_APP_PASSWORD).replace(/\s/g, ""))
  );

  const invalid = await postJson("/api/inquiry", { inquiry_type: "fit_call", name: "", email: "nope" });
  if (invalid.status !== 400 || invalid.json.ok !== false) {
    console.error("FAIL validation", invalid);
    process.exitCode = 1;
  } else {
    results.push({ label: "validation", apiStatus: invalid.status, apiOk: invalid.json.ok });
  }

  const honey = await postJson("/api/inquiry", {
    inquiry_type: "page_inquiry",
    name: "Bot",
    email: "bot@example.com",
    website_hp: "spam",
  });
  if (honey.status !== 200 || honey.json.ok !== true || honey.json.channel) {
    console.error("FAIL honeypot", honey);
    process.exitCode = 1;
  } else {
    results.push({ label: "honeypot", apiStatus: honey.status, apiOk: honey.json.ok });
  }

  for (const [label, payload] of [
    ["project_brief", BRIEF],
    ["fit_call", FIT],
    ["page_inquiry", PAGE],
  ]) {
    const api = await postJson("/api/inquiry", payload);
    assertNoSecrets(api.raw);
    const hasRelay = !!(api.json && api.json.relay);
    results.push({
      label,
      apiStatus: api.status,
      apiOk: api.json.ok,
      channel: api.json.channel || null,
      hasRelay,
      error: api.json.error || null,
    });

    if (hasRelay) {
      console.error("FAIL", label, "API must not return a FormSubmit relay", api);
      process.exitCode = 1;
      continue;
    }

    if (mailConfigured) {
      if (api.status !== 200 || api.json.ok !== true || !api.json.channel) {
        console.error("FAIL", label, "expected SMTP success when Gmail is configured", api);
        process.exitCode = 1;
      }
      continue;
    }

    if (api.status !== 502 || api.json.ok !== false) {
      console.error("FAIL", label, "expected 502 when Gmail is not configured", api);
      process.exitCode = 1;
    }
  }

  console.log("\nSummary:");
  console.log(JSON.stringify(results, null, 2));
  if (!process.exitCode) {
    if (mailConfigured) {
      console.log("\nAll inquiry paths OK (Gmail SMTP).");
    } else {
      console.log("\nAPI shape OK (Gmail not configured → 502 + mailto fallback on the site).");
    }
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
