/* Builds shared/home.bundle.css: the homepage's stylesheets in cascade order, comments and
   whitespace stripped, so the homepage ships one render-blocking CSS request instead of ten.
   Source files stay the edit surface: after changing any of them, run `npm run build:home-css`.
   It also rewrites the homepage <link> tags and the bundle's ?v= hash. */
const fs = require('fs');
const crypto = require('crypto');
const PAGE = 'kriva-redesign.html';
const ORDER = ['tokens', 'home', 'home-art', 'home-next', 'product-ui', 'page-inquiry', 'slot-assets', 'system', 'responsive', 'chrome'];

function minify(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,>])\s*/g, '$1')
    .replace(/:\s+/g, ':')
    .replace(/;}/g, '}')
    .trim();
}

/* Drop rules whose class/id selectors never appear in the page markup or its scripts.
   Conservative: a rule goes only when EVERY selector in its list names an absent class/id. */
function corpus() {
  const files = [PAGE, ...fs.readdirSync('shared').filter((f) => f.endsWith('.js')).map((f) => `shared/${f}`)];
  const words = new Set();
  for (const f of files) for (const w of fs.readFileSync(f, 'utf8').match(/[A-Za-z_][\w-]*/g) || []) words.add(w);
  return words;
}
function splitTop(css) {
  const parts = [];
  let depth = 0, start = 0;
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { parts.push(css.slice(start, i + 1)); start = i + 1; } }
    else if (c === ';' && depth === 0) { parts.push(css.slice(start, i + 1)); start = i + 1; }
  }
  if (start < css.length) parts.push(css.slice(start));
  return parts;
}
function prune(css, words) {
  return splitTop(css).map((blk) => {
    const open = blk.indexOf('{');
    if (open < 0) return blk;
    const head = blk.slice(0, open), body = blk.slice(open + 1, -1);
    if (head.startsWith('@')) {
      if (/^@(media|supports|layer)/.test(head)) { const inner = prune(body, words); return inner ? `${head}{${inner}}` : ''; }
      return blk;
    }
    const dead = (sel) => [...sel.matchAll(/[.#]([A-Za-z_][\w-]*)/g)].some((m) => !words.has(m[1]));
    return head.split(',').every(dead) ? '' : blk;
  }).join('');
}
const words = corpus();
const out = ORDER.map((n) => prune(minify(fs.readFileSync(`shared/${n}.css`, 'utf8')), words)).join('\n');
fs.writeFileSync('shared/home.bundle.css', out);
const hash = crypto.createHash('sha1').update(out).digest('hex').slice(0, 8);

let html = fs.readFileSync(PAGE, 'utf8');
const bundleTag = `<link rel="stylesheet" href="/shared/home.bundle.css?v=${hash}">`;
if (/home\.bundle\.css/.test(html)) {
  html = html.replace(/<link rel="stylesheet" href="\/shared\/home\.bundle\.css[^"]*">/, bundleTag);
} else {
  let first = true;
  html = html.replace(/<link rel="stylesheet" href="\/shared\/(tokens|home|home-art|home-next|product-ui|page-inquiry|slot-assets|system|responsive|chrome)\.css[^"]*">\r?\n?/g, () => {
    if (first) { first = false; return bundleTag + '\n'; }
    return '';
  });
}
fs.writeFileSync(PAGE, html);
console.log(`home.bundle.css ${out.length} bytes (v=${hash})`);
