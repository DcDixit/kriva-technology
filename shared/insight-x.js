/* KRIVA Insights · article "ix" layer behavior. Progress, reveals, contents rail, copy link,
   heading anchors, pointer glow, count-up. Every effect degrades to static content without JS
   or with reduced motion (html.ix-motion is only set when motion is allowed). */
(function () {
  'use strict';
  window.__ix = true;
  var d = document, root = d.documentElement;
  var motion = root.classList.contains('ix-motion');
  var article = d.querySelector('article');
  var nav = d.getElementById('nav');

  function navH() { return nav ? Math.round(nav.getBoundingClientRect().height) : 72; }
  function setNavH() { d.body.style.setProperty('--navh', navH() + 'px'); }
  setNavH();
  addEventListener('resize', setNavH, { passive: true });

  /* Reveals */
  var targets = d.querySelectorAll('[data-x],.ix-spec,.ix-tablecard,.ix-scope');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('is-in'); });
  }
  d.querySelectorAll('.ix-scope li').forEach(function (li, i) { li.style.setProperty('--i', i); });
  d.querySelectorAll('.ix-spec .ix-row').forEach(function (row, i) {
    row.querySelectorAll('.ix-bar,.ix-tail,.ix-dot,.ix-tick').forEach(function (b) { b.style.setProperty('--d', (0.15 + i * 0.12) + 's'); });
  });
  d.querySelectorAll('.ix-tablecard tbody tr').forEach(function (row, i) {
    var b = row.querySelector('.ix-mini b'); if (b) b.style.setProperty('--d', (0.1 + i * 0.1) + 's');
  });

  /* Reading progress + contents rail */
  var bar = d.getElementById('progress');
  var toc = d.querySelector('.ix-toc');
  var links = toc ? [].slice.call(toc.querySelectorAll('ol a')) : [];
  var secs = links.map(function (a) { return d.getElementById(a.getAttribute('href').slice(1)); }).filter(Boolean);
  var nowEl = toc && toc.querySelector('.now');
  var introLabel = nowEl ? nowEl.textContent : '';
  var ticking = false;
  function update() {
    ticking = false;
    if (!article) return;
    var r = article.getBoundingClientRect();
    var total = article.offsetHeight - innerHeight;
    var p = Math.min(1, Math.max(0, -r.top / Math.max(total, 1)));
    if (bar) bar.style.width = (p * 100) + '%';
    if (toc) toc.style.setProperty('--p', p.toFixed(4));
    var line = navH() + 170, cur = -1;
    secs.forEach(function (s, i) { if (s.getBoundingClientRect().top <= line) cur = i; });
    links.forEach(function (a, i) { a.setAttribute('aria-current', i === cur ? 'true' : 'false'); });
    if (nowEl) nowEl.textContent = cur >= 0 ? links[cur].lastChild.textContent.trim() : introLabel;
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  update();

  /* Mobile contents toggle */
  var btn = toc && toc.querySelector('.ix-toc-btn');
  if (btn) {
    var close = function () { toc.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); };
    btn.addEventListener('click', function () {
      var open = !toc.classList.contains('is-open');
      toc.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.forEach(function (a) { a.addEventListener('click', close); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && toc.classList.contains('is-open')) { close(); btn.focus(); } });
    d.addEventListener('click', function (e) { if (!toc.contains(e.target)) close(); });
  }

  /* Copy link helpers */
  function copy(text, el, doneLabel) {
    var done = function () {
      el.classList.add('is-done');
      var lab = el.querySelector('[data-label]');
      var old = lab ? lab.textContent : null;
      if (lab) lab.textContent = doneLabel;
      setTimeout(function () { el.classList.remove('is-done'); if (lab) lab.textContent = old; }, 1800);
    };
    var legacy = function () {
      var t = d.createElement('textarea');
      t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
      d.body.appendChild(t); t.select();
      var ok = false; try { ok = d.execCommand('copy'); } catch (e) { ok = false; }
      t.remove();
      if (ok) done();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, legacy);
    else legacy();
  }
  var base = location.origin + location.pathname;
  var cp = d.querySelector('.ix-copy');
  if (cp) cp.addEventListener('click', function () { copy(base, cp, 'Link copied'); });

  /* Section anchors on h2 */
  var linkSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a5 5 0 0 0 7.1 0l3-3a5 5 0 0 0-7.1-7.1l-1 1"/><path d="M14 10a5 5 0 0 0-7.1 0l-3 3a5 5 0 0 0 7.1 7.1l1-1"/></svg>';
  d.querySelectorAll('.ix-prose h2[id]').forEach(function (h) {
    var a = d.createElement('a');
    a.className = 'ix-anchor';
    a.href = '#' + h.id;
    a.setAttribute('aria-label', 'Copy link to section: ' + h.textContent.trim());
    a.innerHTML = linkSvg;
    a.addEventListener('click', function (e) {
      e.preventDefault();
      history.replaceState(null, '', '#' + h.id);
      copy(base + '#' + h.id, a, '');
    });
    h.appendChild(a);
  });

  /* Pointer glow on hero, closing card and spotlight tiles */
  if (motion && matchMedia('(hover: hover)').matches) {
    d.querySelectorAll('.ix-hero,.ix-end,[data-spot]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    });
  }

  /* Spectrum row ↔ table row highlight */
  var specRows = [].slice.call(d.querySelectorAll('.ix-spec .ix-row'));
  specRows.forEach(function (row, i) {
    row.addEventListener('pointerenter', function () { specRows.forEach(function (r, j) { r.classList.toggle('is-dim', j !== i); }); });
    row.addEventListener('pointerleave', function () { specRows.forEach(function (r) { r.classList.remove('is-dim'); }); });
  });

  /* Count-up on the starting price */
  var num = d.querySelector('[data-count]');
  if (num && motion && 'IntersectionObserver' in window) {
    var end = +num.getAttribute('data-count');
    var fmt = function (v) { return Math.round(v).toLocaleString('en-US'); };
    var rect = num.getBoundingClientRect();
    if (rect.top > innerHeight) {
      num.textContent = '0';
      var cio = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        cio.disconnect();
        var t0 = performance.now(), dur = 1400;
        (function step(t) {
          var k = Math.min(1, (t - t0) / dur);
          num.textContent = fmt(end * (1 - Math.pow(1 - k, 4)));
          if (k < 1) requestAnimationFrame(step);
        })(t0);
      }, { threshold: 0.6 });
      cio.observe(num);
    }
  }
})();
