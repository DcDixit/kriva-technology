/* KRIVA canonical chrome, mega menu, mobile sheet, scroll nav */
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

  const items = [...nav.querySelectorAll('.nav-item[data-mm]')];
  let openItem = null;
  let openTimer = null;
  let closeTimer = null;

  const linksOf = (li) => [...li.querySelectorAll('.mm a[href]')];

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
      const panel = li.querySelector('.mm');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (panel) panel.setAttribute('hidden', '');
    });
    openItem = null;
  };

  const openOne = (li) => {
    clearTimers();
    items.forEach((other) => {
      const isTarget = other === li;
      other.classList.toggle('open', isTarget);
      const btn = other.querySelector('.nav-trigger');
      const panel = other.querySelector('.mm');
      if (btn) btn.setAttribute('aria-expanded', String(isTarget));
      if (panel) {
        if (isTarget) panel.removeAttribute('hidden');
        else panel.setAttribute('hidden', '');
      }
    });
    openItem = li;
  };

  items.forEach((li) => {
    const btn = li.querySelector('.nav-trigger');
    const panel = li.querySelector('.mm');
    if (!btn || !panel) return;
    if (!li.classList.contains('open')) panel.setAttribute('hidden', '');

    li.addEventListener('mouseenter', () => {
      if (!desktop()) return;
      clearTimers();
      openTimer = setTimeout(() => openOne(li), 90);
    });
    li.addEventListener('mouseleave', () => {
      if (!desktop()) return;
      clearTimers();
      closeTimer = setTimeout(closeAll, 140);
    });

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (openItem === li) {
        closeAll();
        btn.focus();
      } else {
        openOne(li);
      }
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeAll();
        btn.focus();
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        openOne(li);
        const first = linksOf(li)[0];
        if (first) first.focus();
      }
    });

    panel.addEventListener('keydown', (e) => {
      const links = linksOf(li);
      const i = links.indexOf(document.activeElement);
      if (e.key === 'Escape') {
        e.preventDefault();
        closeAll();
        btn.focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (links.length) links[(Math.max(i, 0) + 1) % links.length].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (i <= 0) btn.focus();
        else links[i - 1].focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        links[0]?.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        links[links.length - 1]?.focus();
      } else if (e.key === 'Tab' && !e.shiftKey && i === links.length - 1) {
        closeAll();
      } else if (e.key === 'Tab' && e.shiftKey && i <= 0) {
        closeAll();
      }
    });
  });

  document.addEventListener('mousedown', (e) => {
    if (openItem && !openItem.contains(e.target)) closeAll();
  });

  nav.addEventListener('focusout', (e) => {
    if (!openItem) return;
    const next = e.relatedTarget;
    if (next && openItem.contains(next)) return;
    requestAnimationFrame(() => {
      if (!openItem) return;
      if (openItem.contains(document.activeElement)) return;
      if (openItem.matches(':hover')) return;
      closeAll();
    });
  });

  const setSheet = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      sheet.hidden = false;
      closeAll();
      requestAnimationFrame(() => nav.classList.add('open'));
    } else {
      nav.classList.remove('open');
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

  burger.addEventListener('click', () => setSheet(burger.getAttribute('aria-expanded') !== 'true'));

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
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setSheet(false);
        burger.focus();
      }
    });
  });

  sheet.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a && !a.classList.contains('sheet-toggle')) setSheet(false);
  });

  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (nav.classList.contains('open')) {
      setSheet(false);
      burger.focus();
    } else if (openItem) {
      const btn = openItem.querySelector('.nav-trigger');
      closeAll();
      if (btn) btn.focus();
    }
  });

  addEventListener('resize', () => {
    if (desktop() && nav.classList.contains('open')) setSheet(false);
    if (!desktop()) closeAll();
  });

  const processSteps = [
    ['01', 'Discovery', 'Clear the problem'],
    ['02', 'Strategy', 'Defined direction'],
    ['03', 'Design', 'Iterative UI'],
    ['04', 'Build', 'Weekly demos'],
    ['05', 'Launch', 'Confident ship']
  ];
  const mountProcess = (link) => {
    if (!link || link.querySelector('.mm-steps')) return;
    const ol = document.createElement('ol');
    ol.className = 'mm-steps';
    ol.setAttribute('aria-hidden', 'true');
    processSteps.forEach(([num, title, detail]) => {
      const li = document.createElement('li');
      const n = document.createElement('span');
      n.className = 'n';
      const mark = document.createElement('i');
      n.appendChild(mark);
      n.appendChild(document.createTextNode(num));
      const b = document.createElement('b');
      b.textContent = title;
      const small = document.createElement('small');
      small.textContent = detail;
      li.appendChild(n);
      li.appendChild(b);
      li.appendChild(small);
      ol.appendChild(li);
    });
    link.appendChild(ol);
  };
  mountProcess(document.querySelector('#mm-operations a[href="/process"]'));
  mountProcess(document.querySelector('#sheet-operations a[href="/process"]'));
})();
