/** POST /api/inquiry: sends inquiries to the studio (Gmail, Resend, Web3Forms, or FormSubmit). */
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

function gmailUser() {
  return String(process.env.GMAIL_USER || "").trim();
}

/** FormSubmit requires a one-time inbox activation. Default to the public studio inbox. */
function formsubmitRecipient() {
  if (process.env.FORMSUBMIT_TO) return process.env.FORMSUBMIT_TO.trim();
  const cc = ccRecipients();
  if (cc.length) return cc[0];
  return TO;
}

function formsubmitCcList(recipient) {
  const list = [];
  if (TO && TO !== recipient) list.push(TO);
  ccRecipients().forEach((addr) => {
    if (addr !== recipient && !list.includes(addr)) list.push(addr);
  });
  const gmail = gmailUser();
  if (isEmail(gmail) && gmail !== recipient && !list.includes(gmail)) list.push(gmail);
  return list;
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

function requestOrigin(req) {
  const live = "https://krivatechnologies.com";
  const xfHost = String(req.headers["x-forwarded-host"] || req.headers.host || "");
  const host = xfHost.split(",")[0].trim();
  if (!host || /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host)) return live;
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  return proto + "://" + host;
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

function formsubmitNext(data, origin) {
  const inquiryType = field(data, "inquiry_type");
  if (inquiryType === "fit_call") return origin + "/contact?sent=fit#book";
  if (inquiryType === "page_inquiry") {
    const p = safePagePath(data) || "/contact";
    return origin + p + "?sent=1#inquire";
  }
  return origin + "/contact?sent=brief#brief";
}

function formsubmitBody(data, origin) {
  const { subject, text } = buildMessage(data);
  const cc = formsubmitCcList(formsubmitRecipient());
  const body = {
    ...sharedFields(data),
    message: text,
    _subject: subject,
    _template: "table",
    _captcha: "false",
    _honey: "",
    _url: origin + "/contact",
    _next: formsubmitNext(data, origin),
  };
  if (cc.length) body._cc = cc.join(",");
  return body;
}

function browserRelay(data, origin) {
  const recipient = formsubmitRecipient();
  return {
    channel: "browser",
    relay: {
      kind: "ajax",
      url: "https://formsubmit.co/ajax/" + encodeURIComponent(recipient),
      payload: formsubmitBody(data, origin),
    },
  };
}

function gmailCredentials() {
  const user = gmailUser();
  const pass = String(process.env.GMAIL_APP_PASSWORD || "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\s/g, "");
  return { user, pass };
}

function looksLikeGmailAppPassword(pass) {
  return /^[a-z0-9]{16}$/i.test(pass);
}

async function sendWithTransport(transportOpts, mail) {
  const nodemailer = require("nodemailer");
  const tx = nodemailer.createTransport(transportOpts);
  const info = await tx.sendMail(mail);
  if (!info || !info.messageId) {
    throw new Error("smtp accept missing messageId");
  }
  return { channel: "gmail", messageId: info.messageId };
}

async function sendViaGmail(data) {
  const { user, pass } = gmailCredentials();
  if (!user || !pass) return null;
  if (!looksLikeGmailAppPassword(pass)) {
    console.error(
      "inquiry send skipped (gmail): GMAIL_APP_PASSWORD format invalid (length " +
        pass.length +
        ", expected 16)"
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
    { host: "smtp.gmail.com", port: 465, secure: true, auth: { user, pass } },
    {
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user, pass },
    },
  ];

  let lastErr;
  for (const opts of attempts) {
    try {
      return await sendWithTransport(opts, mail);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error("gmail send failed");
}

function formsubmitMessage(body) {
  if (!body || typeof body !== "object") return "";
  const msg = body.message != null ? body.message : body.body && body.body.message;
  if (typeof msg === "string") return msg;
  if (msg && typeof msg === "object" && typeof msg.message === "string") return msg.message;
  return "";
}

function formsubmitSuccessFlag(body) {
  if (!body || typeof body !== "object") return null;
  if (body.success === true || String(body.success) === "true") return true;
  if (body.success === false || String(body.success) === "false") return false;
  return null;
}

function formsubmitSetupBlocked(msg) {
  return /confirm your email|open this page through a web server|needs activation|activate form/i.test(
    msg || ""
  );
}

function formsubmitSucceeded(body, status) {
  const msg = formsubmitMessage(body);
  const flag = formsubmitSuccessFlag(body);
  if (formsubmitSetupBlocked(msg) && flag !== true) return false;
  if (flag === true) return true;
  if (flag === false) return false;
  if (status >= 200 && status < 400 && /sent|thank you|successfully/i.test(msg)) {
    return true;
  }
  return false;
}

async function sendViaFormsubmit(data, origin) {
  const recipient = formsubmitRecipient();
  const payload = formsubmitBody(data, origin);
  const url = "https://formsubmit.co/ajax/" + encodeURIComponent(recipient);
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Origin: origin,
      Referer: origin + "/contact",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    },
    body: JSON.stringify(payload),
  });
  const body = await r.json().catch(() => ({}));
  if (formsubmitSucceeded(body, r.status)) {
    return { channel: "formsubmit" };
  }

  const msg = formsubmitMessage(body);
  const flag = formsubmitSuccessFlag(body);
  if (formsubmitSetupBlocked(msg) && flag !== true) {
    return browserRelay(data, origin);
  }
  console.error(
    "inquiry send failed (formsubmit):",
    r.status,
    "success=" + String(flag),
    msg || "unknown"
  );
  const err = new Error("formsubmit failed");
  err.code = "FORMSUBMIT";
  throw err;
}

async function deliver(data, origin) {
  const email = field(data, "email");
  const { text, html, subject } = buildMessage(data);

  if (process.env.RESEND_API_KEY) {
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
    if (!r.ok) throw new Error("resend " + r.status + " " + (await r.text()));
    return { channel: "resend" };
  }

  try {
    const gmailResult = await sendViaGmail(data);
    if (gmailResult) return gmailResult;
  } catch (err) {
    console.error("inquiry send failed (gmail), trying fallback:", err && err.message);
  }

  if (process.env.WEB3FORMS_ACCESS_KEY) {
    const r = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(web3formsBody(data)),
    });
    const body = await r.json().catch(() => ({}));
    if (!body.success) throw new Error(body.message || "web3forms " + r.status);
    return { channel: "web3forms" };
  }

  return sendViaFormsubmit(data, origin);
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
    const result = await deliver(data, requestOrigin(req));
    if (result && result.channel === "browser") {
      sendJson(res, 200, { ok: true, relay: result.relay });
      return;
    }
    sendJson(res, 200, { ok: true });
  } catch (err) {
    console.error("inquiry send failed:", err && err.message);
    sendJson(res, 502, { ok: false, error: USER_FACING_ERROR });
  }
};
