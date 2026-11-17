/* KRIVA Solutions · Auto transport page motion (body.sx-car), alongside solutions-x.js.
   No libraries. Everything is static and fully readable under reduced motion or without JS.
   Also carries this page's CTA and FAQ analytics (kept from the previous page script). */
(function () {
  'use strict';
  const body = document.body;
  if (!body || !body.classList.contains('sx-car')) return;
  const root = document.documentElement;
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mqFine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = () => mqReduce.matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ── Hero ticket: the order walks quote → dispatch → pickup → delivery ── */
  const ticket = $('[data-cx-ticket]');
  if (ticket) {
    const steps = $$('.cx-t-steps li', ticket);
    const set = (n) => {
      steps.forEach((li, i) => {
        li.classList.toggle('is-done', i < n);
        li.classList.toggle('is-on', i === n);
        li.classList.toggle('is-todo', i > n);
      });
      ticket.style.setProperty('--tp', (n / (steps.length - 1)).toFixed(3));
    };
    if (reduce()) set(steps.length - 1);
    else {
      let n = 0, t = 0;
      const walk = () => { set(n); n = (n + 1) % (steps.length + 1); t = setTimeout(walk, n === 0 ? 2600 : 1700); };
      set(0);
      new IntersectionObserver(([e]) => {
        clearTimeout(t);
        if (e.isIntersecting) { n = 0; t = setTimeout(walk, 900); }
      }, { threshold: 0.3 }).observe(ticket);
    }
  }

  /* ── Quote portal: notes light the matching part; the total counts up once ── */
  const portal = $('[data-cx-portal]');
  if (portal) {
    $$('.cx-q-notes [data-hl]').forEach((li) => {
      const on = () => { portal.setAttribute('data-on', li.getAttribute('data-hl')); li.classList.add('is-on'); };
      const off = () => { portal.removeAttribute('data-on'); li.classList.remove('is-on'); };
      li.addEventListener('pointerenter', on);
      li.addEventListener('pointerleave', off);
    });
    const total = $('[data-cx-count]', portal);
    if (total && !reduce()) {
      const to = parseInt(total.getAttribute('data-cx-count'), 10);
      const fmt = (v) => '$' + Math.round(v).toLocaleString('en-US');
      total.textContent = fmt(0);
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now(), dur = 1300;
        const step = (now) => {
          const k = clamp((now - t0) / dur);
          total.textContent = fmt(to * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(step);
        };
        setTimeout(() => requestAnimationFrame(step), 350);
      }, { threshold: 0.4 });
      io.observe(total);
    }
  }

  /* ── Lifecycle: the car drives the road while the four phases scroll past ── */
  const life = $('[data-cx-life]');
  const phases = life ? $$('.cx-phase', life) : [];
  const way = life ? $('.cx-road-way', life) : null;
  const stops = life ? $$('.cx-road-stop', life) : [];
  const flowLinks = $$('.cx-flow a');
  const lifeOK = () => !reduce() && innerWidth > 1000;
  const setLifeMode = () => {
    root.classList.toggle('cx-scroll', lifeOK());
    body.classList.toggle('cx-has-life', lifeOK());
  };
  if (life) setLifeMode();

  /* ── Scroll loop for this page only ── */
  const stack = $$('[data-cx-stack] .cx-card');
  const pars = $$('[data-cx-par]').map((el) => ({ el, img: $('img', el) }));
  const tilt = $('[data-cx-tilt] .cx-browser-in');
  const heroImg = $('.cx-hero-img');
  let ticking = false;

  const frame = () => {
    ticking = false;
    const vh = innerHeight;

    if (phases.length && root.classList.contains('cx-scroll')) {
      const first = phases[0].getBoundingClientRect();
      const last = phases[phases.length - 1].getBoundingClientRect();
      const c1 = first.top + first.height / 2;
      const c4 = last.top + last.height / 2;
      const p = clamp((vh / 2 - c1) / ((c4 - c1) || 1));
      way.style.setProperty('--p', p.toFixed(4));
      let best = 0, bestD = Infinity;
      phases.forEach((ph, i) => {
        const r = ph.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - vh / 2);
        if (d < bestD) { bestD = d; best = i; }
      });
      phases.forEach((ph, i) => ph.classList.toggle('is-on', i === best));
      flowLinks.forEach((a, i) => a.classList.toggle('is-on', i === best && first.top < vh * 0.7 && last.bottom > vh * 0.3));
      stops.forEach((s, i) => s.classList.toggle('is-on', p >= i / Math.max(1, stops.length - 1) - 0.02));
    }

    if (reduce()) return;

    // stacked problem cards: the one underneath shrinks and dims as the next one covers it
    if (stack.length > 1 && innerWidth > 1000 && vh >= 720) {
      stack.forEach((card, i) => {
        const next = stack[i + 1];
        if (!next) { card.style.setProperty('--s', '1'); card.style.setProperty('--dim', '0'); return; }
        const a = card.getBoundingClientRect();
        const b = next.getBoundingClientRect();
        const k = clamp(1 - (b.top - a.top) / (a.height || 1));
        card.style.setProperty('--s', (1 - k * 0.05).toFixed(4));
        card.style.setProperty('--dim', (k * 0.55).toFixed(3));
      });
    }

    // photos drift slower than the page
    pars.forEach(({ el, img }) => {
      if (!img) return;
      const r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) img.style.setProperty('--py', ((r.top + r.height / 2 - vh / 2) * -0.08).toFixed(1) + 'px');
    });

    // hero photo settles from a slight zoom as you leave the hero
    if (heroImg) {
      const r = heroImg.getBoundingClientRect();
      if (r.bottom > 0) heroImg.style.setProperty('--hs', (1 + clamp(-r.top / vh) * 0.06).toFixed(4));
    }

    // the live site straightens as it reaches the middle of the screen
    if (tilt && innerWidth > 1000) {
      const r = tilt.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) tilt.style.setProperty('--tilt', clamp((r.top + r.height / 2 - vh * 0.5) / (vh * 0.6), -1, 1).toFixed(3));
    }
  };
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', () => { if (life) setLifeMode(); request(); }, { passive: true });
  addEventListener('load', request);
  frame();

  /* ── Analytics: named CTAs and FAQ opens (same events and locations as before) ── */
  const track = (name, type, location, url) => {
    if (typeof window.krivaTrack === 'function') window.krivaTrack('cta_click', { cta_name: name, cta_type: type, cta_location: location, link_url: url || '' });
  };
  $$('[data-kriva-cta]').forEach((el) => {
    el.addEventListener('click', () => {
      if (el.matches('button, [type="submit"]')) return;
      const href = el.getAttribute('href') || '';
      if (href === '#inquire' || href === '#book' || href === '#brief') return;
      try {
        const u = new URL(href, location.href);
        if (u.origin === location.origin && (/^\/contact\/?$/.test(u.pathname) || u.hash === '#inquire')) return;
      } catch (err) { /* ignore */ }
      const loc = el.closest('#inquire') ? 'inquire'
        : el.closest('.cx-proof-split') ? 'case_study'
        : el.closest('.cx-adj') ? 'related_work'
        : el.closest('.cx-hero') ? 'hero'
        : el.closest('#capabilities') ? 'capabilities'
        : 'page';
      track(el.getAttribute('data-kriva-cta'), 'cta', loc, href);
    });
  });
  $$('.sx-faq-list details').forEach((d) => {
    d.addEventListener('toggle', () => {
      const s = $('summary', d);
      if (d.open && s && typeof window.krivaTrack === 'function') window.krivaTrack('select_content', { content_type: 'faq_item', item_id: s.id, cta_location: 'faq' });
    });
  });
})();
