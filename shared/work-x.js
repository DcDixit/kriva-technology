/* KRIVA Work · "wx" layer. /work only (body.wx).
   Carries the page's filter (moved from the old inline script, same URLs and behavior),
   plus reveals, the custom cursor, section rail, card tilt, and the live ShiftRail board.
   No libraries. Everything reads and works without JS or under reduced motion. */
(function () {
  'use strict';
  const body = document.body;
  if (!body || !body.classList.contains('wx')) return;
  window.__wx = true;
  const root = document.documentElement;
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mqFine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = () => mqReduce.matches;
  const fine = () => mqFine.matches && !reduce();
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  if (reduce()) root.classList.remove('wx-motion');

  /* ── Split headlines into words ── */
  $$('[data-split]').forEach((h) => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            const w = document.createElement('span'); w.className = 'wx-w';
            const wi = document.createElement('span'); wi.className = 'wx-wi'; wi.style.setProperty('--i', i++);
            wi.textContent = p; w.appendChild(wi); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(h);
  });

  /* ── Reveal ── */
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in', 'in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  const watch = (el) => (reduce() ? el.classList.add('is-in', 'in') : io.observe(el));
  $$('[data-x],[data-split],[data-r],[data-s],.wk-case,.wx-phases').forEach(watch);

  /* ── Hero counters ── */
  $$('[data-count]').forEach((el) => {
    const n = +el.dataset.count;
    if (reduce()) return;
    el.textContent = '0';
    setTimeout(() => {
      const t0 = performance.now();
      const step = (t) => {
        const p = clamp((t - t0) / 1100);
        el.textContent = String(Math.round(n * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 700);
  });

  /* ── Pointer effects (fine pointers only) ── */
  if (fine()) {
    const hero = $('.wx-hero');
    const glow = $('.wx-glow');
    if (hero && glow) {
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        glow.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
        glow.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
      }, { passive: true });
    }
    $$('[data-magnet]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--tx', clamp((e.clientX - (r.left + r.width / 2)) * 0.22, -10, 10).toFixed(1) + 'px');
        el.style.setProperty('--ty', clamp((e.clientY - (r.top + r.height / 2)) * 0.3, -8, 8).toFixed(1) + 'px');
      }, { passive: true });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--tx', '0px'); el.style.setProperty('--ty', '0px'); });
    });
    /* Product mocks tilt toward the pointer; spotlight follows it */
    /* The card's stretched link sits over the visual, so listen on the card itself */
    $$('.wk-card .wk-visual, .wk-lead-frame').forEach((v) => {
      const host = v.closest('.wk-card') || v;
      host.addEventListener('pointermove', (e) => {
        const r = v.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        v.style.setProperty('--ry', ((x - 0.5) * 4).toFixed(2) + 'deg');
        v.style.setProperty('--rx', ((y - 0.5) * -3).toFixed(2) + 'deg');
        v.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        v.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      }, { passive: true });
      host.addEventListener('pointerleave', () => { v.style.setProperty('--ry', '0deg'); v.style.setProperty('--rx', '0deg'); });
    });
    $$('.wx-mk').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', e.clientX - r.left + 'px');
      }, { passive: true });
    });

    /* Custom cursor: dot + lagging ring that names the action */
    const cur = document.createElement('div');
    cur.className = 'wx-cursor is-off';
    cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML = '<div class="wx-cursor-ring"><b></b></div><div class="wx-cursor-dot"></div>';
    body.appendChild(cur);
    root.classList.add('wx-cur');
    const dot = $('.wx-cursor-dot', cur), ring = $('.wx-cursor-ring', cur), label = $('b', ring);
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
      /* Small links inside a card (service links) read as links, not as the card */
      const inner = t.closest('.wk-svc a,.wk-chip');
      const lab = inner ? null : t.closest('[data-cursor]');
      const link = t.closest('a,button,label,summary');
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

  /* ── Number the cards once (01–08 products, W1–W7 sites) ── */
  $$('#work-grid .wk-card').forEach((c, i) => c.setAttribute('data-n', String(i + 2).padStart(2, '0')));
  $$('#web-grid .wk-card').forEach((c, i) => c.setAttribute('data-n', 'W' + (i + 1)));

  /* ── ShiftRail board: selection walks the rows, SLA clocks tick down ── */
  const ff = $('.wk-ff');
  if (ff && !reduce()) {
    const rows = $$('.wk-ff-row:not(.head)', ff);
    const ticks = rows.map((r) => $('.wk-tick', r));
    const cnt = $('.wk-ff-count', ff);
    const act = $('.wk-ff-act', ff);
    const slas = rows.map((r) => { const b = $('.wk-sla b', r); const bar = $('.wk-sla i i', r); return { b, bar, m: parseInt(b.textContent, 10), max: 60 }; });
    const orig = rows.map((r) => r.classList.contains('on'));
    let phase = 0, t = 0, clock = 0;
    const paint = () => {
      const onIdx = orig.map((o, i) => (o ? i : -1)).filter((i) => i >= 0);
      const sel = rows.map((_, i) => { const k = onIdx.indexOf(i); return k > -1 && k < Math.min(phase, onIdx.length); });
      rows.forEach((r, i) => { r.classList.toggle('on', !!sel[i]); ticks[i].classList.toggle('on', !!sel[i]); });
      const n = sel.filter(Boolean).length;
      if (cnt) cnt.textContent = n + ' selected';
      if (act) act.classList.toggle('wx-pulse', phase === 4);
      ff.classList.toggle('wx-done', phase === 5);
    };
    const step = () => { paint(); t = setTimeout(() => { phase = (phase + 1) % 6; step(); }, phase === 5 ? 2600 : phase === 0 ? 1200 : 700); };
    const tick = () => slas.forEach((s) => {
      s.m = s.m <= 2 ? s.max - 8 : s.m - 1;
      s.b.textContent = s.m + 'm';
      s.bar.style.setProperty('--p', (s.m / s.max).toFixed(2));
      s.bar.classList.toggle('warn', s.m < 12);
    });
    new IntersectionObserver(([e]) => {
      clearTimeout(t); clearInterval(clock);
      if (e.isIntersecting) { phase = 0; step(); clock = setInterval(tick, 1600); }
      else { phase = 5; paint(); }
    }, { threshold: 0.3 }).observe(ff);
  }

  /* ── Filter (same URLs as before: ?filter=x, #web-design) ── */
  const chips = $$('.wk-chip');
  const items = $$('.wk-case');
  const countEl = $('#count');
  const empty = $('#empty');
  const list = $('#list');
  const ind = $('.wx-ind');
  const groups = $$('.wk-group');
  let current = 'all';
  const pad = (n) => String(n).padStart(2, '0');
  const cats = (el) => (el.dataset.cats || '').split(' ');
  chips.forEach((c) => {
    const f = c.dataset.f;
    const n = f === 'all' ? items.length : items.filter((el) => cats(el).includes(f)).length;
    const u = $('u', c); if (u) u.textContent = pad(n);
  });
  const moveInd = () => {
    const on = chips.find((c) => c.getAttribute('aria-pressed') === 'true');
    if (!ind || !on) return;
    ind.style.width = on.offsetWidth + 'px';
    ind.style.transform = `translateX(${on.offsetLeft}px)`;
    ind.classList.add('is-on');
    body.classList.add('wx-ready');
  };
  const stagger = () => {
    $$('#web-grid .wk-case:not([hidden])').forEach((el, i) => el.classList.toggle('wx-low', i % 2 === 1));
  };
  function apply(f, push) {
    if (f === current && push !== 'init') return;
    current = f;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.f === f)));
    moveInd();
    const keep = items.filter((el) => f === 'all' || cats(el).includes(f));
    const swap = () => {
      let shown = 0;
      items.forEach((el) => { const on = keep.includes(el); el.hidden = !on; if (on) shown++; });
      groups.forEach((g) => { g.hidden = !$$('.wk-case', g).some((el) => !el.hidden); });
      if (list) list.classList.toggle('is-filtered', f !== 'all');
      if (empty) empty.hidden = shown > 0;
      if (countEl) countEl.textContent = 'Showing ' + shown + ' of ' + items.length;
      stagger();
      if (push !== 'init') keep.forEach((el, i) => {
        el.classList.add('out', 'is-in');
        setTimeout(() => el.classList.remove('out'), reduce() ? 0 : 40 + i * 55);
      });
      requestAnimationFrame(() => dispatchEvent(new Event('scroll')));
    };
    if (reduce() || push === 'init') swap();
    else { items.forEach((el) => { if (!el.hidden) el.classList.add('out'); }); setTimeout(swap, 200); }
    if (push !== 'init') {
      const hash = f === 'web-design' ? '#web-design' : '';
      const url = f === 'all' ? location.pathname + hash : location.pathname + '?filter=' + f + hash;
      if (window.krivaReplaceUrl) window.krivaReplaceUrl(url);
      else (window.__krivaNativeReplaceState || History.prototype.replaceState).call(history, null, '', url);
      /* Bring the list top into view if the bar is stuck far below it */
      const bar = $('.wx-bar');
      if (list && bar && list.getBoundingClientRect().top < 0) {
        scrollTo({ top: scrollY + list.getBoundingClientRect().top - 140, behavior: reduce() ? 'auto' : 'smooth' });
      }
    }
  }
  const chipRow = $('.wk-chips');
  /* On narrow screens the tapped chip slides to the middle of the row, so its neighbours stay reachable */
  const centerChip = (c) => {
    if (!chipRow || chipRow.scrollWidth <= chipRow.clientWidth + 2) return;
    chipRow.scrollTo({ left: c.offsetLeft - (chipRow.clientWidth - c.offsetWidth) / 2, behavior: reduce() ? 'auto' : 'smooth' });
  };
  chips.forEach((c) => c.addEventListener('click', () => { apply(c.dataset.f); centerChip(c); }));
  const chipsWrap = $('#wkChipsWrap');
  const scrollHint = $('#wkScrollHint');
  function syncChipScroll() {
    if (!chipRow || !chipsWrap) return;
    const overflow = chipRow.scrollWidth > chipRow.clientWidth + 2;
    chipsWrap.classList.toggle('can-left', overflow && chipRow.scrollLeft > 4);
    chipsWrap.classList.toggle('can-right', overflow && chipRow.scrollLeft + chipRow.clientWidth < chipRow.scrollWidth - 4);
    if (scrollHint) scrollHint.hidden = !overflow || innerWidth > 860;
  }
  if (chipRow) {
    chipRow.addEventListener('scroll', syncChipScroll, { passive: true });
    addEventListener('resize', () => { syncChipScroll(); moveInd(); });
    syncChipScroll();
    chipRow.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const i = chips.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      chips[(i + (e.key === 'ArrowRight' ? 1 : chips.length - 1)) % chips.length].focus();
    });
  }
  const initial = new URLSearchParams(location.search).get('filter');
  function bootFilters() {
    const hashFilter = (location.hash || '').replace(/^#/, '');
    const has = (x) => x && chips.some((c) => c.dataset.f === x);
    apply(has(hashFilter) ? hashFilter : has(initial) ? initial : 'all', 'init');
    const on = chips.find((c) => c.getAttribute('aria-pressed') === 'true');
    if (on && on.dataset.f !== 'all' && chipRow) chipRow.scrollLeft = on.offsetLeft - (chipRow.clientWidth - on.offsetWidth) / 2;
    if (has(hashFilter)) requestAnimationFrame(() => $('#web-design')?.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'start' }));
  }
  bootFilters();
  addEventListener('hashchange', bootFilters);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveInd);

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

  /* ── Scroll loop: progress, rail color, parallax, phase line, web stagger drift ── */
  const bar = $('#progress');
  const pars = $$('[data-par]');
  const steps = $('[data-steps]');
  const stepLis = steps ? $$('li', steps) : [];
  const webGrid = $('#web-grid');
  let ticking = false;
  function run() {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    const h = document.documentElement.scrollHeight - vh;
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? clamp(y / h) : 0) + ')';
    if (rail) {
      const mid = vh / 2;
      rail.classList.toggle('is-dark', darks.some((d) => { if (d.closest('[hidden]')) return false; const r = d.getBoundingClientRect(); return r.top < mid && r.bottom > mid; }));
    }
    if (!reduce()) {
      pars.forEach((img) => {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
        img.style.setProperty('--py', (p * -36).toFixed(1) + 'px');
      });
      if (webGrid && innerWidth > 900) {
        const r = webGrid.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) webGrid.style.setProperty('--drift', (clamp((vh - r.top) / (r.height + vh)) * -90).toFixed(1) + 'px');
      }
    }
    if (steps) {
      const r = steps.getBoundingClientRect();
      const vertical = innerWidth <= 900;
      const p = reduce() ? 1 : vertical ? clamp((vh * 0.65 - r.top) / r.height) : clamp((vh * 0.85 - r.top) / (vh * 0.45));
      steps.style.setProperty('--pp', p.toFixed(3));
      stepLis.forEach((li, i) => li.classList.toggle('is-lit', p >= (i + 0.5) / stepLis.length - 0.001 || p === 1));
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(run); } }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  run();
})();
