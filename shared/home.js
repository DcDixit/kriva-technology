/* KRIVA homepage motion — reveals, console, offerings, process rail */
(function () {
  'use strict';
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const reduce = () => mqReduce.matches;

  const readers = [];
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(run);
      ticking = true;
    }
  }
  function run() {
    const y = scrollY;
    for (const r of readers) r(y);
    ticking = false;
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });

  const io = new IntersectionObserver((es) => {
    for (const e of es) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('[data-r],[data-s],[data-mask]').forEach((el) => io.observe(el));

  function countTo(el, target, suffix) {
    if (!el) return;
    if (reduce()) {
      el.textContent = target + suffix;
      return;
    }
    const dur = 1100;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3.4);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ── console ── */
  const con = document.getElementById('console');
  if (con) {
    const rows = [...document.querySelectorAll('#board tbody tr')];
    const conIO = new IntersectionObserver((es) => {
      if (!es[0].isIntersecting) return;
      conIO.disconnect();
      con.classList.add('lit');
      rows.forEach((r, i) => {
        const d = reduce() ? 0 : 280 + Math.pow(i, 0.82) * 90;
        setTimeout(() => r.classList.add('on'), d);
      });
      setTimeout(() => {
        document.querySelectorAll('[data-kpi]').forEach((el) => countTo(el, +el.dataset.kpi, ''));
        countTo(document.getElementById('ontime'), 96, '%');
        const sla = document.getElementById('sla');
        if (sla) sla.style.transform = 'scaleX(.94)';
        countTo(document.getElementById('slaPct'), 94, '%');
      }, reduce() ? 0 : 720);
    }, { threshold: 0.28 });
    conIO.observe(con);

    const tabs = [...con.querySelectorAll('.c-tabs button')];
    const panels = [...con.querySelectorAll('.c-panel')];

    const select = (btn) => {
      const id = btn.getAttribute('aria-controls');
      tabs.forEach((x) => {
        const on = x === btn;
        x.setAttribute('aria-selected', String(on));
        x.tabIndex = on ? 0 : -1;
      });
      panels.forEach((p) => {
        const on = p.id === id;
        p.classList.toggle('on', on);
        p.hidden = !on;
      });
    };

    // roving tabindex: the tablist is one stop, arrows move between tabs
    tabs.forEach((btn, i) => {
      btn.tabIndex = btn.getAttribute('aria-selected') === 'true' ? 0 : -1;
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

  /* ── FAQ accordion ── */
  const faqs = [...document.querySelectorAll('.faq-q')];
  faqs.forEach((btn) => {
    const item = btn.closest('.faq-item');
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      faqs.forEach((other) => {
        if (other === btn) return;
        other.setAttribute('aria-expanded', 'false');
        other.closest('.faq-item').classList.remove('open');
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

  /* ── hero float ── */
  const stack = document.querySelector('.hero-stack');
  const flt = document.querySelector('.hero-float');
  if (stack && flt && !reduce()) {
    readers.push(() => {
      const r = stack.getBoundingClientRect();
      const p = Math.max(-1, Math.min(1, (innerHeight * 0.5 - r.top) / innerHeight));
      flt.style.transform = `rotate(-2.5deg) translate3d(0, ${p * 18}px, 0)`;
    });
  }

  /* ── process rail ── */
  const rail = document.getElementById('rail');
  const fill = document.getElementById('railFill');
  const steps = [...document.querySelectorAll('.step')];
  if (rail && fill) {
    readers.push(() => {
      const r = rail.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) return;
      const mid = innerHeight * 0.58;
      const p = Math.max(0, Math.min(1, (mid - r.top) / r.height));
      fill.style.height = p * r.height + 'px';
      for (const s of steps) s.classList.toggle('on', s.getBoundingClientRect().top < mid);
    });
  }

  run();
})();
