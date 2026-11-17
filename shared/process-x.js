/* KRIVA · Process page motion (body.svx-proc). Runs beside the shared services-x.js, which
   already handles reveals, split headlines, cursor, magnets, spotlights, rail, progress and FAQ.
   This file adds: the hero gate instrument, the signing card that follows the phase path,
   and the live local clocks. Everything stays readable without JS or with reduced motion. */
(function () {
  'use strict';
  const body = document.body;
  if (!body || !body.classList.contains('svx-proc')) return;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ── Hero: gate instrument. Week 1–12 plus "after launch"; week 6 is the static state. ── */
  const inst = $('[data-pcx-inst]');
  if (inst) {
    const rows = $$('.pcx-spine li', inst);
    const wkEl = $('[data-pcx-wk]', inst);
    const nextEl = $('[data-pcx-next]', inst);
    const head = $('.pcx-head', inst);
    const P = [
      { s: 1, e: 2, gate: true }, { s: 3, e: 7, gate: true },
      { s: 8, e: 11, build: true }, { s: 12, e: 12, launch: true }, { s: 13, e: 13, support: true }
    ];
    const paint = (w) => {
      inst.setAttribute('data-wk', w);
      if (wkEl) wkEl.textContent = Math.min(w, 12);
      if (head) head.style.setProperty('--wk', Math.min(w, 12.45));
      let next = '';
      rows.forEach((li, i) => {
        const p = P[i];
        const lab = $('[data-st-label]', li);
        let st, t;
        if (p.support) { st = w >= 13 ? 'on' : 'choice'; t = 'Choice'; }
        else if (w > p.e) { st = 'done'; t = p.build ? 'Shipped' : p.launch ? 'Live' : 'Signed'; }
        else if (w >= p.s) {
          st = 'on';
          t = p.build ? 'Demo ' + (w - p.s + 1) : p.launch ? 'Checklist' : 'Open';
        } else { st = p.launch ? 'hold' : 'q'; t = p.launch ? 'Hold' : 'Queued'; }
        li.setAttribute('data-st', st);
        if (lab) lab.textContent = t;
        if (st === 'on' && !next) {
          next = p.gate ? (w >= p.e - 1 ? 'Next: Fri sign-off' : 'Next: weekly demo')
            : p.build ? 'Next: weekly demo' : p.launch ? 'Next: go-live checklist' : 'Next: retain or handoff';
        }
      });
      if (nextEl) nextEl.textContent = next;
    };
    paint(6);
    if (!reduce()) {
      let w = 6, t = 0, hold = 0, visible = false;
      const step = () => {
        clearTimeout(t);
        if (!visible) return;
        t = setTimeout(() => {
          if (Date.now() < hold) { step(); return; }
          w = w >= 13 ? 1 : w + 1;
          paint(w);
          step();
        }, w === 2 || w === 7 || w === 12 ? 2400 : w === 13 ? 3200 : 1400);
      };
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; step(); }, { threshold: 0.3 }).observe(inst);
      rows.forEach((li, i) => {
        const b = $('.pcx-row', li);
        if (b) b.addEventListener('click', () => { w = P[i].s; hold = Date.now() + 6000; paint(w); step(); });
      });
    } else {
      rows.forEach((li, i) => {
        const b = $('.pcx-row', li);
        if (b) b.addEventListener('click', () => paint(P[i].s));
      });
    }
  }

  /* ── Phases: the path fill, the current card, and the signing card ── */
  const path = $('#prcPath');
  const fill = $('#prcFill');
  const steps = $$('#prcPath .pcx-phase');
  const sign = $('#prcSign');
  const title = $('#prcSignTitle');
  const meta = $('#prcSignMeta');
  const num = $('[data-pcx-n]');
  const stamp = sign ? $('.pcx-stamp', sign) : null;
  const dots = sign ? $$('.pcx-sign-dots li', sign) : [];
  const stamps = ['Signed', 'Signed', 'Weekly', 'Go-live', 'Your call'];
  let cur = -1, swapT = 0;
  const setSign = (i) => {
    if (i === cur || !sign) return;
    cur = i;
    const s = steps[i];
    const gate = s.getAttribute('data-gate') === '1';
    sign.classList.remove('is-gate', 'is-stamped');
    if (!reduce()) sign.classList.add('is-swap');
    clearTimeout(swapT);
    swapT = setTimeout(() => {
      if (title) title.textContent = s.getAttribute('data-sign') || '';
      if (meta) meta.textContent = s.getAttribute('data-meta') || '';
      if (num) num.textContent = String(i + 1).padStart(2, '0');
      if (stamp) stamp.textContent = stamps[i];
      sign.classList.remove('is-swap');
      void sign.offsetWidth;
      if (gate) sign.classList.add('is-gate');
      sign.classList.add('is-stamped');
    }, reduce() ? 0 : 220);
    dots.forEach((d, j) => d.classList.toggle('on', j <= i));
    steps.forEach((st, j) => st.classList.toggle('is-cur', j === i));
  };
  if (path && steps.length) {
    let ticking = false;
    const run = () => {
      ticking = false;
      const vh = innerHeight;
      const line = vh * (innerWidth <= 1000 ? 0.55 : 0.45);
      const r = path.getBoundingClientRect();
      const p = reduce() ? 1 : clamp((line - r.top) / Math.max(r.height - 40, 1));
      if (fill) fill.style.height = (p * 100).toFixed(2) + '%';
      let active = 0;
      steps.forEach((s, i) => {
        const reached = s.getBoundingClientRect().top < line;
        s.classList.toggle('on', reduce() || reached);
        if (reached) active = i;
      });
      setSign(active);
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    addEventListener('resize', run, { passive: true });
    run();
  }

  /* ── Cadence: live local clocks (real time zones, no claims about hours) ── */
  const clocks = $$('.pcx-clocks li[data-tz]');
  if (clocks.length && typeof Intl !== 'undefined') {
    const tick = () => {
      const now = new Date();
      clocks.forEach((li) => {
        try {
          const tz = li.getAttribute('data-tz');
          const parts = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(now);
          const h = +parts.find((p) => p.type === 'hour').value;
          const m = parts.find((p) => p.type === 'minute').value;
          $('b', li).textContent = String(h % 24).padStart(2, '0') + ':' + m;
          li.classList.toggle('is-day', h >= 9 && h < 18);
        } catch (e) { /* unsupported zone: keep the placeholder */ }
      });
    };
    tick();
    setInterval(tick, 30000);
  }
})();
