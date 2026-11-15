/** Render brand/logos/kriva-email-logo.png for inquiry emails (Gmail does not display SVG). */
const fs = require("fs");
const path = require("path");
const { Resvg } = require("@resvg/resvg-js");

const svg = fs.readFileSync(path.join(__dirname, "brand/logos/kriva-lockup.svg"), "utf8");
const png = new Resvg(svg, {
  fitTo: { mode: "width", value: 480 },
  background: "#FFFFFF",
}).render().asPng();
fs.writeFileSync(path.join(__dirname, "brand/logos/kriva-email-logo.png"), png);
console.log("kriva-email-logo.png", png.length, "bytes");
