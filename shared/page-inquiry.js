/* KRIVA on-page inquiry. Binds any form.inq-form */
(function () {
  "use strict";
  const ENDPOINT = "/api/inquiry";
  const SUCCESS_MSG =
    "Thank you! Your inquiry has been submitted successfully. We'll be in touch soon.";
  const FAIL_STATUS =
    "We could not send your inquiry right now. Please try again shortly, or email hello@krivatechnologies.com.";

  const INQUIRY_FIELDS = ["name", "email", "company", "phone", "site", "ptype", "market", "service", "budget", "timeline", "details", "page", "inquiry_type"];

  /* FormSubmit's AJAX endpoint keeps asking for activation even after the form is live.
     A real HTML post to the same address is accepted from every page on the site, so the
     backup submits into a hidden frame and stays on the page. */
  function sendViaFormSubmit(payload) {
    return new Promise((resolve) => {
      const id = "kriva-inq-" + Date.now();
      const iframe = document.createElement("iframe");
      iframe.name = id;
      iframe.title = "Sending inquiry";
      iframe.setAttribute("aria-hidden", "true");
      iframe.style.cssText = "position:absolute;width:1px;height:1px;border:0;opacity:0;pointer-events:none";
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://formsubmit.co/hello@krivatechnologies.com";
      form.target = id;
      form.acceptCharset = "UTF-8";
      const fields = {
        _subject: "KRIVA inquiry: " + (payload.company || payload.name || "Website"),
        _template: "table",
        _captcha: "false",
        _replyto: payload.email || "",
      };
      INQUIRY_FIELDS.forEach((k) => {
        if (payload[k]) fields[k] = String(payload[k]).slice(0, 4000);
      });
      Object.keys(fields).forEach((k) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = fields[k];
        form.appendChild(input);
      });
      let settled = false;
      let loads = 0;
      const finish = (ok) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        setTimeout(() => {
          form.remove();
          iframe.remove();
        }, 400);
        resolve(ok);
      };
      const timer = setTimeout(() => finish(false), 20000);
      iframe.addEventListener("load", () => {
        loads += 1;
        if (loads < 2) return;
        finish(true);
      });
      document.body.appendChild(iframe);
      document.body.appendChild(form);
      form.submit();
    });
  }

  async function sendViaWeb3Forms(payload, key) {
    const out = {
      access_key: key,
      subject: "KRIVA inquiry (backup channel): " + (payload.company || payload.name || "Website"),
      from_name: "KRIVA website",
      botcheck: "",
    };
    INQUIRY_FIELDS.forEach((k) => {
      if (payload[k]) out[k] = String(payload[k]).slice(0, 4000);
    });
    try {
      const r = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(out),
      });
      const j = await r.json().catch(() => ({}));
      return !!(r.ok && j.success === true);
    } catch (err) {
      return false;
    }
  }

  /* Primary: /api/inquiry (Gmail, then Resend). If that fails, Web3Forms when the server
     offers a key, then FormSubmit from the browser. Resolves true only after a provider accepted. */
  async function sendInquiry(payload) {
    let backup = null;
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body && body.ok === true && body.channel) return true;
      if (res.status === 400) return false;
      backup = body && body.backup;
    } catch (err) {}
    if (backup && backup.provider === "web3forms" && backup.key) {
      if (await sendViaWeb3Forms(payload, backup.key)) return true;
    }
    return sendViaFormSubmit(payload);
  }
  window.krivaSendInquiry = sendInquiry;

  function inquiryMailto(payload) {
    payload = payload || {};
    const lines = [
      "Name: " + (payload.name || ""),
      "Email: " + (payload.email || ""),
      payload.company ? "Company: " + payload.company : "",
      payload.ptype ? "Project type: " + payload.ptype : "",
      payload.details ? "Details:\n" + payload.details : "",
    ].filter(Boolean);
    return (
      "mailto:hello@krivatechnologies.com?subject=" +
      encodeURIComponent("Website inquiry from " + (payload.name || "KRIVA site")) +
      "&body=" +
      encodeURIComponent(lines.join("\n").slice(0, 1800))
    );
  }

  function check(f) {
    if (!f.required) return true;
    if (!String(f.value || "").trim()) return false;
    if (f.type === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.value.trim());
    return true;
  }

  function mark(f) {
    const ok = check(f);
    const err = document.getElementById(f.id + "-err");
    f.setAttribute("aria-invalid", String(!ok));
    if (err) err.classList.toggle("on", !ok);
    return ok;
  }

  function showSuccess(form, done, status, label, defaultLabel, payload) {
    form.classList.add("sent");
    if (done) {
      done.classList.add("on");
      const h3 = done.querySelector("h3");
      const p = done.querySelector("p");
      if (h3) h3.textContent = "Thank you!";
      if (p) {
        p.textContent =
          "Your inquiry has been submitted successfully. We'll be in touch soon.";
      }
      done.focus();
    }
    if (status) status.textContent = SUCCESS_MSG;
    if (label) label.textContent = defaultLabel;
    try {
      window.dispatchEvent(
        new CustomEvent("kriva:lead", {
          detail: { type: payload.inquiry_type || "page_inquiry", form_id: form.id || "" },
        })
      );
    } catch (err) {}
  }

  function wire(form) {
    const btn = form.querySelector('[type="submit"]');
    const label = form.querySelector(".inq-submit-label");
    const status = form.querySelector("[data-inq-status]");
    const fail = form.querySelector(".inq-fail") || form.parentElement.querySelector(".inq-fail");
    const done = form.parentElement.querySelector(".inq-done");
    if (!btn) return;
    const defaultLabel = (label && label.textContent) || "Send inquiry";
    let sending = false;

    form.querySelectorAll("[required]").forEach((f) => {
      f.addEventListener("blur", () => mark(f));
      f.addEventListener("input", () => {
        if (f.getAttribute("aria-invalid") === "true" && check(f)) mark(f);
      });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const hp = form.querySelector('[name="website_hp"]');
      if (hp && hp.value) return;
      if (sending) return;
      const bad = [...form.querySelectorAll("[required]")].filter((f) => !mark(f));
      if (bad.length) {
        if (fail) {
          fail.textContent = "Please complete the required fields.";
          fail.classList.add("on");
        }
        bad[0].focus();
        return;
      }
      if (fail) fail.classList.remove("on");
      sending = true;
      btn.setAttribute("aria-disabled", "true");
      form.setAttribute("aria-busy", "true");
      if (label) label.textContent = "Sending";
      if (status) status.textContent = "Sending.";
      const fd = new FormData(form);
      const payload = {};
      fd.forEach((v, k) => {
        payload[k] = v;
      });
      if (!payload.page) payload.page = location.pathname;
      try {
        if (!(await sendInquiry(payload))) throw new Error("send-failed");
        sending = false;
        btn.removeAttribute("aria-disabled");
        form.removeAttribute("aria-busy");
        showSuccess(form, done, status, label, defaultLabel, payload);
      } catch (err) {
        sending = false;
        btn.removeAttribute("aria-disabled");
        form.removeAttribute("aria-busy");
        if (label) label.textContent = defaultLabel;
        if (fail) {
          fail.innerHTML =
            'We could not send your inquiry right now. Please try again shortly, or <a href="' +
            inquiryMailto(payload) +
            '">email this inquiry to hello@krivatechnologies.com</a>.';
          fail.classList.add("on");
        }
        if (status) status.textContent = FAIL_STATUS;
      }
    });
  }

  document.querySelectorAll("form.inq-form").forEach(wire);
})();
