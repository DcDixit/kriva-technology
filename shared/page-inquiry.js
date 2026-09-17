/* KRIVA on-page inquiry. Binds any form.inq-form */
(function () {
  "use strict";
  const ENDPOINT = "/api/inquiry";
  const SUCCESS_MSG =
    "Thank you! Your inquiry has been submitted successfully. We'll be in touch soon.";
  const FAIL_MSG = "We could not send your inquiry right now. Please try again shortly.";

  function formatInquiryError(err) {
    if (!err) return "";
    if (typeof err === "string") return err;
    if (typeof err.message === "string" && err.message) return err.message;
    return "";
  }

  function relayErrorMessage(relayBody) {
    if (!relayBody || typeof relayBody !== "object") return "";
    const msg = relayBody.message != null ? relayBody.message : relayBody.body && relayBody.body.message;
    if (typeof msg === "string") return msg;
    if (msg && typeof msg === "object" && typeof msg.message === "string") return msg.message;
    return "";
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
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok || body.ok === false) {
          const apiErr = body.error;
          const msg = typeof apiErr === "string" ? apiErr : (apiErr && apiErr.message) || FAIL_MSG;
          throw new Error(msg);
        }
        if (body.relay && body.relay.url) {
          const relayPayload = body.relay.payload || payload;
          const relayRes = await fetch(body.relay.url, {
            method: "POST",
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            body: JSON.stringify(relayPayload),
          });
          const relayBody = await relayRes.json().catch(() => ({}));
          const ok = relayBody.success === true || String(relayBody.success) === "true";
          if (!ok) {
            const relayMsg = relayErrorMessage(relayBody);
            if (/activ/i.test(relayMsg) && body.relay.activateInbox) {
              throw new Error(
                "Check " +
                  body.relay.activateInbox +
                  " (including spam) for a FormSubmit activation email, click Activate Form, then submit again."
              );
            }
            throw new Error(relayMsg || FAIL_MSG);
          }
        }
        sending = false;
        btn.removeAttribute("aria-disabled");
        form.removeAttribute("aria-busy");
        showSuccess(form, done, status, label, defaultLabel, payload);
      } catch (err) {
        sending = false;
        btn.removeAttribute("aria-disabled");
        form.removeAttribute("aria-busy");
        if (label) label.textContent = defaultLabel;
        const errMsg = formatInquiryError(err) || FAIL_MSG;
        if (fail) {
          fail.textContent = errMsg;
          fail.classList.add("on");
        }
        if (status) status.textContent = errMsg;
      }
    });
  }

  document.querySelectorAll("form.inq-form").forEach(wire);

  if (/[?&]sent=1(?:&|$)/.test(location.search) && location.hash === "#inquire") {
    const form = document.getElementById("pageInquiry");
    const done = form && form.parentElement.querySelector(".inq-done");
    if (form && done) {
      form.classList.add("sent");
      done.classList.add("on");
      const h3 = done.querySelector("h3");
      const p = done.querySelector("p");
      if (h3) h3.textContent = "Thank you!";
      if (p) p.textContent = "Your inquiry has been submitted successfully. We'll be in touch soon.";
      try {
        const typeEl = form.querySelector('[name="inquiry_type"]');
        const leadType = (typeEl && typeEl.value) || "page_inquiry";
        const storageKey =
          "kriva_ga_lead_" + location.pathname + "|" + (form.id || "") + "|" + leadType;
        if (!sessionStorage.getItem(storageKey)) {
          window.dispatchEvent(
            new CustomEvent("kriva:lead", {
              detail: {
                type: leadType,
                form_id: form.id || "",
              },
            })
          );
        }
      } catch (err) {}
    }
  }
})();
