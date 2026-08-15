#!/usr/bin/env node
/**
 * Premium on-brand product visuals — unique per asset via seeded variation.
 * Honest interface references, not client screenshots. No generic watermarks.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = __dirname;
const C = {
  ink: "#0E1216", ink2: "#161C22", line: "#232B33", dim: "#6B7885", text: "#B9C3CC",
  white: "#EDEFF1", amber: "#DB9B1F", blue: "#1B44C8", green: "#1B7A54", lime: "#5FD3A0",
  violet: "#5B44C8", paper: "#EAEAE4", rule: "#D2D2C9", red: "#C44B4B",
};
const ACCENTS = [C.amber, C.blue, C.green, C.violet, C.lime];

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}
function seedOf(str) {
  const h = crypto.createHash("md5").update(str).digest();
  return h.readUInt32BE(0);
}
function pick(seed, arr, offset = 0) {
  return arr[(seed + offset) % arr.length];
}
function uid(path) {
  return "u" + seedOf(path).toString(36);
}

function svgOpen(w, h, label, id) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(label)}">
<defs>
  <linearGradient id="bg${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${C.ink2}"/><stop offset="100%" stop-color="${C.ink}"/></linearGradient>
  <pattern id="grid${id}" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="${C.line}" stroke-width="0.45" opacity="0.28"/></pattern>
</defs>
<rect width="100%" height="100%" fill="url(#bg${id})"/>
<rect width="100%" height="100%" fill="url(#grid${id})"/>`;
}
function svgClose() { return "</svg>"; }

function chromeBar(w, title, accent, id) {
  return `<rect width="${w}" height="46" fill="${C.ink}"/>
<line x1="0" y1="46" x2="${w}" y2="46" stroke="${C.line}"/>
<rect x="20" y="17" width="9" height="9" fill="${accent}"/>
<text x="38" y="28" fill="${C.white}" font-family="ui-monospace,monospace" font-size="10.5" letter-spacing="0.13em">${esc(title.toUpperCase())}</text>`;
}

function kpis(w, seed, accent, id) {
  const sets = [
    [["ACTIVE", "47"], ["AT RISK", "3"], ["SLA", "94%"]],
    [["ROUTES", "128"], ["OPEN", "6"], ["ON TIME", "91%"]],
    [["PIPELINE", "24"], ["HOT", "5"], ["CLOSE", "18d"]],
    [["SYNCED", "248"], ["OPEN", "1"], ["MATCH", "99%"]],
    [["TICKETS", "86"], ["AUTO", "62"], ["QUEUE", "4"]],
  ];
  const labels = pick(seed, sets);
  const bw = (w - 56) / 3;
  return labels.map((k, i) => {
    const x = 18 + i * bw;
    return `<rect x="${x}" y="58" width="${bw - 10}" height="68" fill="${C.ink2}" stroke="${C.line}"/>
<text x="${x + 10}" y="78" fill="${C.dim}" font-family="ui-monospace,monospace" font-size="9" letter-spacing="0.1em">${k[0]}</text>
<text x="${x + 10}" y="108" fill="${i === 1 ? accent : C.white}" font-family="ui-sans-serif,sans-serif" font-size="21" font-weight="700">${k[1]}</text>`;
  }).join("");
}

function tableBlock(w, y, seed, accent, cols) {
  const rows = pick(seed, [
    [["#4821", "DAL → ATL", "18m", "IN TRANSIT"], ["#4822", "PHX → DEN", "42m", "ASSIGNED"], ["#4823", "CHI → DET", "6m", "AT RISK"]],
    [["#7710", "SEA → PDX", "22m", "DISPATCHED"], ["#7711", "MIA → ATL", "9m", "LOADING"], ["#7712", "DEN → SLC", "31m", "PENDING"]],
    [["INV-2291", "QB match", "—", "MATCHED"], ["INV-2292", "Xero", "—", "MATCHED"], ["INV-2293", "Delta", "—", "REVIEW"]],
    [["TK-8812", "Billing", "2m", "REVIEW"], ["TK-8813", "API", "8m", "AUTO"], ["TK-8814", "Setup", "14m", "OPEN"]],
  ], 1);
  let out = `<rect x="18" y="${y}" width="${w - 36}" height="${rows.length * 40 + 34}" fill="${C.ink2}" stroke="${C.line}"/>
<text x="32" y="${y + 18}" fill="${C.dim}" font-family="ui-monospace,monospace" font-size="9" letter-spacing="0.11em">${esc(cols)}</text>`;
  rows.forEach((r, i) => {
    const ry = y + 32 + i * 40;
    const hi = i === 0;
    out += `<rect x="18" y="${ry}" width="4" height="34" fill="${hi ? accent : "transparent"}"/>
<text x="34" y="${ry + 22}" fill="${hi ? C.white : C.text}" font-size="13">${esc(r[0])}</text>
<text x="${w * 0.36}" y="${ry + 22}" fill="${C.text}" font-family="ui-monospace,monospace" font-size="11">${esc(r[1])}</text>
<text x="${w * 0.58}" y="${ry + 22}" fill="${C.text}" font-family="ui-monospace,monospace" font-size="11">${esc(r[2])}</text>
<rect x="${w - 118}" y="${ry + 8}" width="86" height="18" fill="none" stroke="${hi ? accent : C.dim}"/>
<text x="${w - 75}" y="${ry + 21}" text-anchor="middle" fill="${hi ? accent : C.dim}" font-family="ui-monospace,monospace" font-size="8.5">${esc(r[3])}</text>`;
    if (i < rows.length - 1) out += `<line x1="32" y1="${ry + 34}" x2="${w - 32}" y2="${ry + 34}" stroke="${C.line}"/>`;
  });
  return out;
}

const templates = {
  dispatch(w, h, o, seed, id) {
    const accent = pick(seed, ACCENTS);
    return svgOpen(w, h, o.subtitle || "Dispatch console", id) +
      chromeBar(w, o.title || "Dispatch", accent, id) +
      kpis(w, seed, accent, id) +
      tableBlock(w, 140, seed, accent, "LOAD · LANE · SLA · STATUS") +
      svgClose();
  },
  onboarding(w, h, o, seed, id) {
    const accent = C.blue;
    const pct = 55 + (seed % 35);
    const steps = pick(seed, [
      ["Connect ledger", "Invite admin", "First payroll run", "Set permissions"],
      ["Verify domain", "Import team", "Configure roles", "Go live"],
      ["Link bank", "Add entities", "Run test cycle", "Enable sync"],
    ]);
    const side = seed % 2 === 0;
    return svgOpen(w, h, o.subtitle || "Onboarding flow", id) +
      chromeBar(w, o.title || "Onboarding", accent, id) +
      (side
        ? `<rect x="18" y="64" width="${w * 0.4}" height="${h - 90}" fill="${C.ink2}" stroke="${C.line}"/>
<circle cx="${w * 0.2}" cy="130" r="34" fill="none" stroke="${accent}" stroke-width="3" stroke-dasharray="${pct * 2} 80"/>
<text x="${w * 0.2}" y="136" text-anchor="middle" fill="${C.white}" font-size="17" font-weight="700">${pct}%</text>`
        : `<rect x="${w * 0.55}" y="64" width="${w * 0.4}" height="${h - 90}" fill="${C.ink2}" stroke="${C.line}"/>
<text x="${w * 0.75}" y="120" fill="${C.dim}" font-family="ui-monospace,monospace" font-size="9">FIRST VALUE</text>
<rect x="${w * 0.6}" y="140" width="${w * 0.3}" height="12" fill="${accent}" opacity="0.8"/>`) +
      steps.map((s, i) => {
        const x = side ? w * 0.52 : 18;
        const yy = 72 + i * 54;
        return `<rect x="${x}" y="${yy}" width="${w * 0.42}" height="42" fill="${i < 2 ? C.ink2 : C.ink}" stroke="${i === 1 ? accent : C.line}"/>
<circle cx="${x + 16}" cy="${yy + 21}" r="5" fill="${i < 2 ? C.lime : "none"}" stroke="${i < 2 ? C.lime : C.dim}"/>
<text x="${x + 28}" y="${yy + 25}" fill="${C.text}" font-size="12.5">${esc(s)}</text>`;
      }).join("") +
      svgClose();
  },
  reconciliation(w, h, o, seed, id) {
    const accent = C.green;
    return svgOpen(w, h, o.subtitle || "Reconciliation", id) +
      chromeBar(w, o.title || "Reconciliation hub", accent, id) +
      tableBlock(w, 58, seed, accent, "REF · SOURCE · DELTA · STATE") +
      `<rect x="18" y="${h - 68}" width="${w - 36}" height="40" fill="${C.ink2}" stroke="${C.line}"/>
<text x="32" y="${h - 42}" fill="${C.dim}" font-family="ui-monospace,monospace" font-size="10">AUDIT TRAIL · ${pick(seed, ["2m", "5m", "8m"])} since sync</text>` +
      svgClose();
  },
  mobile(w, h, o, seed, id) {
    const accent = pick(seed, [C.violet, C.blue, C.green]);
    const dual = seed % 3 === 0;
    const pw = Math.min(200, w * 0.26);
    const ph = h - 110;
    let phones = `<rect x="${w * 0.34}" y="68" width="${pw}" height="${ph}" rx="22" fill="${C.ink2}" stroke="${C.line}" stroke-width="2"/>
<rect x="${w * 0.34 + 14}" y="98" width="${pw - 28}" height="7" rx="2" fill="${C.line}"/>
<rect x="${w * 0.34 + 14}" y="118" width="${pw - 28}" height="44" rx="5" fill="${C.ink}"/>
<rect x="${w * 0.34 + 14}" y="174" width="${pw - 28}" height="44" rx="5" fill="${C.ink}"/>
<rect x="${w * 0.34 + 14}" y="${ph - 8}" width="${pw - 28}" height="32" rx="5" fill="${accent}" opacity="0.85"/>`;
    if (dual) phones += `<rect x="${w * 0.58}" y="88" width="${pw * 0.85}" height="${ph * 0.88}" rx="20" fill="${C.ink2}" stroke="${accent}" stroke-width="1.5" opacity="0.92"/>`;
    return svgOpen(w, h, o.subtitle || "Mobile interface", id) +
      chromeBar(w, o.title || "Mobile", accent, id) + phones + svgClose();
  },
  dashboard(w, h, o, seed, id) {
    const accent = pick(seed, [C.blue, C.amber, C.violet]);
    const bars = Array.from({ length: 7 }, (_, i) => 0.25 + ((seed + i * 17) % 50) / 100);
    return svgOpen(w, h, o.subtitle || "Dashboard", id) +
      chromeBar(w, o.title || "Dashboard", accent, id) +
      kpis(w, seed + 3, accent, id) +
      `<rect x="18" y="142" width="${w * 0.56}" height="${h - 172}" fill="${C.ink2}" stroke="${C.line}"/>` +
      bars.map((v, i) => {
        const bx = 32 + i * ((w * 0.56 - 48) / 7);
        const bh = v * (h - 230);
        return `<rect x="${bx}" y="${h - 78 - bh}" width="24" height="${bh}" fill="${accent}" opacity="${0.55 + (i % 3) * 0.15}"/>`;
      }).join("") +
      `<rect x="${w * 0.6}" y="142" width="${w * 0.34}" height="${h - 172}" fill="${C.ink2}" stroke="${C.line}"/>
<text x="${w * 0.62}" y="168" fill="${C.dim}" font-family="ui-monospace,monospace" font-size="9">ACTIVITY</text>` +
      svgClose();
  },
  support(w, h, o, seed, id) {
    const accent = C.violet;
    return svgOpen(w, h, o.subtitle || "Support console", id) +
      chromeBar(w, o.title || "Support console", accent, id) +
      tableBlock(w, 58, seed, accent, "TICKET · TOPIC · AGE · ROUTE") + svgClose();
  },
  marketplace(w, h, o, seed, id) {
    const accent = C.amber;
    const cols = 3 + (seed % 2);
    let cards = "";
    for (let r = 0; r < 3; r++) for (let c = 0; c < cols; c++) {
      const cw = (w - 48 - (cols - 1) * 10) / cols;
      const cx = 24 + c * (cw + 10);
      const cy = 68 + r * ((h - 100) / 3);
      cards += `<rect x="${cx}" y="${cy}" width="${cw}" height="${(h - 110) / 3}" fill="${C.ink2}" stroke="${(r + c + seed) % 4 === 0 ? accent : C.line}"/>
<rect x="${cx + 10}" y="${cy + 10}" width="36" height="36" rx="4" fill="${C.line}"/>`;
    }
    return svgOpen(w, h, o.subtitle || "Marketplace", id) + chromeBar(w, o.title || "Marketplace", accent, id) + cards + svgClose();
  },
  brand(w, h, o, seed, id) {
    const initials = pick(seed, ["BL", "SC", "MK", "HV", "KR"]);
    const accent = pick(seed, ACCENTS);
    return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(o.subtitle || "Brand system")}">
<rect width="100%" height="100%" fill="${C.paper}"/>
<rect width="${w * 0.4}" height="100%" fill="${C.ink}"/>
<text x="${w * 0.2}" y="${h * 0.46}" text-anchor="middle" fill="${C.white}" font-size="${w * 0.08}" font-weight="800">${initials}</text>
<text x="${w * 0.2}" y="${h * 0.56}" text-anchor="middle" fill="${accent}" font-family="ui-monospace,monospace" font-size="11" letter-spacing="0.14em">IDENTITY</text>
<rect x="${w * 0.5}" y="${h * 0.18}" width="${w * 0.38}" height="10" fill="${C.rule}"/>
<rect x="${w * 0.5}" y="${h * 0.28}" width="${w * 0.28}" height="10" fill="${C.rule}"/>
<rect x="${w * 0.5}" y="${h * 0.48}" width="${w * 0.36}" height="${h * 0.32}" fill="#fff" stroke="${C.rule}"/></svg>`;
  },
  legacy(w, h, o, seed) {
    return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Before state">
<rect width="100%" height="100%" fill="#F3F3ED"/>
<rect x="20" y="20" width="${w - 40}" height="${h - 40}" fill="#fff" stroke="${C.rule}"/>
${Array.from({ length: 9 }, (_, i) => `<rect x="36" y="${52 + i * 34}" width="${w - 100 - (i % 3) * 40}" height="9" fill="${i % 2 ? C.rule : "#E6E6DE"}"/>`).join("")}
<text x="${w / 2}" y="${h - 32}" text-anchor="middle" fill="${C.dim}" font-family="ui-monospace,monospace" font-size="10">LEGACY WORKFLOW</text></svg>`;
  },
  modern(w, h, o, seed, id) {
    return templates.dispatch(w, h, { title: o.title || "Unified console", subtitle: o.subtitle || "After" }, seed + 99, id);
  },
  transport(w, h, o, seed, id) {
    const accent = C.amber;
    const price = 980 + (seed % 800);
    const route = pick(seed, ["LA → MIAMI", "CHI → PHX", "SEA → DEN", "ATL → DAL"]);
    return svgOpen(w, h, o.subtitle || "Transport order", id) +
      chromeBar(w, o.title || "Transport order", accent, id) +
      `<text x="32" y="98" fill="${C.white}" font-size="34" font-weight="700">$${price.toLocaleString()}</text>
<text x="32" y="124" fill="${C.dim}" font-family="ui-monospace,monospace" font-size="10">${route} · ENCLOSED</text>` +
      ["Vehicle", "Pickup", "Carrier", "Transit"].map((s, i) =>
        `<rect x="32" y="${150 + i * 54}" width="${w - 64}" height="42" fill="${C.ink2}" stroke="${i === 2 ? accent : C.line}"/>
<text x="48" y="${176 + i * 54}" fill="${C.text}" font-size="13">${s}</text>`).join("") +
      svgClose();
  },
  founder(w, h) {
    return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="KRIVA Technologies product studio">
<rect width="100%" height="100%" fill="${C.ink}"/>
<rect y="${h * 0.64}" width="${w}" height="${h * 0.36}" fill="${C.ink2}"/>
<circle cx="${w / 2}" cy="${h * 0.36}" r="${w * 0.14}" fill="none" stroke="${C.amber}" stroke-width="2"/>
<text x="${w / 2}" y="${h * 0.38}" text-anchor="middle" fill="${C.white}" font-size="${w * 0.12}" font-weight="800">K</text>
<text x="${w / 2}" y="${h * 0.78}" text-anchor="middle" fill="${C.amber}" font-family="ui-monospace,monospace" font-size="11" letter-spacing="0.14em">KRIVA · STUDIO</text>
<text x="${w / 2}" y="${h * 0.84}" text-anchor="middle" fill="${C.dim}" font-size="14">Design engineering · remote-first</text></svg>`;
  },
  editorial(w, h, o, seed) {
    const accent = pick(seed, ACCENTS);
    return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(o.headline || "Insights")}">
<rect width="100%" height="100%" fill="${C.paper}"/>
<rect width="6" height="100%" fill="${accent}"/>
<text x="44" y="${h * 0.38}" fill="${C.ink}" font-size="${Math.min(44, w * 0.055)}" font-weight="800" letter-spacing="-0.03em">${esc(o.headline || "Insights")}</text>
<text x="44" y="${h * 0.5}" fill="${C.dim}" font-family="ui-monospace,monospace" font-size="11" letter-spacing="0.13em">${esc((o.tag || "Editorial").toUpperCase())}</text></svg>`;
  },
};

// Asset list — same paths as before
const ASSETS = require("./content/visual-assets-manifest.cjs");

function localPath(publicPath) {
  if (publicPath.startsWith("/brand/")) return path.join(ROOT, publicPath.slice(1));
  return path.join(ROOT, "media", publicPath.slice(1));
}

let n = 0;
for (const a of ASSETS) {
  const seed = seedOf(a.path);
  const id = uid(a.path);
  const fn = templates[a.t];
  if (!fn) { console.warn("skip", a.t, a.path); continue; }
  const svg = fn(a.w, a.h, a.opts || {}, seed, id);
  const fp = localPath(a.path);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, svg);
  n++;
}
console.log(`Regenerated ${n} premium SVG visuals (seeded, no watermarks)`);
