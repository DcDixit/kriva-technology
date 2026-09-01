/* KRIVA on-page inquiry. Binds any form.inq-form */
(function () {
  "use strict";
  const ENDPOINT = "/api/inquiry";

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
        if (!res.ok || body.ok === false) throw new Error(body.error || "Could not send.");
        if (body.relay && body.relay.url) {
          const relayPayload = body.relay.payload || payload;
          if (body.relay.kind === "form") {
            const hop = document.createElement("form");
            hop.method = "POST";
            hop.action = body.relay.url;
            hop.acceptCharset = "UTF-8";
            hop.style.display = "none";
            Object.keys(relayPayload).forEach((k) => {
              const input = document.createElement("input");
              input.type = "hidden";
              input.name = k;
              input.value = relayPayload[k] == null ? "" : String(relayPayload[k]);
              hop.appendChild(input);
            });
            document.body.appendChild(hop);
            hop.submit();
            return;
          }
          const relayRes = await fetch(body.relay.url, {
            method: "POST",
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            body: JSON.stringify(relayPayload),
          });
          const relayBody = await relayRes.json().catch(() => ({}));
          const ok = relayBody.success === true || String(relayBody.success) === "true";
          if (!ok) throw new Error(String(relayBody.message || "") || "Could not send.");
        }
        sending = false;
        form.classList.add("sent");
        if (done) {
          done.classList.add("on");
          done.focus();
        }
        if (status) status.textContent = "Inquiry received. We reply within one business day.";
        try {
          window.dispatchEvent(
            new CustomEvent("kriva:lead", {
              detail: { type: payload.inquiry_type || "page_inquiry", form_id: form.id || "" },
            })
          );
        } catch (err) {}
      } catch (err) {
        sending = false;
        btn.removeAttribute("aria-disabled");
        form.removeAttribute("aria-busy");
        if (label) label.textContent = defaultLabel;
        if (fail) {
          fail.textContent = err && err.message ? err.message : "Could not send. Try again shortly.";
          fail.classList.add("on");
        }
        if (status) status.textContent = "Could not send.";
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
    }
  }
})();
