/** POST /api/inquiry: Gmail SMTP is the production send path for every site form. */
const CONTACT_EMAIL = "hello@krivatechnologies.com";
const TO = process.env.INQUIRY_TO || CONTACT_EMAIL;
const USER_FACING_ERROR =
  "We could not send your inquiry right now. Please try again shortly, or email " +
  CONTACT_EMAIL +
  ".";

function ccRecipients() {
  const raw = process.env.INQUIRY_CC || "";
  return raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s));
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || "").trim());
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (req.body != null && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === "string" && req.body.trim()) {
    const ct = String(req.headers["content-type"] || "");
    if (ct.includes("application/json")) return JSON.parse(req.body);
    return Object.fromEntries(new URLSearchParams(req.body));
  }
  const chunks = [];
  if (req[Symbol.asyncIterator]) {
    for await (const c of req) chunks.push(c);
  } else if (typeof req.on === "function") {
    await new Promise((resolve, reject) => {
      req.on("data", (c) => chunks.push(c));
      req.on("end", resolve);
      req.on("error", reject);
    });
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  const ct = String(req.headers["content-type"] || "");
  if (ct.includes("application/json")) return JSON.parse(raw || "{}");
  return Object.fromEntries(new URLSearchParams(raw || ""));
}

function field(data, key) {
  const v = data[key];
  if (v == null) return "";
  return String(v).trim().slice(0, 4000);
}

function safePagePath(data) {
  const raw = field(data, "page");
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) return "";
  return raw.split("#")[0].split("?")[0].slice(0, 200);
}

function buildMessage(data) {
  const inquiryType = field(data, "inquiry_type");
  const rows = [
    ["Type", inquiryType || "project_brief"],
    ["Name", field(data, "name")],
    ["Email", field(data, "email")],
    ["Company", field(data, "company")],
    ["Phone", field(data, "phone")],
    ["Page", safePagePath(data)],
    ["Website", field(data, "site")],
    ["Project type", field(data, "ptype")],
    ["Market", field(data, "market")],
    ["Service", field(data, "service")],
    ["Budget", field(data, "budget")],
    ["Timeline", field(data, "timeline")],
    ["Details", field(data, "details")],
  ].filter(([, v]) => v);
  const text = rows.map(([k, v]) => k + ": " + v).join("\n");
  const html =
    "<h2>New KRIVA inquiry</h2><table>" +
    rows
      .map(
        ([k, v]) =>
          "<tr><th align='left'>" +
          k +
          "</th><td>" +
          String(v).replace(/</g, "&lt;").replace(/\n/g, "<br>") +
          "</td></tr>"
      )
      .join("") +
    "</table>";
  const typeLabel =
    inquiryType === "fit_call"
      ? "Fit call request"
      : inquiryType === "page_inquiry"
        ? "Page inquiry"
        : "Project brief";
  const subject =
    "KRIVA " + typeLabel + ": " + (field(data, "company") || field(data, "name") || "Website");
  return { text, html, subject, inquiryType };
}

function sharedFields(data) {
  return {
    name: field(data, "name"),
    email: field(data, "email"),
    inquiry_type: field(data, "inquiry_type"),
    company: field(data, "company"),
    phone: field(data, "phone"),
    page: safePagePath(data),
    website: field(data, "site"),
    project_type: field(data, "ptype"),
    market: field(data, "market"),
    service: field(data, "service"),
    budget: field(data, "budget"),
    timeline: field(data, "timeline"),
    details: field(data, "details"),
  };
}

function web3formsBody(data) {
  const { subject, text } = buildMessage(data);
  return {
    access_key: process.env.WEB3FORMS_ACCESS_KEY,
    subject,
    from_name: "KRIVA website",
    botcheck: "",
    message: text,
    ...sharedFields(data),
  };
}

function gmailCredentials() {
  const user = String(process.env.GMAIL_USER || "").trim();
  const pass = String(process.env.GMAIL_APP_PASSWORD || "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\s/g, "");
  return { user, pass };
}

function looksLikeGmailAppPassword(pass) {
  return /^[a-z0-9]{16}$/i.test(pass);
}

function isConnError(err) {
  const msg = String((err && (err.code || err.message)) || "");
  return /timeout|etimedout|econn|enetunreach|socket|connect/i.test(msg);
}

function smtpErrorMeta(err) {
  if (!err) return "unknown";
  const parts = [err.code, err.responseCode, err.command, err.message].filter(Boolean);
  return parts.join(" ").slice(0, 240);
}

async function sendWithTransport(transportOpts, mail) {
  const nodemailer = require("nodemailer");
  const tx = nodemailer.createTransport(transportOpts);
  try {
    const info = await tx.sendMail(mail);
    if (!info || !info.messageId) {
      throw new Error("smtp accept missing messageId");
    }
    return { channel: "gmail", messageId: info.messageId };
  } finally {
    try {
      tx.close();
    } catch (err) {}
  }
}

function smtpTransportOpts(port, secure, user, pass) {
  return {
    host: "smtp.gmail.com",
    port,
    secure,
    requireTLS: !secure,
    auth: { user, pass },
    connectionTimeout: 3500,
    greetingTimeout: 3500,
    socketTimeout: 6000,
    tls: { servername: "smtp.gmail.com" },
  };
}

async function sendViaGmail(data) {
  const { user, pass } = gmailCredentials();
  if (!user || !pass) {
    console.error("inquiry gmail: GMAIL_USER or GMAIL_APP_PASSWORD is not set");
    return null;
  }
  if (!looksLikeGmailAppPassword(pass)) {
    console.error(
      "inquiry gmail: GMAIL_APP_PASSWORD is not a 16-character Google App Password (length " +
        pass.length +
        "). Skipping SMTP so the request fails fast. Create one at Google Account → Security → App passwords."
    );
    return null;
  }

  const submitterEmail = field(data, "email");
  const { text, html, subject } = buildMessage(data);
  const mail = {
    from: "KRIVA website <" + user + ">",
    to: TO,
    replyTo: submitterEmail,
    subject,
    text,
    html,
  };
  const cc = ccRecipients();
  if (cc.length) mail.cc = cc.join(", ");

  const attempts = [
    smtpTransportOpts(587, false, user, pass),
    smtpTransportOpts(465, true, user, pass),
  ];

  let lastErr;
  for (let i = 0; i < attempts.length; i++) {
    try {
      return await sendWithTransport(attempts[i], mail);
    } catch (err) {
      lastErr = err;
      console.error("inquiry send failed (gmail smtp " + attempts[i].port + "):", smtpErrorMeta(err));
      if (!isConnError(err) && i === 0) break;
    }
  }
  throw lastErr || new Error("gmail send failed");
}

async function sendViaResend(data) {
  if (!process.env.RESEND_API_KEY) return null;
  const email = field(data, "email");
  const { text, html, subject } = buildMessage(data);
  const payload = {
    from: process.env.RESEND_FROM || "KRIVA <onboarding@resend.dev>",
    to: [TO],
    reply_to: email,
    subject,
    text,
    html,
  };
  const cc = ccRecipients();
  if (cc.length) payload.cc = cc;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env.RESEND_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error("resend " + r.status);
  return { channel: "resend" };
}

async function sendViaWeb3forms(data) {
  if (!process.env.WEB3FORMS_ACCESS_KEY) return null;
  const r = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(web3formsBody(data)),
  });
  const body = await r.json().catch(() => ({}));
  if (!body.success) throw new Error(body.message || "web3forms " + r.status);
  return { channel: "web3forms" };
}

async function deliver(data) {
  try {
    const gmailResult = await sendViaGmail(data);
    if (gmailResult) return gmailResult;
  } catch (err) {
    console.error("inquiry send failed (gmail), trying optional backup:", smtpErrorMeta(err));
  }

  try {
    const resendResult = await sendViaResend(data);
    if (resendResult) return resendResult;
  } catch (err) {
    console.error("inquiry send failed (resend):", err && err.message);
  }

  try {
    const web3Result = await sendViaWeb3forms(data);
    if (web3Result) return web3Result;
  } catch (err) {
    console.error("inquiry send failed (web3forms):", err && err.message);
  }

  throw new Error("inquiry delivery failed");
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    sendJson(res, 204, {});
    return;
  }
  if (req.method !== "POST") {
    sendJson(res, 405, { ok: false, error: USER_FACING_ERROR });
    return;
  }

  let data = {};
  try {
    data = await readBody(req);
  } catch {
    sendJson(res, 400, { ok: false, error: "Please check the form and try again." });
    return;
  }

  if (field(data, "website_hp")) {
    sendJson(res, 200, { ok: true });
    return;
  }

  const name = field(data, "name");
  const email = field(data, "email");
  if (!name || !isEmail(email)) {
    sendJson(res, 400, { ok: false, error: "Name and a valid email are required." });
    return;
  }

  try {
    const result = await deliver(data);
    sendJson(res, 200, { ok: true, channel: result && result.channel });
  } catch (err) {
    console.error("inquiry send failed:", err && err.message);
    sendJson(res, 502, { ok: false, error: USER_FACING_ERROR });
  }
};
