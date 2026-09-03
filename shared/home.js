/* KRIVA homepage motion: reveals, hero board, workflow, FAQ */
(function () {
  'use strict';
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const reduce = () => mqReduce.matches;

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('[data-r],[data-s],[data-mask]').forEach((el) => {
    if (el.hasAttribute('data-mask')) el.classList.add('mask');
    io.observe(el);
  });
  if (reduce()) document.querySelectorAll('[data-r],[data-s],[data-mask]').forEach((el) => el.classList.add('in'));

  /* ── hero board ── */
  const board = document.getElementById('heroBoard');
  if (board) board.classList.add('lit');

  /* ── problem tabs ── */
  const tabs = [...document.querySelectorAll('.prob-tabs [role="tab"]')];
  const panels = [...document.querySelectorAll('.prob-panel')];
  if (tabs.length) {
    const select = (btn) => {
      const id = btn.getAttribute('aria-controls');
      tabs.forEach((t) => {
        const on = t === btn;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach((p) => {
        const on = p.id === id;
        p.classList.toggle('on', on);
        p.hidden = !on;
      });
    };
    tabs.forEach((btn, i) => {
      btn.addEventListener('click', () => select(btn));
      btn.addEventListener('keydown', (e) => {
        const map = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
        if (!(e.key in map)) return;
        e.preventDefault();
        const next = tabs[(map[e.key] + tabs.length) % tabs.length];
        select(next);
        next.focus();
      });
    });
  }

  /* ── workflow load console ── */
  const path = document.getElementById('wfPath');
  if (path) {
    const tabs = [...path.querySelectorAll('[role="tab"]')];
    const panels = [...document.querySelectorAll('#wfStage .wf-panel')];
    const scroller = path.closest('.wf-path-scroller');
    const sub = document.getElementById('wfSub');
    const live = document.getElementById('wfLive');
    const count = document.getElementById('wfCount');
    const meter = document.getElementById('wfMeter');
    let userTouched = false;
    let playTimer;
    let primed = false;
    let playIndex = 0;

    const scrollTabIntoScroller = (btn) => {
      if (!scroller) return;
      const max = scroller.scrollWidth - scroller.clientWidth;
      if (max <= 0) return;
      const left = btn.offsetLeft - (scroller.clientWidth - btn.offsetWidth) / 2;
      scroller.scrollTo({
        left: Math.max(0, Math.min(left, max)),
        behavior: reduce() ? 'auto' : 'smooth',
      });
    };

    const select = (btn, { focus = false } = {}) => {
      const id = btn.getAttribute('aria-controls');
      const idx = tabs.indexOf(btn);
      tabs.forEach((t, i) => {
        const on = t === btn;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        t.classList.toggle('is-done', i < idx);
      });
      panels.forEach((p) => {
        const on = p.id === id;
        p.classList.toggle('on', on);
        p.hidden = !on;
      });
      if (sub) sub.textContent = btn.dataset.sub || '';
      if (live) {
        live.textContent = btn.dataset.live || '';
        live.parentElement.classList.remove('is-risk', 'is-ok');
        if (btn.dataset.tone) live.parentElement.classList.add('is-' + btn.dataset.tone);
      }
      if (count) count.textContent = btn.dataset.n || '';
      if (meter) meter.style.setProperty('--p', btn.dataset.p || '.125');
      if (focus) btn.focus();
      if (primed) scrollTabIntoScroller(btn);
      primed = true;
      playIndex = idx;
    };

    tabs.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        userTouched = true;
        clearTimeout(playTimer);
        playTimer = null;
        select(btn);
      });
      btn.addEventListener('keydown', (e) => {
        const map = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
        if (!(e.key in map)) return;
        e.preventDefault();
        userTouched = true;
        clearTimeout(playTimer);
        playTimer = null;
        const next = tabs[(map[e.key] + tabs.length) % tabs.length];
        select(next, { focus: true });
      });
    });
    select(tabs[0]);

    const consoleEl = document.getElementById('loadFlow');
    if (consoleEl && !reduce()) {
      const tick = () => {
        playTimer = null;
        if (userTouched || playIndex >= tabs.length - 1) return;
        playIndex += 1;
        select(tabs[playIndex]);
        playTimer = setTimeout(tick, 2400);
      };
      const playIO = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) {
          clearTimeout(playTimer);
          playTimer = null;
          return;
        }
        if (userTouched || playTimer || playIndex >= tabs.length - 1) return;
        playTimer = setTimeout(tick, 2200);
      }, { threshold: 0.28 });
      playIO.observe(consoleEl);
    }
  }

  /* ── FAQ accordion ── */
  const faqs = [...document.querySelectorAll('.faq-q')];
  faqs.forEach((btn) => {
    const item = btn.closest('.faq-item');
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      faqs.forEach((other) => {
        if (other === btn) return;
        other.setAttribute('aria-expanded', 'false');
        other.closest('.faq-item')?.classList.remove('open');
      });
      btn.setAttribute('aria-expanded', String(!open));
      item.classList.toggle('open', !open);
    });
    btn.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || btn.getAttribute('aria-expanded') !== 'true') return;
      btn.setAttribute('aria-expanded', 'false');
      item.classList.remove('open');
    });
  });

  /* ── horizontal scroll cue ── */
  document.querySelectorAll('.shift-scroll').forEach((scroller) => {
    const cue = scroller.querySelector('.scroll-cue');
    if (!cue) return;
    const check = () => {
      const overflow = scroller.scrollWidth > scroller.clientWidth + 8;
      cue.hidden = !overflow;
    };
    check();
    addEventListener('resize', check, { passive: true });
  });
})();
