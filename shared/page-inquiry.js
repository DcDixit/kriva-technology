/* KRIVA on-page inquiry. Binds any form.inq-form */
(function () {
  "use strict";
  const ENDPOINT = "/api/inquiry";
  const SUCCESS_MSG =
    "Thank you! Your inquiry has been submitted successfully. We'll be in touch soon.";
  const FAIL_STATUS =
    "We could not send your inquiry right now. Please try again shortly, or email hello@krivatechnologies.com.";

  /* Primary: /api/inquiry (Gmail, then Resend). Backup: Web3Forms from the browser, only when the
     server reports that delivery failed. Resolves true only after a provider accepted the message. */
  async function sendInquiry(payload) {
    let backup = null;
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
