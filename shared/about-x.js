/* KRIVA About · "abx" motion (body.svx-about). Runs beside services-x.js, which already owns the
   shared reveals, split headlines, cursor, rail, progress bar, FAQ, parallax and [data-steps] line.
   This file adds: the hero squad thread, the read-along story stage, the case counter, card tilt,
   and the mobile section chips. Without JS or under reduced motion every element shows its
   finished state (set in the HTML). */
(function () {
  'use strict';
  const body = document.body;
  if (!body || !body.classList.contains('svx-about')) return;
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mqFine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = () => mqReduce.matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const whenVisible = (el, on, off, threshold = 0.3) => {
    new IntersectionObserver(([e]) => (e.isIntersecting ? on() : off && off()), { threshold }).observe(el);
  };

  /* ── Hero: the squad thread writes itself, the week moves Mon → Wed → Fri ── */
  const thread = $('[data-abx-thread]');
  if (thread && !reduce()) {
    const holds = [1300, 1500, 1500, 2600, 2600];
    let n = 0, t = 0;
    const tick = () => { thread.setAttribute('data-step', n); t = setTimeout(() => { n = (n + 1) % 5; tick(); }, holds[n]); };
    whenVisible(thread, () => { clearTimeout(t); n = 0; tick(); }, () => { clearTimeout(t); thread.setAttribute('data-step', 3); }, 0.25);
  }

  /* ── Story stage: the paragraph being read drives the illustration ── */
  const story = $('[data-abx-story]');
  const stage = $('[data-abx-stage]');
  if (story && stage) {
    const sec = story.closest('section');
    const paras = $$('.abx-letter p[data-k]', story);
    const tabs = $$('.abx-tab', stage);
    const cap = $('[data-abx-cap]', stage);
    const caps = ['Used on a real workday', 'Three vendors for one product', 'One in-house team · founded 2025', 'Ahmedabad HQ · no local offices abroad'];
    const wide = matchMedia('(min-width: 1001px)');
    let cur = Number(stage.getAttribute('data-step')) || 0, pinned = 0, auto = 0;
    const show = (i) => {
      cur = i;
      stage.setAttribute('data-step', i);
      tabs.forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
      paras.forEach((p, j) => p.classList.toggle('is-on', j === i));
      if (cap) cap.textContent = caps[i];
    };
    tabs.forEach((b, i) => b.addEventListener('click', () => { pinned = Date.now(); show(i); }));
    if (!reduce()) {
      if (sec) sec.classList.add('is-reading');
      show(0);
      /* Wide screens: the last paragraph whose top has passed the reading line (mid-viewport)
         sets the step. One deterministic line, so the stage never runs ahead of the text. */
      let ticking = false;
      const read = () => {
        ticking = false;
        if (!wide.matches || Date.now() - pinned < 1800) return;
        const line = innerHeight * 0.5;
        const r = story.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        let i = 0;
        paras.forEach((p, j) => { if (p.getBoundingClientRect().top <= line) i = j; });
        if (i !== cur) show(i);
      };
      addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(read); } }, { passive: true });
      read();
      /* Narrow screens: the stage sits above the letter and steps through the story while visible. */
      whenVisible(stage, () => {
        clearInterval(auto);
        if (!wide.matches) auto = setInterval(() => { if (Date.now() - pinned > 6000) show((cur + 1) % 4); }, 3400);
      }, () => clearInterval(auto), 0.45);
    }
  }

  /* ── "08" case studies counts up once ── */
  const count = $('[data-abx-count]');
  if (count && !reduce()) {
    const to = Number(count.getAttribute('data-abx-count')) || 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(), dur = 1100;
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        count.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3)))).padStart(2, '0');
        if (p < 1) requestAnimationFrame(step);
      };
      count.textContent = '00';
      requestAnimationFrame(step);
    }, { threshold: 0.6 });
    io.observe(count);
  }

  /* ── Cards that tilt toward the pointer (thread, company record) ── */
  if (mqFine.matches && !reduce()) {
    $$('[data-abx-tilt]').forEach((wrap) => {
      const card = wrap.firstElementChild;
      if (!card) return;
      wrap.addEventListener('pointermove', (e) => {
        const r = wrap.getBoundingClientRect();
        card.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 7).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (((e.clientY - r.top) / r.height - 0.5) * -6).toFixed(2) + 'deg');
      }, { passive: true });
      wrap.addEventListener('pointerleave', () => { card.style.setProperty('--ry', '0deg'); card.style.setProperty('--rx', '0deg'); });
    });
  }

  /* ── Phone swipe rows (practices, cases): keyboard-scrollable region + progress dots ── */
  const narrow = matchMedia('(max-width: 600px)');
  $$('[data-abx-swipe]').forEach((row) => {
    const hint = row.parentElement && $('.abx-swipe', row.parentElement);
    const dots = hint ? $$('i b', hint) : [];
    const cards = [...row.children];
    const sync = () => {
      if (narrow.matches) { row.setAttribute('tabindex', '0'); row.setAttribute('role', 'region'); }
      else { row.removeAttribute('tabindex'); row.removeAttribute('role'); }
    };
    sync();
    narrow.addEventListener('change', sync);
    let raf = 0;
    row.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const x = row.scrollLeft;
        let best = 0;
        cards.forEach((c, i) => { if (Math.abs(c.offsetLeft - row.offsetLeft - x) < Math.abs(cards[best].offsetLeft - row.offsetLeft - x)) best = i; });
        if (row.scrollLeft + row.clientWidth >= row.scrollWidth - 4) best = cards.length - 1;
        dots.forEach((d, i) => d.classList.toggle('on', i === best));
      });
    }, { passive: true });
  });

  /* ── Mobile section chips follow the reader ── */
  const chips = $$('#mobChips a');
  if (chips.length) {
    const targets = chips.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const cio = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        chips.forEach((a) => {
          if (a.getAttribute('href') === '#' + e.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    targets.forEach((t) => cio.observe(t));
  }
})();
