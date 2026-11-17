/* KRIVA Services · svx layer · Product design (body.svx-pd).
   Runs after services-x.js, which owns reveals, split headlines, cursor, rail, FAQ, the
   [data-steps] line, spotlight and magnetic buttons. This file only drives the page's own
   pictures. All of them are aria-hidden or carry their meaning in real text; with reduced
   motion each one is shown in its final, readable state. */
(function () {
  'use strict';
  const body = document.body;
  if (!body || !body.classList.contains('svx-pd')) return;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const onView = (el, fn, threshold = 0.3) => new IntersectionObserver(([e]) => fn(e.isIntersecting), { threshold }).observe(el);

  /* ── Hero canvas: driver uploads POD → every surface says "Delivered" → back office ready ── */
  const cv = $('[data-pd-cv]');
  if (cv) {
    const set = (n) => cv.setAttribute('data-step', n);
    if (reduce()) set(3);
    else {
      const dur = [2400, 2300, 2100, 3400];
      let n = 0, t = 0;
      const loop = () => { set(n); t = setTimeout(() => { n = (n + 1) % 4; loop(); }, dur[n]); };
      onView(cv, (v) => { clearTimeout(t); if (v) { n = 0; loop(); } }, 0.25);
      if (fine.matches) {
        const hero = cv.closest('.svx-hero');
        hero.addEventListener('pointermove', (e) => {
          const r = hero.getBoundingClientRect();
          cv.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
          cv.style.setProperty('--py2', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
        }, { passive: true });
        hero.addEventListener('pointerleave', () => { cv.style.setProperty('--px', 0); cv.style.setProperty('--py2', 0); });
      }
    }
  }

  /* ── Seams: pick a problem; the stage flips between "separate files" and "one map" ── */
  const seams = $('[data-pd-seams]');
  if (seams) {
    const items = $$('.pdx-seam', seams);
    const stage = $('.pdx-stage', seams);
    let cur = 0, pinned = 0, flip = 0, mode = 0;
    const show = (i) => {
      cur = i;
      items.forEach((it, j) => {
        it.classList.toggle('is-on', j === i);
        $('.pdx-seam-btn', it).setAttribute('aria-pressed', String(j === i));
      });
      stage.setAttribute('data-on', i);
    };
    const setMode = (m) => { mode = m; stage.setAttribute('data-mode', m ? 'after' : 'before'); };
    items.forEach((it, i) => {
      $('.pdx-seam-btn', it).addEventListener('click', () => { pinned = Date.now(); show(i); setMode(0); });
      if (fine.matches) it.addEventListener('pointerenter', () => { if (cur !== i) { pinned = Date.now(); show(i); setMode(0); } });
    });
    if (reduce()) setMode(1);
    else {
      onView(stage, (v) => {
        clearInterval(flip);
        if (!v) return;
        flip = setInterval(() => {
          if (mode === 1 && Date.now() - pinned > 9000) { show((cur + 1) % items.length); setMode(0); }
          else setMode(mode ? 0 : 1);
        }, 2600);
      }, 0.35);
    }
  }

  /* ── Journey map: wires between lanes, a load chip riding them, surfaces lighting up ── */
  const jm = $('[data-pd-map]');
  if (jm) {
    const NS = 'http://www.w3.org/2000/svg';
    const grid = $('.pdx-jm-grid', jm);
    const svg = $('.pdx-jm-svg', jm);
    const dot = $('.pdx-jm-dot', jm);
    const nodes = $$('.pdx-node', jm);
    const surfs = $$('.pdx-surf', jm);
    const toSurface = [0, 2, 1, 3, 2, 4];
    let paths = [], step = 0, t = 0, live = false, hold = false;
    const draw = () => {
      svg.replaceChildren();
      paths = [];
      if (getComputedStyle(svg).display === 'none') return;
      const g = grid.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${g.width.toFixed(1)} ${g.height.toFixed(1)}`);
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i].getBoundingClientRect(), b = nodes[i + 1].getBoundingClientRect();
        /* Nodes overlap by a column, so each wire leaves the right edge and drops into the next node's top. */
        const x1 = a.right - g.left, y1 = a.top + a.height / 2 - g.top;
        const x2 = b.left + b.width * 0.62 - g.left, y2 = b.top - g.top;
        const f = (v) => v.toFixed(1);
        const d = `M${f(x1)} ${f(y1)} C${f(x1 + (x2 - x1) * 0.85)} ${f(y1)} ${f(x2)} ${f(y1 + (y2 - y1) * 0.2)} ${f(x2)} ${f(y2)}`;
        const p = document.createElementNS(NS, 'path');
        p.setAttribute('d', d);
        if (nodes[i + 1].classList.contains('is-edge') || nodes[i].classList.contains('is-edge')) p.classList.add('is-edge');
        svg.appendChild(p);
        paths.push(d);
      }
      paint(false);
    };
    const paint = (ride) => {
      jm.setAttribute('data-step', step);
      nodes.forEach((el, j) => { el.classList.toggle('is-now', j === step); el.classList.toggle('is-done', j < step); });
      $$('path', svg).forEach((p, j) => p.classList.toggle('is-lit', j < step));
      surfs.forEach((s, j) => s.classList.toggle('is-on', j === toSurface[step]));
      if (ride && dot && step > 0 && paths[step - 1] && !reduce()) {
        dot.style.offsetPath = `path('${paths[step - 1]}')`;
        dot.classList.remove('is-run');
        void dot.offsetWidth;
        dot.classList.add('is-run');
      }
    };
    const loop = () => {
      clearTimeout(t);
      t = setTimeout(() => { if (!hold) { step = (step + 1) % nodes.length; paint(true); } loop(); }, step === nodes.length - 1 ? 3200 : 1900);
    };
    let rz = 0;
    addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(draw); }, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    draw();
    if (reduce()) { step = nodes.length - 1; paint(false); }
    else {
      onView(jm, (v) => { live = v; clearTimeout(t); if (v) { draw(); step = 0; paint(false); loop(); } }, 0.3);
      if (fine.matches) {
        nodes.forEach((el, i) => el.addEventListener('pointerenter', () => { hold = true; step = i; paint(true); }));
        $('.pdx-nodes', jm).addEventListener('pointerleave', () => { hold = false; if (live) loop(); });
      }
    }
  }

  /* ── Proof: onboarding checklist ticks through, the window tilts toward the pointer ── */
  const onb = $('[data-pd-onb]');
  if (onb) {
    if (reduce()) onb.setAttribute('data-n', 4);
    else {
      let n = 0, t = 0;
      onView(onb, (v) => {
        clearInterval(t);
        if (v) { n = 0; onb.setAttribute('data-n', 0); t = setInterval(() => { n = (n + 1) % 6; onb.setAttribute('data-n', Math.min(n, 4)); }, 1300); }
      }, 0.4);
    }
  }
  const shot = $('[data-pd-tilt]');
  if (shot && fine.matches && !reduce()) {
    const wrap = shot.parentElement;
    wrap.addEventListener('pointermove', (e) => {
      const r = wrap.getBoundingClientRect();
      shot.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 7).toFixed(2) + 'deg');
      shot.style.setProperty('--rx', (((e.clientY - r.top) / r.height - 0.5) * -5).toFixed(2) + 'deg');
    }, { passive: true });
    wrap.addEventListener('pointerleave', () => { shot.style.setProperty('--ry', '0deg'); shot.style.setProperty('--rx', '0deg'); });
  }
})();
