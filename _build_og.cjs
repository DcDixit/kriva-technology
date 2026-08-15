#!/usr/bin/env node
/** Render brand/og-default.png from the real inverse wordmark geometry. */
const fs = require("fs");
const path = require("path");
const { Resvg } = require("@resvg/resvg-js");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0E1216"/>
  <rect x="80" y="78" width="48" height="1" fill="#DB9B1F"/>
  <g transform="translate(80,208) scale(0.78)">
    <rect x="7" y="10" width="48" height="174" fill="#FFFFFF"/>
    <polygon points="159,10 224,10 129,95 63,95" fill="#1551F9"/>
    <polygon points="64,95 128,95 224,184 160,184" fill="#FFFFFF"/>
    <rect x="252" y="10" width="47" height="174" fill="#FFFFFF"/>
    <path fill="#FFFFFF" fill-rule="evenodd" d="M299 10 H400 C448 10 466 30 466 62 C466 90 446 104 392 104 H299 Z M299 40 H384 C416 40 430 50 430 66 C430 84 416 92 382 92 H299 Z"/>
    <polygon points="338,104 416,184 473,184 390,104" fill="#FFFFFF"/>
    <rect x="495" y="10" width="46" height="174" fill="#FFFFFF"/>
    <path fill="#FFFFFF" d="M560 10 H614 L689 168 L769 10 H826 L698 184 H680 Z"/>
    <path fill="#FFFFFF" d="M887 10 H891 L1002 184 H948 L889 76 L808 184 H754 Z"/>
  </g>
  <text x="80" y="512" fill="#8C98A4" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="17" letter-spacing="4">DESIGN ENGINEERING  ·  SAAS &amp; TRUCKING</text>
</svg>`;

const png = new Resvg(svg, {
  fitTo: { mode: "width", value: 1200 },
  font: { loadSystemFonts: true },
}).render().asPng();

const out = path.join(__dirname, "brand", "og-default.png");
fs.writeFileSync(out, png);
console.log("wrote", out, png.length, "bytes");
