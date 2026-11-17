/* KRIVA Services · "svx" layer, Mobile applications page (body.svx-mob).
   Loaded after services-x.js, which already runs reveals, split headlines, cursor, magnets,
   spotlight tiles, FAQ accordion, rail, progress and the delivery step line.
   This file adds: the hero phone loop, the role stage, the signal switch, the case tilt,
   and the page's old CTA + FAQ analytics. Static and readable without JS or with reduced motion. */
(function () {
  'use strict';
  const body = document.body;
  if (!body || !body.classList.contains('svx-mob')) return;
  body.classList.add('mb-js');
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ── Hero: accept → status → offline POD → synced ── */
  const hv = $('[data-mb-hero]');
  if (hv) {
    if (reduce()) hv.setAttribute('data-step', '2');
    else {
      const hold = [2600, 2400, 3400, 3200];
      let n = 0, t = 0;
      const loop = () => { hv.setAttribute('data-step', n); t = setTimeout(() => { n = (n + 1) % 4; loop(); }, hold[n]); };
      new IntersectionObserver(([e]) => {
        clearTimeout(t);
        if (e.isIntersecting) { n = 0; loop(); }
      }, { threshold: 0.2 }).observe(hv);
      if (fine) {
        const ph = $('.mb-phone', hv);
        const hero = hv.closest('.svx-hero');
        hero.addEventListener('pointermove', (e) => {
          const r = hero.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
          ph.style.setProperty('--rot', (-3 + x * 4).toFixed(2) + 'deg');
          ph.style.setProperty('--px', (x * 14).toFixed(1) + 'px');
          ph.style.setProperty('--py2', (y * 10).toFixed(1) + 'px');
        }, { passive: true });
        hero.addEventListener('pointerleave', () => { ph.style.setProperty('--rot', '-3deg'); ph.style.setProperty('--px', '0px'); ph.style.setProperty('--py2', '0px'); });
      }
    }
  }

  /* ── Users: three roles, one phone stage ── */
  const roles = $('[data-mb-roles]');
  if (roles) {
    const items = $$('.mb-role', roles);
    const stage = $('.mb-ustage', roles);
    let cur = 0, pinned = 0, auto = 0;
    const show = (i) => {
      cur = i;
      items.forEach((r, j) => {
        r.classList.toggle('is-on', j === i);
        const b = $('.cr-role-btn', r);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      });
      stage.setAttribute('data-on', i);
    };
    items.forEach((r, i) => {
      const b = $('.cr-role-btn', r);
      if (b) b.addEventListener('click', () => { pinned = Date.now(); show(i); });
    });
    if (!reduce()) {
      new IntersectionObserver(([e]) => {
        clearInterval(auto);
        if (e.isIntersecting) auto = setInterval(() => { if (Date.now() - pinned > 7000) show((cur + 1) % items.length); }, 4200);
      }, { threshold: 0.45 }).observe(stage);
    }
  }

  /* ── Workflow: drop the signal ── */
  const sw = $('[data-mb-signal]');
  const wf = $('#workflow');
  if (sw && wf) {
    sw.addEventListener('click', () => {
      const off = sw.getAttribute('aria-pressed') !== 'true';
      sw.setAttribute('aria-pressed', String(off));
      $('span:last-child', sw).textContent = off ? 'Bring the signal back' : 'Drop the signal';
      wf.classList.toggle('is-offline', off);
    });
  }

  /* ── Related work: illustration tilts toward the pointer ── */
  const tilt = $('[data-mb-tilt]');
  if (tilt && fine && !reduce()) {
    const inner = $('.mb-shot-in', tilt);
    tilt.addEventListener('pointermove', (e) => {
      const r = tilt.getBoundingClientRect();
      inner.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 7).toFixed(2) + 'deg');
      inner.style.setProperty('--rx', (((e.clientY - r.top) / r.height - 0.5) * -6).toFixed(2) + 'deg');
    }, { passive: true });
    tilt.addEventListener('pointerleave', () => { inner.style.setProperty('--ry', '0deg'); inner.style.setProperty('--rx', '0deg'); });
  }

  /* ── Analytics carried over from the old inline script ── */
  const track = (ev, p) => { if (typeof window.krivaTrack === 'function') window.krivaTrack(ev, p); };
  $$('[data-kriva-cta]').forEach((a) => {
    a.addEventListener('click', () => {
      if (a.matches('button, [type="submit"]')) return;
      const href = a.getAttribute('href') || '';
      if (href === '#inquire' || href === '#book' || href === '#brief') return;
      try {
        const u = new URL(href, location.href);
        if (u.origin === location.origin && (/^\/contact\/?$/.test(u.pathname) || u.hash === '#inquire')) return;
      } catch (err) { /* ignore */ }
      const loc = a.closest('.cr-inq') ? 'inquire' : a.closest('.mb-work') ? 'case_study' : a.closest('.svx-hero') ? 'hero' : 'page';
      track('cta_click', { cta_name: a.getAttribute('data-kriva-cta'), cta_type: 'cta', cta_location: loc, link_url: href });
    });
  });
  /* services-x.js toggles the accordion first; this runs after and reports opens only */
  $$('.faq-q').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.getAttribute('aria-expanded') === 'true') track('select_content', { content_type: 'faq_item', item_id: btn.id, cta_location: 'faq' });
    });
  });
})();
