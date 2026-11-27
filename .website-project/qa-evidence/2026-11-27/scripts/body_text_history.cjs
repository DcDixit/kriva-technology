/* For an article file, list every commit where the article's reading text (h1/h2/h3/p/li inside the body) changed,
   with counts of added/removed blocks and a sample. Ignores head, scripts, styles, nav/footer/CTA chrome.
   Usage: node body_text_history.cjs <repoDir> <file> */
const { execSync } = require('child_process');
const [DIR, FILE] = process.argv.slice(2);
const sh = c => execSync(c, { cwd: DIR, maxBuffer: 256 * 1024 * 1024 }).toString();
const commits = sh(`git log --reverse --format=%h -- ${FILE}`).trim().split('\n');
const blocks = html => {
  let s = html.replace(/<head[\s\S]*?<\/head>/i, '').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
  s = s.replace(/<(nav|footer)[\s\S]*?<\/\1>/gi, '');
  const start = s.search(/class="(?:ix-)?prose|<article/); if (start > 0) s = s.slice(start);
  const end = s.search(/class="related|id="related|class="cta-band|class="ix-cta|<footer/); if (end > 0) s = s.slice(0, end);
  const out = [];
  for (const m of s.matchAll(/<(h[1-3]|p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const t = m[2].replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&rsquo;|&#8217;/g, '’').replace(/&mdash;/g, '—').replace(/\s+/g, ' ').trim();
    if (t.split(' ').length >= 4) out.push(t);
  }
  return out;
};
let prev = null;
for (const c of commits) {
  const cur = new Set(blocks(sh(`git show ${c}:${FILE}`)));
  const meta = sh(`git log -1 --format="%ad %s" --date=short ${c}`).trim().slice(0, 95);
  if (!prev) { console.log(`${c} ${meta}\n    first version: ${cur.size} text blocks`); prev = cur; continue; }
  const added = [...cur].filter(x => !prev.has(x)), removed = [...prev].filter(x => !cur.has(x));
  if (added.length || removed.length) {
    console.log(`${c} ${meta}\n    text blocks: +${added.length} / -${removed.length}  (of ${cur.size})`);
    added.slice(0, 2).forEach(a => console.log('      + ' + a.slice(0, 120)));
    removed.slice(0, 1).forEach(a => console.log('      - ' + a.slice(0, 120)));
  }
  prev = cur;
}
