/* KRIVA Services · "svx" layer · API integrations page motion (body.svx-api).
   Runs beside services-x.js, which already owns reveals, split headlines, cursor, spotlight,
   magnetic buttons, parallax, the FAQ, the rail, the progress bar and the [data-steps] line.
   No libraries. Every block is readable and usable without JS or with reduced motion. */
(function () {
  'use strict';
  const body = document.body;
  if (!body || !body.classList.contains('svx-api')) return;
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mqFine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = () => mqReduce.matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const onView = (el, fn, threshold = 0.3) => new IntersectionObserver(([e]) => fn(e.isIntersecting), { threshold }).observe(el);

  /* ── Hero: one event travels the path. Steps: queued, 429, retry, validated, written, matched ── */
  const live = $('[data-ai-live]');
  if (live) {
    const pipe = $('[data-ai-pipe]', live);
    const nodes = $$('li', pipe);
    const state = $('[data-ai-state]', live);
    const node = [0, 1, 1, 2, 3, 4];
    const labels = ['Received', 'Rate limited', 'Retrying', 'Validated', 'Written', 'Matched'];
    const set = (n) => {
      live.setAttribute('data-step', n);
      const at = node[n];
      pipe.style.setProperty('--n', at);
      nodes.forEach((li, i) => {
        li.classList.toggle('is-done', i < at || (n === 5 && i === 4));
        li.classList.toggle('is-now', i === at && n !== 5);
        li.classList.toggle('is-warn', i === at && (n === 1 || n === 2));
      });
      if (state) state.textContent = labels[n];
    };
    if (reduce()) set(5);
    else {
      let n = 0, t = 0;
      const wait = [1600, 1700, 1500, 1500, 1500, 3400];
      const loop = () => { set(n); t = setTimeout(() => { n = (n + 1) % 6; loop(); }, wait[n]); };
      set(0);
      onView(live, (on) => { clearTimeout(t); if (on) { n = 0; loop(); } }, 0.25);
    }
  }

  /* ── Structure: the step in the middle of the viewport drives the trace (wide);
        on narrow screens the trace sits above the list and steps through by itself ── */
  const flow = $('[data-ai-flow]');
  if (flow) {
    const steps = $$('.ai-step', flow);
    const panes = $('.ai-panes', flow);
    const rail = $('.ai-rail', flow);
    const name = $('[data-ai-stage-name]', flow);
    let cur = 0, pinned = 0, auto = 0;
    const show = (i) => {
      cur = i;
      steps.forEach((s, j) => {
        s.classList.toggle('is-on', j === i);
        s.classList.toggle('is-past', j < i);
        const b = $('.ai-step-btn', s);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      });
      if (panes) panes.setAttribute('data-on', i);
      if (rail) rail.setAttribute('data-on', i);
      if (name) name.textContent = $('.ai-step-btn', steps[i]).textContent;
    };
    steps.forEach((s, i) => {
      const b = $('.ai-step-btn', s);
      if (b) b.addEventListener('click', () => { pinned = Date.now(); show(i); });
    });
    const wide = matchMedia('(min-width: 1001px)');
    const sio = new IntersectionObserver((es) => {
      if (!wide.matches || Date.now() - pinned < 1200) return;
      es.forEach((e) => { if (e.isIntersecting) show(steps.indexOf(e.target)); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach((s) => sio.observe(s));
    if (!reduce()) {
      onView($('.ai-trace', flow), (on) => {
        clearInterval(auto);
        if (on && !wide.matches) auto = setInterval(() => { if (Date.now() - pinned > 6000) show((cur + 1) % steps.length); }, 3400);
      }, 0.4);
    }
  }

  /* ── Exceptions: the actions really resolve the demo card, with an audit trail ── */
  const exc = $('[data-ai-exc]');
  if (exc) {
    const card = $('.ai-exc-card', exc);
    const label = $('[data-exc-label] span', exc);
    const owner = $('[data-exc-owner]', exc);
    const audit = $('[data-exc-audit]', exc);
    const reset = $('[data-exc-reset]', exc);
    const acts = $$('.ai-act', exc);
    const first = audit.innerHTML;
    const plan = {
      retry: { label: 'Retried', lines: [['09:44', 'Retry · same key inv_pr882 · job created'], ['09:44', 'Closed by M. Okafor · audit A-2290', 'ok']] },
      match: { label: 'Matched', lines: [['09:44', 'Matched to job J-5512 by M. Okafor'], ['09:44', 'Closed · audit A-2291', 'ok']] },
      park: { label: 'Parked', lines: [['09:44', 'Parked by M. Okafor · reason: repo not in scope'], ['09:44', 'Audit A-2292 · review Friday', 'ok']] }
    };
    const add = ([time, text, cls]) => {
      const li = document.createElement('li');
      if (cls) li.className = cls;
      const tm = document.createElement('time'); tm.textContent = time;
      li.append(tm, document.createTextNode(text));
      audit.appendChild(li);
    };
    acts.forEach((b) => b.addEventListener('click', () => {
      const p = plan[b.dataset.act];
      card.setAttribute('data-state', b.dataset.act);
      label.textContent = p.label;
      owner.textContent = 'M. Okafor';
      acts.forEach((a) => { a.disabled = true; a.classList.toggle('is-chosen', a === b); });
      p.lines.forEach((l, i) => (reduce() ? add(l) : setTimeout(() => add(l), i * 450)));
      reset.hidden = false;
    }));
    reset.addEventListener('click', () => {
      card.setAttribute('data-state', 'open');
      label.textContent = 'Needs match';
      owner.textContent = 'Unassigned';
      audit.innerHTML = first;
      acts.forEach((a) => { a.disabled = false; a.classList.remove('is-chosen'); });
      reset.hidden = true;
      acts[1].focus();
    });
    /* hovering or focusing a point on the right lights that part of the card */
    $$('.ai-points li[data-for]').forEach((li) => {
      const part = li.getAttribute('data-for');
      const on = () => { card.classList.add('hl-' + part); li.classList.add('is-hl'); };
      const off = () => { card.classList.remove('hl-' + part); li.classList.remove('is-hl'); };
      li.addEventListener('pointerenter', on);
      li.addEventListener('pointerleave', off);
    });
  }

  /* ── Proof queue: worked top-down by close risk, then reopens ── */
  const q = $('[data-ai-queue]');
  if (q) {
    const rows = $$('.ai-q-list li', q);
    const chips = rows.map((r) => $('.ai-q-chip', r));
    const orig = chips.map((c) => c.textContent);
    const count = $('[data-q-count]', q);
    const bar = $('[data-q-bar]', q);
    const paint = (k) => {
      rows.forEach((r, i) => {
        r.classList.toggle('is-done', i < k);
        r.classList.toggle('is-now', i === k);
        chips[i].textContent = i < k ? r.dataset.done : orig[i];
      });
      const left = rows.length - Math.min(k, rows.length);
      if (count) count.textContent = left;
      q.setAttribute('data-left', left);
      if (bar) bar.style.setProperty('--qb', (0.25 + 0.75 * Math.min(k, rows.length) / rows.length).toFixed(3));
    };
    if (reduce()) paint(0);
    else {
      let k = 0, t = 0;
      const step = () => { paint(k); t = setTimeout(() => { k = (k + 1) % (rows.length + 1); step(); }, k === rows.length ? 3200 : 1700); };
      onView(q, (on) => { clearTimeout(t); if (on) { k = 0; step(); } else paint(0); }, 0.35);
    }
    if (mqFine.matches && !reduce()) {
      const wrap = q.parentElement;
      wrap.addEventListener('pointermove', (e) => {
        const r = wrap.getBoundingClientRect();
        q.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 6).toFixed(2) + 'deg');
        q.style.setProperty('--rx', (((e.clientY - r.top) / r.height - 0.5) * -5).toFixed(2) + 'deg');
      }, { passive: true });
      wrap.addEventListener('pointerleave', () => { q.style.setProperty('--ry', '0deg'); q.style.setProperty('--rx', '0deg'); });
    }
  }
})();
