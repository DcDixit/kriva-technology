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
    document.body.classList.toggle('nav-scroll-lock', open);
    document.body.style.overflow = '';
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

  const menuCopy = {
    '/solutions/trucking-logistics': 'Dispatch, visibility, and the load record.',
    '/solutions/freight-broker-software': 'Quotes, carriers, and load tracking.',
    '/solutions/fleet-management-software': 'Vehicles, maintenance, and performance.',
    '/solutions/car-transportation': 'Pickup, delivery, and condition notes.',
    '/solutions/saas': 'Product, platform, and onboarding.',
    '/solutions/accounting-integrations': 'Sync, retries, and reconciliation.',
    '/services/crm-development': 'Boards, pipelines, and an audit trail.',
    '/services/saas-platforms': 'Multi-tenant products and admin.',
    '/services/mobile-applications': 'Field apps built for one hand.',
    '/services/web-development': 'Sites and web applications.',
    '/services/api-integrations': 'Connections with visible failures.',
    '/services/automation-systems': 'Repeat work, with a human gate.',
    '/services/product-design': 'From the job to a shippable UI.',
    '/services/ui-ux-design': 'Screens arranged around the task.',
    '/services/dashboard-design': 'The morning scan, then the record.',
    '/services/branding': 'Identity the product can use.'
  };
  const menuIcons = {
    '/solutions/trucking-logistics': '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    '/solutions/freight-broker-software': '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 8.7 5 8.7-5"/>',
    '/solutions/fleet-management-software': '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    '/solutions/car-transportation': '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
    '/solutions/saas': '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
    '/solutions/accounting-integrations': '<path d="M3 22h18"/><path d="M6 18v-7"/><path d="M10 18v-7"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="m12 2 8 5H4Z"/>',
    '/services/crm-development': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    '/services/saas-platforms': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>',
    '/services/mobile-applications': '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
    '/services/web-development': '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    '/services/api-integrations': '<path d="M4 9a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1Z"/><path d="M16 7a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2"/><path d="M8 12h8"/>',
    '/services/automation-systems': '<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>',
    '/services/product-design': '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>',
    '/services/ui-ux-design': '<rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/>',
    '/services/dashboard-design': '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    '/services/branding': '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>'
  };

  const icon = (href) => {
    const body = menuIcons[href];
    if (!body) return null;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'mm-ico');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.75');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = body;
    return svg;
  };

  document.querySelectorAll('#mm-solutions a[href], #mm-services a[href], #sheet-solutions a[href], #sheet-services a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!a.querySelector('.mm-ico')) {
      const mark = icon(href);
      if (mark) a.insertBefore(mark, a.firstChild);
    }
    if (menuCopy[href] && !a.querySelector('em')) {
      const em = document.createElement('em');
      em.textContent = menuCopy[href];
      a.appendChild(em);
    }
  });
})();
