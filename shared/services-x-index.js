/* KRIVA Services · "svx" layer · Services overview hub (body.svx-index).
   Loaded after services-x.js (which owns reveals, cursor, rail, FAQ, progress and [data-steps]).
   This file: the hero engagement composer, the service directory preview and filter, the
   SaaS / Dashboards / Mobile tabs (moved from the old inline script), the first-run flow,
   the ShiftRail board, and the 12-week ruler gates. Everything works by click and keyboard;
   under reduced motion nothing loops and every widget shows a finished state. */
(function () {
  'use strict';
  const body = document.body;
  if (!body || !body.classList.contains('svx-index')) return;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const whenVisible = (el, on, off, threshold = 0.3) => {
    if (!el) return;
    new IntersectionObserver(([e]) => (e.isIntersecting ? on() : off && off()), { threshold }).observe(el);
  };
  /* Tablist keyboard: arrows, Home, End move focus and select */
  const tabKeys = (tabs, select) => tabs.forEach((t, i) => t.addEventListener('keydown', (e) => {
    let n = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = tabs.length - 1;
    if (n === null) return;
    e.preventDefault(); tabs[n].focus(); select(n, true);
  }));

  /* ── Hero: engagement composer ── */
  const comp = $('[data-svi-comp]');
  if (comp) {
    const tabs = $$('[role="tab"]', comp);
    const panel = $('[role="tabpanel"]', comp);
    const board = $('.svi-board', comp);
    const blocks = $$('.svi-board b', comp);
    const svg = $('.svi-thread', comp);
    const path = svg && $('path', svg);
    const out = $('[data-svi-out]', comp);
    const num = $('[data-svi-n]', comp);
    const combos = [
      { k: ['crm', 'dash', 'mobile'], t: 'CRM, then dashboards, then mobile. One team on one thread.' },
      { k: ['research', 'uiux', 'product'], t: 'Research, then UI/UX, then tenant-aware product design.' },
      { k: ['api', 'dash'], t: 'The connector first, then the operator view finance can finish.' }
    ];
    let cur = 0, timer = 0, pinned = false;
    const draw = () => {
      if (!path || !board) return;
      const br = board.getBoundingClientRect();
      if (!br.width) return;
      svg.setAttribute('viewBox', `0 0 ${br.width.toFixed(1)} ${br.height.toFixed(1)}`);
      const pts = combos[cur].k.map((k) => blocks.find((b) => b.dataset.k === k)).filter(Boolean).map((b) => {
        const r = b.getBoundingClientRect();
        return [r.left - br.left + r.width / 2, r.top - br.top + r.height / 2];
      });
      let d = '';
      pts.forEach((p, i) => {
        if (!i) { d = `M${p[0].toFixed(1)} ${p[1].toFixed(1)}`; return; }
        const q = pts[i - 1], my = (q[1] + p[1]) / 2;
        d += q[1] === p[1]
          ? ` C${q[0].toFixed(1)} ${(q[1] - 26).toFixed(1)} ${p[0].toFixed(1)} ${(p[1] - 26).toFixed(1)} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`
          : ` C${q[0].toFixed(1)} ${my.toFixed(1)} ${p[0].toFixed(1)} ${my.toFixed(1)} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
      });
      path.setAttribute('d', d);
      path.setAttribute('pathLength', '1');
      svg.classList.remove('is-drawn');
      if (reduce()) { svg.classList.add('is-drawn'); return; }
      void svg.getBoundingClientRect();
      requestAnimationFrame(() => svg.classList.add('is-drawn'));
    };
    const select = (i, user) => {
      cur = i;
      if (user) { pinned = true; clearInterval(timer); }
      tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(j === i)); t.tabIndex = j === i ? 0 : -1; });
      panel.setAttribute('aria-labelledby', tabs[i].id);
      comp.setAttribute('data-on', i);
      const ks = combos[i].k;
      blocks.forEach((b) => {
        const o = ks.indexOf(b.dataset.k);
        b.classList.toggle('is-on', o > -1);
        if (o > -1) { b.dataset.o = o + 1; b.style.setProperty('--o', o); } else { delete b.dataset.o; }
      });
      if (out) out.textContent = combos[i].t;
      if (num) num.textContent = ks.length;
      draw();
    };
    tabs.forEach((t, i) => t.addEventListener('click', () => select(i, true)));
    tabKeys(tabs, select);
    select(0);
    let rt = 0;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(draw, 120); }, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    if (!reduce()) {
      whenVisible(comp, () => {
        clearInterval(timer);
        if (!pinned) timer = setInterval(() => { if (!comp.contains(document.activeElement)) select((cur + 1) % combos.length); }, 4200);
      }, () => clearInterval(timer), 0.35);
      comp.addEventListener('pointerenter', () => clearInterval(timer));
    }
  }

  /* ── Directory: rows drive the preview; filter narrows the list ── */
  const dir = $('[data-svi-dir]');
  if (dir) {
    const rows = $$('.svi-row', dir);
    const pv = $('.svi-pv', dir);
    const imgs = pv ? $$('.svi-pv-media img', pv) : [];
    const minis = pv ? $$('.svi-mini', pv) : [];
    const cap = pv && $('[data-pv-cap]', pv);
    const n = pv && $('[data-pv-n]', pv);
    const g = pv && $('[data-pv-g]', pv);
    const wide = matchMedia('(min-width: 1001px)');
    let on = -1, pinnedAt = 0;
    const show = (i) => {
      if (i === on || i < 0) return;
      on = i;
      rows.forEach((r) => r.classList.toggle('is-on', +r.dataset.i === i));
      imgs.forEach((im, j) => im.classList.toggle('is-on', j === i));
      minis.forEach((m, j) => m.classList.toggle('is-on', j === i));
      if (pv) pv.setAttribute('data-on', i);
      const row = rows.find((r) => +r.dataset.i === i);
      if (cap && row) cap.textContent = $('h3', row).textContent;
      if (n) n.textContent = String(i + 1).padStart(2, '0');
      if (g && row) g.textContent = row.closest('[data-g]').dataset.g === 'build' ? 'Build' : 'Design';
    };
    rows.forEach((r) => {
      const i = +r.dataset.i;
      r.addEventListener('focus', () => { pinnedAt = Date.now(); show(i); });
      if (fine) r.addEventListener('pointerenter', () => { pinnedAt = Date.now(); show(i); });
    });
    /* Wide screens: the last visible row above the middle of the viewport drives the preview.
       Read from layout on scroll, so a fast scroll never leaves the preview stale. */
    let dt = false;
    const pick = () => {
      dt = false;
      if (!wide.matches || Date.now() - pinnedAt < 1200) return;
      const r = dir.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const line = innerHeight * 0.55;
      let best = -1;
      rows.forEach((row) => {
        if (row.closest('[data-g]').hidden) return;
        if (row.getBoundingClientRect().top < line) best = +row.dataset.i;
      });
      if (best < 0) { const first = rows.find((row) => !row.closest('[data-g]').hidden); if (first) best = +first.dataset.i; }
      show(best);
    };
    addEventListener('scroll', () => { if (!dt) { dt = true; requestAnimationFrame(pick); } }, { passive: true });
    show(0);
    const fbtns = $$('.svi-filter button', dir);
    const groups = $$('[data-g]', dir);
    fbtns.forEach((b) => b.addEventListener('click', () => {
      const f = b.dataset.f;
      fbtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      groups.forEach((gr) => { gr.hidden = f !== 'all' && gr.dataset.g !== f; });
      const first = rows.find((r) => !r.closest('[data-g]').hidden);
      on = -1; if (first) show(+first.dataset.i);
      pinnedAt = Date.now();
    }));
  }

  /* ── SaaS / Dashboards / Mobile tabs (ids and panels kept from the old page) ── */
  const stabs = $$('.svi-tabs [role="tab"]');
  if (stabs.length) {
    const map = { 'tab-saas': ['panel-saas', 'view-saas'], 'tab-dash': ['panel-dash', 'view-dash'], 'tab-mob': ['panel-mob', 'view-mob'] };
    const sel = (i) => {
      stabs.forEach((t, j) => {
        const yes = j === i;
        t.setAttribute('aria-selected', String(yes)); t.tabIndex = yes ? 0 : -1;
        (map[t.id] || []).forEach((id) => { const el = document.getElementById(id); if (el) el.hidden = !yes; });
      });
    };
    stabs.forEach((t, i) => t.addEventListener('click', () => sel(i)));
    tabKeys(stabs, sel);
    sel(0);
  }

  /* ── First-run flow: steps complete one after another while visible ── */
  const flow = $('[data-svi-flow]');
  if (flow) {
    const steps = $$('.flow-step', flow);
    let k = 1, t = 0;
    const paint = () => steps.forEach((s, i) => { s.classList.toggle('on', i <= k); s.classList.toggle('now', i === k); });
    if (reduce()) { k = steps.length - 1; paint(); steps[k].classList.remove('now'); }
    else whenVisible(flow, () => {
      clearInterval(t); k = 0; paint();
      t = setInterval(() => { k = (k + 1) % (steps.length + 1); if (k === steps.length) { steps.forEach((s) => s.classList.add('on')); steps.forEach((s) => s.classList.remove('now')); } else paint(); }, 1300);
    }, () => { clearInterval(t); k = 1; paint(); }, 0.4);
  }

  /* ── ShiftRail board: select three, assign once, one audit line ── */
  const wb = $('[data-svi-board]');
  if (wb) {
    const rs = $$('.svi-wb-r', wb);
    const cnt = $('[data-wb-n]', wb);
    const sts = rs.map((r) => $('strong', r));
    let p = 0, t = 0;
    const paint = () => {
      wb.setAttribute('data-p', p);
      const s = Math.min(p, 3);
      rs.forEach((r, i) => r.classList.toggle('is-sel', i < s && p < 5));
      if (cnt) cnt.textContent = p >= 5 ? 0 : s;
      sts.forEach((x) => { x.textContent = p >= 5 ? 'Assigned' : 'Open'; });
    };
    if (reduce()) { p = 5; paint(); }
    else whenVisible(wb, () => {
      clearTimeout(t); p = 0;
      const step = () => { paint(); t = setTimeout(() => { p = (p + 1) % 6; step(); }, p === 5 ? 3000 : p === 0 ? 1200 : 750); };
      step();
    }, () => clearTimeout(t), 0.35);
  }

  /* ── 12-week ruler: gates light as the shared --pp progress passes them ── */
  const proc = $('.svi-proc[data-steps]');
  if (proc) {
    const gates = $$('.svi-ticks .g', proc);
    const weeks = [0, 2, 6, 11];
    let tick = false;
    const run = () => {
      tick = false;
      const pp = reduce() ? 1 : parseFloat(proc.style.getPropertyValue('--pp')) || 0;
      gates.forEach((g, i) => g.classList.toggle('is-lit', pp >= weeks[i] / 11 - 0.001));
    };
    const on = () => { if (!tick) { tick = true; requestAnimationFrame(() => requestAnimationFrame(run)); } };
    addEventListener('scroll', on, { passive: true });
    addEventListener('resize', on, { passive: true });
    on();
  }

  /* The old CTA band (hidden by kds before the inquiry) still uses [data-r]; keep it readable */
  $$('[data-r]').forEach((el) => el.classList.add('in'));
})();
