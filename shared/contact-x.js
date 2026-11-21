/* KRIVA Contact · "ctx" layer behavior (body.svx-ct). Loaded after services-x.js.
   Progressive enhancement only: the inline page script still owns validation and submission,
   and every form control stays in the DOM unchanged. Without this file the page is complete. */
(function () {
  'use strict';
  const body = document.body;
  if (!body || !body.classList.contains('svx-ct')) return;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STUDIO_TZ = 'Asia/Kolkata';

  /* ── Studio clock, visitor clock, reply-by date ── */
  const timeHtml = (d, tz) => {
    try {
      const parts = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz }).formatToParts(d);
      return parts.map((p) => p.value).join('');
    } catch (e) { return ''; }
  };
  /* One business day in the studio's calendar: the next weekday after today (IST). */
  const replyBy = (now) => {
    let ist;
    try {
      const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: STUDIO_TZ, year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(now).map((x) => [x.type, x.value]));
      ist = new Date(Date.UTC(+p.year, +p.month - 1, +p.day, 12));
    } catch (e) { return ''; }
    do { ist.setUTCDate(ist.getUTCDate() + 1); } while (ist.getUTCDay() === 0 || ist.getUTCDay() === 6);
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(ist);
  };
  const studioEl = $('[data-ct-studio]');
  const localEl = $('[data-ct-local]');
  const tzEl = $('[data-ct-tz]');
  let localTz = '';
  try { localTz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
  const sameZone = (() => {
    try {
      const d = new Date();
      return timeHtml(d, STUDIO_TZ) === timeHtml(d, localTz || undefined);
    } catch (e) { return false; }
  })();
  if (tzEl) {
    const city = localTz.split('/').pop().replace(/_/g, ' ');
    let abbr = '';
    /* Prefer a real abbreviation (EST, GMT, AEDT) from the visitor's locale or en-US; fall back to GMT±n. */
    const zoneName = (loc) => { try { return (new Intl.DateTimeFormat(loc, { timeZoneName: 'short' }).formatToParts(new Date()).find((p) => p.type === 'timeZoneName') || {}).value || ''; } catch (e) { return ''; } };
    const names = [zoneName(navigator.language), zoneName('en-US')].filter(Boolean);
    abbr = names.find((n) => !/^(GMT|UTC)/.test(n)) || names[0] || '';
    if (sameZone) tzEl.textContent = 'Same time zone as the studio';
    else if (city) tzEl.textContent = city + (abbr ? ' · ' + abbr : '');
  }
  const tick = () => {
    const now = new Date();
    const s = timeHtml(now, STUDIO_TZ);
    const l = timeHtml(now, localTz || undefined);
    if (studioEl && s) studioEl.textContent = s;
    if (localEl && l) localEl.textContent = l;
    const r = replyBy(now);
    if (r) $$('[data-ct-reply]').forEach((el) => { el.textContent = r; });
  };
  tick();
  setTimeout(() => { tick(); setInterval(tick, 60000); }, (60 - new Date().getSeconds()) * 1000 + 50);
  /* Background tabs throttle timers: refresh as soon as the page is visible again. */
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });

  /* ── Field state: same rule as the inline validator ── */
  const valid = (f) => {
    const v = (f.value || '').trim();
    if (!v) return false;
    if (f.type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    if (f.type === 'url') return /^https?:\/\/\S+\.\S+/.test(v) || /^[^\s]+\.[^\s]{2,}/.test(v);
    return true;
  };

  /* ── Project-type chips for the fit call (the select stays the submitted field) ── */
  const sel = $('#fit-ptype');
  if (sel) {
    const f = sel.closest('.f');
    const lab = $('label[for="fit-ptype"]', f);
    if (lab && !lab.id) lab.id = 'fit-ptype-label';
    const group = document.createElement('div');
    group.className = 'ctx-chips';
    group.setAttribute('role', 'radiogroup');
    group.setAttribute('aria-labelledby', lab ? lab.id : '');
    group.setAttribute('aria-describedby', 'fit-ptype-err');
    group.setAttribute('aria-required', 'true');
    const opts = [...sel.options].filter((o) => o.value !== '');
    const chips = opts.map((o) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ctx-chip';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', 'false');
      b.tabIndex = -1;
      b.textContent = o.text;
      b.dataset.value = o.value;
      group.appendChild(b);
      return b;
    });
    const sync = () => {
      let any = false;
      chips.forEach((c) => { const on = c.dataset.value === sel.value && sel.value !== ''; c.setAttribute('aria-checked', String(on)); c.tabIndex = on ? 0 : -1; any = any || on; });
      if (!any && chips[0]) chips[0].tabIndex = 0;
      group.setAttribute('aria-invalid', String(sel.getAttribute('aria-invalid') === 'true'));
    };
    const pick = (c, focus) => {
      sel.value = c.dataset.value;
      sel.dispatchEvent(new Event('input', { bubbles: true }));
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      sync();
      if (focus) c.focus();
    };
    chips.forEach((c, i) => {
      c.addEventListener('click', () => pick(c, false));
      c.addEventListener('keydown', (e) => {
        const k = e.key;
        let j = -1;
        if (k === 'ArrowRight' || k === 'ArrowDown') j = (i + 1) % chips.length;
        else if (k === 'ArrowLeft' || k === 'ArrowUp') j = (i - 1 + chips.length) % chips.length;
        else if (k === 'Home') j = 0;
        else if (k === 'End') j = chips.length - 1;
        if (j < 0) return;
        e.preventDefault();
        pick(chips[j], true);
      });
    });
    (sel.closest('.select-wrap') || sel).after(group);
    f.classList.add('has-chips');
    /* Chips on wider screens; phones keep the native select (simpler, built-in picker). */
    const mqChips = matchMedia('(min-width: 601px)');
    const chipsOn = () => mqChips.matches;
    const applyMode = () => {
      if (chipsOn()) { sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true'); }
      else { sel.removeAttribute('tabindex'); sel.removeAttribute('aria-hidden'); }
      group.hidden = !chipsOn();
    };
    applyMode();
    if (mqChips.addEventListener) mqChips.addEventListener('change', applyMode);
    /* The error summary links focus the select: hand focus to the chips instead. */
    sel.addEventListener('focus', () => { if (!chipsOn()) return; const c = chips.find((x) => x.tabIndex === 0) || chips[0]; if (c) c.focus(); });
    sel.addEventListener('change', sync);
    new MutationObserver(sync).observe(sel, { attributes: true, attributeFilter: ['aria-invalid'] });
    if (lab) lab.addEventListener('click', (e) => { if (!chipsOn()) return; e.preventDefault(); const c = chips.find((x) => x.tabIndex === 0) || chips[0]; if (c) c.focus(); });
    sync();
  }

  /* ── Progress: ring, bar, checklist, and a quiet tick on valid fields ── */
  const wireProgress = (form) => {
    if (!form) return;
    const id = form.id;
    const req = $$('[required]', form);
    const meter = $('[data-ct-meter="' + id + '"]');
    const bar = $('[data-ct-bar="' + id + '"]');
    const check = $('[data-ct-check="' + id + '"]');
    const countEl = meter && $('[data-ct-count]', meter);
    const totalEl = meter && $('[data-ct-total]', meter);
    if (totalEl) totalEl.textContent = req.length;
    const update = () => {
      let n = 0;
      req.forEach((f) => { if (valid(f)) n++; });
      const p = req.length ? n / req.length : 0;
      if (meter) { meter.style.setProperty('--p', p); meter.classList.toggle('is-full', p === 1); }
      if (countEl) countEl.textContent = n;
      if (bar) bar.style.setProperty('--p', p);
      /* Once every required field is valid, retire the field-check summary (not a send error). */
      const sum = form.previousElementSibling && form.previousElementSibling.classList.contains('summary') ? form.previousElementSibling : null;
      if (sum && p === 1 && sum.classList.contains('on') && /Check these fields/.test(sum.querySelector('b') ? sum.querySelector('b').textContent : '')) sum.classList.remove('on');
      if (check) $$('li[data-for]', check).forEach((li) => { const f = form.elements[li.dataset.for]; li.classList.toggle('is-done', !!f && valid(f)); });
      $$('input:not([type=hidden]),select,textarea', form).forEach((f) => {
        const box = f.closest('.f');
        if (!box || f.name === 'website_hp' || f.tagName === 'TEXTAREA') return;
        box.classList.toggle('is-ok', valid(f) && f.getAttribute('aria-invalid') !== 'true');
      });
    };
    form.addEventListener('input', update);
    form.addEventListener('change', update);
    form.addEventListener('focusout', update);
    update();
  };
  wireProgress($('#fitForm'));
  wireProgress($('#briefForm'));

  /* ── "Fit call" route: bring the card into view and start typing ── */
  $$('[data-ct-start]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const card = $('[data-ct-card]');
      const first = $('#fit-name');
      if (!card || !first || $('#fitForm.sent')) return;
      e.preventDefault();
      const r = card.getBoundingClientRect();
      if (r.top < 70 || r.top > innerHeight * 0.6) card.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'start' });
      setTimeout(() => first.focus({ preventScroll: true }), reduce() ? 0 : 450);
    });
  });

  /* ── Copy the email address ── */
  $$('[data-ct-copy]').forEach((b) => {
    const lab = $('[data-ct-copy-l]', b);
    const orig = lab ? lab.textContent : '';
    if (lab) lab.setAttribute('aria-live', 'polite');
    b.addEventListener('click', async () => {
      const v = b.getAttribute('data-ct-copy');
      let ok = false;
      try { await navigator.clipboard.writeText(v); ok = true; } catch (e) {
        try { const t = document.createElement('textarea'); t.value = v; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.select(); ok = document.execCommand('copy'); t.remove(); } catch (e2) {}
      }
      if (!lab) return;
      lab.textContent = ok ? 'Copied' : v;
      b.classList.toggle('is-done', ok);
      clearTimeout(b._t);
      b._t = setTimeout(() => { lab.textContent = orig; b.classList.remove('is-done'); }, 2200);
    });
  });

  /* ── Custom cursor stays off over the two form cards (native cursor for typing) ── */
  addEventListener('pointerover', (e) => {
    const cur = $('.svx-cursor');
    const t = e.target instanceof Element ? e.target : null;
    if (!cur || !t || !t.closest('.ctx-card,.ctx-brief-card')) return;
    cur.classList.add('is-off');
    cur.classList.remove('is-link', 'is-label');
  }, { passive: true });
  /* ── Deep links (/contact#brief): the chips above change the layout after the browser's
     first anchor jump, so re-anchor once, unless the visitor has already scrolled. ── */
  const hashTarget = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (hashTarget) {
    let moved = false;
    const stop = () => { moved = true; };
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((t) => addEventListener(t, stop, { once: true, passive: true }));
    const snap = () => { if (!moved) hashTarget.scrollIntoView({ block: 'start' }); };
    requestAnimationFrame(snap);
    addEventListener('load', () => setTimeout(snap, 60), { once: true });
  }
})();
