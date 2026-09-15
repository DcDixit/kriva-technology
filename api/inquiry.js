/** POST /api/inquiry: sends inquiries to the studio via Gmail SMTP. */
const CONTACT_EMAIL = "hello@krivatechnologies.com";
const TO = process.env.INQUIRY_TO || CONTACT_EMAIL;
const GMAIL_USER = process.env.GMAIL_USER;
const USER_FACING_ERROR =
  "We could not send your inquiry right now. Please try again shortly.";

function ccRecipients() {
  const raw = process.env.INQUIRY_CC || "";
  return raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s));
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
  return { text, html, subject };
}

async function sendViaGmail(data) {
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!GMAIL_USER || !pass) {
    const err = new Error("inquiry mail not configured");
    err.code = "NOT_CONFIGURED";
    throw err;
  }

  const submitterEmail = field(data, "email");
  const { text, html, subject } = buildMessage(data);
  const nodemailer = require("nodemailer");
  const tx = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: GMAIL_USER, pass: pass.replace(/\s/g, "") },
  });

  const mail = {
    from: "KRIVA website <" + GMAIL_USER + ">",
    to: TO,
    replyTo: submitterEmail,
    subject,
    text,
    html,
  };
  const cc = ccRecipients();
  if (cc.length) mail.cc = cc.join(", ");

  const info = await tx.sendMail(mail);
  if (!info || !info.messageId) {
    throw new Error("smtp accept missing messageId");
  }
  return { messageId: info.messageId };
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
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    sendJson(res, 400, { ok: false, error: "Name and a valid email are required." });
    return;
  }

  try {
    await sendViaGmail(data);
    sendJson(res, 200, { ok: true });
  } catch (err) {
    if (err && err.code === "NOT_CONFIGURED") {
      console.error("inquiry send failed: mail not configured");
    } else {
      console.error("inquiry send failed:", err && err.message);
    }
    const status = err && err.code === "NOT_CONFIGURED" ? 503 : 502;
    sendJson(res, status, { ok: false, error: USER_FACING_ERROR });
  }
};
