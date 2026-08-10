/* KRIVA canonical chrome, mega menu, mobile sheet, scroll nav, WhatsApp */
(function () {
  'use strict';
  if (window.__KRIVA_CHROME__) return;
  window.__KRIVA_CHROME__ = true;

  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const sheet = document.getElementById('sheet');
  if (!nav || !burger || !sheet) return;

  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = () => matchMedia('(min-width: 1100px)').matches;

  /* ── sticky header: shrink on scroll, never hide ── */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      nav.classList.toggle('scrolled', scrollY > 20);
      nav.classList.remove('hide');
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── desktop mega menus ── */
  const items = [...nav.querySelectorAll('.nav-item[data-mm]')];
  let openItem = null;
  let openTimer = null;
  let closeTimer = null;

  const clearTimers = () => {
    if (openTimer) clearTimeout(openTimer);
    if (closeTimer) clearTimeout(closeTimer);
    openTimer = closeTimer = null;
  };

  const closeAll = () => {
    clearTimers();
    items.forEach((li) => {
      li.classList.remove('open');
      const btn = li.querySelector('.nav-trigger');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
    openItem = null;
  };

  const openOne = (li) => {
    clearTimers();
    items.forEach((other) => {
      const isTarget = other === li;
      other.classList.toggle('open', isTarget);
      const btn = other.querySelector('.nav-trigger');
      if (btn) btn.setAttribute('aria-expanded', String(isTarget));
    });
    openItem = li;
  };

  items.forEach((li) => {
    const btn = li.querySelector('.nav-trigger');
    const panel = li.querySelector('.mm');
    if (!btn || !panel) return;

    li.addEventListener('mouseenter', () => {
      if (!desktop()) return;
      clearTimers();
      openTimer = setTimeout(() => openOne(li), 90);
    });
    li.addEventListener('mouseleave', () => {
      if (!desktop()) return;
      clearTimers();
      closeTimer = setTimeout(closeAll, 120);
    });

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (openItem === li) closeAll();
      else openOne(li);
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAll();
        btn.focus();
      }
    });
  });

  document.addEventListener('mousedown', (e) => {
    if (openItem && !openItem.contains(e.target)) closeAll();
  });

  /* ── mobile sheet ── */
  const setSheet = (open) => {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      sheet.hidden = false;
      closeAll();
    } else {
      sheet.querySelectorAll('.sheet-item.open').forEach((el) => {
        el.classList.remove('open');
        const t = el.querySelector('.sheet-toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
      const delay = reduce() ? 0 : 620;
      setTimeout(() => {
        if (!nav.classList.contains('open')) sheet.hidden = true;
      }, delay);
    }
  };

  burger.addEventListener('click', () => setSheet(!nav.classList.contains('open')));

  sheet.querySelectorAll('.sheet-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.sheet-item');
      if (!item) return;
      const willOpen = !item.classList.contains('open');
      sheet.querySelectorAll('.sheet-item.open').forEach((el) => {
        if (el !== item) {
          el.classList.remove('open');
          const t = el.querySelector('.sheet-toggle');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('open', willOpen);
      btn.setAttribute('aria-expanded', String(willOpen));
    });
  });

  sheet.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a && !a.classList.contains('sheet-toggle')) setSheet(false);
  });

  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (nav.classList.contains('open')) {
        setSheet(false);
        burger.focus();
      } else if (openItem) {
        closeAll();
      }
    }
  });

  addEventListener('resize', () => {
    if (desktop() && nav.classList.contains('open')) setSheet(false);
    if (!desktop()) closeAll();
  });
})();
