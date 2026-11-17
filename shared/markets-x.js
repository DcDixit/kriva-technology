/* KRIVA Markets + Industries · "mx" layer motion and interactions. No libraries.
   Every page reads fully without JS or under reduced motion: all states below are enhancements
   over static, complete markup. */
(function () {
  'use strict';
  const body = document.body;
  if (!body || !body.classList.contains('mx')) return;
  window.__mx = true;
  const root = document.documentElement;
  root.classList.add('mx-js');
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mqFine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = () => mqReduce.matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  if (reduce()) root.classList.remove('mx-motion');
  /* Run a callback only while an element is on screen. */
  const whileVisible = (el, on, off, threshold = 0.3) => {
    if (!el) return;
    new IntersectionObserver(([e]) => (e.isIntersecting ? on() : off && off()), { threshold }).observe(el);
  };

  /* ── Split headlines into words for the rise-in ── */
  $$('[data-split]').forEach((h) => {
    if (h.dataset.splitDone) return;
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            const w = document.createElement('span'); w.className = 'mx-w';
            const wi = document.createElement('span'); wi.className = 'mx-wi'; wi.style.setProperty('--i', i++);
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
  $$('[data-x],[data-split],[data-in]').forEach((el) => (reduce() ? el.classList.add('is-in') : io.observe(el)));

  /* ── Live local clocks (market switch, US time zones) ── */
  const clocks = $$('[data-tz]');
  if (clocks.length) {
    const fmts = new Map();
    const tick = () => {
      const now = new Date();
      clocks.forEach((el) => {
        const tz = el.getAttribute('data-tz');
        try {
          if (!fmts.has(tz)) fmts.set(tz, new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }));
          el.textContent = fmts.get(tz).format(now).replace(',', '');
        } catch (_) { /* leave the static label */ }
      });
    };
    tick();
    setInterval(tick, 20000);
  }

  /* ── Hero glow follows the pointer ── */
  const hero = $('.mx-hero');
  const glow = $('.mx-glow');
  if (hero && glow && mqFine.matches && !reduce()) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      glow.style.setProperty('--gx', ((e.clientX - r.left) / r.width) * 100 + '%');
      glow.style.setProperty('--gy', ((e.clientY - r.top) / r.height) * 100 + '%');
    }, { passive: true });
  }

  /* ── Spotlight, magnetic buttons, tilt (fine pointers only) ── */
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
    $$('[data-tilt]').forEach((wrap) => {
      const t = wrap.firstElementChild;
      if (!t) return;
      t.style.transition = 'transform .8s cubic-bezier(.16,1,.3,1)';
      wrap.addEventListener('pointermove', (e) => {
        const r = wrap.getBoundingClientRect();
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
        const rx = ((e.clientY - r.top) / r.height - 0.5) * -5;
        t.style.transform = `perspective(1400px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      }, { passive: true });
      wrap.addEventListener('pointerleave', () => { t.style.transform = ''; });
    });
  }

  /* ── Custom cursor: a dot plus a lagging ring that names the action ── */
  if (mqFine.matches && !reduce()) {
    const cur = document.createElement('div');
    cur.className = 'mx-cursor is-off';
    cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML = '<div class="mx-cursor-ring"><b></b></div><div class="mx-cursor-dot"></div>';
    body.appendChild(cur);
    root.classList.add('mx-cur');
    const dot = $('.mx-cursor-dot', cur);
    const ring = $('.mx-cursor-ring', cur);
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

  /* ── Pressed-button groups: one choice at a time, optional auto-cycle until touched ── */
  const group = (btns, onPick, { auto = 0, scope = null } = {}) => {
    if (!btns.length) return;
    let cur = 0, touched = false, t = 0;
    const pick = (i) => {
      cur = i;
      btns.forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
      onPick(i);
    };
    btns.forEach((b, i) => b.addEventListener('click', () => { touched = true; clearInterval(t); pick(i); }));
    pick(btns.findIndex((b) => b.getAttribute('aria-pressed') === 'true') === -1 ? 0 : btns.findIndex((b) => b.getAttribute('aria-pressed') === 'true'));
    if (auto && !reduce() && scope) {
      whileVisible(scope, () => { clearInterval(t); if (!touched) t = setInterval(() => pick((cur + 1) % btns.length), auto); }, () => clearInterval(t), 0.4);
    }
    return pick;
  };

  /* ════════ US · assignment row respects hours of service ════════ */
  const usb = $('[data-us-board]');
  if (usb) {
    const msg = $('[data-us-msg]', usb);
    const msgs = (usb.getAttribute('data-msgs') || '').split('|');
    const stv = $$('[data-st]', usb);
    const orig = stv.map((s) => s.textContent);
    const set = (n) => {
      usb.setAttribute('data-step', n);
      if (msg && msgs[n]) msg.textContent = msgs[n];
      stv.forEach((s, i) => { const alt = (s.getAttribute('data-st') || '').split('|')[n]; s.textContent = alt || orig[i]; });
    };
    if (reduce()) set(2);
    else {
      let n = 0, t = 0;
      const loop = () => { set(n); t = setTimeout(() => { n = (n + 1) % 3; loop(); }, n === 2 ? 3800 : 2600); };
      whileVisible(usb, () => { clearTimeout(t); n = 0; loop(); }, () => clearTimeout(t), 0.25);
    }
  }
  /* US anatomy: the step crossing the middle of the viewport lights its layer */
  const anat = $('[data-us-anat]');
  if (anat) {
    const layers = $$('.us-layer', anat);
    const steps = $$('.us-step', anat);
    const light = (i) => layers.forEach((l, j) => { l.classList.toggle('is-on', j === i); l.classList.toggle('is-done', j < i); });
    light(0);
    const sio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) light(steps.indexOf(e.target)); }), { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach((s) => sio.observe(s));
  }

  /* ════════ UK · questionnaire answered with screenshots ════════ */
  const ukq = $('[data-uk-q]');
  if (ukq) {
    const items = $$('.uk-qi', ukq);
    const bar = $('.bar i', ukq);
    const cnt = $('[data-uk-count]', ukq);
    const set = (n) => {
      items.forEach((it, i) => it.classList.toggle('is-ok', i < n));
      if (bar) bar.style.setProperty('--p', (n / items.length) * 100 + '%');
      if (cnt) cnt.textContent = n;
    };
    if (reduce()) set(items.length);
    else {
      let n = 0, t = 0;
      const loop = () => { set(n); t = setTimeout(() => { n = n >= items.length ? 0 : n + 1; loop(); }, n === items.length ? 3600 : n === 0 ? 1400 : 1100); };
      whileVisible(ukq, () => { clearTimeout(t); n = 0; loop(); }, () => clearTimeout(t), 0.25);
    }
  }
  /* UK admin panel: export, correct, delete each write an audit line */
  const adm = $('[data-uk-admin]');
  if (adm) {
    const log = $('.uk-log', adm);
    const btns = $$('button', adm);
    btns.forEach((b) => b.addEventListener('click', () => {
      btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      const d = new Date();
      const li = document.createElement('li');
      li.innerHTML = '<span>' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + '</span><b></b><span></span>';
      li.children[1].textContent = b.getAttribute('data-act');
      li.children[2].textContent = 'by Admin · logged';
      log.prepend(li);
      while (log.children.length > 3) log.lastElementChild.remove();
    }));
  }
  /* UK activation chart: dash length from the real path */
  $$('.uk-act .ac').forEach((p) => { try { p.style.setProperty('--len', Math.ceil(p.getTotalLength())); } catch (_) {} });

  /* ════════ AU · chain of responsibility lights link by link ════════ */
  const chain = $('[data-au-chain]');
  if (chain) {
    const links = $$('.au-link', chain);
    const list = $('.au-links', chain);
    const set = (n) => {
      links.forEach((l, i) => l.classList.toggle('is-on', i < n));
      list.style.setProperty('--p', n <= 1 ? 0 : (n - 1) / (links.length - 1));
    };
    if (reduce()) set(links.length);
    else {
      let n = 0, t = 0;
      const loop = () => { set(n); t = setTimeout(() => { n = n >= links.length ? 0 : n + 1; loop(); }, n === links.length ? 3400 : 950); };
      whileVisible(chain, () => { clearTimeout(t); n = 0; loop(); }, () => clearTimeout(t), 0.25);
    }
  }
  /* AU jurisdictions: rule set as data */
  const jur = $('[data-au-jur]');
  if (jur) {
    const sts = $$('.au-st', jur);
    const out = $('[data-au-rule]', jur);
    const code = $('code', out), name = $('b', out), note = $('small', out);
    group(sts, (i) => {
      const s = sts[i];
      code.textContent = s.getAttribute('data-rule');
      name.textContent = s.getAttribute('data-name');
      note.textContent = s.getAttribute('data-note');
    }, { auto: 2400, scope: jur });
  }

  /* ════════ UAE · one record, two directions ════════ */
  const ae = $('[data-ae]');
  if (ae) {
    const views = $$('.ae-body', ae);
    const dirOut = $('[data-ae-dir]', ae);
    group($$('.ae-toggle button', ae), (i) => {
      views.forEach((v, j) => { v.hidden = j !== i; });
      if (dirOut) dirOut.textContent = i ? 'Right to left' : 'Left to right';
    }, { auto: 4200, scope: ae });
  }
  /* UAE tabs (ARIA tabs pattern) */
  $$('[data-ae-tabs]').forEach((wrap) => {
    const tabs = $$('[role="tab"]', wrap);
    const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
    const sel = (i, focus) => {
      tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(j === i)); t.tabIndex = j === i ? 0 : -1; });
      panels.forEach((p, j) => { p.hidden = j !== i; if (j === i) { p.classList.remove('is-swap'); void p.offsetWidth; p.classList.add('is-swap'); } });
      if (focus) tabs[i].focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => sel(i));
      t.addEventListener('keydown', (e) => {
        const k = e.key;
        if (k === 'ArrowDown' || k === 'ArrowRight') { e.preventDefault(); sel((i + 1) % tabs.length, true); }
        if (k === 'ArrowUp' || k === 'ArrowLeft') { e.preventDefault(); sel((i - 1 + tabs.length) % tabs.length, true); }
        if (k === 'Home') { e.preventDefault(); sel(0, true); }
        if (k === 'End') { e.preventDefault(); sel(tabs.length - 1, true); }
      });
    });
    sel(0);
  });
  /* UAE FAQ accordion (answers stay open without JS) */
  $$('.ae-q').forEach((q, i) => {
    const b = $('button', q);
    if (i === 0) { q.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
    b.addEventListener('click', () => {
      const open = q.classList.contains('is-open');
      $$('.ae-q.is-open').forEach((o) => { if (o !== q) { o.classList.remove('is-open'); $('button', o).setAttribute('aria-expanded', 'false'); } });
      q.classList.toggle('is-open', !open);
      b.setAttribute('aria-expanded', String(!open));
    });
  });

  /* ════════ CA · province by province ════════ */
  const inv = $('[data-ca-inv]');
  if (inv) {
    const provs = $$('.ca-prov', inv);
    const tax = $('[data-ca-tax]', inv);
    const ship = $('[data-ca-ship]', inv);
    group(provs, (i) => {
      const p = provs[i];
      if (ship) ship.textContent = p.getAttribute('data-name');
      if (tax) {
        $$('.ca-chip', tax).forEach((c) => c.remove());
        p.getAttribute('data-tax').split('+').forEach((t) => {
          const c = document.createElement('span'); c.className = 'ca-chip'; c.textContent = t.trim(); tax.appendChild(c);
        });
      }
    }, { auto: 2600, scope: inv });
  }
  /* CA bilingual length demo */
  const lang = $('[data-ca-lang]');
  if (lang) {
    const spans = $$('.ca-lang-row span', lang);
    const len = $('[data-ca-len]', lang);
    group($$('.ca-lang-sw button', lang), (i) => {
      let n = 0;
      spans.forEach((s) => { const t = s.getAttribute(i ? 'data-fr' : 'data-en'); s.textContent = t; n += t.length; });
      lang.setAttribute('lang', i ? 'fr' : 'en');
      if (len) len.textContent = n;
    }, { auto: 3000, scope: lang });
  }

  /* ════════ Industries · desk router and chapters ════════ */
  const router = $('[data-in-router]');
  if (router && !reduce()) {
    const rows = $$('.in-route', router);
    let cur = 0, t = 0, hold = 0;
    const on = (i) => { cur = i; rows.forEach((r, j) => r.classList.toggle('is-on', j === i)); };
    rows.forEach((r, i) => r.addEventListener('pointerenter', () => { hold = Date.now(); on(i); }));
    rows.forEach((r, i) => r.addEventListener('focus', () => { hold = Date.now(); on(i); }));
    on(0);
    whileVisible(router, () => { clearInterval(t); t = setInterval(() => { if (Date.now() - hold > 5000) on((cur + 1) % rows.length); }, 2200); }, () => clearInterval(t), 0.3);
  }
  const chaps = $('[data-in-chaps]');
  if (chaps) {
    const scr = $$('.in-chap-stage > .in-scr', chaps);
    const cs = $$('.in-chap', chaps);
    const count = $('[data-in-count]', chaps);
    const show = (i) => { scr.forEach((s, j) => s.classList.toggle('is-on', j === i)); if (count) count.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(cs.length).padStart(2, '0'); };
    show(0);
    const cio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) show(cs.indexOf(e.target)); }), { rootMargin: '-45% 0px -45% 0px' });
    cs.forEach((c) => cio.observe(c));
  }

  /* ── Section rail ── */
  const rail = $('.mx-rail');
  const railLinks = rail ? $$('a', rail) : [];
  const targets = railLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (targets.length) {
    const rio = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        const i = targets.indexOf(e.target);
        railLinks.forEach((a, j) => a.setAttribute('aria-current', j === i ? 'true' : 'false'));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach((t) => rio.observe(t));
  }
  const darks = $$('[data-dark]').filter((d) => d.closest('main'));

  /* ── The scroll loop: progress, rail colour, parallax, scroll-drawn tracks ── */
  const bar = $('.mx-progress');
  const pars = $$('[data-par]');
  const tracks = $$('[data-track]');
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
        img.style.setProperty('--py', (p * -40 - 20).toFixed(1) + 'px');
      });
    }
    tracks.forEach((tr) => {
      const r = tr.getBoundingClientRect();
      const p = reduce() ? 1 : clamp((vh * 0.75 - r.top) / (r.height * 0.9 || 1));
      tr.style.setProperty('--p', p.toFixed(3));
      const items = $$(':scope > li', tr);
      items.forEach((li, i) => li.classList.toggle('is-lit', reduce() || p >= (items.length > 1 ? i / (items.length - 1) : 0) - 0.02));
    });
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  run();
})();
