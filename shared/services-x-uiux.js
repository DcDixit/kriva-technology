/* KRIVA Services · svx layer · UI/UX design (body.svx-uiux).
   Runs after services-x.js, which owns reveals, split headlines, cursor, rail, FAQ, the
   [data-steps] line, spotlight and magnetic buttons. This file drives the page's own demos.
   Every control is a real button or input, so each demo works by keyboard; with reduced
   motion nothing auto-plays and each picture shows its final, readable state. */
(function () {
  'use strict';
  if (!document.querySelector('[data-ux-wf],[data-ux-den],[data-ux-kit],[data-ux-cmp]')) return;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const onView = (el, fn, threshold = 0.3) => new IntersectionObserver(([e]) => fn(e.isIntersecting), { threshold }).observe(el);

  /* ── Hero: before / after compare ── */
  const cmp = $('[data-ux-cmp]');
  if (cmp) {
    const stage = $('.uxx-cmp-stage', cmp);
    const range = $('.uxx-range', cmp);
    const segs = $$('.uxx-seg-b', cmp);
    let cut = 50, touched = false, timers = [];
    const text = (c) => (c >= 98 ? 'Before only' : c <= 2 ? 'After only' : Math.round(c) + '% before, ' + Math.round(100 - c) + '% after');
    const set = (c, anim) => {
      cut = Math.max(0, Math.min(100, c));
      cmp.classList.toggle('is-anim', !!anim);
      cmp.style.setProperty('--cut', cut + '%');
      cmp.setAttribute('data-side', cut >= 92 ? 'b' : cut <= 8 ? 'a' : 'both');
      range.value = String(Math.round(cut));
      range.setAttribute('aria-valuetext', text(cut));
      const pick = cut >= 98 ? '100' : cut <= 2 ? '0' : '50';
      segs.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cut === pick && (pick !== '50' || Math.abs(cut - 50) < 1))));
    };
    const stop = () => { touched = true; timers.forEach(clearTimeout); timers = []; };
    const fromX = (x) => { const r = stage.getBoundingClientRect(); return ((x - r.left) / r.width) * 100; };
    let drag = false;
    stage.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      stop(); drag = true; cmp.classList.add('is-drag');
      stage.setPointerCapture(e.pointerId);
      set(fromX(e.clientX), e.pointerType !== 'mouse');
    });
    stage.addEventListener('pointermove', (e) => { if (drag) set(fromX(e.clientX), false); });
    const end = () => { drag = false; cmp.classList.remove('is-drag'); };
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);
    range.addEventListener('input', () => { stop(); set(+range.value, false); });
    segs.forEach((b) => b.addEventListener('click', () => { stop(); set(+b.dataset.cut, !reduce()); }));
    set(50, false);
    if (reduce()) cmp.classList.add('is-on');
    else {
      let played = false;
      onView(cmp, (v) => {
        if (!v) return;
        cmp.classList.add('is-on');
        if (played || touched) return;
        played = true;
        [[700, 80], [2300, 20], [3900, 50]].forEach(([t, c]) => timers.push(setTimeout(() => { if (!touched) set(c, true); }, t)));
      }, 0.35);
    }
  }

  /* ── Workflows: pick one, the stage shows it redesigned ── */
  const wf = $('[data-ux-wf]');
  if (wf) {
    const items = $$('.uxx-wf-item', wf);
    const stage = $('.uxx-wf-stage', wf);
    const num = $('[data-wf-n]', wf);
    let cur = 0, pinned = 0, auto = 0;
    const show = (i) => {
      cur = i;
      items.forEach((it, j) => {
        it.classList.toggle('is-on', j === i);
        $('.uxx-wf-btn', it).setAttribute('aria-pressed', String(j === i));
      });
      stage.setAttribute('data-on', i);
      if (num) num.textContent = String(i + 1).padStart(2, '0');
    };
    items.forEach((it, i) => {
      $('.uxx-wf-btn', it).addEventListener('click', () => { pinned = Date.now(); show(i); });
      if (fine.matches) it.addEventListener('pointerenter', () => { pinned = Date.now(); show(i); });
    });
    const wide = matchMedia('(min-width: 1001px)');
    /* Wide: the item crossing the middle of the viewport drives the sticky stage. */
    const rio = new IntersectionObserver((es) => {
      if (!wide.matches || Date.now() - pinned < 1800) return;
      es.forEach((e) => { if (e.isIntersecting) show(items.indexOf(e.target)); });
    }, { rootMargin: '-48% 0px -48% 0px' });
    items.forEach((it) => rio.observe(it));
    /* Narrow: the stage sits above the list and steps through while it is visible. */
    if (!reduce()) {
      onView(stage, (v) => {
        clearInterval(auto);
        if (v && !wide.matches) auto = setInterval(() => { if (Date.now() - pinned > 7000) show((cur + 1) % items.length); }, 3400);
      }, 0.5);
    }
  }

  /* ── Dense screens: switch the board's state, check it without color ── */
  const den = $('[data-ux-den]');
  if (den) {
    const segs = $$('.uxx-seg-b', den);
    const sw = $('[data-gray]', den);
    const live = $('[data-den-live]', den);
    const rows = $('.uxx-den-rows', den);
    const words = { data: 'the board with data', empty: 'the empty state', loading: 'the loading state', error: 'the error state' };
    const say = () => { if (live) live.textContent = 'Showing ' + words[den.dataset.state] + (den.dataset.gray === '1' ? ', without color.' : '.'); };
    segs.forEach((b) => b.addEventListener('click', () => {
      den.dataset.state = b.dataset.state;
      segs.forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
      say();
    }));
    sw.addEventListener('click', () => {
      const on = sw.getAttribute('aria-checked') !== 'true';
      sw.setAttribute('aria-checked', String(on));
      den.dataset.gray = on ? '1' : '0';
      say();
    });
    /* A keyboard path walks the rows: J, J, A ... */
    if (!reduce() && rows) {
      let r = 0, t = 0;
      const path = [0, 1, 2, 2, 3, 1];
      onView(den, (v) => {
        clearInterval(t);
        if (v) t = setInterval(() => { if (den.dataset.state === 'data') rows.style.setProperty('--row', path[r = (r + 1) % path.length]); }, 1300);
      }, 0.3);
    }
  }

  /* ── PayrollPro kit: Roles → Tokens → Flows, plus a gentle tilt ── */
  const kit = $('[data-ux-kit]');
  if (kit && !reduce()) {
    let tab = 0, t = 0;
    onView(kit, (v) => {
      clearInterval(t);
      if (v) t = setInterval(() => kit.setAttribute('data-tab', tab = (tab + 1) % 3), 2800);
    }, 0.35);
    const link = kit.closest('a');
    if (fine.matches && link) {
      link.addEventListener('pointermove', (e) => {
        const r = link.getBoundingClientRect();
        kit.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 6).toFixed(2) + 'deg');
        kit.style.setProperty('--rx', (((e.clientY - r.top) / r.height - 0.5) * -5).toFixed(2) + 'deg');
      }, { passive: true });
      link.addEventListener('pointerleave', () => { kit.style.setProperty('--ry', '0deg'); kit.style.setProperty('--rx', '0deg'); });
    }
  }

  /* ── Close: pick the workflow that hurts, it starts the inquiry for you ── */
  const pick = $('[data-ux-pick]');
  const ta = $('#inq-details');
  if (pick && ta) {
    const btns = $$('.uxx-pick-b', pick);
    let prefix = '';
    btns.forEach((b) => b.addEventListener('click', () => {
      btns.forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
      const next = 'Workflow: ' + b.dataset.wf + '. ';
      const v = ta.value;
      ta.value = !v.trim() ? next : prefix && v.startsWith(prefix) ? next + v.slice(prefix.length) : v.startsWith(next) ? v : next + v;
      prefix = next;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      ta.classList.add('is-prefilled');
      setTimeout(() => ta.classList.remove('is-prefilled'), 1800);
      const form = $('#pageInquiry');
      (form || ta).scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'center' });
      setTimeout(() => { ta.focus({ preventScroll: true }); ta.setSelectionRange(ta.value.length, ta.value.length); }, reduce() ? 0 : 700);
    }));
    btns.forEach((b) => b.setAttribute('aria-pressed', 'false'));
  }
})();
