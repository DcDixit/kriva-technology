/* KRIVA Work · case study "csx" layer behavior. First page: ShiftRail (body.svx-case).
   services-x.js (loaded first) owns reveals, split headlines, cursor, rail, progress, magnets
   and spotlights. This file adds the page's own demos. Every demo is readable without JS and
   settles on a static, complete state under reduced motion. */
(function () {
  'use strict';
  const body = document.body;
  if (!body || !body.classList.contains('svx-case')) return;
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mqFine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = () => mqReduce.matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const seen = (el, fn, threshold = 0.3) => new IntersectionObserver(([e]) => fn(e.isIntersecting), { threshold }).observe(el);

  /* ── Section chips (below 1360px): follow the nav, appear after the hero ── */
  const nav = $('#nav');
  const chips = $('#mobChips');
  const hero = $('#overview');
  const chipLinks = chips ? $$('a', chips) : [];
  const chipTargets = chipLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (chips && chipTargets.length) {
    const cio = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        const id = '#' + e.target.id;
        chipLinks.forEach((a) => {
          const on = a.getAttribute('href') === id;
          a.setAttribute('aria-current', on ? 'true' : 'false');
          if (on && chips.classList.contains('is-show')) {
            const l = a.offsetLeft - (chips.clientWidth - a.offsetWidth) / 2;
            chips.scrollTo({ left: l, behavior: reduce() ? 'auto' : 'smooth' });
          }
        });
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    chipTargets.forEach((t) => cio.observe(t));
  }

  /* ── Hero console: sort the queue by arrival or by SLA risk (FLIP) ── */
  const consoleEl = $('[data-csx-sort]');
  if (consoleEl) {
    const list = $('[data-csx-rows]', consoleEl);
    const rows = list ? $$('.csx-row', list) : [];
    const segs = $$('.csx-seg-b[data-sort]', consoleEl);
    let mode = 'arrival', touched = false, timer = 0;
    const sort = (m) => {
      if (m === mode) return;
      const first = rows.map((r) => r.getBoundingClientRect().top);
      mode = m;
      consoleEl.setAttribute('data-csx-sort', m);
      segs.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.sort === m)));
      rows.forEach((r) => r.classList.toggle('is-on', m === 'sla' ? r.dataset.sla === '6' : r.dataset.sla === '9'));
      if (reduce()) return;
      rows.forEach((r, i) => {
        const dy = first[i] - r.getBoundingClientRect().top;
        if (!dy) return;
        r.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 700, easing: 'cubic-bezier(.16,1,.3,1)' });
      });
    };
    segs.forEach((b) => b.addEventListener('click', () => { touched = true; clearInterval(timer); sort(b.dataset.sort); }));
    if (!reduce()) {
      seen(consoleEl, (on) => {
        clearInterval(timer);
        if (on && !touched) timer = setInterval(() => sort(mode === 'arrival' ? 'sla' : 'arrival'), 3400);
      });
    }
    /* tilt toward the pointer */
    const stage = $('[data-csx-tilt]');
    if (stage && mqFine.matches && !reduce()) {
      stage.addEventListener('pointermove', (e) => {
        const r = stage.getBoundingClientRect();
        consoleEl.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 7).toFixed(2) + 'deg');
        consoleEl.style.setProperty('--rx', (((e.clientY - r.top) / r.height - 0.5) * -6).toFixed(2) + 'deg');
      }, { passive: true });
      stage.addEventListener('pointerleave', () => { consoleEl.style.setProperty('--ry', '0deg'); consoleEl.style.setProperty('--rx', '0deg'); });
    }
  }

  /* ── Workflow: three moves drive one stage ── */
  const flow = $('[data-csx-flow]');
  if (flow) {
    const moves = $$('.csx-move', flow);
    const views = $('.csx-views', flow);
    const name = $('[data-csx-stage-name]', flow);
    const foot = $('[data-csx-stage-foot]', flow);
    const names = ['load board · bulk select', 'sla · burndown', 'supervisor · override'];
    const feet = ['Forty loads, one approval, one audit entry', 'Worked by urgency, not arrival order', 'The floor can move. Leadership can see who moved it.'];
    let cur = 0, pinned = 0, auto = 0;
    const show = (i) => {
      cur = i;
      moves.forEach((m, j) => {
        m.classList.toggle('is-on', j === i);
        $('.csx-move-btn', m).setAttribute('aria-pressed', String(j === i));
      });
      views.setAttribute('data-on', i);
      $$('.csx-view', views).forEach((v, j) => v.toggleAttribute('inert', j !== i));
      if (name) name.textContent = names[i];
      if (foot) foot.textContent = feet[i];
      document.dispatchEvent(new CustomEvent('csx:view', { detail: i }));
    };
    moves.forEach((m, i) => $('.csx-move-btn', m).addEventListener('click', () => { pinned = Date.now(); show(i); }));
    const wide = matchMedia('(min-width: 1001px)');
    const mio = new IntersectionObserver((es) => {
      if (!wide.matches || Date.now() - pinned < 2500) return;
      es.forEach((e) => { if (e.isIntersecting) show(moves.indexOf(e.target)); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    moves.forEach((m) => mio.observe(m));
    if (!reduce()) {
      seen($('.csx-fstage', flow), (on) => {
        clearInterval(auto);
        if (on && !wide.matches) auto = setInterval(() => { if (Date.now() - pinned > 9000) show((cur + 1) % moves.length); }, 5200);
      }, 0.4);
    }
    show(0);
  }

  /* ── Bulk demo: pick loads, reassign them as one event ── */
  const bulk = $('[data-csx-bulk]');
  if (bulk) {
    const picks = $$('.csx-vb-pick', bulk);
    const n = $('[data-csx-n]', bulk);
    const go = $('[data-csx-go]', bulk);
    const log = $('[data-csx-log]', bulk);
    const idle = log.innerHTML;
    let done = false, touched = false, t = 0;
    const count = () => picks.filter((p) => p.getAttribute('aria-pressed') === 'true').length;
    const reset = () => {
      done = false;
      picks.forEach((p) => { const s = $('[data-st]', p); s.textContent = 'Open'; s.classList.remove('is-done'); });
      log.classList.remove('is-done'); log.innerHTML = idle;
    };
    const paint = () => { const c = count(); n.textContent = c; go.disabled = c === 0; };
    const pick = (p, on) => { if (done) reset(); p.setAttribute('aria-pressed', String(on)); paint(); };
    const fire = () => {
      const sel = picks.filter((p) => p.getAttribute('aria-pressed') === 'true');
      if (!sel.length) return;
      sel.forEach((p) => { const s = $('[data-st]', p); s.textContent = 'Assigned'; s.classList.add('is-done'); p.setAttribute('aria-pressed', 'false'); });
      done = true;
      log.classList.add('is-done');
      log.textContent = '1 event · ' + sel.length + (sel.length === 1 ? ' load' : ' loads') + ' reassigned · one audit entry';
      paint();
      go.classList.add('is-press'); setTimeout(() => go.classList.remove('is-press'), 260);
    };
    picks.forEach((p) => p.addEventListener('click', () => { touched = true; clearTimeout(t); pick(p, p.getAttribute('aria-pressed') !== 'true'); }));
    go.addEventListener('click', () => { touched = true; clearTimeout(t); fire(); });
    if (reduce()) { [0, 1, 2].forEach((i) => picks[i].setAttribute('aria-pressed', 'true')); paint(); fire(); }
    else {
      /* a short self-demo while the bulk view is showing and nobody has touched it */
      const script = [() => pick(picks[0], true), () => pick(picks[1], true), () => pick(picks[2], true), fire, () => { reset(); picks.forEach((p) => p.setAttribute('aria-pressed', 'false')); paint(); }];
      const waits = [900, 650, 650, 900, 3200];
      let k = 0, visible = false, active = true;
      const step = () => { if (touched || !visible || !active) return; script[k](); t = setTimeout(() => { k = (k + 1) % script.length; step(); }, waits[k]); };
      const kick = () => { clearTimeout(t); if (visible && active && !touched) { k = 0; reset(); picks.forEach((p) => p.setAttribute('aria-pressed', 'false')); paint(); t = setTimeout(step, 700); } };
      seen(bulk.closest('.csx-fstage'), (on) => { visible = on; kick(); }, 0.35);
      document.addEventListener('csx:view', (e) => { active = e.detail === 0; kick(); });
    }
  }

  /* ── Density: desk ↔ tablet ── */
  const dens = $('[data-csx-dens]');
  if (dens) {
    const btns = $$('[data-density]');
    let mode = 'desk', touched = false, timer = 0;
    const set = (m) => { mode = m; dens.setAttribute('data-mode', m); btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.density === m))); };
    btns.forEach((b) => b.addEventListener('click', () => { touched = true; clearInterval(timer); set(b.dataset.density); }));
    dens.addEventListener('click', () => { touched = true; clearInterval(timer); set(mode === 'desk' ? 'tablet' : 'desk'); });
    if (!reduce()) seen(dens, (on) => { clearInterval(timer); if (on && !touched) timer = setInterval(() => set(mode === 'desk' ? 'tablet' : 'desk'), 3800); }, 0.45);
  }

  /* ── Before / after ── */
  const ba = $('[data-csx-ba]');
  if (ba) {
    const range = $('.csx-ba-range', ba);
    const put = (v) => ba.style.setProperty('--split', v + '%');
    range.addEventListener('input', () => put(range.value));
    put(range.value);
    if (!reduce()) {
      /* one sweep on first view so the comparison is discoverable */
      let swept = false;
      seen(ba, (on) => {
        if (!on || swept) return;
        swept = true;
        const t0 = performance.now();
        const tick = (now) => {
          if (document.activeElement === range) return;
          const p = Math.min(1, (now - t0) / 1600);
          const v = 34 + Math.sin(p * Math.PI * 2) * 22 * (1 - p);
          range.value = v.toFixed(0); put(v.toFixed(1));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, 0.5);
    }
  }

  /* ── Scroll loop: chips visibility, nav offset, twin merge ── */
  const twins = $('[data-csx-twins]');
  const inq = $('#inquire');
  let ticking = false;
  const run = () => {
    ticking = false;
    const vh = innerHeight;
    if (nav) body.style.setProperty('--csx-navh', Math.round(nav.getBoundingClientRect().bottom) + 'px');
    if (chips && hero) chips.classList.toggle('is-show', hero.getBoundingClientRect().bottom < 80);
    if (inq) { const r = inq.getBoundingClientRect(); body.classList.toggle('csx-rail-ink', r.top < vh / 2 && r.bottom > vh / 2); }
    if (twins) {
      const r = twins.getBoundingClientRect();
      const p = reduce() ? 0 : clamp((vh * 0.78 - r.top) / (r.height + vh * 0.25));
      twins.style.setProperty('--tw', p.toFixed(3));
    }
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  run();
})();
