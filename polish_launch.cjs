#!/usr/bin/env node
/** Final launch polish: paths, proof slots, qblock removal, relative CSS fix. */
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;

const PROOF_INJECT = {
  "kriva-solution-accounting.html": {
    find: '<figure class="proof-shot" data-shot>',
    img: '<img src="/solutions/accounting/proof.svg" alt="FinanceSync reconciliation dashboard" width="1920" height="1080" loading="lazy" decoding="async">',
  },
};

for (const file of fs.readdirSync(ROOT).filter((f) => /^kriva-.*\.html$/.test(f))) {
  let html = fs.readFileSync(path.join(ROOT, file), "utf8");
  let changed = false;

  if (html.includes('href="shared/slot-assets.css"')) {
    html = html.replace(/href="shared\/slot-assets\.css"/g, 'href="/shared/slot-assets.css"');
    changed = true;
  }

  if (html.includes(".jpg")) {
    const next = html.replace(/\/work\/([a-z0-9-]+)\/([^"]+)\.jpg/g, "/work/$1/$2.svg");
    if (next !== html) {
      html = next;
      changed = true;
    }
  }

  if (PROOF_INJECT[file] && !html.includes(PROOF_INJECT[file].img.split('"')[1])) {
    const { find, img } = PROOF_INJECT[file];
    html = html.replace(find, `${find}\n          ${img}`);
    changed = true;
  }

  // Remove unverified quote blocks
  html = html.replace(
    /<!-- ══════════ QUOTE ══════════ -->[\s\S]*?<!-- ══════════ RELATED ══════════ -->/,
    "<!-- ══════════ RELATED ══════════ -->"
  );

  // Outdated slot captions
  html = html.replace(
    /Project story frame · screenshot drops into this host when supplied/g,
    "Interface reference · stylized product pattern"
  );
  html = html.replace(
    /Interface crop · replaces when supplied/g,
    ""
  );

  if (changed) {
    fs.writeFileSync(path.join(ROOT, file), html);
    console.log("Polished", file);
  }
}

console.log("Polish complete.");
