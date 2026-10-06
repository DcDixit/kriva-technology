/* Injects the GA4 loader into every page. Idempotent. */
const fs = require('fs');
const path = require('path');

const START = '<!-- KRIVA_GA_START -->';
const END = '<!-- KRIVA_GA_END -->';
const MEASUREMENT_ID = 'G-FHG12KTF8C';
const BLOCK = [
  START,
  '<link rel="preconnect" href="https://www.googletagmanager.com">',
  '<link rel="dns-prefetch" href="https://www.google-analytics.com">',
  '<script>',
  'window.dataLayer=window.dataLayer||[];',
  'function gtag(){dataLayer.push(arguments);}window.gtag=gtag;',
  'window.__krivaNativeReplaceState=History.prototype.replaceState;',
  "gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted',functionality_storage:'granted',security_storage:'granted'});",
  '(function(){',
  `var id='${MEASUREMENT_ID}';`,
  "var debug=/(?:^|[?&])ga_debug=1(?:&|$)/.test(location.search);",
  "var local=location.hostname==='localhost'||location.hostname==='127.0.0.1';",
  "var optedOut=!!window['ga-disable-'+id];",
  "gtag('js',new Date());",
  "if(optedOut)gtag('consent','update',{analytics_storage:'denied'});",
  'if(optedOut||(local&&!debug))return;',
  "var cfg={allow_google_signals:false,allow_ad_personalization_signals:false,send_page_view:true,cookie_flags:'SameSite=Lax;Secure',page_location:location.origin+location.pathname+location.search};",
  'if(debug)cfg.debug_mode=true;',
  "gtag('config',id,cfg);",
  '})();',
  '</script>',
  `<script async src="https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}"></script>`,
  '<script src="/shared/analytics.js?v=20261006a" defer></script>',
  END,
].join('\n');

const CHROME = '<script src="/shared/chrome.js" defer></script>';
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
  } else if (src.includes(CHROME)) {
    out = src.replace(CHROME, `${CHROME}\n${BLOCK}`);
    injected++;
  } else {
    console.warn(`SKIP (no chrome.js): ${file}`);
    skipped++;
    continue;
  }

  if (out !== src) fs.writeFileSync(file, out);
}

console.log(`${files.length} pages scanned · ${injected} injected · ${replaced} refreshed · ${skipped} skipped`);
