/* Tawk.to was removed from the site. This script only strips leftover blocks.
   It does not inject a chat widget. */
const fs = require("fs");

const START = "<!-- KRIVA_TAWK_START -->";
const END = "<!-- KRIVA_TAWK_END -->";

const files = fs
  .readdirSync(process.cwd())
  .filter((f) => f === "404.html" || /^kriva-.*\.html$/.test(f));

let stripped = 0;
for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  const out = src.replace(new RegExp(`\\s*${START}[\\s\\S]*?${END}\\s*`, "g"), "\n");
  if (out !== src) {
    fs.writeFileSync(file, out);
    stripped++;
  }
}

console.log(`${files.length} pages scanned · ${stripped} tawk blocks removed`);
