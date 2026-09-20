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
          resolve({ status: res.statusCode, json });
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log("Inquiry verification →", BASE);
  const results = [];
  const mailConfigured = !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);

  for (const [label, payload] of [
    ["project_brief", BRIEF],
    ["fit_call", FIT],
  ]) {
    const api = await postJson("/api/inquiry", payload);
    const hasRelay = !!(api.json && api.json.relay);
    results.push({
      label,
      apiStatus: api.status,
      apiOk: api.json.ok,
      hasRelay,
      error: api.json.error || null,
    });

    if (mailConfigured && hasRelay) {
      console.error("FAIL", label, "API returned browser relay when Gmail is configured", api);
      process.exitCode = 1;
      continue;
    }

    if (api.status !== 200 || api.json.ok !== true) {
      console.error("FAIL", label, api);
      process.exitCode = 1;
    }
  }

  console.log("\nSummary:");
  console.log(JSON.stringify(results, null, 2));
  if (!process.exitCode) {
    if (mailConfigured) {
      console.log("\nAll inquiry paths OK (Gmail SMTP).");
    } else {
      console.log("\nAPI shape OK (FormSubmit fallback). Set GMAIL_APP_PASSWORD to verify live SMTP.");
    }
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
