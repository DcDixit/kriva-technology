// Builds before/after comparison sheets for /contact from _shots/contact/{before,desktop-1440,mobile-390}.
// Output: _shots/contact/compare/{hero,full}-{1440,390}.png   Usage: node _shots_contact_compare.cjs
const fs = require('fs'), path = require('path'), sharp = require('sharp');
const D = path.join('_shots', 'contact'), OUT = path.join(D, 'compare');
fs.mkdirSync(OUT, { recursive: true });
const frames = (dir) => fs.readdirSync(dir).filter((f) => f.endsWith('.png')).sort().map((f) => path.join(dir, f));
const label = (text, w) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="56"><rect width="100%" height="100%" fill="#0F1C2E"/><text x="20" y="37" font-family="Segoe UI, Arial" font-size="24" font-weight="700" fill="#fff">${text}</text></svg>`);
async function column(files, scale, title) {
  const m = await sharp(files[0]).metadata();
  const w = Math.round(m.width * scale), h = Math.round(m.height * scale);
  const parts = [{ input: label(title, w), left: 0, top: 0 }];
  for (let i = 0; i < files.length; i++) parts.push({ input: await sharp(files[i]).resize(w, h).toBuffer(), left: 0, top: 56 + i * (h + 8) });
  return { w, h: 56 + files.length * (h + 8), parts };
}
async function sheet(pairs, scale, out) {
  const cols = [];
  for (const [files, title] of pairs) cols.push(await column(files, scale, title));
  const W = cols.reduce((a, c) => a + c.w, 0) + 24 * (cols.length + 1), H = Math.max(...cols.map((c) => c.h)) + 48;
  let x = 24; const comp = [];
  for (const c of cols) { c.parts.forEach((p) => comp.push({ ...p, left: p.left + x, top: p.top + 24 })); x += c.w + 24; }
  await sharp({ create: { width: W, height: H, channels: 3, background: '#E6E9EE' } }).composite(comp).png().toFile(out);
  console.log('wrote', out, W + 'x' + H);
}
(async () => {
  for (const [tag, w, s] of [['desktop-1440', '1440', 0.5], ['mobile-390', '390', 0.75]]) {
    const b = frames(path.join(D, 'before', tag)), a = frames(path.join(D, tag));
    await sheet([[b.slice(0, 1), 'BEFORE · ' + w + 'px · first screen'], [a.slice(0, 1), 'AFTER · ' + w + 'px · first screen']], w === '1440' ? 0.6 : 1, path.join(OUT, 'hero-' + w + '.png'));
    await sheet([[b, 'BEFORE · ' + w + 'px · full page'], [a, 'AFTER · ' + w + 'px · full page']], s, path.join(OUT, 'full-' + w + '.png'));
  }
})().catch((e) => { console.error(e); process.exit(1); });
