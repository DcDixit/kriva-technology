/** POST /api/inquiry: emails the studio without putting an address in page HTML. */
const { CONTACT_EMAIL } = require("../shared/studio");
const TO = CONTACT_EMAIL;

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function field(data, key) {
  const v = data[key];
  if (v == null) return "";
  return String(v).trim().slice(0, 4000);
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

function safePagePath(data) {
  const raw = field(data, "page");
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) return "";
  return raw.split("#")[0].split("?")[0].slice(0, 200);
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
  const { subject } = buildMessage(data);
  const next = formsubmitNext(data, origin);
  return {
    ...sharedFields(data),
    _subject: subject,
    _template: "table",
    _captcha: "false",
    _honey: "",
    _url: origin + "/contact",
    _next: next,
  };
}

async function deliver(data, origin) {
  const email = field(data, "email");
  const { text, html, subject } = buildMessage(data);

  if (process.env.RESEND_API_KEY) {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.RESEND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "KRIVA <onboarding@resend.dev>",
        to: [TO],
        reply_to: email,
        subject,
        text,
        html,
      }),
    });
    if (!r.ok) throw new Error("resend " + r.status + " " + (await r.text()));
    return { channel: "resend" };
  }

  if (process.env.GMAIL_APP_PASSWORD) {
    const nodemailer = require("nodemailer");
    const user = process.env.GMAIL_USER || CONTACT_EMAIL;
    const tx = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass: process.env.GMAIL_APP_PASSWORD.replace(/\s/g, "") },
    });
    await tx.sendMail({
      from: "KRIVA <" + user + ">",
      to: TO,
      replyTo: email,
      subject,
      text,
      html,
    });
    return { channel: "gmail" };
  }

  if (process.env.WEB3FORMS_ACCESS_KEY) {
    return {
      channel: "browser",
      relay: {
        kind: "json",
        url: "https://api.web3forms.com/submit",
        payload: web3formsBody(data),
      },
    };
  }

  // FormSubmit /ajax/ confirmation emails produce "Confirmation token not found".
  // A real HTML form POST to the unencoded address is the endpoint they support.
  return {
    channel: "browser",
    relay: {
      kind: "form",
      url: "https://formsubmit.co/" + TO,
      payload: formsubmitBody(data, origin),
    },
  };
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    sendJson(res, 204, {});
    return;
  }
  if (req.method !== "POST") {
    sendJson(res, 405, { ok: false, error: "Method not allowed" });
    return;
  }

  let data = {};
  try {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const raw = Buffer.concat(chunks).toString("utf8");
    const ct = String(req.headers["content-type"] || "");
    if (ct.includes("application/json")) data = JSON.parse(raw || "{}");
    else data = Object.fromEntries(new URLSearchParams(raw));
  } catch {
    sendJson(res, 400, { ok: false, error: "Invalid body" });
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
    const result = await deliver(data, requestOrigin(req));
    if (result.channel === "browser") {
      sendJson(res, 200, { ok: true, relay: result.relay });
      return;
    }
    sendJson(res, 200, { ok: true });
  } catch (err) {
    console.error("inquiry send failed", err && err.message);
    sendJson(res, 502, { ok: false, error: "Could not send. Try again shortly." });
  }
};
