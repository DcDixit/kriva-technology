#!/usr/bin/env node
/** Add twitter:title and twitter:description from OG tags where missing. */
const fs = require("fs");

function metaContent(html, property) {
  const re = new RegExp(
    `<meta\\s+(?:property|name)="${property}"\\s+content="([^"]*)"`,
    "i"
  );
  const m = html.match(re);
  return m ? m[1] : null;
}

function hasMeta(html, property) {
  return new RegExp(
    `<meta\\s+(?:property|name)="${property}"\\s+content=`,
    "i"
  ).test(html);
}

let updated = 0;
for (const file of fs.readdirSync(".").filter((f) => f.endsWith(".html") && f !== "404.html")) {
  let html = fs.readFileSync(file, "utf8");
  const orig = html;
  const ogTitle = metaContent(html, "og:title");
  const ogDesc = metaContent(html, "og:description");

  if (ogTitle && !hasMeta(html, "twitter:title")) {
    html = html.replace(
      /(<meta\s+name="twitter:card"\s+content="[^"]*">)/i,
      `$1\n<meta name="twitter:title" content="${ogTitle}">`
    );
  }
  if (ogDesc && !hasMeta(html, "twitter:description")) {
    const insertAfter = hasMeta(html, "twitter:title")
      ? /<meta\s+name="twitter:title"\s+content="[^"]*">/i
      : /<meta\s+name="twitter:card"\s+content="[^"]*">/i;
    html = html.replace(
      insertAfter,
      (m) => `${m}\n<meta name="twitter:description" content="${ogDesc}">`
    );
  }

  if (html !== orig) {
    fs.writeFileSync(file, html);
    updated++;
    console.log("  " + file);
  }
}
console.log("Added Twitter meta to " + updated + " page(s).");
