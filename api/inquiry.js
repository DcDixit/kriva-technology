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

/* ── Email templates ──
   Table layout + inline styles only: Gmail, Outlook and Apple Mail strip <style>, SVG and
   flexbox. The logo is a PNG on the live site (brand/logos/kriva-email-logo.png, built by
   _build_email_logo.cjs); everything else is HTML so the email reads fine with images off. */
const SITE_URL = "https://krivatechnologies.com";
const LOGO_URL = SITE_URL + "/brand/logos/kriva-email-logo.png";
const C = {
  ink: "#0F1C2E",
  steel: "#4A5868",
  dim: "#6B7785",
  rule: "#E4E7EB",
  canvas: "#F4F5F7",
  panel: "#F8F9FB",
  soft: "#EEF0FF",
  brand: "#4F46E5",
  white: "#FFFFFF",
};
const FONT = "'Figtree',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function esc(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escMultiline(value) {
  return esc(value).replace(/\r?\n/g, "<br>");
}

function typeLabel(inquiryType) {
  if (inquiryType === "fit_call") return "Fit call request";
  if (inquiryType === "page_inquiry") return "Page inquiry";
  return "Project brief";
}

function firstName(name) {
  return String(name || "").trim().split(/\s+/)[0].slice(0, 40) || "there";
}

function submittedAt() {
  const tz = String(process.env.INQUIRY_TZ || "Asia/Kolkata").trim();
  try {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: tz,
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short",
    }).format(new Date());
  } catch {
    return new Date().toUTCString();
  }
}

function safeHttpUrl(value) {
  const v = String(value || "").trim();
  if (!v || /\s/.test(v)) return "";
  const url = /^https?:\/\//i.test(v) ? v : "https://" + v;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : "";
  } catch {
    return "";
  }
}

function link(href, label, color) {
  return (
    '<a href="' + esc(href) + '" target="_blank" style="color:' + (color || C.brand) +
    ';text-decoration:none;">' + esc(label) + "</a>"
  );
}

function button(href, label) {
  return (
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>' +
    '<td style="background:' + C.brand + ';border-radius:8px;">' +
    '<a href="' + esc(href) + '" target="_blank" style="display:inline-block;padding:12px 22px;font-family:' + FONT +
    ";font-size:14px;font-weight:600;line-height:20px;color:" + C.white + ';text-decoration:none;">' +
    esc(label) + " &rarr;</a></td></tr></table>"
  );
}

function spacer(px) {
  return '<div style="height:' + px + "px;line-height:" + px + 'px;font-size:0;">&nbsp;</div>';
}

function label(text) {
  return (
    '<p style="margin:0 0 10px;font-family:' + FONT +
    ";font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:" + C.dim + ';">' +
    esc(text) + "</p>"
  );
}

/* rows: [label, value] pairs; value is plain text, or { html } when already escaped */
function detailTable(rows) {
  if (!rows.length) return "";
  const cell = "font-family:" + FONT + ";font-size:14px;line-height:20px;padding:10px 0;";
  return (
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' +
    rows
      .map(
        ([k, v], i) =>
          "<tr>" +
          '<td valign="top" width="120" style="' + cell + "color:" + C.dim + ";" + (i ? "border-top:1px solid " + C.rule + ";" : "") + '">' +
          esc(k) + "</td>" +
          '<td valign="top" style="' + cell + "color:" + C.ink + ";font-weight:600;" + (i ? "border-top:1px solid " + C.rule + ";" : "") + '">' +
          (v && v.html ? v.html : esc(v)) + "</td></tr>"
      )
      .join("") +
    "</table>"
  );
}

function layout({ preheader, chip, bodyHtml, footerHtml }) {
  const chipCell = chip
    ? '<td align="right" valign="middle" style="font-family:' + FONT + ';">' +
      '<span style="display:inline-block;white-space:nowrap;background:' + C.soft + ";color:" + C.brand +
      ';font-size:12px;font-weight:600;line-height:16px;padding:6px 12px;border-radius:999px;">' +
      esc(chip) + "</span></td>"
    : "";
  return (
    '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">' +
    "<title>KRIVA Technologies</title></head>" +
    '<body style="margin:0;padding:0;background:' + C.canvas + ';-webkit-text-size-adjust:100%;">' +
    '<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">' +
    esc(preheader) + "&#8199;&#847;".repeat(40) + "</div>" +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:' + C.canvas + ';">' +
    '<tr><td align="center" style="padding:36px 12px;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:' + C.white +
    ";border:1px solid " + C.rule + ';border-radius:14px;border-collapse:separate;">' +
    /* header */
    '<tr><td style="padding:26px 32px 22px;border-bottom:1px solid ' + C.rule + ';">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
    '<td valign="middle"><a href="' + SITE_URL + '" target="_blank" style="text-decoration:none;">' +
    '<img src="' + LOGO_URL + '" width="140" height="36" alt="KRIVA Technologies" style="display:block;border:0;outline:none;width:140px;height:auto;font-family:' +
    FONT + ";font-size:18px;font-weight:800;letter-spacing:2px;color:" + C.ink + ';"></a></td>' +
    chipCell +
    "</tr></table></td></tr>" +
    /* body */
    '<tr><td style="padding:30px 32px 6px;">' + bodyHtml + "</td></tr>" +
    /* footer */
    '<tr><td style="padding:18px 32px 24px;border-top:1px solid ' + C.rule + ";font-family:" + FONT +
    ";font-size:13px;line-height:20px;color:" + C.dim + ';">' + footerHtml + "</td></tr>" +
    "</table>" +
    '<p style="margin:18px 0 0;font-family:' + FONT + ";font-size:12px;line-height:18px;color:" + C.dim + ';">' +
    "KRIVA Technologies &middot; " + link(SITE_URL, "krivatechnologies.com", C.dim) +
    "</p>" +
    "</td></tr></table></body></html>"
  );
}

function buildMessage(data) {
  const inquiryType = field(data, "inquiry_type") || "project_brief";
  const kind = typeLabel(inquiryType);
  const name = field(data, "name");
  const email = field(data, "email");
  const company = field(data, "company");
  const phone = field(data, "phone");
  const page = safePagePath(data);
  const site = field(data, "site");
  const siteUrl = safeHttpUrl(site);
  const details = field(data, "details");
  const when = submittedAt();

  const projectRows = [
    ["Project type", field(data, "ptype")],
    ["Service", field(data, "service")],
    ["Market", field(data, "market")],
    ["Budget", field(data, "budget")],
    ["Timeline", field(data, "timeline")],
    ["Submitted from", page],
  ].filter(([, v]) => v);

  const text = [
    kind + " · " + when,
    "",
    ["Name", name],
    ["Email", email],
    ["Company", company],
    ["Phone", phone],
    ["Website", site],
    ...projectRows,
    "",
    details ? "Message:\n" + details : "",
  ]
    .map((r) => (Array.isArray(r) ? (r[1] ? r[0] + ": " + r[1] : null) : r))
    .filter((r) => r !== null)
    .join("\n")
    .trim();

  const contactRows = [
    ["Name", name],
    ["Company", company],
    ["Email", { html: link("mailto:" + email, email) }],
    ["Phone", phone && { html: link("tel:" + phone.replace(/[^\d+]/g, ""), phone) }],
    ["Website", site && (siteUrl ? { html: link(siteUrl, site.replace(/^https?:\/\//i, "").replace(/\/$/, "")) } : site)],
  ].filter(([, v]) => v);

  const replySubject = "Re: your " + kind.toLowerCase() + " with KRIVA";
  const bodyHtml =
    '<p style="margin:0 0 6px;font-family:' + FONT + ";font-size:13px;line-height:18px;color:" + C.dim + ';">' + esc(when) + "</p>" +
    '<h1 style="margin:0 0 22px;font-family:' + FONT + ";font-size:22px;line-height:30px;font-weight:700;color:" + C.ink + ';">' +
    "New " + esc(kind.toLowerCase()) + "</h1>" +
    label("Contact details") +
    detailTable(contactRows) +
    spacer(18) +
    button("mailto:" + email + "?subject=" + encodeURIComponent(replySubject), "Reply to " + firstName(name)) +
    spacer(28) +
    (details
      ? label("Message") +
        '<div style="background:' + C.panel + ";border-left:3px solid " + C.brand + ";border-radius:0 8px 8px 0;padding:14px 18px;font-family:" + FONT +
        ";font-size:15px;line-height:24px;color:" + C.ink + ';">' + escMultiline(details) + "</div>" +
        spacer(26)
      : "") +
    (projectRows.length ? label("Project details") + detailTable(projectRows) + spacer(20) : "");

  const footerHtml =
    "Replying to this email goes straight to " + esc(firstName(name)) + ". We promised a reply within one business day.";

  const html = layout({
    preheader: name + (company ? " · " + company : "") + (details ? ": " + details.slice(0, 90) : ""),
    chip: kind.replace(/ request$/, ""),
    bodyHtml,
    footerHtml,
  });

  const subject = "KRIVA " + kind + ": " + (company ? company + " (" + name + ")" : name || "Website");
  return { text, html, subject, inquiryType };
}

/* Confirmation to the submitter. The address is unverified, so only echo picked options,
   never free text, or the form becomes a relay for arbitrary content. */
function buildConfirmation(data) {
  const inquiryType = field(data, "inquiry_type") || "project_brief";
  const kind = typeLabel(inquiryType);
  const first = firstName(field(data, "name")).replace(/[^\p{L}\p{M}'-]/gu, "") || "there";
  const pick = (key) => field(data, key).slice(0, 80);
  const rows = [
    ["Request", kind],
    ["Project type", pick("ptype")],
    ["Service", pick("service")],
    ["Market", pick("market")],
    ["Budget", pick("budget")],
    ["Timeline", pick("timeline")],
  ].filter(([, v]) => v);

  const steps = [
    ["We review your request", "A senior team member reads it and checks it against similar work we have delivered."],
    [
      "We reply within one business day",
      inquiryType === "fit_call" ? "With a few call times that suit your time zone." : "With questions or a first take on scope.",
    ],
    [
      inquiryType === "fit_call" ? "20-minute fit call" : "A short call if useful",
      "No pitch deck. You leave with a clear next step, even if we are not the right fit.",
    ],
  ];

  const stepsHtml =
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:' + C.panel +
    ";border:1px solid " + C.rule + ';border-radius:12px;border-collapse:separate;"><tr><td style="padding:20px 20px 4px;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' +
    steps
      .map(
        ([title, body], i) =>
          "<tr>" +
          '<td valign="top" width="42" style="padding:0 0 16px;">' +
          '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" valign="middle" width="28" height="28" style="background:' +
          C.brand + ";border-radius:14px;font-family:" + FONT + ";font-size:13px;font-weight:700;color:" + C.white + ';">' +
          (i + 1) + "</td></tr></table></td>" +
          '<td valign="top" style="padding:3px 0 16px;font-family:' + FONT + ';">' +
          '<p style="margin:0 0 2px;font-size:15px;line-height:22px;font-weight:600;color:' + C.ink + ';">' + esc(title) + "</p>" +
          '<p style="margin:0;font-size:14px;line-height:21px;color:' + C.steel + ';">' + esc(body) + "</p>" +
          "</td></tr>"
      )
      .join("") +
    "</table></td></tr></table>";

  const bodyHtml =
    '<h1 style="margin:0 0 10px;font-family:' + FONT + ";font-size:24px;line-height:32px;font-weight:700;color:" + C.ink + ';">' +
    "Thanks, " + esc(first) + ". We have your request." + "</h1>" +
    '<p style="margin:0 0 26px;font-family:' + FONT + ";font-size:15px;line-height:24px;color:" + C.steel + ';">' +
    "Your " + esc(kind.toLowerCase()) + " is with the KRIVA team. You will hear from us at " +
    link("mailto:" + CONTACT_EMAIL, CONTACT_EMAIL) + " within one business day." + "</p>" +
    label("What happens next") +
    stepsHtml +
    spacer(28) +
    (rows.length ? label("Your request") + detailTable(rows) + spacer(26) : "") +
    button(SITE_URL + "/work", "See our recent work") +
    spacer(26);

  const footerHtml =
    "Want to add something? Just reply to this email.<br>" +
    '<span style="font-size:12px;">You received this because your email was entered on our contact form. If that was not you, please ignore it.</span>';

  const text =
    "Thanks, " + first + ". We have your request.\n\n" +
    "Your " + kind.toLowerCase() + " is with the KRIVA team. You will hear from us at " + CONTACT_EMAIL + " within one business day.\n\n" +
    "What happens next\n" +
    steps.map(([t, b], i) => i + 1 + ". " + t + ": " + b).join("\n") +
    (rows.length ? "\n\nYour request\n" + rows.map(([k, v]) => k + ": " + v).join("\n") : "") +
    "\n\nSee our recent work: " + SITE_URL + "/work\n\n" +
    "Want to add something? Just reply to this email.\n\nKRIVA Technologies · " + SITE_URL;

  const html = layout({
    preheader: "We reply within one business day. Here is what happens next.",
    chip: "",
    bodyHtml,
    footerHtml,
  });

  return { text, html, subject: "We received your " + kind.toLowerCase() + " · KRIVA Technologies" };
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

function gmailCredentialIssue() {
  const { user, pass } = gmailCredentials();
  if (!user) return "GMAIL_USER missing";
  if (!pass) return "GMAIL_APP_PASSWORD missing";
  if (!looksLikeGmailAppPassword(pass)) {
    return "GMAIL_APP_PASSWORD wrong_length (length " + pass.length + ")";
  }
  return "";
}

function isConnError(err) {
  const msg = String((err && (err.code || err.message)) || "");
  return /timeout|etimedout|econn|enetunreach|socket|connect/i.test(msg);
}

function smtpErrorMeta(err) {
  if (!err) return "unknown";
  const pass = gmailCredentials().pass;
  let text = [err.code, err.responseCode, err.command, err.message].filter(Boolean).join(" ").slice(0, 240);
  if (pass) text = text.split(pass).join("[redacted]");
  return text;
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
  const issue = gmailCredentialIssue();
  if (issue) {
    console.error("inquiry gmail: " + issue + ". Skipping SMTP.");
    return null;
  }
  const { user, pass } = gmailCredentials();

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
      const result = await sendWithTransport(attempts[i], mail);
      return { ...result, transport: attempts[i] };
    } catch (err) {
      lastErr = err;
      console.error("inquiry send failed (gmail smtp " + attempts[i].port + "):", smtpErrorMeta(err));
      if (!isConnError(err) && i === 0) break;
    }
  }
  throw lastErr || new Error("gmail send failed");
}

function envConfigured(name) {
  return Boolean(String(process.env[name] || "").trim());
}

async function sendViaResend(data) {
  if (!envConfigured("RESEND_API_KEY")) return null;
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

async function deliver(data) {
  let gmailIssue = "";
  try {
    const gmailResult = await sendViaGmail(data);
    if (gmailResult) return gmailResult;
    gmailIssue = gmailCredentialIssue() || "gmail_unavailable";
  } catch (err) {
    gmailIssue = "smtp_rejected";
    console.error("inquiry send failed (gmail), trying optional backup:", smtpErrorMeta(err));
  }

  const resendConfigured = envConfigured("RESEND_API_KEY");
  if (!resendConfigured) {
    console.error("inquiry resend: RESEND_API_KEY is not set; skipping Resend");
  } else {
    try {
      const resendResult = await sendViaResend(data);
      if (resendResult) return resendResult;
    } catch (err) {
      console.error("inquiry send failed (resend):", err && err.message);
    }
  }


  const fallback = resendConfigured ? "configured but rejected" : "not configured";
  console.error("inquiry delivery failed: " + gmailIssue + "; fallback " + fallback);
  throw new Error("inquiry delivery failed");
}

/* Best effort: the inquiry already reached the inbox, so a failure here never fails the request. */
async function sendConfirmation(data, delivered) {
  if (/^(0|off|false|no)$/i.test(String(process.env.INQUIRY_AUTOREPLY || "").trim())) return;
  const to = field(data, "email");
  if (!isEmail(to) || to.toLowerCase() === TO.toLowerCase()) return;
  const { text, html, subject } = buildConfirmation(data);
  try {
    if (delivered && delivered.channel === "gmail" && delivered.transport) {
      const { user } = gmailCredentials();
      await sendWithTransport({ ...delivered.transport, connectionTimeout: 2500, greetingTimeout: 2500, socketTimeout: 3500 }, {
        from: "KRIVA Technologies <" + user + ">",
        to,
        replyTo: CONTACT_EMAIL,
        subject,
        text,
        html,
      });
    } else if (envConfigured("RESEND_API_KEY") && envConfigured("RESEND_FROM")) {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + process.env.RESEND_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: process.env.RESEND_FROM, to: [to], reply_to: CONTACT_EMAIL, subject, text, html }),
      });
      if (!r.ok) throw new Error("resend " + r.status);
    }
  } catch (err) {
    console.error("inquiry confirmation failed:", smtpErrorMeta(err));
  }
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

  const startedAt = Date.now();
  try {
    const result = await deliver(data);
    /* maxDuration is 10s; skip the courtesy email rather than risk a timeout after a successful send */
    if (Date.now() - startedAt < 5000) await sendConfirmation(data, result);
    sendJson(res, 200, { ok: true, channel: result && result.channel });
  } catch (err) {
    console.error("inquiry send failed:", err && err.message);
    /* Web3Forms' free plan only accepts browser submissions, so the browser finishes the send.
       Its access key is public by design and maps to an inbox; it still lives in Vercel env, not in Git. */
    const backupKey = String(process.env.WEB3FORMS_ACCESS_KEY || "").trim();
    console.error("inquiry browser backup: " + (backupKey ? "offered" : "WEB3FORMS_ACCESS_KEY is not set"));
    sendJson(res, 502, {
      ok: false,
      error: USER_FACING_ERROR,
      ...(backupKey ? { backup: { provider: "web3forms", key: backupKey } } : {}),
    });
  }
};
