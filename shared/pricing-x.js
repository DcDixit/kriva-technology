/* KRIVA Pricing · svx layer page script (body.svx-price).
   Runs after services-x.js, which owns reveals, split headlines, cursor, rail, FAQ, the
   [data-steps] line, spotlight and magnetic buttons. This file drives the estimate sheet, the
   price index, the price count-up and the "Get a free project estimate" service pre-fill.
   Every name and price is read from the plan cards in the HTML, so the page has one source of
   truth for numbers. Under reduced motion everything shows its final state. */
(function () {
  'use strict';
  const body = document.body;
  if (!body || !body.classList.contains('svx-price')) return;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const onView = (el, fn, opts) => new IntersectionObserver((es) => es.forEach((e) => fn(e.isIntersecting, e)), opts || { threshold: 0.3 }).observe(el);
  const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US');

  const cards = $$('.pz-card');
  const plans = cards.map((c) => {
    const amt = $('[data-pz-count]', c);
    return { id: c.id, name: $('.pz-card-t', c).textContent.trim(), price: Number(amt.getAttribute('data-pz-count')), label: amt.textContent.trim() };
  });
  const max = Math.max(...plans.map((p) => p.price));

  /* Count a number up from part-way, ending exactly on the printed label */
  const countUp = (el, to, label, from) => {
    if (reduce()) { el.textContent = label; return; }
    const t0 = performance.now(), dur = 1100, a = from == null ? to * 0.55 : from;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = k < 1 ? fmt(a + (to - a) * e) : label;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* ── Hero estimate sheet ── */
  const est = $('[data-pz-est]');
  if (est && plans.length) {
    const btns = $$('.pz-est-pick button', est);
    const nameEl = $('[data-pz-name]', est);
    const priceEl = $('[data-pz-price]', est);
    const bar = $('[data-pz-bar]', est);
    const rows = $$('.pz-est-rows li', est);
    let cur = 0, timers = [], cycle = 0, pinned = 0, visible = false;
    const clear = () => { timers.forEach(clearTimeout); timers = []; };
    const settle = (on) => {
      rows.forEach((r) => { r.classList.toggle('is-set', on); $('b', r).textContent = on ? 'Scoped' : 'To scope'; });
      est.classList.toggle('is-done', on);
    };
    const show = (i, animate) => {
      const prev = plans[cur].price;
      cur = i;
      const p = plans[i];
      btns.forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
      nameEl.textContent = p.name;
      bar.style.setProperty('--w', (p.price / max).toFixed(3));
      clear();
      if (!animate) { priceEl.textContent = p.label; settle(true); return; }
      countUp(priceEl, p.price, p.label, prev);
      settle(false);
      rows.forEach((r, k) => timers.push(setTimeout(() => { r.classList.add('is-set'); $('b', r).textContent = 'Scoped'; }, 900 + k * 420)));
      timers.push(setTimeout(() => est.classList.add('is-done'), 900 + rows.length * 420 + 200));
    };
    btns.forEach((b, i) => b.addEventListener('click', () => { pinned = Date.now(); show(i, !reduce()); }));
    if (reduce()) show(0, false);
    else {
      const loop = () => { clearInterval(cycle); cycle = setInterval(() => { if (visible && Date.now() - pinned > 9000) show((cur + 1) % plans.length, true); }, 5200); };
      onView(est, (v) => { visible = v; if (v) { show(cur, true); loop(); } else { clearInterval(cycle); clear(); } }, { threshold: 0.25 });
      if (fine.matches) {
        const hero = est.closest('.svx-hero');
        const card = $('.pz-est-card', est);
        hero.addEventListener('pointermove', (e) => {
          const r = hero.getBoundingClientRect();
          card.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
          card.style.setProperty('--py2', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
        }, { passive: true });
        hero.addEventListener('pointerleave', () => { card.style.setProperty('--px', 0); card.style.setProperty('--py2', 0); });
      }
    }
  }

  /* ── Price index: bars grow in, the card in view is marked ── */
  const index = $('.pz-index');
  if (index) {
    const links = $$('a', index);
    if (reduce()) index.classList.add('is-in');
    else onView(index, (v) => { if (v) index.classList.add('is-in'); }, { threshold: 0.2 });
    const mark = (id) => links.forEach((a) => a.setAttribute('aria-current', a.getAttribute('href') === '#' + id ? 'true' : 'false'));
    const cio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) mark(e.target.id); }), { rootMargin: '-40% 0px -55% 0px' });
    cards.forEach((c) => cio.observe(c));
  }

  /* ── Card prices count up once, when first seen ── */
  if (!reduce()) {
    cards.forEach((c, i) => {
      const el = $('[data-pz-count]', c);
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        countUp(el, plans[i].price, plans[i].label);
      }, { threshold: 0.5 });
      io.observe(c);
    });
  }

  /* ── Compare bars draw when the panel shows (services-x.js adds is-in to [data-x]) ── */

  /* ── Card CTA pre-fills the form's Service field ── */
  const sel = $('#inq-ptype');
  $$('[data-pz-pick]').forEach((a) => a.addEventListener('click', () => {
    const v = a.getAttribute('data-pz-pick');
    if (!sel || !v) return;
    const opt = [...sel.options].find((o) => o.value === v || o.textContent.trim() === v);
    if (opt) { sel.value = opt.value || opt.textContent; sel.dispatchEvent(new Event('change', { bubbles: true })); }
  }));
})();
