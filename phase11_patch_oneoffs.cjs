/**
 * Phase 11: one-off patches for solutions, work index, legal notes, home crop captions.
 * Run after builders.
 */
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;

function patch(file, fn) {
  const p = path.join(ROOT, file);
  let html = fs.readFileSync(p, "utf8");
  const next = fn(html);
  if (next !== html) {
    fs.writeFileSync(p, next, "utf8");
    console.log("Patched", file);
  } else {
    console.log("No change", file);
  }
}

// Soften Capture pending captions → intentional hosts
const SLOT_CAPTION_RE =
  /Capture pending[^<]*/gi;
const TBD_FLAG_OPEN = /<span class="flag tbd">[^<]*<\/span>\s*/g;

for (const file of fs.readdirSync(ROOT).filter((f) => f.startsWith("kriva-") && f.endsWith(".html"))) {
  patch(file, (html) => {
    let h = html;
    h = h.replace(SLOT_CAPTION_RE, "Interface host · real capture replaces this frame when supplied");
    // Quiet leftover yellow TBD badges on buyer pages (keep legal notes content, strip badge chrome)
    if (!/privacy|terms/i.test(file)) {
      h = h.replace(
        /<span class="flag tbd">TBD<\/span>\s*/g,
        ""
      );
      h = h.replace(
        /<span class="flag tbd">Placeholder<\/span>\s*/g,
        ""
      );
      h = h.replace(
        /<span class="flag tbd">Note<\/span>\s*/g,
        ""
      );
      h = h.replace(
        /<span class="flag tbd">Hub detail<\/span>\s*/g,
        ""
      );
      h = h.replace(
        /<span class="flag tbd">Byline TBD<\/span>/g,
        ""
      );
      h = h.replace(
        /<span class="flag tbd">Check<\/span>\s*/g,
        ""
      );
      h = h.replace(
        /<span class="flag tbd">TBC<\/span>\s*/g,
        ""
      );
    }
    // Absolute shared paths if relative
    h = h.replace(/href="shared\//g, 'href="/shared/');
    h = h.replace(/src="shared\//g, 'src="/shared/');
    return h;
  });
}

// Privacy / Terms: honest analytics language without yellow TBD theater
patch("kriva-privacy.html", (html) =>
  html.replace(
    /<p class="body-sm" style="margin-top:12px"><span class="flag tbd">TBD<\/span>[^<]*<\/p>/,
    `<p class="body-sm" style="margin-top:12px">This static redesign currently ships with <strong>no analytics or advertising cookies</strong>. Theme preference may use localStorage only. If GA4/GTM is enabled on the production host later, this section will name the provider and storage used.</p>`
  )
);

patch("kriva-terms.html", (html) =>
  html.replace(
    /<p class="body-sm" style="margin-top:12px"><span class="flag tbd">TBD<\/span>[^<]*<\/p>/,
    `<p class="body-sm" style="margin-top:12px">Analytics and cookie language stays aligned with the Privacy Policy. Confirm production analytics before treating any tracker as active.</p>`
  )
);

// Home crop slots: quieter labels
patch("kriva-redesign.html", (html) =>
  html
    .replace(/Slot · 1600×1000 · console screenshot/g, "FleetFlow · console reference")
    .replace(/Slot · 1600×1000 · onboarding flow/g, "PayrollPro · onboarding reference")
    .replace(/Slot · 1600×1000 · reconciliation view/g, "FinanceSync · reconciliation reference")
);

// Work index: quieter thumbs
patch("kriva-work-index.html", (html) =>
  html
    .replace(/Slot · 1920×1080 · dispatch console/g, "FleetFlow · featured reference")
    .replace(/Slot · 1600×1000/g, "Case reference")
);

console.log("One-off patches done");
