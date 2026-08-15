const fs = require("fs");
const files = fs.readdirSync(".").filter((f) => /^kriva-.*\.html$/.test(f));
let n = 0;
const re = /background:\s*\n\s*radial-gradient\([\s\S]*?var\(--paper\);/g;
for (const f of files) {
  const s = fs.readFileSync(f, "utf8");
  const t = s.replace(re, "background:var(--paper);");
  if (t !== s) {
    fs.writeFileSync(f, t);
    n++;
    console.log("fixed", f);
  }
}
console.log("count", n);
