/* KRIVA Services · "svx" layer · Web development page motion (body.svx-web).
   Runs beside services-x.js, which owns reveals, cursor, FAQ, rail, progress, and the process line.
   Without JS or with reduced motion, every mock shows its finished state. */
(function () {
  'use strict';
  const body = document.body;
  if (!body || !body.classList.contains('svx-web')) return;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const watch = (el, on, off, threshold = 0.3) => new IntersectionObserver(([e]) => (e.isIntersecting ? on() : off && off()), { threshold }).observe(el);

  /* ── Hero: the long email is replaced by a quote flow that fills itself ── */
  const door = $('[data-wd-door]');
  if (door && !reduce()) {
    const flds = $$('.wd-fld', door);
    const steps = $$('.wd-q-steps li', door);
    let n = 0, t = 0;
    const paint = () => {
      door.setAttribute('data-n', Math.min(n, flds.length));
      flds.forEach((f, i) => { f.classList.toggle('is-on', i < n); f.classList.toggle('is-cur', i === n - 1 && n <= flds.length); });
      const stage = n > flds.length ? 3 : n >= 3 ? 1 : 0;
      steps.forEach((s, i) => { s.classList.toggle('done', i < stage); s.classList.toggle('on', i === stage); });
      door.toggleAttribute('data-sent', n > flds.length);
    };
    const tick = () => {
      paint();
      const wait = n === 0 ? 1500 : n > flds.length ? 3400 : n === flds.length ? 1100 : 820;
      t = setTimeout(() => { n = n > flds.length ? 0 : n + 1; tick(); }, wait);
    };
    watch(door, () => { clearTimeout(t); n = 0; tick(); }, () => clearTimeout(t), 0.2);
  }

  /* ── Scenarios: pick a page, see it today, then with the fix ── */
  const sc = $('[data-wd-scen]');
  if (sc) {
    const items = $$('.wd-sc-item', sc);
    const stage = $('.wd-stage', sc);
    const path = $('[data-stage-path]', sc);
    const foot = $('[data-stage-foot]', sc);
    const paths = ['quote', 'track', 'carriers', 'home · on a phone'];
    let cur = -1, pinned = 0, flip = 0, auto = 0;
    const show = (i, force) => {
      if (i === cur && !force) return;
      cur = i;
      items.forEach((it, j) => {
        it.classList.toggle('is-on', j === i);
        const b = $('.wd-sc-btn', it);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      });
      stage.setAttribute('data-on', i);
      if (path) path.textContent = paths[i];
      const cons = $('.wd-cons', items[i]);
      if (foot && cons) foot.textContent = cons.textContent;
      clearTimeout(flip);
      if (reduce()) { stage.setAttribute('data-mode', 'after'); return; }
      stage.setAttribute('data-mode', 'before');
      flip = setTimeout(() => stage.setAttribute('data-mode', 'after'), 1300);
    };
    items.forEach((it, i) => {
      const b = $('.wd-sc-btn', it);
      if (b) b.addEventListener('click', () => { pinned = Date.now(); show(i, true); });
      if (fine.matches) it.addEventListener('pointerenter', () => { pinned = Date.now(); show(i); });
    });
    /* The toggle in the browser bar flips between today and the fix */
    const tog = $('.wd-toggle', stage);
    if (tog) {
      tog.style.cursor = 'pointer';
      tog.addEventListener('click', () => {
        clearTimeout(flip); pinned = Date.now();
        stage.setAttribute('data-mode', stage.getAttribute('data-mode') === 'after' ? 'before' : 'after');
      });
    }
    const wide = matchMedia('(min-width: 1001px)');
    /* Wide screens: the scenario crossing the middle of the viewport drives the stage */
    const sio = new IntersectionObserver((es) => {
      if (!wide.matches || Date.now() - pinned < 1500) return;
      es.forEach((e) => { if (e.isIntersecting) show(items.indexOf(e.target)); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    items.forEach((it) => sio.observe(it));
    /* Narrow screens: the stage sits above the list and steps through the pages while visible */
    if (!reduce()) {
      watch(stage, () => {
        clearInterval(auto);
        if (!wide.matches) auto = setInterval(() => { if (Date.now() - pinned > 7000) show((cur + 1) % items.length); }, 4200);
      }, () => clearInterval(auto), 0.4);
    }
    show(0, true);
  }

  /* ── CMS card: draft → preview → publish while it is on screen ── */
  const track = $('.wd-cms-track');
  if (track && !reduce()) {
    const s = $$('span', track);
    let i = 0, t = 0;
    const step = () => { s.forEach((x, j) => x.classList.toggle('on', j === i)); i = (i + 1) % s.length; t = setTimeout(step, 1300); };
    watch(track, () => { clearTimeout(t); i = 0; step(); }, () => clearTimeout(t));
  }
})();
