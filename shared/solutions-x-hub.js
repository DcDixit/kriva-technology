/* KRIVA Solutions hub (/solutions, body.sx-hub) · "Pick your path".
   Runs beside solutions-x.js (reveals, cursor, magnet, spotlight, rail and chips come from there).
   Here: the hero path switchboard, the ShiftRail console walk, the photo clip reveal,
   stacked path cards and the closing route. No libraries; everything is readable and static
   under prefers-reduced-motion or without JS. */
(function () {
  'use strict';
  const body = document.body;
  if (!body || !body.classList.contains('sx-hub')) return;

  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ── Hero switchboard: four paths, one preview stage ── */
  const board = $('[data-hb-board]');
  const hero = $('.hb-hero');
  if (board) {
    const card = $('.hb-board-card', board);
    const scenes = $$('.hb-scene', board);
    const paths = $$('[data-hb-path]', board);
    const name = $('[data-hb-name]', board);
    const cycle = 4200;
    let now = 0, timer = 0, held = false, visible = true;
    const set = (i) => {
      now = i;
      scenes.forEach((s, j) => s.classList.toggle('is-on', j === i));
      paths.forEach((p, j) => p.classList.toggle('is-on', j === i));
      const acc = paths[i].style.getPropertyValue('--a').trim();
      card.style.setProperty('--cur', acc);
      if (hero) hero.style.setProperty('--hb-cur', acc);
      if (name) name.textContent = paths[i].querySelector('b').textContent;
    };
    const restartBar = () => { board.classList.remove('is-auto'); void board.offsetWidth; board.classList.add('is-auto'); };
    const stop = () => { clearInterval(timer); timer = 0; board.classList.remove('is-auto'); };
    const start = () => {
      stop();
      if (held || !visible || reduce()) return;
      board.style.setProperty('--hb-cycle', cycle + 'ms');
      restartBar();
      timer = setInterval(() => { set((now + 1) % paths.length); restartBar(); }, cycle);
    };
    paths.forEach((p, i) => {
      p.addEventListener('pointerenter', () => { held = true; stop(); set(i); });
      p.addEventListener('focus', () => { held = true; stop(); set(i); });
      p.addEventListener('blur', () => { held = false; start(); });
    });
    board.addEventListener('pointerleave', () => { held = false; start(); });
    set(0);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }, { threshold: 0.3 }).observe(board);

    // the trucking scene's SLA clock counts down while it is on screen
    const clock = $('[data-hb-clock]', board);
    if (clock && !reduce()) {
      let secs = 357;
      setInterval(() => {
        if (!visible || now !== 0) return;
        secs = secs <= 61 ? 357 : secs - 1;
        clock.textContent = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0') + ' left';
      }, 1000);
    }

    // a gentle tilt toward the pointer (fine pointers only)
    if (hero && fine && !reduce()) {
      hero.addEventListener('pointermove', (e) => {
        const b = card.getBoundingClientRect();
        const r = hero.getBoundingClientRect();
        card.style.setProperty('--ry', (clamp((e.clientX - (b.left + b.width / 2)) / (r.width / 2), -1, 1) * 4).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (clamp((e.clientY - (b.top + b.height / 2)) / (r.height / 2), -1, 1) * -3).toFixed(2) + 'deg');
      }, { passive: true });
      hero.addEventListener('pointerleave', () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });
    }
  }

  /* ── ShiftRail console: three loads get picked, then one bulk reassign ── */
  const con = $('[data-hb-console] .hb-con');
  if (con && !reduce()) {
    const rows = $$('.hb-con-rows li', con);
    const meta = $('.hb-con-meta', con);
    let t = [], live = false;
    const later = (fn, ms) => t.push(setTimeout(fn, ms));
    const run = () => {
      t.forEach(clearTimeout); t = [];
      con.classList.remove('is-done', 'is-fire');
      rows.forEach((r) => r.classList.remove('is-sel', 'is-on'));
      if (meta) meta.textContent = 'Dispatch · 0 selected';
      rows.forEach((r, i) => later(() => {
        r.classList.add('is-sel');
        if (meta) meta.textContent = 'Dispatch · ' + (i + 1) + ' selected';
      }, 700 + i * 650));
      const end = 700 + rows.length * 650;
      later(() => con.classList.add('is-fire'), end + 300);
      later(() => { con.classList.remove('is-fire'); con.classList.add('is-done'); }, end + 600);
      later(run, end + 4200);
    };
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !live) { live = true; run(); }
      else if (!e.isIntersecting && live) {
        live = false; t.forEach(clearTimeout); t = [];
        con.classList.remove('is-fire', 'is-done');
        rows.forEach((r, i) => { r.classList.toggle('is-on', i === 0); r.classList.remove('is-sel'); });
        if (meta) meta.textContent = 'Dispatch · 3 selected';
      }
    }, { threshold: 0.35 }).observe(con);
  }

  /* ── Stacked path cards: reveal flag for the mock rows ── */
  const cards = $$('.hb-card');
  const cio = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); cio.unobserve(e.target); }
  }), { threshold: 0.2 });
  cards.forEach((c) => (reduce() ? c.classList.add('is-in') : cio.observe(c)));

  /* ── Scroll-driven pieces ── */
  const clip = $('[data-hb-clip]');
  const clipImg = clip ? $('img', clip) : null;
  const route = $('[data-hb-route]');
  const routeLine = route ? $('.hb-route-line', route) : null;
  const stops = route ? $$('li', route) : [];
  if (route && !reduce()) body.classList.add('hb-has-route');
  const mocks = $$('.hb-card .hb-mock');
  let ticking = false;

  const frame = () => {
    ticking = false;
    if (reduce()) return;
    const vh = innerHeight;

    // photo opens from an inset card to the full frame, with a slow parallax
    if (clip && innerWidth > 760) {
      const r = clip.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const t = clamp((vh - r.top) / (vh * 0.85));
        clip.style.setProperty('--cx', ((1 - t) * 6).toFixed(2) + '%');
        clip.style.setProperty('--cy', ((1 - t) * 4).toFixed(2) + '%');
        clip.style.setProperty('--cr', (28 + (1 - t) * 24).toFixed(1) + 'px');
        if (clipImg) {
          clipImg.style.setProperty('--py', ((r.top + r.height / 2 - vh / 2) * -0.1).toFixed(1) + 'px');
          clipImg.style.setProperty('--ps', (1.12 - t * 0.12).toFixed(4));
        }
      }
    }

    // stacked cards: each eases back and dims as the next one slides over it
    const wide = innerWidth > 1000;
    cards.forEach((c, i) => {
      const inner = c.firstElementChild;
      const next = cards[i + 1];
      if (!next || !wide) { inner.style.removeProperty('--s'); inner.style.removeProperty('--dim'); return; }
      const top = next.getBoundingClientRect().top;
      const stick = c.getBoundingClientRect().top;
      const t = clamp(1 - (top - stick) / (vh * 0.75));
      inner.style.setProperty('--s', (1 - t * 0.05).toFixed(4));
      inner.style.setProperty('--dim', (t * 0.18).toFixed(3));
    });

    // mock windows drift slightly against the scroll
    mocks.forEach((m) => {
      const r = m.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) m.style.setProperty('--py', ((r.top + r.height / 2 - vh / 2) * -0.04).toFixed(1) + 'px');
    });

    // route: the line fills and the eight stops light up in order
    if (route) {
      const r = route.getBoundingClientRect();
      const t = clamp((vh * 0.9 - r.top) / (vh * 0.45));
      if (routeLine) routeLine.style.setProperty('--p', t.toFixed(4));
      stops.forEach((li, i) => li.classList.toggle('is-on', t >= i / (stops.length - 1) - 0.02));
    }
  };
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request, { passive: true });
  frame();
})();
