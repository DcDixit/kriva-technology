/* KRIVA Services · "svx" layer motion. First page: Custom CRM development (body.svx-crm).
   No libraries. Everything is static and fully readable under reduced motion or without JS.
   Also carries the page's FAQ accordion, progress bar, and section rail (the old inline script). */
(function () {
  'use strict';
  const body = document.body;
  if (!body || !body.classList.contains('svx')) return;
  window.__svx = true;
  const root = document.documentElement;
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mqFine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = () => mqReduce.matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  if (reduce()) root.classList.remove('svx-motion');

  /* ── Split headlines into words for the rise-in ── */
  $$('[data-split]').forEach((h) => {
    if (h.dataset.splitDone) return;
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const parts = n.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            const w = document.createElement('span'); w.className = 'svx-w';
            const wi = document.createElement('span'); wi.className = 'svx-wi'; wi.style.setProperty('--i', i++);
            wi.textContent = p; w.appendChild(wi); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(h);
    h.dataset.splitDone = '1';
  });

  /* ── Reveal on scroll ── */
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  $$('[data-x],[data-split],[data-clip]').forEach((el) => (reduce() ? el.classList.add('is-in') : io.observe(el)));

  /* ── Hero: cursor glow ── */
  const hero = $('.svx-hero');
  const glow = $('.svx-glow');
  if (hero && glow && mqFine.matches && !reduce()) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      glow.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
      glow.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
    }, { passive: true });
  }

  /* ── Hero record: unassigned → owner set → next action, with an audit log ── */
  const rec = $('[data-cr-rec]');
  if (rec) {
    const state = $('[data-cr-state]', rec);
    const clock = $('[data-cr-clock]', rec);
    const labels = ['Tendered', 'Assigned', 'Assigned'];
    const set = (n) => { rec.setAttribute('data-step', n); if (state) state.textContent = labels[n]; };
    if (reduce()) set(2);
    else {
      let n = 0, t = 0, secs = 540, tick = 0;
      const fmt = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
      const loop = () => { set(n); t = setTimeout(() => { n = (n + 1) % 3; if (n === 0) secs = 540; loop(); }, n === 2 ? 3600 : 2200); };
      new IntersectionObserver(([e]) => {
        clearTimeout(t); clearInterval(tick);
        if (e.isIntersecting) {
          n = 0; loop();
          tick = setInterval(() => { secs = Math.max(0, secs - 1); if (clock) clock.textContent = fmt(secs); }, 1000);
        }
      }, { threshold: 0.25 }).observe(rec);
    }
  }

  /* ── Spotlight tiles and magnetic buttons (fine pointers only) ── */
  if (mqFine.matches && !reduce()) {
    $$('[data-spot]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', e.clientX - r.left + 'px');
        el.style.setProperty('--my', e.clientY - r.top + 'px');
      }, { passive: true });
    });
    $$('[data-magnet]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--tx', clamp((e.clientX - (r.left + r.width / 2)) * 0.22, -10, 10).toFixed(1) + 'px');
        el.style.setProperty('--ty', clamp((e.clientY - (r.top + r.height / 2)) * 0.3, -8, 8).toFixed(1) + 'px');
      }, { passive: true });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--tx', '0px'); el.style.setProperty('--ty', '0px'); });
    });
    /* Proof board tilts toward the pointer */
    const bw = $('.cr-board-wrap');
    const board = $('[data-cr-board]');
    if (bw && board) {
      bw.addEventListener('pointermove', (e) => {
        const r = bw.getBoundingClientRect();
        board.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 6).toFixed(2) + 'deg');
        board.style.setProperty('--rx', (((e.clientY - r.top) / r.height - 0.5) * -5).toFixed(2) + 'deg');
      }, { passive: true });
      bw.addEventListener('pointerleave', () => { board.style.setProperty('--ry', '0deg'); board.style.setProperty('--rx', '0deg'); });
    }
  }

  /* ── Custom cursor: a dot plus a lagging ring that names the action ── */
  if (mqFine.matches && !reduce()) {
    const cur = document.createElement('div');
    cur.className = 'svx-cursor is-off';
    cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML = '<div class="svx-cursor-ring"><b></b></div><div class="svx-cursor-dot"></div>';
    body.appendChild(cur);
    root.classList.add('svx-cur');
    const dot = $('.svx-cursor-dot', cur);
    const ring = $('.svx-cursor-ring', cur);
    const label = $('b', ring);
    let mx = -100, my = -100, rx = -100, ry = -100, raf = 0, seen = false;
    const loop = () => {
      rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      raf = Math.abs(mx - rx) + Math.abs(my - ry) > 0.2 ? requestAnimationFrame(loop) : 0;
    };
    addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      if (!seen) { seen = true; rx = mx; ry = my; cur.classList.remove('is-off'); }
      dot.style.transform = `translate3d(${mx}px,${my}px,0)`;
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    addEventListener('pointerover', (e) => {
      const t = e.target instanceof Element ? e.target : null;
      if (!t) return;
      const off = t.closest('input,textarea,select,.nav,.sheet,.mm,.inq-form');
      const lab = t.closest('[data-cursor]');
      const link = t.closest('a,button,label,[data-role]');
      cur.classList.toggle('is-off', !!off);
      cur.classList.toggle('is-dark', !!t.closest('[data-dark],footer'));
      cur.classList.toggle('is-label', !off && !!lab);
      cur.classList.toggle('is-link', !off && !lab && !!link);
      if (lab) label.textContent = lab.getAttribute('data-cursor');
    }, { passive: true });
    addEventListener('pointerdown', () => cur.classList.add('is-down'), { passive: true });
    addEventListener('pointerup', () => cur.classList.remove('is-down'), { passive: true });
    document.addEventListener('pointerleave', () => cur.classList.add('is-off'));
  }

  /* ── Desks: one record, four layouts ── */
  const desks = $('[data-desks]');
  if (desks) {
    const roles = $$('.cr-role', desks);
    const views = $('.cr-views', desks);
    const name = $('[data-stage-name]', desks);
    const foot = $('[data-stage-foot]', desks);
    const feet = ['dense table, bulk actions, SLA first', 'three large actions, audited overrides', 'holds and invoice readiness', 'stages with exit rules'];
    let cur = 0, pinned = 0, auto = 0;
    const show = (i) => {
      cur = i;
      roles.forEach((r, j) => {
        r.classList.toggle('is-on', j === i);
        const b = $('.cr-role-btn', r);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      });
      if (views) views.setAttribute('data-on', i);
      if (name) name.textContent = $('.cr-role-k', roles[i]).textContent;
      if (foot) foot.textContent = feet[i];
    };
    roles.forEach((r, i) => {
      const b = $('.cr-role-btn', r);
      if (b) b.addEventListener('click', () => { pinned = Date.now(); show(i); });
      if (mqFine.matches) r.addEventListener('pointerenter', () => { pinned = Date.now(); show(i); });
    });
    const wide = matchMedia('(min-width: 1001px)');
    /* Wide screens: the card crossing the middle of the viewport drives the stage. */
    const rio = new IntersectionObserver((es) => {
      if (!wide.matches || Date.now() - pinned < 1500) return;
      es.forEach((e) => { if (e.isIntersecting) show(roles.indexOf(e.target)); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    roles.forEach((r) => rio.observe(r));
    /* Narrow screens: the stage sits above the list and steps through the desks while visible. */
    if (!reduce()) {
      new IntersectionObserver(([e]) => {
        clearInterval(auto);
        if (e.isIntersecting && !wide.matches) {
          auto = setInterval(() => { if (Date.now() - pinned > 6000) show((cur + 1) % roles.length); }, 3200);
        }
      }, { threshold: 0.4 }).observe($('.cr-stage', desks));
    }
  }

  /* ── Proof board: select three loads, assign once, one audit entry ── */
  const board = $('[data-cr-board]');
  if (board && !reduce()) {
    const rows = $$('.cr-b-row', board);
    const count = $('[data-b-count]', board);
    const sts = rows.map((r) => $('[data-st]', r));
    const orig = sts.map((s) => [s.textContent, s.className]);
    let phase = 0, t = 0;
    const paint = () => {
      board.setAttribute('data-phase', phase);
      const sel = phase === 0 ? 0 : Math.min(phase, 3);
      rows.forEach((r, i) => r.classList.toggle('is-sel', i < sel));
      if (count) count.textContent = sel;
      sts.forEach((s, i) => {
        if (phase === 5) { s.textContent = 'Assigned'; s.className = 'cr-b-st ok'; }
        else { s.textContent = orig[i][0]; s.className = orig[i][1]; }
      });
    };
    const step = () => { paint(); t = setTimeout(() => { phase = (phase + 1) % 6; step(); }, phase === 5 ? 3200 : phase === 0 ? 1400 : 800); };
    new IntersectionObserver(([e]) => {
      clearTimeout(t);
      if (e.isIntersecting) { phase = 0; step(); }
      else { phase = 3; paint(); }
    }, { threshold: 0.35 }).observe(board);
  }

  /* ── FAQ accordion (one open at a time) ── */
  $$('.faq-q').forEach((btn) => {
    const item = btn.closest('.faq-item');
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      $$('.faq-q[aria-expanded="true"]').forEach((o) => {
        if (o === btn) return;
        o.setAttribute('aria-expanded', 'false');
        o.closest('.faq-item').classList.remove('open');
      });
      btn.setAttribute('aria-expanded', String(!open));
      item.classList.toggle('open', !open);
    });
  });

  /* ── Section rail ── */
  const rail = $('#chapters');
  const railLinks = rail ? $$('a', rail) : [];
  const targets = railLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (targets.length) {
    const cio = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        const i = targets.indexOf(e.target);
        railLinks.forEach((a, j) => a.setAttribute('aria-current', j === i ? 'true' : 'false'));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach((t) => cio.observe(t));
  }
  const darks = $$('[data-dark]').filter((d) => d.closest('main'));

  /* ── The scroll loop: progress, rail colour, parallax, process line ── */
  const bar = $('#progress');
  const pars = $$('[data-par]');
  const steps = $('[data-steps]');
  const stepLis = steps ? $$('li', steps) : [];
  let ticking = false;
  const run = () => {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    const h = document.documentElement.scrollHeight - vh;
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? clamp(y / h) : 0) + ')';
    if (rail) {
      const mid = vh / 2;
      rail.classList.toggle('is-dark', darks.some((d) => { const r = d.getBoundingClientRect(); return r.top < mid && r.bottom > mid; }));
    }
    if (!reduce()) {
      pars.forEach((img) => {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
        img.style.setProperty('--py', (p * -36).toFixed(1) + 'px');
      });
    }
    if (steps) {
      const r = steps.getBoundingClientRect();
      const vertical = innerWidth <= 1000;
      const p = vertical ? clamp((vh * 0.6 - r.top) / r.height) : clamp((vh * 0.85 - r.top) / (vh * 0.5));
      steps.style.setProperty('--pp', reduce() ? 1 : p.toFixed(3));
      stepLis.forEach((li, i) => li.classList.toggle('is-lit', reduce() || p >= (vertical ? (li.offsetTop / r.height) : i / stepLis.length) - 0.001));
    }
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  run();
})();
