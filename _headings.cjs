const fs = require('fs');
const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

for (const f of process.argv.slice(2)) {
  const src = fs.readFileSync(f, 'utf8');
  const heads = [...src.matchAll(/<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/gi)];
  console.log(`\n===== ${f} =====`);
  let prev = 0;
  heads.forEach((m) => {
    const lvl = +m[1];
    const jump = prev && lvl > prev + 1 ? '  <<< JUMP' : '';
    const cls = (m[2].match(/class="([^"]*)"/) || [])[1] || '';
    console.log(`${' '.repeat((lvl - 1) * 2)}H${lvl} [${cls}] ${strip(m[3]).slice(0, 62)}${jump}`);
    prev = lvl;
  });
}
