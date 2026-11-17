/* KRIVA Services · "svx" layer, SaaS Platforms page (body.svx-saas).
   services-x.js (loaded first) runs the shared parts: split headlines, reveals, cursor, magnets,
   spotlight tiles, FAQ, section rail, progress bar, parallax, and the process line.
   This file adds the page's own pieces. Static and readable without JS or under reduced motion. */
(function () {
  'use strict';
  const body = document.body;
  if (!body || !body.classList.contains('svx-saas')) return;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const whenVisible = (el, on, off, threshold = 0.3) =>
    new IntersectionObserver(([e]) => (e.isIntersecting ? on() : off && off()), { threshold }).observe(el);

  /* ── Hero console: two tenants, three roles, every request checked in the API ── */
  const con = $('[data-sp-con]');
  if (con) {
    const role = $('[data-sp-role]', con);
    const path = $('[data-sp-path]', con);
    const st = $('[data-sp-st]', con);
    const api = $('.sp-api', con);
    const S = [
      { t: 0, r: 'owner', l: 'Owner', p: '/api/members', s: '200 · 3 rows', d: 0, x: 0 },
      { t: 0, r: 'member', l: 'Member', p: '/api/members/export', s: '403 · ask owner', d: 1, x: 0 },
      { t: 1, r: 'admin', l: 'Admin', p: '/api/members', s: '200 · 3 rows', d: 0, x: 0 },
      { t: 1, r: 'admin', l: 'Admin', p: '/api/members?tenant=acme', s: '403 · other tenant', d: 1, x: 1 }
    ];
    let n = 0, t = 0;
    const set = (i) => {
      const s = S[i];
      const swap = role && role.textContent !== s.l;
      con.setAttribute('data-tenant', s.t);
      con.setAttribute('data-role', s.r);
      con.setAttribute('data-deny', s.d);
      con.setAttribute('data-cross', s.x);
      if (path) path.textContent = s.p;
      if (st) st.textContent = s.s;
      if (api && !reduce()) { api.classList.remove('is-ping'); void api.offsetWidth; api.classList.add('is-ping'); }
      if (role) {
        if (swap && !reduce()) {
          role.classList.add('is-swap');
          setTimeout(() => { role.textContent = s.l; role.classList.remove('is-swap'); }, 220);
        } else role.textContent = s.l;
      }
    };
    if (reduce()) set(1);
    else {
      const loop = () => { set(n); t = setTimeout(() => { n = (n + 1) % S.length; loop(); }, n === 3 ? 3400 : 2600); };
      whenVisible(con, () => { clearTimeout(t); n = 0; loop(); }, () => clearTimeout(t), 0.25);
    }
  }

  /* ── Surfaces: accessible tabs (same ids and keyboard model as before) ── */
  const tabs = $$('.sp-tabs [role="tab"]');
  const tabWrap = $('.sp-tabs');
  const panels = { 'tab-admin': ['panel-admin', 'view-admin'], 'tab-customer': ['panel-customer', 'view-customer'], 'tab-roles': ['panel-roles', 'view-roles'] };
  const selectSurface = (id) => {
    tabs.forEach((t, i) => {
      const on = t.id === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && tabWrap) tabWrap.style.setProperty('--ti', i);
    });
    Object.entries(panels).forEach(([key, ids]) => ids.forEach((pid) => {
      const el = document.getElementById(pid);
      if (el) el.hidden = key !== id;
    }));
  };
  tabs.forEach((btn, i) => {
    btn.tabIndex = i === 0 ? 0 : -1;
    btn.addEventListener('click', () => selectSurface(btn.id));
    btn.addEventListener('keydown', (e) => {
      const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      const jump = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : -1;
      if (!dir && jump < 0) return;
      e.preventDefault();
      const k = jump >= 0 ? jump : (i + dir + tabs.length) % tabs.length;
      tabs[k].focus();
      selectSurface(tabs[k].id);
    });
  });
  /* Clicking the preview steps to the next surface */
  const views = $('.sp-views');
  if (views && tabs.length) {
    views.addEventListener('click', () => {
      const i = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
      selectSurface(tabs[(i + 1) % tabs.length].id);
    });
  }

  /* ── What we build: the card crossing the middle lights its layer ── */
  const build = $('[data-sp-build]');
  if (build) {
    const parts = $$('.sp-part', build);
    const arch = $$('.sp-arch li', build);
    const light = (n) => {
      parts.forEach((p) => p.classList.toggle('is-on', p.dataset.n === n));
      arch.forEach((a) => a.classList.toggle('is-on', a.dataset.n === n));
    };
    light('1');
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) light(e.target.dataset.n); }), { rootMargin: '-45% 0px -45% 0px' });
    parts.forEach((p) => {
      io.observe(p);
      if (fine.matches) p.addEventListener('pointerenter', () => light(p.dataset.n));
    });
  }

  /* ── PayrollPro first sitting: steps advance to first value, then rest ── */
  const ob = $('[data-sp-ob]');
  if (ob) {
    const lis = $$('.sp-ob-steps li', ob);
    const labels = lis.map((li) => $('small', li));
    const paint = (k) => {
      lis.forEach((li, i) => {
        li.classList.toggle('is-done', i < k);
        li.classList.toggle('is-now', i === k);
        if (labels[i]) labels[i].textContent = i < k ? 'Done' : i === k ? 'Now' : 'Later';
      });
      ob.style.setProperty('--obp', ((k + 0.5) / lis.length) * 100 + '%');
    };
    paint(2);
    if (!reduce()) {
      let k = 0, t = 0;
      const loop = () => { paint(k); t = setTimeout(() => { k = (k + 1) % 3; loop(); }, k === 2 ? 4200 : 1300); };
      whenVisible(ob, () => { clearTimeout(t); k = 0; loop(); }, () => { clearTimeout(t); paint(2); }, 0.4);
      const wrap = ob.parentElement;
      if (fine.matches && wrap) {
        wrap.addEventListener('pointermove', (e) => {
          const r = wrap.getBoundingClientRect();
          ob.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 7).toFixed(2) + 'deg');
          ob.style.setProperty('--rx', (((e.clientY - r.top) / r.height - 0.5) * -6).toFixed(2) + 'deg');
        }, { passive: true });
        wrap.addEventListener('pointerleave', () => { ob.style.setProperty('--ry', '0deg'); ob.style.setProperty('--rx', '0deg'); });
      }
    }
  }

  /* ── Mobile section chips follow the scroll ── */
  const chips = $$('#mobChips a');
  if (chips.length) {
    const targets = chips.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const cio = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      chips.forEach((a) => a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'));
    }), { rootMargin: '-35% 0px -55% 0px' });
    targets.forEach((t) => cio.observe(t));
  }

  /* ── Platform layers separate as the section scrolls in ── */
  const stack = $('[data-sp-layers] .sp-stack');
  if (stack && !reduce()) {
    let ticking = false;
    const run = () => {
      ticking = false;
      const r = stack.getBoundingClientRect();
      const vh = innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      stack.style.setProperty('--lp', clamp((vh - r.top) / (vh * 0.8)).toFixed(3));
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }
})();
