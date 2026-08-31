const fs = require("fs");
const files = fs.readdirSync(".").filter((f) => /^kriva-case-.*\.html$/.test(f));
for (const f of files) {
  let h = fs.readFileSync(f, "utf8");
  const orig = h;
  if (!/"image"\s*:/.test(h)) {
    h = h.replace(
      /("description":\s*"[^"]+",)\s*("author")/,
      `$1\n  "image": "https://krivatechnologies.com/brand/og-default.png",\n  $2`
    );
    h = h.replace(
      /"publisher":\{"@type":"Organization","name":"KRIVA Technologies"\},\s*"mainEntityOfPage":/,
      '"image":"https://krivatechnologies.com/brand/og-default.png","publisher":{"@type":"Organization","name":"KRIVA Technologies","url":"https://krivatechnologies.com"},"mainEntityOfPage":'
    );
  }
  if (h !== orig) {
    fs.writeFileSync(f, h);
    console.log("updated", f);
  } else {
    console.log("skip", f);
  }
}
