/* KRIVA Services · "svx" layer · Automation workflows page motion (body.svx-auto).
   Runs beside services-x.js, which already owns reveals, split headlines, cursor, spotlight,
   magnetic buttons, parallax, the FAQ, the rail, the progress bar and the [data-steps] line.
   No libraries. Every block is readable and usable without JS or with reduced motion. */
(function () {
  'use strict';
  const body = document.body;
  if (!body || !body.classList.contains('svx-auto')) return;
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mqFine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = () => mqReduce.matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const onView = (el, fn, threshold = 0.3) => new IntersectionObserver(([e]) => fn(e.isIntersecting), { threshold }).observe(el);

  /* ── Hero: runs flow through; the detention claim stops at the gate until a person decides ── */
  const run = $('[data-au-run]');
  if (run) {
    const lane = $('[data-au-lane]', run);
    const nodes = $$('li', lane);
    const note = $('[data-au-gate-note]', run);
    const foot = $('[data-au-foot]', run);
    const btnGo = $('[data-au-act="approve"]', run);
    const btnHold = $('[data-au-act="hold"]', run);
    const copy = {
      wait: ['Waiting on the billing desk', '2 ran · 1 waiting on a person · 0 failed'],
      approved: ['Approved by a person · claim sent', '3 ran · 0 waiting · 0 failed'],
      held: ['Held · stays in the queue until someone decides', '2 ran · 1 held by a person · 0 failed']
    };
    const paint = (step, phase) => {
      run.setAttribute('data-step', step);
      run.setAttribute('data-phase', phase);
      const at = phase === 'approved' ? 3 : Math.min(step, 2);
      lane.style.setProperty('--n', at);
      nodes.forEach((li, i) => {
        li.classList.toggle('is-done', i < at || (phase === 'approved' && i === 3));
        li.classList.toggle('is-now', i === at && phase !== 'approved');
        li.classList.toggle('is-held', i === 2 && phase === 'held');
      });
      const c = copy[phase] || copy.wait;
      if (note) note.textContent = c[0];
      if (foot) foot.textContent = step < 2 ? (step + 1) + ' ran · 0 waiting · 0 failed' : c[1];
      if (btnGo) btnGo.setAttribute('aria-pressed', String(phase === 'approved'));
      if (btnHold) btnHold.setAttribute('aria-pressed', String(phase === 'held'));
    };
    let t = 0, pinned = false;
    const stop = () => { clearTimeout(t); if (btnGo) btnGo.classList.remove('is-press'); };
    const loop = (s) => {
      if (pinned) return;
      if (s <= 2) { paint(s, 'wait'); t = setTimeout(() => loop(s + 1), s === 2 ? 2600 : 1500); }
      else if (s === 3) { if (btnGo) btnGo.classList.add('is-press'); t = setTimeout(() => loop(4), 520); }
      else { if (btnGo) btnGo.classList.remove('is-press'); paint(3, 'approved'); t = setTimeout(() => loop(0), 3600); }
    };
    const choose = (phase) => { pinned = true; stop(); paint(3, phase); };
    if (btnGo) btnGo.addEventListener('click', () => choose(run.getAttribute('data-phase') === 'approved' && pinned ? 'wait' : 'approved'));
    if (btnHold) btnHold.addEventListener('click', () => choose(run.getAttribute('data-phase') === 'held' && pinned ? 'wait' : 'held'));
    if (reduce()) paint(2, 'wait');
    else {
      paint(0, 'wait');
      onView(run, (on) => { stop(); if (on && !pinned) loop(0); }, 0.25);
    }
  }

  /* ── Scenarios: the card in the middle of the viewport drives the canvas (wide);
        on narrow screens the canvas sits above the list and steps through by itself ── */
  const scen = $('[data-au-scen]');
  if (scen) {
    const cards = $$('.au-sc', scen);
    const flows = $('.au-flows', scen);
    const name = $('[data-au-scen-name]', scen);
    let cur = 0, pinned = 0, auto = 0;
    const show = (i) => {
      if (i < 0) return;
      cur = i;
      cards.forEach((c, j) => {
        c.classList.toggle('is-on', j === i);
        const b = $('.au-sc-btn', c);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      });
      if (flows) flows.setAttribute('data-on', i);
      if (name) name.textContent = $('.au-sc-btn', cards[i]).textContent;
    };
    cards.forEach((c, i) => {
      const b = $('.au-sc-btn', c);
      if (b) b.addEventListener('click', () => { pinned = Date.now(); show(i); });
      if (mqFine.matches) c.addEventListener('pointerenter', () => { pinned = Date.now(); show(i); });
    });
    const wide = matchMedia('(min-width: 1001px)');
    const cio = new IntersectionObserver((es) => {
      if (!wide.matches || Date.now() - pinned < 1500) return;
      es.forEach((e) => { if (e.isIntersecting) show(cards.indexOf(e.target)); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    cards.forEach((c) => cio.observe(c));
    if (!reduce()) {
      onView($('.au-canvas', scen), (on) => {
        clearInterval(auto);
        if (on && !wide.matches) auto = setInterval(() => { if (Date.now() - pinned > 6000) show((cur + 1) % cards.length); }, 3400);
      }, 0.4);
    }
  }

  /* ── Proof: ticket → draft → review gate → a person sends ── */
  const rq = $('[data-au-rq]');
  if (rq) {
    const rows = $$('.au-rq-row', rq);
    const first = rows[0];
    const st = first ? $('.st', first) : null;
    const set = (k) => {
      rq.setAttribute('data-k', k);
      if (first) {
        first.classList.toggle('is-focus', k === 2);
        first.classList.toggle('is-sent', k === 3);
        if (st) st.textContent = k === 3 ? 'Sent' : 'Review';
      }
    };
    if (reduce()) set(2);
    else {
      let k = 0, t = 0;
      const wait = [1300, 1400, 2200, 3200];
      const loop = () => { set(k); t = setTimeout(() => { k = (k + 1) % 4; loop(); }, wait[k]); };
      onView(rq, (on) => { clearTimeout(t); if (on) { k = 0; loop(); } else set(2); }, 0.35);
    }
    const wrap = rq.parentElement;
    if (wrap && mqFine.matches && !reduce()) {
      wrap.addEventListener('pointermove', (e) => {
        const r = wrap.getBoundingClientRect();
        rq.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 6).toFixed(2) + 'deg');
        rq.style.setProperty('--rx', (((e.clientY - r.top) / r.height - 0.5) * -5).toFixed(2) + 'deg');
      }, { passive: true });
      wrap.addEventListener('pointerleave', () => { rq.style.setProperty('--ry', '0deg'); rq.style.setProperty('--rx', '0deg'); });
    }
  }
})();
