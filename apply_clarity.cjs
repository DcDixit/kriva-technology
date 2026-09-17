/* Injects Microsoft Clarity into every page. Idempotent. */
const fs = require('fs');

const START = '<!-- KRIVA_CLARITY_START -->';
const END = '<!-- KRIVA_CLARITY_END -->';
const GA_END = '<!-- KRIVA_GA_END -->';
const BLOCK = [
  START,
  '<script type="text/javascript">',
  '    (function(c,l,a,r,i,t,y){',
  '        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};',
  '        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;',
  '        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);',
  '    })(window, document, "clarity", "script", "yjj9g3gojt");',
  '</script>',
  END,
].join('\n');

const files = fs
  .readdirSync(process.cwd())
  .filter((f) => f === '404.html' || /^kriva-.*\.html$/.test(f));

let injected = 0;
let replaced = 0;
let skipped = 0;

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  let out = src;

  if (src.includes(START)) {
    out = src.replace(new RegExp(`${START}[\\s\\S]*?${END}`), BLOCK);
    if (out !== src) replaced++;
  } else if (src.includes(GA_END)) {
    out = src.replace(GA_END, `${GA_END}\n${BLOCK}`);
    injected++;
  } else {
    console.warn(`SKIP (no GA block): ${file}`);
    skipped++;
    continue;
  }

  if (out !== src) fs.writeFileSync(file, out);
}

console.log(`${files.length} pages scanned · ${injected} injected · ${replaced} refreshed · ${skipped} skipped`);
