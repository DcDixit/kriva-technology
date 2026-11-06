#!/usr/bin/env node
/** Render brand/og-default.png from the full logo master file. */
const fs = require("fs");
const path = require("path");
const { Resvg } = require("@resvg/resvg-js");

const LOGO_ART = fs.readFileSync(path.join(__dirname, 'brand/logos/kriva-lockup-inverse.svg'), 'utf8').match(/<g[\s\S]*<\/svg>/)[0].replace('</svg>', '');
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0E1216"/>
  <rect x="80" y="78" width="48" height="1" fill="#DB9B1F"/>
  <g transform="translate(${80 - 10.5 * 1.1},${170 - 6.3 * 1.1}) scale(1.1)">${LOGO_ART}</g>
  <text x="80" y="512" fill="#8C98A4" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="17" letter-spacing="4">DESIGN ENGINEERING  ·  SAAS &amp; TRUCKING</text>
</svg>`;

const png = new Resvg(svg, {
  fitTo: { mode: "width", value: 1200 },
  font: { loadSystemFonts: true },
}).render().asPng();

const out = path.join(__dirname, "brand", "og-default.png");
fs.writeFileSync(out, png);
console.log("wrote", out, png.length, "bytes");
