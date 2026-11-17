// Verifies the /contact studio clock, visitor clock, and reply-by date under fixed instants and time zones.
// Expected values are computed independently here (not by calling the page code). Usage: node _qa_contact_clock.cjs
const puppeteer = require('puppeteer');
const BASE = 'http://localhost:5177';
const fmtTime = (d, tz) => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz }).format(d);
// Reply-by: IST calendar date of the instant, then the next Mon-Fri.
function expectedReply(d) {
  const ist = new Date(d.getTime() + 5.5 * 3600e3); // IST has no DST
  const x = new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate(), 12));
  do x.setUTCDate(x.getUTCDate() + 1); while ([0, 6].includes(x.getUTCDay()));
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(x);
}
const cases = [
  ['Mon 10:00 IST', '2026-11-16T04:30:00Z', 'America/New_York'],
  ['Thu 23:50 IST (just before midnight)', '2026-11-19T18:20:00Z', 'Europe/London'],
  ['Fri 18:00 IST → Monday', '2026-11-20T12:30:00Z', 'America/Chicago'],
  ['Fri 23:59 IST → Monday', '2026-11-20T18:29:00Z', 'America/Los_Angeles'],
  ['Sat 00:01 IST (visitor still Fri) → Monday', '2026-11-20T18:31:00Z', 'America/New_York'],
  ['Sun 15:00 IST → Monday', '2026-11-22T09:30:00Z', 'Australia/Sydney'],
  ['Sydney already Tue, IST Mon', '2026-11-23T14:00:00Z', 'Australia/Sydney'],
  ['US DST spring-forward day', '2026-03-08T15:00:00Z', 'America/New_York'],
  ['Year end Thu Dec 31', '2026-12-31T06:00:00Z', 'Asia/Dubai'],
  ['Same zone as studio', '2026-11-17T09:00:00Z', 'Asia/Kolkata'],
];
(async () => {
  const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  let fail = 0;
  for (const [name, iso, tz] of cases) {
    const p = await b.newPage();
    await p.emulateTimezone(tz);
    const t0 = Date.parse(iso);
    await p.evaluateOnNewDocument((t0) => {
      const Real = Date, start = Real.now();
      const now = () => t0 + (Real.now() - start);
      class FakeDate extends Real { constructor(...a) { super(...(a.length ? a : [now()])); } static now() { return now(); } }
      window.Date = FakeDate;
    }, t0);
    await p.setRequestInterception(true);
    p.on('request', (r) => (r.url().startsWith(BASE) ? r.continue() : r.abort()));
    await p.goto(BASE + '/contact', { waitUntil: 'networkidle2' });
    const got = await p.evaluate(() => ({
      studio: document.querySelector('[data-ct-studio]').textContent,
      local: document.querySelector('[data-ct-local]').textContent,
      tz: document.querySelector('[data-ct-tz]').textContent,
      reply: [...document.querySelectorAll('[data-ct-reply]')].map((e) => e.textContent)
    }));
    const d = new Date(t0);
    const exp = { studio: fmtTime(d, 'Asia/Kolkata'), local: fmtTime(d, tz), reply: expectedReply(d) };
    const good = got.studio === exp.studio && got.local === exp.local && got.reply.every((r) => r === exp.reply);
    if (!good) fail++;
    console.log((good ? '✓ ' : '✗ ') + name.padEnd(44) + ` [${tz}] studio ${got.studio} · you ${got.local} (${got.tz}) · reply by ${got.reply[0]}` + (good ? '' : `   EXPECTED ${JSON.stringify(exp)}`));
    await p.close();
  }
  await b.close();
  console.log(fail ? fail + ' failed' : 'all clock cases correct');
  process.exit(fail ? 1 : 0);
})();
