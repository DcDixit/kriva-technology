/* KRIVA trucking solution: reveals, lifecycle highlight, FAQ, process rail */
(function () {
  'use strict';

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

  const beats = [...document.querySelectorAll('.life-item')];
  if (beats.length) {
    const bIO = new IntersectionObserver((es) => {
      for (const e of es) {
        if (!e.isIntersecting) continue;
        beats.forEach((b) => b.classList.toggle('on', b === e.target));
      }
    }, { rootMargin: '-42% 0px -42% 0px' });
    beats.forEach((b) => bIO.observe(b));
    beats[0].classList.add('on');
  }

  document.querySelectorAll('.faq-q').forEach((btn) => {
    const item = btn.closest('.faq-item');
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.faq-q[aria-expanded="true"]').forEach((o) => {
        if (o === btn) return;
        o.setAttribute('aria-expanded', 'false');
        o.closest('.faq-item').classList.remove('open');
      });
      btn.setAttribute('aria-expanded', String(!open));
      item.classList.toggle('open', !open);
    });
  });

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
