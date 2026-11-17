/* KRIVA Insights · "ix" layer motion and the article filter (body.page-insights.ix).
   No libraries. The page is fully readable without JS or with reduced motion.
   The filter keeps the old page's contract: ?filter=<category> in the URL, aria-pressed chips,
   a polite live count, the empty state with its reset, arrow keys across chips, and topic
   buttons that filter and scroll to the bar. */
(function () {
  'use strict';
  const body = document.body;
  if (!body || !body.classList.contains('ix')) return;
  window.__ix = true;
  const root = document.documentElement;
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mqFine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = () => mqReduce.matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  if (reduce()) root.classList.remove('ix-motion');

  /* ── Split headlines into words ── */
  $$('[data-ix-split]').forEach((h) => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            const w = document.createElement('span'); w.className = 'ix-w';
            const wi = document.createElement('span'); wi.className = 'ix-wi'; wi.style.setProperty('--i', i++);
            wi.textContent = p; w.appendChild(wi); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(h);
  });

  /* ── Reveal on scroll ── */
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  $$('[data-ix],[data-ix-split]').forEach((el) => (reduce() ? el.classList.add('is-in') : io.observe(el)));

  /* Card covers draw in once each card is seen */
  const seen = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-seen'); seen.unobserve(e.target); } });
  }, { threshold: 0.3 });
  $$('.ix-card').forEach((c) => (reduce() ? c.classList.add('is-seen') : seen.observe(c)));

  /* ── Hero stats: derived from the list (one entry per article), then count up ── */
  const cardsByHref = new Map();
  $$('#ledger .ix-card').forEach((c) => { const a = $('h3 a', c); if (a) cardsByHref.set(a.getAttribute('href'), c); });
  const derived = {
    0: cardsByHref.size,
    1: $$('.ix-chip').filter((c) => c.getAttribute('data-cat') !== 'all').length,
    /* read time is the text after the separator dot ("Nov 2026 • 8 min read") */
    2: [...cardsByHref.values()].reduce((sum, c) => {
      const sep = $('.ix-when i', c);
      const m = ((sep && sep.nextSibling && sep.nextSibling.textContent) || '').match(/^\s*(\d+)\s*min/);
      return sum + (m ? +m[1] : 0);
    }, 0)
  };
  $$('[data-count]').forEach((el, i) => {
    if (derived[i]) { el.setAttribute('data-count', derived[i]); el.textContent = derived[i]; }
  });
  if (!reduce()) {
    $$('[data-count]').forEach((el) => {
      const to = +el.getAttribute('data-count');
      el.textContent = '0';
      new IntersectionObserver(([e], o) => {
        if (!e.isIntersecting) return;
        o.disconnect();
        const t0 = performance.now(), dur = 1300;
        const tick = (t) => {
          const p = clamp((t - t0) / dur);
          el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, { threshold: 0.6 }).observe(el);
    });
  }

  /* ── Hero desk: the top note moves to the back every few seconds ── */
  const stack = $('[data-ix-stack]');
  if (stack) {
    const notes = $$('.ix-note', stack);
    const dots = $$('.ix-stack-dots i');
    let order = notes.map((_, i) => i), timer = 0, hovering = false;
    const paint = () => {
      order.forEach((n, pos) => notes[n].setAttribute('data-pos', pos));
      dots.forEach((d, i) => d.classList.toggle('on', i === order[0]));
    };
    paint();
    if (!reduce()) {
      const next = () => { if (!hovering && !document.hidden) { order.push(order.shift()); paint(); } };
      stack.addEventListener('pointerenter', () => { hovering = true; });
      stack.addEventListener('pointerleave', () => { hovering = false; });
      stack.addEventListener('focusin', () => { hovering = true; });
      stack.addEventListener('focusout', () => { hovering = false; });
      new IntersectionObserver(([e]) => {
        clearInterval(timer);
        if (e.isIntersecting) timer = setInterval(next, 3600);
      }, { threshold: 0.3 }).observe(stack);
    }
  }

  /* ── Pointer effects (fine pointers only) ── */
  if (mqFine.matches && !reduce()) {
    const follow = (area, target) => {
      if (!area || !target) return;
      area.addEventListener('pointermove', (e) => {
        const r = area.getBoundingClientRect();
        target.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
        target.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
      }, { passive: true });
    };
    /* Hero glow: one gradient disc moved with a transform, so the pointer never repaints the whole hero */
    const hero = $('.ix-hero'), glow = $('.ix-glow');
    if (hero && glow) hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      glow.style.setProperty('--gx', Math.round(e.clientX - r.left) + 'px');
      glow.style.setProperty('--gy', Math.round(e.clientY - r.top) + 'px');
    }, { passive: true });
    follow($('.ix-cta'), $('.ix-cta-bg'));
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
    /* Featured sitting tilts toward the pointer */
    const tilt = $('[data-ix-tilt]');
    const card = tilt && $('.ix-sit-card', tilt);
    if (card) {
      const stage = tilt.closest('.ix-feat') || tilt;
      stage.addEventListener('pointermove', (e) => {
        const r = tilt.getBoundingClientRect();
        card.style.setProperty('--ry', clamp(((e.clientX - r.left) / r.width - 0.5) * 9, -7, 7).toFixed(2) + 'deg');
        card.style.setProperty('--rx', clamp(((e.clientY - r.top) / r.height - 0.5) * -7, -6, 6).toFixed(2) + 'deg');
      }, { passive: true });
      stage.addEventListener('pointerleave', () => { card.style.setProperty('--ry', '0deg'); card.style.setProperty('--rx', '0deg'); });
    }

    /* Custom cursor: a dot plus a lagging ring that names the action */
    const cur = document.createElement('div');
    cur.className = 'ix-cursor is-off';
    cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML = '<div class="ix-cursor-ring"><b></b></div><div class="ix-cursor-dot"></div>';
    body.appendChild(cur);
    root.classList.add('ix-cur');
    const dot = $('.ix-cursor-dot', cur), ring = $('.ix-cursor-ring', cur), label = $('b', ring);
    let mx = -100, my = -100, rx = -100, ry = -100, raf = 0, on = false;
    const loop = () => {
      rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      raf = Math.abs(mx - rx) + Math.abs(my - ry) > 0.2 ? requestAnimationFrame(loop) : 0;
    };
    addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      if (!on) { on = true; rx = mx; ry = my; cur.classList.remove('is-off'); }
      dot.style.transform = `translate3d(${mx}px,${my}px,0)`;
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    addEventListener('pointerover', (e) => {
      const t = e.target instanceof Element ? e.target : null;
      if (!t) return;
      const off = t.closest('input,textarea,select,.nav,.sheet,.mm,.inq-form');
      const rel = t.closest('.rel a');
      const lab = rel ? null : t.closest('[data-cursor]');
      const link = t.closest('a,button,label');
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

  /* ── Filter ── */
  const chips = $$('.ix-chip');
  const chipRow = $('.ix-chips');
  const ink = $('.ix-chip-ink');
  const all = $$('#ledger [data-cat]');
  /* The featured note has its own section; its grid card only shows when its category is filtered */
  const featCard = all.find((p) => p.hasAttribute('data-featured'));
  const posts = all.filter((p) => p !== featCard);
  const countEl = $('#count');
  const empty = $('#empty');
  const featured = $('#featured');
  const featCat = featured ? featured.getAttribute('data-cat') : null;
  const bar = $('#ins-bar');
  let current = null, swap = 0;

  /* Topic counts come from the list itself, so they stay right as notes are added */
  $$('[data-topic-count]').forEach((b) => {
    const cat = b.getAttribute('data-topic-count');
    b.textContent = posts.filter((p) => p.getAttribute('data-cat') === cat).length + (featCat === cat ? 1 : 0);
  });

  const moveInk = () => {
    if (!ink) return;
    const on = chips.find((c) => c.getAttribute('aria-pressed') === 'true');
    if (!on) return;
    body.classList.add('ix-ink');
    ink.style.width = on.offsetWidth + 'px';
    ink.style.transform = 'translateX(' + on.offsetLeft + 'px)';
  };
  const reveal = (on) => {
    if (!chipRow || !on) return;
    const l = on.offsetLeft, r = l + on.offsetWidth;
    if (l < chipRow.scrollLeft || r > chipRow.scrollLeft + chipRow.clientWidth) {
      chipRow.scrollTo({ left: l - 24, behavior: reduce() ? 'auto' : 'smooth' });
    }
  };
  const layout = () => {
    /* The first two visible notes take the wide slots */
    let n = 0;
    all.forEach((p) => { p.classList.toggle('is-big', !p.hidden && n++ < 2); });
  };

  function apply(cat, push) {
    if (cat === current && push !== 'init') return;
    current = cat;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.getAttribute('data-cat') === cat)));
    moveInk();
    reveal(chips.find((c) => c.getAttribute('data-cat') === cat));
    /* The featured note appears exactly once: in its own section on "All", and as its grid card
       when its category is filtered. */
    const featOn = cat === 'all';
    const matches = posts.filter((p) => cat === 'all' || p.getAttribute('data-cat') === cat);
    const grid = featCard && cat !== 'all' && cat === featCat ? [featCard, ...matches] : matches;
    const shown = grid.length + (featOn && featured ? 1 : 0);
    if (countEl) countEl.textContent = 'Showing ' + shown + ' of ' + (posts.length + (featured ? 1 : 0));

    const commit = () => {
      if (featured) featured.hidden = !featOn;
      all.forEach((p) => { p.hidden = !grid.includes(p); if (p.hidden) p.classList.remove('is-out'); });
      if (empty) empty.hidden = shown > 0;
      layout();
      /* The list just got shorter: if the reader is already inside it, bring the top of the list back into view */
      const sec = $('#notes');
      if (push !== 'init' && sec && sec.getBoundingClientRect().top < 0) sec.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'start' });
      if (reduce() || push === 'init') { all.forEach((p) => p.classList.remove('is-out')); return; }
      grid.forEach((el) => el.classList.add('is-out'));
      requestAnimationFrame(() => requestAnimationFrame(() => {
        grid.forEach((el, i) => setTimeout(() => el.classList.remove('is-out'), i * 55));
      }));
    };
    clearTimeout(swap);
    if (reduce() || push === 'init') commit();
    else {
      all.filter((p) => !p.hidden).forEach((p) => p.classList.add('is-out'));
      swap = setTimeout(commit, 260);
    }

    if (push !== 'init') {
      const url = cat === 'all' ? location.pathname : location.pathname + '?filter=' + encodeURIComponent(cat);
      if (window.krivaReplaceUrl) window.krivaReplaceUrl(url);
      else (window.__krivaNativeReplaceState || History.prototype.replaceState).call(history, null, '', url);
    }
  }
  chips.forEach((c) => c.addEventListener('click', () => apply(c.getAttribute('data-cat'))));
  $$('.ix-desk-go').forEach((b) => b.addEventListener('click', () => {
    apply(b.getAttribute('data-cat'));
    if (bar) bar.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'start' });
  }));
  if (chipRow) chipRow.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const i = chips.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    chips[(i + (e.key === 'ArrowRight' ? 1 : chips.length - 1)) % chips.length].focus();
  });
  const reset = $('#reset-filter');
  if (reset) reset.addEventListener('click', (e) => { e.preventDefault(); apply('all'); });
  const initial = new URLSearchParams(location.search).get('filter');
  if (initial && chips.some((c) => c.getAttribute('data-cat') === initial)) apply(initial, 'init');
  else apply('all', 'init');
  addEventListener('resize', moveInk, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveInk);

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
  const darks = $$('main [data-dark]');

  /* ── Scroll loop: progress, sticky offset under the header, rail colour, parallax ── */
  const prog = $('#progress');
  const nav = $('#nav');
  const pars = $$('[data-par]');
  let ticking = false, navH = -1;
  const run = () => {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    const h = document.documentElement.scrollHeight - vh;
    if (prog) prog.style.transform = 'scaleX(' + (h > 0 ? clamp(y / h) : 0) + ')';
    if (nav) {
      const nh = Math.max(0, Math.round(nav.getBoundingClientRect().bottom));
      if (nh !== navH) { navH = nh; body.style.setProperty('--ix-navh', nh + 'px'); }
    }
    if (rail) {
      const mid = vh / 2;
      rail.classList.toggle('is-dark', darks.some((d) => { const r = d.getBoundingClientRect(); return r.top < mid && r.bottom > mid; }));
    }
    if (!reduce()) {
      pars.forEach((img) => {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
        img.style.setProperty('--py', (p * -40).toFixed(1) + 'px');
      });
    }
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  run();
})();
