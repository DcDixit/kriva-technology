/* KRIVA homepage · "Follow the load" motion layer.
   No libraries. One passive scroll loop writes CSS variables; IntersectionObserver handles reveals.
   Everything degrades to a static, readable page under prefers-reduced-motion or without JS.
   home.js still owns the hero board, the workflow tabs, and the form; this file only drives them. */
(function () {
  'use strict';
  window.__hx = true;
  const root = document.documentElement;
  const body = document.body;
  if (!body.classList.contains('hx')) return;

  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mqFine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = () => mqReduce.matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  if (reduce()) root.classList.remove('x-motion');
  else root.classList.add('x-motion');

  /* ── Split headings into masked words (text content is unchanged for assistive tech) ── */
  const splitWords = (el, outer, inner) => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((w, i) => {
      const o = document.createElement('span');
      o.className = outer;
      if (inner) {
        const n = document.createElement('span');
        n.className = inner;
        n.style.setProperty('--i', i);
        n.textContent = w;
        o.appendChild(n);
      } else {
        o.textContent = w;
      }
      el.appendChild(o);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  };
  $$('[data-split]').forEach((el) => splitWords(el, 'x-w', 'x-wi'));
  const scrub = $('[data-scrub]');
  if (scrub) splitWords(scrub, 'x-sw');
  const scrubWords = scrub ? $$('.x-sw', scrub) : [];

  /* ── Reveal on enter, with sibling stagger ── */
  const groups = new Map();
  $$('[data-x]').forEach((el) => {
    const p = el.parentElement;
    const n = groups.get(p) || 0;
    groups.set(p, n + 1);
    el.style.setProperty('--d', Math.min(n, 6) * 0.08 + 's');
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
  $$('[data-x],[data-split]').forEach((el) => (reduce() ? el.classList.add('is-in') : io.observe(el)));

  /* ── Live clocks: shows the hours overlap the copy promises ── */
  const clocks = $$('[data-clock]');
  const fmt = {};
  const tickClocks = () => {
    const now = new Date();
    clocks.forEach((c) => {
      const tz = c.getAttribute('data-clock');
      try {
        fmt[tz] = fmt[tz] || new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz });
        c.textContent = fmt[tz].format(now);
      } catch (_) { /* unknown zone: leave placeholder */ }
    });
  };
  if (clocks.length) { tickClocks(); setInterval(tickClocks, 20000); }

  /* ── Hero: cursor glow ── */
  const hero = $('.x-hero');
  const glow = $('.x-glow');
  if (hero) {
    if (mqFine.matches && !reduce()) {
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        if (glow) {
          glow.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
          glow.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
        }
      }, { passive: true });
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
        const x = clamp((e.clientX - (r.left + r.width / 2)) * 0.22, -10, 10);
        const y = clamp((e.clientY - (r.top + r.height / 2)) * 0.3, -8, 8);
        el.style.setProperty('--tx', x.toFixed(1) + 'px');
        el.style.setProperty('--ty', y.toFixed(1) + 'px');
      }, { passive: true });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--tx', '0px'); el.style.setProperty('--ty', '0px'); });
    });
  }

  /* ── Custom cursor: a dot plus a lagging ring that names the action ── */
  const cur = $('.x-cursor');
  if (cur && mqFine.matches && !reduce()) {
    root.classList.add('x-cur');
    const dot = $('.x-cursor-dot', cur);
    const ring = $('.x-cursor-ring', cur);
    const label = $('b', ring);
    let mx = -100, my = -100, rx = -100, ry = -100, raf = 0, seen = false;
    cur.classList.add('is-off');
    const loop = () => {
      rx += (mx - rx) * 0.2;
      ry += (my - ry) * 0.2;
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
      const off = t.closest('input,textarea,select,.hp-board,.nav,.sheet,.mm,.wf-path,.lf-steps');
      const lab = t.closest('[data-cursor]');
      const link = t.closest('a,button,summary,label,[role="tab"]');
      cur.classList.toggle('is-off', !!off);
      cur.classList.toggle('is-dark', !!t.closest('[data-dark]'));
      cur.classList.toggle('is-label', !off && !!lab);
      cur.classList.toggle('is-link', !off && !lab && !!link);
      if (lab) label.textContent = lab.getAttribute('data-cursor');
    }, { passive: true });
    addEventListener('pointerdown', () => cur.classList.add('is-down'), { passive: true });
    addEventListener('pointerup', () => cur.classList.remove('is-down'), { passive: true });
    document.addEventListener('pointerleave', () => cur.classList.add('is-off'));
    document.addEventListener('pointerenter', () => cur.classList.remove('is-off'));
  }

  /* ── Integration sync log: walks pushed → failed (visible) → retried while in view ── */
  const sync = $('[data-sync]');
  if (sync && !reduce()) {
    let step = 0, timer = 0;
    const next = () => {
      step = step >= 3 ? 1 : step + 1;
      sync.setAttribute('data-step', step);
      sync.classList.toggle('is-risk', step === 2);
      timer = setTimeout(next, step === 3 ? 2600 : 1500);
    };
    new IntersectionObserver(([e]) => {
      clearTimeout(timer);
      if (e.isIntersecting) next();
    }, { threshold: 0.35 }).observe(sync);
  }

  /* ── Stacked cards get their sticky offset ── */
  const cards = $$('[data-stack]');
  cards.forEach((c, i) => c.style.setProperty('--i', i));

  /* ── Workflow: scroll moves the load through the eight handoffs ── */
  const flow = $('#workflow');
  const tabs = $$('#wfPath [role="tab"]');
  let flowIdx = -1;
  let driving = false;
  const scrollyOK = () => !reduce() && innerWidth >= 1024 && innerHeight >= 720 && tabs.length;
  const setScrolly = () => root.classList.toggle('x-scrolly', !!scrollyOK());
  setScrolly();
  if (flow && tabs.length) {
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => {
        if (driving || !root.classList.contains('x-scrolly')) return;
        // A reader clicked a stop: move the page to where that stop lives so scroll and tab agree.
        const r = flow.getBoundingClientRect();
        const span = flow.offsetHeight - innerHeight;
        const y = scrollY + r.top + span * ((i + 0.5) / tabs.length);
        flowIdx = i;
        scrollTo({ top: y, behavior: 'smooth' });
      });
    });
  }

  /* ── The scroll loop ── */
  const bar = $('.x-progress i');
  const photo = $('[data-reveal-clip]');
  const photoImg = photo ? $('img', photo) : null;
  const steps = $('[data-steps]');
  const stepItems = steps ? $$('.x-steps li', steps) : [];
  const stepLine = steps ? $('.x-steps-line i', steps) : null;
  if (steps) body.classList.add('x-has-steps');
  const featUi = $('.x-feature .x-ui');
  const cardImgs = $$('.x-card-media img');
  const rail = $('.x-rail');
  const darks = $$('[data-dark]');
  const railLinks = $$('.x-rail a');
  const railTargets = railLinks.map((a) => document.querySelector(a.getAttribute('href')));
  let ticking = false;

  const frame = () => {
    ticking = false;
    const vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    if (bar) bar.style.setProperty('--sp', clamp(scrollY / (max || 1)).toFixed(4));

    // rail: last section whose top passed 40% of the viewport
    let on = 0;
    railTargets.forEach((t, i) => { if (t && t.getBoundingClientRect().top <= vh * 0.4) on = i; });
    if (rail) {
      const mid = vh / 2;
      const dark = darks.some((d) => { const r = d.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; });
      if (rail.classList.contains('is-dark') !== dark) rail.classList.toggle('is-dark', dark);
    }
    railLinks.forEach((a, i) => {
      const is = i === on;
      if (a.classList.contains('is-on') !== is) {
        a.classList.toggle('is-on', is);
        if (is) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      }
    });

    if (reduce()) return;

    // stacked cards: shrink and dim as the next one slides over
    if (innerWidth > 900) {
      cards.forEach((c, i) => {
        const nxt = cards[i + 1];
        if (!nxt) return;
        const stick = 104 + i * 18;
        const t = clamp(1 - (nxt.getBoundingClientRect().top - stick) / (vh - stick));
        c.style.setProperty('--s', (1 - t * 0.06).toFixed(4));
        c.style.setProperty('--dim', (t * 0.35).toFixed(3));
      });
    }
    cardImgs.forEach((img) => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      img.style.setProperty('--py', ((r.top + r.height / 2 - vh / 2) * -0.06).toFixed(1) + 'px');
    });

    // photo: the frame opens from an inset card to full bleed
    if (photo) {
      const r = photo.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const t = clamp((vh - r.top) / (vh * 0.9));
        photo.style.setProperty('--cx', ((1 - t) * 10).toFixed(2) + '%');
        photo.style.setProperty('--cy', ((1 - t) * 6).toFixed(2) + '%');
        photo.style.setProperty('--cr', ((1 - t) * 36).toFixed(1) + 'px');
        if (photoImg) {
          photoImg.style.setProperty('--py', ((r.top + r.height / 2 - vh / 2) * -0.12).toFixed(1) + 'px');
          photoImg.style.setProperty('--ps', (1.12 - t * 0.12).toFixed(4));
        }
      }
    }

    // workflow scrollytelling
    if (flow && root.classList.contains('x-scrolly')) {
      const r = flow.getBoundingClientRect();
      const span = flow.offsetHeight - vh;
      if (r.top <= vh && r.bottom >= 0 && span > 0) {
        const p = clamp(-r.top / span);
        const idx = Math.min(tabs.length - 1, Math.floor(p * tabs.length));
        if (idx !== flowIdx) {
          flowIdx = idx;
          driving = true;
          tabs[idx].click();
          driving = false;
        }
      }
    }

    // process: line fills and stops light up in order
    if (steps) {
      const r = steps.getBoundingClientRect();
      const t = clamp((vh * 0.78 - r.top) / (r.height + vh * 0.15));
      if (stepLine) stepLine.parentElement.style.setProperty('--p', t.toFixed(4));
      if (stepLine) stepLine.style.setProperty('--p', t.toFixed(4));
      stepItems.forEach((li, i) => li.classList.toggle('is-on', t >= i / stepItems.length + 0.02));
    }

    // team statement: words light up as you read down
    if (scrub && scrubWords.length) {
      const r = scrub.getBoundingClientRect();
      if (r.bottom > -vh && r.top < vh * 1.5) {
        const t = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.32));
        const n = Math.round(t * scrubWords.length);
        scrubWords.forEach((w, i) => w.classList.toggle('is-on', i < n));
      }
    }

    if (featUi) {
      const r = featUi.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) featUi.style.setProperty('--py', ((r.top + r.height / 2 - vh / 2) * -0.05).toFixed(1) + 'px');
    }
  };

  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', () => { setScrolly(); request(); }, { passive: true });
  mqReduce.addEventListener?.('change', () => location.reload());
  frame();
})();
