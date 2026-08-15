/* KRIVA SaaS / Sales — reveals, product stage, phases, FAQ */
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
    for (const r of readers) r();
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
  document.querySelectorAll('[data-r],[data-s],[data-mask]').forEach((el) => {
    if (el.hasAttribute('data-mask')) el.classList.add('mask');
    io.observe(el);
  });

  const tabs = [...document.querySelectorAll('.stage-tabs button')];
  const panels = [...document.querySelectorAll('.stage-panel')];
  const shots = [...document.querySelectorAll('.stage-frame img')];
  function setStage(i) {
    tabs.forEach((t, j) => {
      const on = j === i;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p, j) => {
      const on = j === i;
      p.classList.toggle('on', on);
      p.toggleAttribute('hidden', !on);
    });
    shots.forEach((img, j) => img.classList.toggle('on', j === i));
  }
  tabs.forEach((btn, i) => {
    btn.addEventListener('click', () => setStage(i));
    btn.addEventListener('keydown', (e) => {
      let next = i;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      else return;
      e.preventDefault();
      setStage(next);
      tabs[next].focus();
    });
  });
  if (tabs.length) setStage(0);

  const phases = [...document.querySelectorAll('.phase')];
  if (phases.length) {
    readers.push(() => {
      const mid = innerHeight * 0.7;
      phases.forEach((s) => {
        if (s.getBoundingClientRect().top < mid) s.classList.add('on');
      });
    });
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

  run();
})();
