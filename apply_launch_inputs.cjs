#!/usr/bin/env node
/**
 * Phase 9: apply launch inputs without architecture changes.
 *
 * Usage:
 *   node apply_launch_inputs.cjs              # stamp markers + link CSS + sync OG state
 *   node apply_launch_inputs.cjs --og         # sync OG tags from brand/og-default.png presence
 *   node apply_launch_inputs.cjs --assets     # inject <img> where media files exist
 *   node apply_launch_inputs.cjs --attribution  # apply confirmed registry bylines
 *   node apply_launch_inputs.cjs --all
 *
 * Does not invent assets, attributions, or tracking scripts.
 */

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const {
  ogImageMetaTagsAuto,
  OG_MARKER_START,
  OG_MARKER_END,
  assetExists,
  localOgPath,
} = require("./shared/og.js");
const { assets, localPathFor } = require("./content/asset-manifest.cjs");
const { attributions } = require("./content/attribution-registry.cjs");

const args = new Set(process.argv.slice(2));
const runAll = args.has("--all") || args.size === 0;
const runOg = runAll || args.has("--og");
const runAssets = args.has("--assets") || args.has("--all");
const runAttr = args.has("--attribution") || args.has("--all");
const stampOnly = runAll && !args.has("--assets") && !args.has("--attribution");

const SLOT_CSS = '<link rel="stylesheet" href="shared/slot-assets.css">';
const htmlFiles = () =>
  fs.readdirSync(ROOT).filter((f) => /^kriva-.*\.html$/.test(f));

function ensureSlotCss(html) {
  if (html.includes("shared/slot-assets.css")) return html;
  if (html.includes("shared/chrome.css")) {
    return html.replace(
      '<link rel="stylesheet" href="/shared/chrome.css">',
      `<link rel="stylesheet" href="/shared/chrome.css">\n${SLOT_CSS}`
    );
  }
  return html.replace("</head>", `${SLOT_CSS}\n</head>`);
}

function syncOgBlock(html) {
  const block = ogImageMetaTagsAuto(ROOT);
  if (html.includes(OG_MARKER_START) && html.includes(OG_MARKER_END)) {
    return html.replace(
      new RegExp(`${OG_MARKER_START}[\\s\\S]*?${OG_MARKER_END}`),
      block
    );
  }
  // Prefer after og:url, else before </head>
  if (/<meta property="og:url"[^>]*>/i.test(html)) {
    return html.replace(
      /(<meta property="og:url"[^>]*>)/i,
      `$1\n${block}`
    );
  }
  return html.replace("</head>", `${block}\n</head>`);
}

function stampDataAsset(html, asset) {
  const marker = `data-asset="${asset.path}"`;
  if (html.includes(marker)) return { html, changed: false };

  // Work index thumbs: Slot · 1600×1000 + numbered span
  const thumbNum = (asset.slotLabel.match(/\b(0\d)\b/) || [])[1];
  if (asset.file === "kriva-work-index.html" && thumbNum) {
    const re = new RegExp(
      `(<div class="proj-media">\\s*(?:<!--[\\s\\S]*?-->\\s*)?)(<div class="slot">[\\s\\S]*?<span>Slot · 1600×1000</span><span>${thumbNum}</span>[\\s\\S]*?</div>)`
    );
    if (re.test(html) && !html.includes(marker)) {
      const next = html.replace(
        re,
        `$1<div data-asset="${asset.path}" data-asset-alt="${escapeAttr(asset.alt)}" data-asset-dims="${asset.dims}">$2</div>`
      );
      if (next !== html) return { html: next, changed: true };
    }
  }

  // Homepage crop-slots: wrap crop-ph parent .crop
  if (asset.file === "kriva-redesign.html" && asset.slotLabel.includes("console screenshot")) {
    const next = html.replace(
      /(<figure class="crop">\s*)(<!--[\s\S]*?-->\s*)?(<div class="crop-ph">[\s\S]*?console screenshot[\s\S]*?<\/div>)/,
      `$1$2<div data-asset="${asset.path}" data-asset-alt="${escapeAttr(asset.alt)}" data-asset-dims="${asset.dims}">$3</div>`
    );
    if (next !== html) return { html: next, changed: true };
  }
  if (asset.file === "kriva-redesign.html" && asset.slotLabel.includes("onboarding flow")) {
    const next = html.replace(
      /(<figure class="crop">\s*)(<!--[\s\S]*?-->\s*)?(<div class="crop-ph">[\s\S]*?onboarding flow[\s\S]*?<\/div>)/,
      `$1$2<div data-asset="${asset.path}" data-asset-alt="${escapeAttr(asset.alt)}" data-asset-dims="${asset.dims}">$3</div>`
    );
    if (next !== html) return { html: next, changed: true };
  }
  if (asset.file === "kriva-redesign.html" && asset.slotLabel.includes("reconciliation view")) {
    const next = html.replace(
      /(<figure class="crop">\s*)(<!--[\s\S]*?-->\s*)?(<div class="crop-ph">[\s\S]*?reconciliation view[\s\S]*?<\/div>)/,
      `$1$2<div data-asset="${asset.path}" data-asset-alt="${escapeAttr(asset.alt)}" data-asset-dims="${asset.dims}">$3</div>`
    );
    if (next !== html) return { html: next, changed: true };
  }

  // Generic: add data-asset onto nearest .media / .feat-shot / wrapper that contains the slot label
  const label = asset.slotLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Match opening tag of .media or .feat-shot before this slot label (within ~800 chars)
  const re = new RegExp(
    `(<(?:div|figure)[^>]*class="[^"]*(?:media|feat-shot|shot)[^"]*"[^>]*)(>)([\\s\\S]{0,900}?${label})`,
    "i"
  );
  const m = html.match(re);
  if (m && !m[1].includes("data-asset=")) {
    const next = html.replace(
      re,
      `$1 data-asset="${asset.path}" data-asset-alt="${escapeAttr(asset.alt)}" data-asset-dims="${asset.dims}"$2$3`
    );
    if (next !== html) return { html: next, changed: true };
  }

  // Fallback: slot div itself
  const slotRe = new RegExp(
    `(<div class="slot"[^>]*)(>[\\s\\S]{0,400}?${label})`,
    "i"
  );
  if (slotRe.test(html) && !html.includes(marker)) {
    const next = html.replace(
      slotRe,
      `$1 data-asset="${asset.path}" data-asset-alt="${escapeAttr(asset.alt)}" data-asset-dims="${asset.dims}"$2`
    );
    if (next !== html) return { html: next, changed: true };
  }

  return { html, changed: false };
}

function escapeAttr(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
}

function injectImgForAsset(html, asset) {
  const local = path.join(ROOT, localPathFor(asset.path));
  if (!fs.existsSync(local)) return { html, injected: false };

  const marker = `data-asset="${asset.path}"`;
  if (!html.includes(marker)) return { html, injected: false };
  if (html.includes(`src="${asset.path}"`)) return { html, injected: false };

  const [w, h] = (asset.dims || "").split(/[×x]/).map((n) => n.trim());
  const img = `<img src="${asset.path}" alt="${escapeAttr(asset.alt)}" width="${w || ""}" height="${h || ""}" loading="lazy" decoding="async">`;

  // Insert img immediately after the opening tag that carries data-asset
  const re = new RegExp(
    `(<[a-z]+[^>]*data-asset="${asset.path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>)`,
    "i"
  );
  if (!re.test(html)) return { html, injected: false };
  const next = html.replace(re, `$1\n${img}`);
  return { html: next, injected: next !== html };
}

function stampAttrMarkers() {
  const map = [
    {
      file: "kriva-redesign.html",
      replacements: [
        {
          id: "fleetroute-fleetflow",
          find: /(<figure class="q lead">[\s\S]*?<figcaption class="who">)/,
        },
        {
          id: "flowledger-payrollpro",
          find: /(<figure class="q">\s*<blockquote>“Activation moved[\s\S]*?<figcaption class="who">)/,
        },
        {
          id: "carepath-quote",
          find: /(<figure class="q">\s*<blockquote>“One team designing[\s\S]*?<figcaption class="who">)/,
        },
      ],
    },
    {
      file: "kriva-case-fleetflow.html",
      replacements: [
        {
          id: "fleetroute-fleetflow",
          find: /(<figure class="qblock on-ink">)/,
        },
      ],
    },
    {
      file: "kriva-case-payroll-pro.html",
      replacements: [
        {
          id: "flowledger-payrollpro",
          find: /(<figure class="qblock on-ink">)/,
        },
      ],
    },
    {
      file: "kriva-case-brandlift.html",
      replacements: [
        {
          id: "meridian-brandlift",
          find: /(<p class="body-sm" style="margin-top:12px"><span class="flag tbd">TBD<\/span> Internal · Meridian)/,
        },
      ],
    },
  ];

  let n = 0;
  for (const entry of map) {
    const fp = path.join(ROOT, entry.file);
    let html = fs.readFileSync(fp, "utf8");
    let changed = false;
    for (const r of entry.replacements) {
      if (html.includes(`data-attr-id="${r.id}"`)) continue;
      const next = html.replace(r.find, (m) => {
        if (m.includes("data-attr-id=")) return m;
        if (m.startsWith("<figure")) {
          return m.replace("<figure ", `<figure data-attr-id="${r.id}" `);
        }
        if (m.startsWith("<p ")) {
          return m.replace("<p ", `<p data-attr-id="${r.id}" `);
        }
        return m;
      });
      if (next !== html) {
        html = next;
        changed = true;
        n++;
      }
    }
    if (changed) fs.writeFileSync(fp, html);
  }
  return n;
}

function applyConfirmedAttribution() {
  let applied = 0;
  for (const a of attributions) {
    if (a.status !== "confirmed" || !a.confirmed) continue;
    const c = a.confirmed;
    if (c.publishQuote === false) {
      // Leave structural remove to a future pass: mark only
      console.log(`Attribution ${a.id}: confirmed omit: remove quotes manually or extend applicator`);
      continue;
    }
    const byline = `${c.name}<small>${c.role} · ${c.company}</small>`;
    const initials = c.initials || "·";
    for (const t of a.applyTargets) {
      if (!t.file.endsWith(".html")) continue;
      const fp = path.join(ROOT, t.file);
      if (!fs.existsSync(fp)) continue;
      let html = fs.readFileSync(fp, "utf8");
      const id = a.id;
      if (!html.includes(`data-attr-id="${id}"`)) continue;

      // Homepage figcaption pattern
      html = html.replace(
        new RegExp(
          `(<figure[^>]*data-attr-id="${id}"[^>]*>[\\s\\S]*?<figcaption class="who">)[\\s\\S]*?(</figcaption>)`,
          "i"
        ),
        `$1<span class="av" aria-hidden="true">${initials}</span><span>${byline}</span>$2`
      );
      // Case qblock figcaption
      html = html.replace(
        new RegExp(
          `(<figure[^>]*data-attr-id="${id}"[^>]*>[\\s\\S]*?<figcaption>)[\\s\\S]*?(</figcaption>)`,
          "i"
        ),
        `$1\n      <span class="av" aria-hidden="true">${initials}</span>\n      <span>${byline}</span>\n    $2`
      );
      fs.writeFileSync(fp, html);
      applied++;
      console.log(`Applied attribution ${id} → ${t.file}`);
    }
  }
  return applied;
}

function ensureBrandDir() {
  const dir = path.join(ROOT, "brand");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const readme = path.join(dir, "README.md");
  if (!fs.existsSync(readme)) {
    fs.writeFileSync(
      readme,
      `# Brand drop folder

Place the real OG image here (do not invent a placeholder PNG):

- \`og-default.png\`: **1200 × 630**

Then run:

\`\`\`bash
node apply_launch_inputs.cjs --og
\`\`\`

Screenshots go under \`media/\` mirroring public URLs (see \`content/asset-manifest.cjs\`).
`
    );
  }
  const media = path.join(ROOT, "media");
  if (!fs.existsSync(media)) fs.mkdirSync(media, { recursive: true });
  const mediaReadme = path.join(media, "README.md");
  if (!fs.existsSync(mediaReadme)) {
    fs.writeFileSync(
      mediaReadme,
      `# Media drop folder

Mirror public paths, e.g.:

- \`media/work/fleetflow/console-full.jpg\` → served as \`/work/fleetflow/console-full.jpg\`

See \`content/asset-manifest.cjs\` for filenames. Run \`node apply_launch_inputs.cjs --assets\` after dropping files.
`
    );
  }
}

// ── main ──
ensureBrandDir();

let stampedAssets = 0;
let injected = 0;

for (const file of htmlFiles()) {
  const fp = path.join(ROOT, file);
  let html = fs.readFileSync(fp, "utf8");
  let changed = false;

  const withCss = ensureSlotCss(html);
  if (withCss !== html) {
    html = withCss;
    changed = true;
  }

  if (runOg || stampOnly) {
    const withOg = syncOgBlock(html);
    if (withOg !== html) {
      html = withOg;
      changed = true;
    }
  }

  for (const asset of assets) {
    if (asset.id === "og-default") continue;
    if (asset.file !== file) continue;
    const stamped = stampDataAsset(html, asset);
    if (stamped.changed) {
      html = stamped.html;
      changed = true;
      stampedAssets++;
    }
    if (runAssets) {
      const inj = injectImgForAsset(html, asset);
      if (inj.injected) {
        html = inj.html;
        changed = true;
        injected++;
        console.log(`Injected ${asset.path} → ${file}`);
      }
    }
  }

  if (changed) fs.writeFileSync(fp, html);
}

const attrMarks = stampAttrMarkers();

if (runAttr) {
  applyConfirmedAttribution();
}

console.log("---");
console.log("OG asset on disk:", assetExists(ROOT) ? "YES → tags enabled" : "NO → tags withheld");
console.log("OG path expected:", localOgPath(ROOT));
console.log("data-asset stamps this run:", stampedAssets);
console.log("attribution markers touched:", attrMarks);
console.log("images injected:", injected);
console.log("Done. Drop files into brand/ and media/, set confirmed attributions in content/attribution-registry.cjs, re-run with flags.");
