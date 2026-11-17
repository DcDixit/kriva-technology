/* KRIVA Solutions · QuickBooks and Xero integrations page (body.sx-acc), alongside solutions-x.js.
   No libraries. Everything is static, final-state, and fully readable under reduced motion or without JS.
   Re-implements the old page script: the seven-stage close ledger driven by scroll.
   Also carries this page's CTA and FAQ analytics, in the same shape as the other solution pages. */
(function () {
  'use strict';
  const body = document.body;
  if (!body || !body.classList.contains('sx-acc')) return;
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mqFine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = () => mqReduce.matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ── Hero: the job ties out row by row; QuickBooks ⇄ Xero switch ── */
  const tie = $('[data-acx-tie]');
  if (tie) {
    const rows = $$('.acx-tie-rows li', tie);
    const count = $('[data-acx-count]', tie);
    const state = $('[data-acx-tie-state]', tie);
    const route = $('[data-acx-route]', tie);
    const name = $('[data-acx-ledger-name]', tie);
    const logo = $('[data-acx-ledger-logo]', tie);
    const refs = $$('[data-ref]', tie);
    const btns = $$('[data-ledger-set]', tie);
    const total = count ? parseInt(count.getAttribute('data-acx-count'), 10) : 0;
    const LEDGER = {
      qbo: { name: 'QuickBooks Online', logo: '#acx-qb', ref: (n) => 'Invoice ' + n, route: 'to the operator queue' },
      xero: { name: 'Xero', logo: '#acx-xero', ref: (n) => 'ACCREC INV-' + n, route: 'same queue, same language' }
    };
    const setLedger = (k) => {
      const L = LEDGER[k];
      if (!L) return;
      btns.forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute('data-ledger-set') === k)));
      const apply = () => {
        tie.setAttribute('data-ledger', k);
        if (name) name.textContent = L.name;
        if (logo) logo.setAttribute('href', L.logo);
        refs.forEach((r) => { r.textContent = L.ref(r.getAttribute('data-ref')); });
        if (route) route.textContent = L.route;
        tie.classList.remove('is-swap');
      };
      if (reduce()) { apply(); return; }
      tie.setAttribute('data-ledger', k);
      tie.classList.add('is-swap');
      setTimeout(apply, 220);
    };
    btns.forEach((b) => b.addEventListener('click', () => setLedger(b.getAttribute('data-ledger-set'))));

    if (!reduce()) {
      let timers = [], live = false;
      const later = (fn, ms) => timers.push(setTimeout(fn, ms));
      const stop = () => { timers.forEach(clearTimeout); timers = []; };
      const fmt = (v) => Math.round(v).toLocaleString('en-US');
      const countTo = (from, to, dur) => {
        if (!count) return;
        const t0 = performance.now();
        const step = (now) => {
          const k = clamp((now - t0) / dur);
          count.textContent = fmt(from + (to - from) * (1 - Math.pow(1 - k, 3)));
          if (k < 1 && live) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      };
      const run = () => {
        stop();
        tie.classList.add('is-run');
        rows.forEach((r) => r.classList.remove('is-done', 'is-scan'));
        if (state) state.textContent = 'tying out';
        if (count) count.textContent = '0';
        let t = 500;
        rows.forEach((r, i) => {
          later(() => r.classList.add('is-scan'), t);
          later(() => { r.classList.remove('is-scan'); r.classList.add('is-done'); }, t + 520);
          later(() => countTo(Math.round(total * i / rows.length), Math.round(total * (i + 1) / rows.length), 480), t + 40);
          t += 900;
        });
        later(() => { if (state) state.textContent = 'tied out · 1 exception'; }, t);
        later(run, t + 5200);
      };
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !live) { live = true; run(); }
        else if (!e.isIntersecting && live) {
          live = false; stop();
          rows.forEach((r) => { r.classList.remove('is-scan'); r.classList.add('is-done'); });
          if (count) count.textContent = fmt(total);
          if (state) state.textContent = 'tied out · 1 exception';
        }
      }, { threshold: 0.3 }).observe(tie);

      const hero = $('.acx-hero');
      if (hero && mqFine.matches) {
        hero.addEventListener('pointermove', (e) => {
          const b = tie.getBoundingClientRect();
          const r = hero.getBoundingClientRect();
          tie.style.setProperty('--ry', (clamp((e.clientX - (b.left + b.width / 2)) / (r.width / 2), -1, 1) * 5).toFixed(2) + 'deg');
          tie.style.setProperty('--rx', (clamp((e.clientY - (b.top + b.height / 2)) / (r.height / 2), -1, 1) * -4).toFixed(2) + 'deg');
        }, { passive: true });
        hero.addEventListener('pointerleave', () => { tie.style.setProperty('--rx', '0deg'); tie.style.setProperty('--ry', '0deg'); });
      }
    } else if (state) {
      state.textContent = 'tied out · 1 exception';
    }
  }

  /* ── Platforms: progressive tabs (both panels stay visible without JS) ── */
  const pl = $('[data-acx-pl]');
  if (pl) {
    const list = $('[role="tablist"]', pl);
    const tabs = $$('[role="tab"]', pl);
    const ind = $('.acx-pl-ind', pl);
    const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
    $$('.acx-gauge-bars', pl).forEach((g) => $$('i', g).forEach((b, i) => b.style.setProperty('--n', i)));
    const place = () => {
      const on = tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
      if (!ind || !on) return;
      ind.style.setProperty('--w', on.offsetWidth + 'px');
      ind.style.setProperty('--x', (on.offsetLeft - 6) + 'px');
    };
    const select = (i, focus) => {
      tabs.forEach((t, j) => {
        const on = i === j;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        panels[j].hidden = !on;
        panels[j].classList.toggle('is-enter', on);
        if (on) panels[j].classList.add('is-in');
      });
      if (focus) tabs[i].focus();
      place();
    };
    if (list && tabs.length === 2 && panels.every(Boolean)) {
      list.hidden = false;
      pl.classList.add('is-tabs');
      panels.forEach((p, j) => { p.setAttribute('role', 'tabpanel'); p.setAttribute('aria-labelledby', tabs[j].id); p.tabIndex = 0; });
      tabs.forEach((t, i) => {
        t.addEventListener('click', () => select(i));
        t.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); select((i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length, true); }
          else if (e.key === 'Home') { e.preventDefault(); select(0, true); }
          else if (e.key === 'End') { e.preventDefault(); select(tabs.length - 1, true); }
        });
      });
      select(0);
      panels[0].classList.remove('is-enter');
      addEventListener('resize', place, { passive: true });
      addEventListener('load', place);
    }
  }

  /* ── Close cycle: seven stages, driven by the beat nearest the viewport centre ── */
  const close = $('.acx-close');
  const led = close ? $('.acx-led', close) : null;
  const beats = close ? $$('.acx-beat', close) : [];
  if (close && led && beats.length) {
    const q = (k) => $('[data-led="' + k + '"]', close);
    const audit = $$('.acx-led-audit li', led);
    const pips = $$('.acx-led-pips i', led);
    const tags = {};
    ['a', 'b', 'c', 'd'].forEach((k) => { tags[k] = $('[data-rec="' + k + '"]', led); });
    const S = {
      1: { job: 'queued', lbl: 'Import', p: 0.2, val: '248 / 248', clean: ['Imported', 't-idle'], ex: ['Imported', 't-idle'], label: 'Imported' },
      2: { job: 'running', lbl: 'Validate', p: 0.45, val: '248 / 248', clean: ['Validated', 't-sync'], ex: ['Validated', 't-sync'], label: 'Validated' },
      3: { job: 'running', lbl: 'Match', p: 0.72, val: '247 / 248', clean: ['Matched', 't-ok'], ex: ['Matching', 't-sync'], label: 'Matched' },
      4: { job: 'exception', lbl: 'Match', p: 0.72, val: '247 / 248', clean: ['Matched', 't-ok'], ex: ['Exception', 't-warn'], label: 'Exception detected' },
      5: { job: 'retrying', lbl: 'Review', p: 0.88, val: '247 / 248', clean: ['Matched', 't-ok'], ex: ['In review', 't-warn'], label: 'Operator review' },
      6: { job: 'resolved', lbl: 'Close', p: 1, val: '248 / 248', clean: ['Matched', 't-ok'], ex: ['Reconciled', 't-ok'], label: 'Reconciled' },
      7: { job: 'closed', lbl: 'Audit', p: 1, val: '248 / 248', clean: ['Matched', 't-ok'], ex: ['Reconciled', 't-ok'], label: 'Audit trail written' }
    };
    let now = 0;
    const setState = (n, quiet) => {
      if (n === now || !S[n]) return;
      now = n;
      const s = S[n];
      led.setAttribute('data-state', String(n));
      q('job').textContent = s.job;
      q('lbl').textContent = s.lbl;
      q('val').textContent = s.val;
      q('track').style.setProperty('--p', s.p);
      ['a', 'b', 'd'].forEach((k) => { if (tags[k]) { tags[k].textContent = s.clean[0]; tags[k].className = 'acx-tag ' + s.clean[1]; } });
      if (tags.c) { tags.c.textContent = s.ex[0]; tags.c.className = 'acx-tag ' + s.ex[1]; }
      q('amt').textContent = n >= 6 ? '1,240.75' : '1,204.75';
      if (n >= 5) {
        q('exTitle').textContent = 'Exception · queued for operator review';
        q('exBody').textContent = 'Retry did not clear · finance to confirm correct value';
      } else {
        q('exTitle').textContent = 'Exception · amount variance on INV-2293';
        q('exBody').textContent = 'Source 1,204.75 · ledger 1,240.75 · transposition suspected';
      }
      audit.forEach((li) => li.classList.toggle('on', +li.getAttribute('data-from') <= n));
      pips.forEach((p, i) => {
        p.classList.remove('on', 'done', 'warn');
        if (i < n - 1) p.classList.add('done');
        else if (i === n - 1) p.classList.add(n === 4 || n === 5 ? 'warn' : 'on');
      });
      beats.forEach((b) => b.classList.toggle('is-on', +b.getAttribute('data-beat') === n));
      if (!quiet) q('announce').textContent = 'Stage ' + n + ' of 7: ' + s.label;
    };
    const scrollyOK = () => !reduce() && innerWidth > 1000 && innerHeight >= 700;
    const mode = () => {
      const on = scrollyOK();
      close.classList.toggle('is-scrolly', on);
      close.classList.toggle('is-live', on);
      if (!on) { now = 0; setState(7, true); beats.forEach((b) => b.classList.remove('is-on')); }
    };
    mode();
    let tick = false;
    const frame = () => {
      tick = false;
      if (!close.classList.contains('is-scrolly')) return;
      const vh = innerHeight;
      let best = 1, bestD = Infinity;
      beats.forEach((b) => {
        const r = b.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - vh / 2);
        if (d < bestD) { bestD = d; best = +b.getAttribute('data-beat'); }
      });
      setState(best);
    };
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true });
    addEventListener('resize', () => { mode(); frame(); }, { passive: true });
    frame();
  }

  /* ── Exception explorer: the four types swap the operator card ── */
  const exq = $('[data-acx-exq]');
  if (exq) {
    const card = $('[data-ex-card]', exq);
    const f = (k) => $('[data-exf="' + k + '"]', card);
    const types = $$('[data-ex]', exq);
    const EX = {
      amt: { title: 'INV-2293 · Amount variance', k1: 'Source value', v1: '1,204.75', k2: 'Ledger value', v2: '1,240.75', cause: 'digit transposition · Halden Co',
        label: 'Exception card: amount variance on INV-2293, source 1204.75, ledger 1240.75, close risk, actions retry, confirm, or park, assigned to the controller, audit pending review' },
      tax: { title: 'INV-2307 · Tax / VAT mismatch', k1: 'Source tax', v1: 'UK VAT 20%', k2: 'Ledger tax', v2: 'No VAT', cause: 'tax code not mapped for the UK organization · Northgate',
        label: 'Exception card: tax mismatch on INV-2307, source UK VAT 20 percent, ledger no VAT, close risk, actions retry, confirm, or park, assigned to the controller, audit pending review' },
      ent: { title: 'PAY-1188 · Entity mapping', k1: 'Source entity', v1: 'Acme UK', k2: 'Posted to', v2: 'Acme US · QBO', cause: 'payment routed to the wrong company file · Brightside',
        label: 'Exception card: entity mapping on payment PAY-1188, source entity Acme UK, posted to Acme US in QuickBooks, close risk, actions retry, confirm, or park, assigned to the controller, audit pending review' },
      dup: { title: 'INV-2291 · Duplicate posting', k1: 'Source records', v1: '1 invoice', k2: 'Ledger entries', v2: '2 postings', cause: 'retry after a timeout already posted · Acme Ltd',
        label: 'Exception card: duplicate posting of INV-2291, one source invoice, two ledger postings, close risk, actions retry, confirm, or park, assigned to the controller, audit pending review' }
    };
    types.forEach((b) => b.addEventListener('click', () => {
      const d = EX[b.getAttribute('data-ex')];
      if (!d || !card) return;
      types.forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
      ['title', 'k1', 'v1', 'k2', 'v2', 'cause'].forEach((k) => { const el = f(k); if (el) el.textContent = d[k]; });
      card.setAttribute('aria-label', d.label);
      if (!reduce()) { card.classList.remove('is-swap'); void card.offsetWidth; card.classList.add('is-swap'); }
    }));
  }

  /* ── One-shot reveals for this page's own pieces ── */
  const once = $$('.acx-mx-queue');
  if (reduce()) once.forEach((el) => el.classList.add('is-in'));
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: 0.4 });
    once.forEach((el) => io.observe(el));
  }

  /* ── Scroll loop: architecture path, photo parallax, case panels ── */
  const path = $('[data-acx-path]');
  const pathLine = path ? $('.acx-path-line', path) : null;
  const nodes = path ? $$('.acx-node', path) : [];
  if (path && !reduce()) body.classList.add('acx-path-live');
  const pars = $$('[data-acx-par]').map((el) => ({ el, img: $('img', el) }));
  const pus = $$('.acx-pu');
  let ticking = false;
  const frame = () => {
    ticking = false;
    if (reduce()) return;
    const vh = innerHeight;
    if (path && pathLine) {
      const r = path.getBoundingClientRect();
      const t = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.3 || 1));
      pathLine.style.setProperty('--p', t.toFixed(4));
      nodes.forEach((n, i) => n.classList.toggle('is-on', t >= i / Math.max(1, nodes.length - 1) - 0.02));
    }
    pars.forEach(({ el, img }) => {
      if (!img) return;
      const r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) img.style.setProperty('--py', ((r.top + r.height / 2 - vh / 2) * -0.08).toFixed(1) + 'px');
    });
    if (pus.length && innerWidth > 1000) {
      const r = pus[0].getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) pus[0].style.setProperty('--py', ((r.top + r.height / 2 - vh / 2) * -0.05).toFixed(1) + 'px');
    }
  };
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request, { passive: true });
  addEventListener('load', request);
  frame();

  /* ── Analytics: named CTAs and FAQ opens ── */
  const track = (name, type, location, url) => {
    if (typeof window.krivaTrack === 'function') window.krivaTrack('cta_click', { cta_name: name, cta_type: type, cta_location: location, link_url: url || '' });
  };
  $$('[data-kriva-cta]').forEach((el) => {
    el.addEventListener('click', () => {
      const href = el.getAttribute('href') || '';
      const loc = el.closest('.acx-hero') ? 'hero'
        : el.closest('.acx-case') ? 'case_study'
        : el.closest('#build') ? 'capabilities'
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
