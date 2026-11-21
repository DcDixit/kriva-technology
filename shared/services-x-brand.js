/* KRIVA Services · svx layer · Branding (body.svx-brand).
   Runs after services-x.js, which owns reveals, split headlines, cursor, rail, FAQ, the
   [data-steps] line, spotlight and magnetic buttons. This file drives the page's own demos.
   Every control is a real button with aria-pressed; the pictures are aria-hidden and their
   meaning is in text. With reduced motion nothing auto-plays and each demo rests in a final state. */
(function () {
  'use strict';
  const body = document.body;
  if (!body || !body.classList.contains('svx-brand')) return;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const onView = (el, fn, threshold = 0.3) => new IntersectionObserver(([e]) => fn(e.isIntersecting), { threshold }).observe(el);

  /* ── Hero rig: one sample identity, three color modes, four surfaces checked in turn ── */
  const rig = $('[data-bd-rig]');
  if (rig) {
    const modes = $$('.bdx-mode', rig);
    const surfs = $$('.bdx-s', rig);
    const at = $('[data-bd-at]', rig);
    const score = $('[data-bd-score]', rig);
    const live = $('[data-bd-live]', rig);
    const names = { full: 'Full color', one: 'One color', rev: 'Reversed' };
    const order = ['full', 'one', 'rev'];
    let mode = 'full', t = 0, visible = false, userAt = 0;

    const allOk = () => {
      surfs.forEach((s) => { s.classList.remove('is-scan'); s.classList.add('is-ok'); });
      if (score) score.textContent = surfs.length;
      if (at) at.textContent = names[mode];
    };
    const setMode = (m, announce) => {
      mode = m;
      rig.setAttribute('data-mode', m);
      modes.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
      if (announce && live) live.textContent = names[m] + ': the sample mark holds on the trailer door, rate confirmation, login screen, and favicon.';
    };
    /* sweep: highlight each surface, tick it, then rest; auto-advance the mode unless a person chose one */
    const sweep = () => {
      clearTimeout(t);
      if (reduce()) { allOk(); return; }
      surfs.forEach((s) => s.classList.remove('is-ok', 'is-scan'));
      let i = 0;
      if (score) score.textContent = '0';
      const step = () => {
        surfs.forEach((s) => s.classList.remove('is-scan'));
        if (i < surfs.length) {
          const s = surfs[i];
          s.classList.add('is-scan');
          if (at) at.textContent = s.dataset.name;
          t = setTimeout(() => { s.classList.add('is-ok'); i++; if (score) score.textContent = i; step(); }, 620);
        } else {
          if (at) at.textContent = names[mode];
          t = setTimeout(() => {
            if (!visible) return;
            if (Date.now() - userAt > 9000) setMode(order[(order.indexOf(mode) + 1) % order.length], false);
            sweep();
          }, 2600);
        }
      };
      step();
    };
    modes.forEach((b) => b.addEventListener('click', () => {
      userAt = Date.now();
      setMode(b.dataset.mode, true);
      sweep();
    }));
    /* arrow keys move between the three modes like a segmented control */
    $('.bdx-modes', rig).addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const i = modes.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      const n = modes[(i + (e.key === 'ArrowRight' ? 1 : modes.length - 1)) % modes.length];
      n.focus(); n.click();
    });
    if (reduce()) allOk();
    else onView(rig, (v) => { visible = v; clearTimeout(t); if (v) sweep(); else allOk(); }, 0.3);
  }

  /* ── Who: on touch screens the system applies itself once each card is in view ── */
  const who = $('[data-bd-who]');
  if (who && !fine.matches) {
    $$('.bdx-wc', who).forEach((c, i) => {
      if (reduce()) { c.classList.add('is-fixed'); return; }
      let t = 0;
      onView(c, (v) => {
        clearTimeout(t);
        if (v) t = setTimeout(() => c.classList.add('is-fixed'), 900 + i * 80);
        else c.classList.remove('is-fixed');
      }, 0.6);
    });
  }

  /* ── Deliverables: pick a deliverable, read the same file as marketing or as product ── */
  const dv = $('[data-bd-deliv]');
  if (dv) {
    const items = $$('.bdx-di', dv);
    const file = $('.bdx-file', dv);
    const fname = $('[data-bd-fname]', dv);
    const reads = $$('.bdx-read-btn', dv);
    let cur = 0, pinned = 0, auto = 0;
    const show = (i) => {
      cur = i;
      items.forEach((it, j) => {
        it.classList.toggle('is-on', j === i);
        $('.bdx-di-btn', it).setAttribute('aria-pressed', String(j === i));
      });
      file.setAttribute('data-on', i);
      if (fname) fname.textContent = $('.bdx-di-btn b', items[i]).textContent;
    };
    items.forEach((it, i) => $('.bdx-di-btn', it).addEventListener('click', () => { pinned = Date.now(); show(i); }));
    reads.forEach((b) => b.addEventListener('click', () => {
      pinned = Date.now();
      file.setAttribute('data-read', b.dataset.read);
      reads.forEach((r) => r.setAttribute('aria-pressed', String(r === b)));
    }));
    /* Wide screens: the deliverable crossing the middle of the viewport drives the file */
    const wide = matchMedia('(min-width: 1001px)');
    const rio = new IntersectionObserver((es) => {
      if (!wide.matches || Date.now() - pinned < 2500) return;
      es.forEach((e) => { if (e.isIntersecting) show(items.indexOf(e.target)); });
    }, { rootMargin: '-46% 0px -46% 0px' });
    items.forEach((it) => rio.observe(it));
    /* Narrow screens: the file sits above the list and pages through while visible */
    if (!reduce()) {
      onView(file, (v) => {
        clearInterval(auto);
        if (v && !wide.matches) auto = setInterval(() => { if (Date.now() - pinned > 7000) show((cur + 1) % items.length); }, 3600);
      }, 0.5);
    }
  }
})();
