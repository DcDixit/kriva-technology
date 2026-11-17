/* KRIVA Solutions · "x" motion layer for solution pages (body.sx).
   No libraries. One passive scroll loop writes CSS variables; IntersectionObserver handles reveals.
   Everything degrades to a static, readable page under prefers-reduced-motion or without JS.
   page-inquiry.js still owns the form; chrome.js owns the header, menus, and mobile sheet. */
(function () {
  'use strict';
  window.__sx = true;
  const root = document.documentElement;
  const body = document.body;
  if (!body || !body.classList.contains('sx')) return;

  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mqFine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = () => mqReduce.matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  root.classList.toggle('sx-motion', !reduce());

  /* ── Masked word reveal on headings (text content stays the same for assistive tech) ── */
  $$('[data-split]').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((w, i) => {
      const o = document.createElement('span');
      o.className = 'sx-w';
      const n = document.createElement('span');
      n.className = 'sx-wi';
      n.style.setProperty('--i', i);
      n.textContent = w;
      o.appendChild(n);
      el.appendChild(o);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });

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
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('[data-x],[data-split],.sx-case').forEach((el) => (reduce() ? el.classList.add('is-in') : io.observe(el)));

  /* ── Mark the current page in the Solutions menu ── */
  const here = location.pathname.replace(/\/$/, '');
  $$('#mm-solutions a[href], #sheet-solutions a[href]').forEach((a) => {
    if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page');
  });

  /* ── Hero: load record tilt + handoff walk ── */
  const rec = $('.sx-rec');
  const hero = $('.sx-hero');
  if (rec && hero && mqFine.matches && !reduce()) {
    hero.addEventListener('pointermove', (e) => {
      const b = rec.getBoundingClientRect();
      const r = hero.getBoundingClientRect();
      const dx = clamp((e.clientX - (b.left + b.width / 2)) / (r.width / 2), -1, 1);
      const dy = clamp((e.clientY - (b.top + b.height / 2)) / (r.height / 2), -1, 1);
      rec.style.setProperty('--ry', (dx * 5).toFixed(2) + 'deg');
      rec.style.setProperty('--rx', (-dy * 4).toFixed(2) + 'deg');
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { rec.style.setProperty('--rx', '0deg'); rec.style.setProperty('--ry', '0deg'); });
  }
  if (rec) {
    const rows = $$('.sx-rec-rows li', rec);
    const tags = $$('.sx-rec-foot span', rec);
    const clock = $('[data-count]', rec);
    let secs = clock ? parseInt(clock.getAttribute('data-count'), 10) : 0;
    let step = -1, t1 = 0, t2 = 0;
    const show = (i) => {
      rows.forEach((li, j) => li.classList.toggle('is-on', j === i));
      const who = rows[i] ? rows[i].getAttribute('data-who') : '';
      tags.forEach((s) => s.classList.toggle('is-on', s.getAttribute('data-who') === who));
    };
    const walk = () => { step = (step + 1) % rows.length; show(step); t1 = setTimeout(walk, 2200); };
    const tick = () => {
      if (!clock) return;
      secs = secs <= 61 ? 360 : secs - 1;
      clock.textContent = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0') + ' left';
      t2 = setTimeout(tick, 1000);
    };
    if (reduce()) show(2);
    else {
      new IntersectionObserver(([e]) => {
        clearTimeout(t1); clearTimeout(t2);
        if (e.isIntersecting) { walk(); tick(); }
      }, { threshold: 0.3 }).observe(rec);
    }
  }

  /* ── Move request card: fields type themselves in, then the request "sends" ── */
  const mr = $('[data-mr]');
  if (mr && !reduce()) {
    const fields = $$('.sx-mr-f', mr);
    const vals = fields.map((f) => $('b', f));
    let timers = [], running = false;
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const reset = () => {
      timers.forEach(clearTimeout); timers = [];
      mr.classList.remove('is-sent');
      fields.forEach((f, i) => { f.classList.remove('is-typing', 'is-done'); vals[i].textContent = ''; });
    };
    const run = () => {
      reset();
      mr.classList.add('is-live');
      let t = 400;
      fields.forEach((f, i) => {
        const v = vals[i].getAttribute('data-v');
        later(() => f.classList.add('is-typing'), t);
        for (let c = 1; c <= v.length; c++) later(() => { vals[i].textContent = v.slice(0, c); }, t + c * 45);
        t += v.length * 45 + 260;
        later(() => { f.classList.remove('is-typing'); f.classList.add('is-done'); }, t);
      });
      later(() => mr.classList.add('is-sent'), t + 500);
      later(run, t + 4200);
    };
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) { running = true; run(); }
      else if (!e.isIntersecting && running) {
        running = false; timers.forEach(clearTimeout); timers = [];
        fields.forEach((f, i) => { f.classList.remove('is-typing'); f.classList.add('is-done'); vals[i].textContent = vals[i].getAttribute('data-v'); });
        mr.classList.add('is-sent');
      }
    }, { threshold: 0.35 }).observe(mr);
  }

  /* ── Trucking site preview: one site, shipper view and driver view ── */
  const site = $('[data-site]');
  if (site) {
    const views = $$('[data-view]', site);
    const cycle = 5600;
    let now = site.getAttribute('data-now') || 'ship';
    let auto = 0, held = false, chosen = false;
    const set = (v) => {
      now = v;
      site.setAttribute('data-now', v);
      views.forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute('data-view') === v)));
    };
    const stop = () => { clearInterval(auto); auto = 0; site.classList.remove('is-auto'); };
    const restartBar = () => { site.classList.remove('is-auto'); void site.offsetWidth; site.classList.add('is-auto'); };
    const start = () => {
      stop();
      if (chosen || held || reduce()) return;
      site.style.setProperty('--sx-cycle', cycle + 'ms');
      restartBar();
      auto = setInterval(() => { set(now === 'ship' ? 'drive' : 'ship'); restartBar(); }, cycle);
    };
    views.forEach((b) => b.addEventListener('click', () => { chosen = true; stop(); set(b.getAttribute('data-view')); }));
    site.addEventListener('pointerenter', () => { held = true; stop(); });
    site.addEventListener('pointerleave', () => { held = false; start(); });
    site.addEventListener('focusin', () => { held = true; stop(); });
    new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.25 }).observe(site);
  }

  /* ── Sitemap: filter the pages by who they serve ── */
  const map = $('[data-map]');
  if (map) {
    const filters = $$('[data-aud-filter]');
    const pages = $$('[data-aud]', map);
    filters.forEach((b) => b.addEventListener('click', () => {
      const f = b.getAttribute('data-aud-filter');
      filters.forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
      pages.forEach((p) => p.classList.toggle('is-dim', f !== 'all' && !p.getAttribute('data-aud').split(' ').includes(f)));
    }));
  }

  /* ── Spotlight cards and magnetic buttons (fine pointers only) ── */
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
        el.style.setProperty('--tx', clamp((e.clientX - (r.left + r.width / 2)) * 0.2, -9, 9).toFixed(1) + 'px');
        el.style.setProperty('--ty', clamp((e.clientY - (r.top + r.height / 2)) * 0.3, -7, 7).toFixed(1) + 'px');
      }, { passive: true });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--tx', '0px'); el.style.setProperty('--ty', '0px'); });
    });
  }

  /* ── Custom cursor: a dot plus a lagging ring that names the action ── */
  const cur = $('.sx-cursor');
  if (cur && mqFine.matches && !reduce()) {
    root.classList.add('sx-cur');
    const dot = $('.sx-cursor-dot', cur);
    const ring = $('.sx-cursor-ring', cur);
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
      const off = t.closest('input,textarea,select,label,.nav,.sheet,.mm,footer,.sx-chips,.sx-rail');
      const lab = t.closest('[data-cursor]');
      const link = t.closest('a,button,summary');
      cur.classList.toggle('is-off', !!off);
      cur.classList.toggle('is-dark', !!t.closest('[data-dark]'));
      cur.classList.toggle('is-label', !off && !!lab);
      cur.classList.toggle('is-link', !off && !lab && !!link);
      if (lab) label.textContent = lab.getAttribute('data-cursor');
    }, { passive: true });
    addEventListener('pointerdown', () => cur.classList.add('is-down'), { passive: true });
    addEventListener('pointerup', () => cur.classList.remove('is-down'), { passive: true });
    document.addEventListener('pointerleave', () => cur.classList.add('is-off'));
  }

  /* ── Surfaces: pinned screens follow the copy (desktop, motion allowed) ── */
  const surfaces = $$('.sx-surface');
  const screens = $$('.sx-screen');
  const countNow = $('.sx-screens-count b');
  const scrollyOK = () => !reduce() && innerWidth > 1000 && innerHeight >= 680 && screens.length > 1;
  const hs = $('[data-hscroll]');
  const hsTrack = hs ? $('.sx-hs-track', hs) : null;
  const hsPin = hs ? $('.sx-hs-pin', hs) : null;
  const hsBar = hs ? $('.sx-hs-bar', hs) : null;
  const hsItems = hsTrack ? $$('li', hsTrack) : [];
  let hsOver = 0;
  const sizeHs = () => {
    if (!hs) return;
    if (root.classList.contains('sx-scrolly')) {
      hsTrack.style.setProperty('--hx', '0px');
      hsOver = Math.max(0, hsTrack.scrollWidth - innerWidth);
      hs.style.height = hsPin.offsetHeight + hsOver + 'px';
    } else {
      hsOver = 0;
      hs.style.height = '';
      hsTrack.style.removeProperty('--hx');
    }
  };
  const setScrolly = () => {
    root.classList.toggle('sx-scrolly', !!(!reduce() && innerWidth > 1000 && innerHeight >= 680 && (screens.length > 1 || hs)));
    sizeHs();
  };
  setScrolly();
  const setSurface = (i) => {
    surfaces.forEach((s, j) => s.classList.toggle('is-on', j === i));
    screens.forEach((s, j) => s.classList.toggle('is-on', j === i));
    if (countNow) countNow.textContent = String(i + 1).padStart(2, '0');
  };
  if (surfaces.length) setSurface(0);

  /* ── Section navigation: rail (desktop) and chips (tablet/mobile) ── */
  const navLinks = $$('.sx-rail a, .sx-chips a');
  const ids = [...new Set(navLinks.map((a) => a.getAttribute('href')))];
  const targets = ids.map((h) => document.querySelector(h)).filter(Boolean);
  const rail = $('.sx-rail');
  const chips = $('.sx-chips');
  const darks = $$('[data-dark]');

  /* ── Scroll loop ── */
  const bar = $('.sx-progress i');
  const route = $('[data-route]');
  const routeItems = route ? $$('li', route) : [];
  if (route) body.classList.add('sx-has-route');
  const steps = $('[data-steps]');
  const stepItems = steps ? $$('.sx-steps li', steps) : [];
  if (steps) body.classList.add('sx-has-steps');
  const photo = $('[data-reveal-clip]');
  const photoImg = photo ? $('img', photo) : null;
  const caseUi = $('.sx-q');
  const heroImg = $('.sx-fhero-img img');
  const siteWin = $('.sx-site-win');
  const stackCards = $$('.sx-stack .sx-sc');
  let current = '';
  let ticking = false;

  // 0 when the element's top reaches `start` (fraction of the viewport), 1 when its bottom reaches `end`
  const progressOf = (el, start, end) => {
    const r = el.getBoundingClientRect();
    const vh = innerHeight;
    return clamp((vh * start - r.top) / (r.height + vh * (start - end) || 1));
  };

  const frame = () => {
    ticking = false;
    const vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    if (bar) bar.style.setProperty('--sp', clamp(scrollY / (max || 1)).toFixed(4));

    // active section: last target whose top passed 40% of the viewport
    let on = targets[0];
    targets.forEach((t) => { if (t.getBoundingClientRect().top <= vh * 0.4) on = t; });
    const id = on ? '#' + on.id : '';
    if (id !== current) {
      current = id;
      navLinks.forEach((a) => a.setAttribute('aria-current', a.getAttribute('href') === id ? 'true' : 'false'));
      const chip = chips && $(`a[href="${id}"]`, chips);
      if (chip && getComputedStyle(chips).display !== 'none') chips.scrollTo({ left: chip.offsetLeft - 16, behavior: reduce() ? 'auto' : 'smooth' });
    }
    if (rail) {
      rail.classList.toggle('is-show', scrollY > vh * 0.5);
      const mid = vh / 2;
      const dark = darks.some((d) => { const r = d.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; });
      if (rail.classList.contains('is-dark') !== dark) rail.classList.toggle('is-dark', dark);
    }

    // surfaces: the copy block nearest the viewport centre wins
    if (surfaces.length && root.classList.contains('sx-scrolly')) {
      let best = 0, bestD = Infinity;
      surfaces.forEach((s, i) => {
        const r = s.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - vh / 2);
        if (d < bestD) { bestD = d; best = i; }
      });
      if (!surfaces[best].classList.contains('is-on')) setSurface(best);
    }

    if (reduce()) return;

    // route: the truck drives the five handoffs as the section scrolls
    if (route) {
      const t = progressOf(route, 0.88, 0.5);
      route.style.setProperty('--p', t.toFixed(4));
      routeItems.forEach((li, i) => li.classList.toggle('is-on', t >= i / Math.max(1, routeItems.length - 1) - 0.02));
    }

    // process: line fills and stops light up in order
    if (steps) {
      const t = progressOf(steps, 0.85, 0.55);
      steps.style.setProperty('--p', t.toFixed(4));
      stepItems.forEach((li, i) => li.classList.toggle('is-on', t >= i / stepItems.length + 0.02));
    }

    // photo: opens from an inset card to the full frame, with a slow parallax
    if (photo && innerWidth > 760) {
      const r = photo.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const t = clamp((vh - r.top) / (vh * 0.85));
        photo.style.setProperty('--cx', ((1 - t) * 6).toFixed(2) + '%');
        photo.style.setProperty('--cy', ((1 - t) * 4).toFixed(2) + '%');
        photo.style.setProperty('--cr', (28 + (1 - t) * 20).toFixed(1) + 'px');
        if (photoImg) {
          photoImg.style.setProperty('--py', ((r.top + r.height / 2 - vh / 2) * -0.1).toFixed(1) + 'px');
          photoImg.style.setProperty('--ps', (1.1 - t * 0.1).toFixed(4));
        }
      }
    }

    // lifecycle: vertical scroll drives the track sideways while the section is pinned
    if (hs && hsOver > 0 && root.classList.contains('sx-scrolly')) {
      const r = hs.getBoundingClientRect();
      const t = clamp(-r.top / hsOver);
      hsTrack.style.setProperty('--hx', (-t * hsOver).toFixed(1) + 'px');
      if (hsBar) hsBar.style.setProperty('--hp', t.toFixed(4));
      const on = Math.min(hsItems.length - 1, Math.floor(t * hsItems.length));
      hsItems.forEach((li, i) => li.classList.toggle('is-on', i === on && t > 0 && t < 1));
    }

    if (heroImg) {
      const r = heroImg.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) heroImg.style.setProperty('--py', (r.top * -0.08).toFixed(1) + 'px');
    }

    if (caseUi) {
      const r = caseUi.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) caseUi.style.setProperty('--py', ((r.top + r.height / 2 - vh / 2) * -0.05).toFixed(1) + 'px');
    }

    // trucking site preview: tilted back below the fold, flat by the time it reaches the top third
    if (siteWin) {
      const r = siteWin.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const t = innerWidth > 760 ? clamp((vh - r.top) / (vh * 0.75)) : 1;
        siteWin.style.setProperty('--tilt', ((1 - t) * 9).toFixed(2) + 'deg');
        siteWin.style.setProperty('--sc', (0.95 + t * 0.05).toFixed(4));
      }
    }

    // stacked showcase: a card eases back as the next one slides over it
    if (stackCards.length > 1) {
      const wide = innerWidth > 1000;
      stackCards.forEach((card, i) => {
        const next = stackCards[i + 1];
        if (!next || !wide) { card.style.removeProperty('--ss'); return; }
        const top = next.parentElement.getBoundingClientRect().top;
        const t = clamp((vh - top) / (vh * 0.8));
        card.style.setProperty('--ss', (1 - t * 0.05).toFixed(4));
      });
    }
  };

  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', () => { setScrolly(); request(); }, { passive: true });
  addEventListener('load', () => { sizeHs(); request(); });
  mqReduce.addEventListener?.('change', () => location.reload());
  frame();

  /* ═══ Fleet management page (body.sx-fleet) ═══ */

  /* Console: the unit that needs attention lights up, with the source its data came from */
  const con = $('[data-console]');
  if (con) {
    const rows = $$('.fl-units li', con);
    const srcs = $$('.fl-srcs span', con);
    const miles = $('[data-miles]', con);
    const show = (i) => {
      rows.forEach((r, j) => r.classList.toggle('is-on', j === i));
      const s = (rows[i] ? rows[i].getAttribute('data-src') : '').split(' ');
      srcs.forEach((x) => x.classList.toggle('is-on', s.includes(x.getAttribute('data-src'))));
    };
    if (reduce()) show(0);
    else {
      let i = -1, t1 = 0, t2 = 0, m = miles ? parseInt(miles.getAttribute('data-miles'), 10) : 0;
      const walk = () => { i = (i + 1) % rows.length; show(i); t1 = setTimeout(walk, 2400); };
      const tick = () => {
        if (!miles) return;
        m = m <= 1180 ? 1240 : m - 1;
        miles.textContent = m.toLocaleString('en-US');
        t2 = setTimeout(tick, 1500);
      };
      new IntersectionObserver(([e]) => {
        clearTimeout(t1); clearTimeout(t2);
        if (e.isIntersecting) { walk(); tick(); }
      }, { threshold: 0.3 }).observe(con);
      const flHero = $('.fl-hero');
      const panel = $('.fl-con-in', con);
      if (flHero && panel && mqFine.matches) {
        flHero.addEventListener('pointermove', (e) => {
          const b = panel.getBoundingClientRect();
          const r = flHero.getBoundingClientRect();
          panel.style.setProperty('--ry', (clamp((e.clientX - (b.left + b.width / 2)) / (r.width / 2), -1, 1) * 5).toFixed(2) + 'deg');
          panel.style.setProperty('--rx', (clamp((e.clientY - (b.top + b.height / 2)) / (r.height / 2), -1, 1) * -4).toFixed(2) + 'deg');
        }, { passive: true });
        flHero.addEventListener('pointerleave', () => { panel.style.setProperty('--rx', '0deg'); panel.style.setProperty('--ry', '0deg'); });
      }
    }
  }

  /* Module picker: choose a first phase, then carry it into the inquiry */
  const picker = $('[data-picker]');
  const tray = $('[data-tray]');
  if (picker && tray) {
    const mods = $$('.fl-mod', picker);
    const trayN = $('[data-tray-n]', tray);
    const trayW = $('[data-tray-w]', tray);
    const picked = () => mods.filter((m) => m.classList.contains('is-picked')).map((m) => m.getAttribute('data-mod'));
    const update = () => {
      const p = picked();
      trayN.textContent = p.length;
      trayW.textContent = p.length === 1 ? 'module' : 'modules';
      tray.hidden = p.length === 0;
    };
    mods.forEach((m) => {
      const b = $('.fl-pick', m);
      if (!b) return;
      b.hidden = false;
      m.classList.add('is-pickable');
      const set = (on) => { m.classList.toggle('is-picked', on); b.setAttribute('aria-pressed', String(on)); update(); };
      b.addEventListener('click', (e) => { e.stopPropagation(); set(!m.classList.contains('is-picked')); });
      m.addEventListener('click', (e) => {
        if (e.target.closest('a,button')) return;
        if (String(getSelection && getSelection()).length) return;
        set(!m.classList.contains('is-picked'));
      });
    });
    $('[data-tray-go]', tray).addEventListener('click', () => {
      const ta = $('#inq-details');
      if (ta) {
        const prefix = 'Modules for a first phase:';
        const rest = ta.value.split('\n').filter((l) => l.indexOf(prefix) !== 0).join('\n').trim();
        ta.value = prefix + ' ' + picked().join(', ') + '.\n' + rest;
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const target = $('#inquire');
      if (target) target.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'start' });
      if (ta) setTimeout(() => { ta.focus({ preventScroll: true }); ta.setSelectionRange(ta.value.length, ta.value.length); }, reduce() ? 0 : 800);
    });
  }

  /* Driver app: inspection items tick off offline, then the queue syncs */
  const phone = $('[data-phone]');
  if (phone) {
    const items = $$('.fl-phone-list li', phone);
    const net = $('[data-net]', phone);
    if (reduce()) items.slice(0, 3).forEach((li) => li.classList.add('is-done'));
    else {
      let pt = [], live = false;
      const later = (fn, ms) => pt.push(setTimeout(fn, ms));
      const run = () => {
        pt.forEach(clearTimeout); pt = [];
        items.forEach((li) => li.classList.remove('is-done'));
        phone.classList.remove('is-synced');
        net.textContent = 'Offline · no signal';
        items.forEach((li, i) => later(() => {
          li.classList.add('is-done');
          net.textContent = 'Offline · ' + (i + 1) + (i ? ' updates' : ' update') + ' queued';
        }, 800 + i * 750));
        const end = 800 + items.length * 750;
        later(() => { phone.classList.add('is-synced'); net.textContent = 'Signal back · all synced'; }, end + 900);
        later(run, end + 4400);
      };
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !live) { live = true; run(); }
        else if (!e.isIntersecting && live) { live = false; pt.forEach(clearTimeout); pt = []; }
      }, { threshold: 0.4 }).observe(phone);
    }
  }

  /* Work order: scrolling walks the defect from reported to signed off; hero photo drifts */
  const wo = $('[data-wo]');
  const woCard = wo ? $('.fl-wo', wo) : null;
  const woSteps = wo ? $$('[data-wo-step]', wo) : [];
  const woState = wo ? $('[data-wo-state]', wo) : null;
  const woImg = wo ? $('.fl-mnt-img img', wo) : null;
  const flImg = $('.fl-hero-media img');
  let woNow = -1;
  const setWo = (k) => {
    if (k === woNow || !woCard) return;
    woNow = k;
    woSteps.forEach((s, j) => s.classList.toggle('is-on', j <= k));
    woCard.setAttribute('data-step', String(k));
    if (woState && woSteps[k]) woState.textContent = woSteps[k].getAttribute('data-wo-step');
  };
  if (wo) { body.classList.add('sx-has-wo'); setWo(reduce() ? 3 : 0); }
  const fleetFrame = () => {
    flTick = false;
    if (reduce()) return;
    const vh = innerHeight;
    if (wo) {
      const t = progressOf(wo, 0.7, 0.55);
      setWo(Math.min(woSteps.length - 1, Math.floor(t * woSteps.length)));
      if (woImg) {
        const r = woImg.parentElement.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) woImg.style.setProperty('--py', ((r.top + r.height / 2 - vh / 2) * -0.08).toFixed(1) + 'px');
      }
    }
    if (flImg && scrollY < vh * 1.4) flImg.style.setProperty('--py', (scrollY * 0.22).toFixed(1) + 'px');
  };
  let flTick = false;
  if (wo || flImg) {
    addEventListener('scroll', () => { if (!flTick) { flTick = true; requestAnimationFrame(fleetFrame); } }, { passive: true });
    fleetFrame();
  }

  /* ── FAQ: one answer open at a time ── */
  const faqs = $$('.sx-faq-list details');
  faqs.forEach((d) => d.addEventListener('toggle', () => {
    if (d.open) faqs.forEach((o) => { if (o !== d) o.open = false; });
  }));
})();
