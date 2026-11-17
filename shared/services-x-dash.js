/* KRIVA Services · "svx" layer · Dashboard design (body.svx-dash). Loaded after services-x.js,
   which owns reveals, the cursor, the rail, the FAQ, and the progress bar.
   This file runs the page's own pieces, all built on one dataset of six loads:
   - the hero board (Equal weight ↔ Late load first), a real toggle with a scan-line re-rank
   - the role tabs, which re-rank the same six loads for dispatch, fleet, billing, and accounts
   - the before/after slider (a native range input, so keys and touch work)
   - the live exception queue on the ShiftRail case
   Everything is readable without JS: all role panels show, and the board shows equal weight. */
(function () {
  'use strict';
  const body = document.body;
  if (!body || !body.classList.contains('svx-dash')) return;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const seen = (el, fn, threshold = 0.3) => new IntersectionObserver(([e]) => fn(e.isIntersecting), { threshold }).observe(el);

  /* ── Hero board: the same six loads, equal weight or ranked by risk ── */
  const board = $('[data-dbx-board]');
  if (board) {
    const btns = $$('.dbx-ctl-b', board);
    const rows = $$('.dbx-rows li', board);
    const status = $('[data-dbx-status]');
    const clock = $('[data-dbx-clock]', board);
    const msgs = {
      flat: 'Equal weight: four equal charts, loads listed by number.',
      rank: 'Late load first: 3 loads will miss their appointment. Late and at-risk loads move to the top, with an Assign action on the two unowned loads.'
    };
    let mode = 'flat', user = false, t = 0, held = false, inView = false;
    const set = (m, announce) => {
      if (announce && status) status.textContent = msgs[m];
      if (m === mode) return;
      mode = m;
      board.setAttribute('data-mode', m);
      btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.set === m)));
      rows.forEach((li) => {
        const r = +li.dataset[m];
        li.style.setProperty('--dl', (r * 0.045).toFixed(3) + 's');
        li.style.setProperty('--r', r);
      });
      if (!reduce()) {
        board.style.setProperty('--bh', board.offsetHeight + 'px');
        board.classList.remove('is-scan');
        void board.offsetWidth;
        board.classList.add('is-scan');
      }
    };
    btns.forEach((b, i) => {
      b.addEventListener('click', () => { user = true; clearTimeout(t); set(b.dataset.set, true); });
      b.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        const n = btns[(i + (e.key === 'ArrowRight' ? 1 : -1) + btns.length) % btns.length];
        n.focus(); n.click();
      });
    });
    if (reduce()) {
      set('rank', false);
      if (status) status.textContent = msgs.rank;
    } else {
      /* Plays once on arrival, then keeps alternating until someone uses the toggle. */
      const loop = (delay) => {
        clearTimeout(t);
        if (user || !inView) return;
        t = setTimeout(() => {
          if (user || !inView) return;
          if (!held) set(mode === 'flat' ? 'rank' : 'flat', false);
          loop(mode === 'rank' ? 6500 : 2800);
        }, delay);
      };
      board.addEventListener('pointerenter', () => { held = true; });
      board.addEventListener('pointerleave', () => { held = false; });
      board.addEventListener('focusin', () => { held = true; });
      board.addEventListener('focusout', () => { held = false; });
      seen(board, (v) => { inView = v; if (v) loop(mode === 'flat' ? 1700 : 6500); else clearTimeout(t); }, 0.35);
      /* The shift clock moves on while the board is on screen */
      if (clock) {
        let mins = 6 * 60 + 12;
        setInterval(() => {
          if (!inView || document.hidden) return;
          mins += 1;
          clock.textContent = String(Math.floor(mins / 60)).padStart(2, '0') + ':' + String(mins % 60).padStart(2, '0');
        }, 15000);
      }
    }
  }

  /* ── Roles: one dataset, four first questions ── */
  const ROLES = [
    { name: 'Dispatch', q: 'Which loads will miss their appointment?', n: '3', l: 'at risk in the next 30 minutes', s: 'Sorted by time left', col: 'Time left', a: 'Reassign or resolve without leaving the view', btn: 'Assign', tone: 'risk',
      cells: [['2h 10m', 'ok'], ['11m', 'watch'], ['1h 25m', 'ok'], ['6m', 'risk'], ['−18m', 'risk'], ['3h 05m', 'ok']],
      own: ['JK', 'MR', 'AL', '', '', 'SP'], rank: [4, 2, 3, 1, 0, 5] },
    { name: 'Fleet and ops', q: 'Is the fleet on plan today?', n: '91%', l: 'on time, with 4 exceptions open', s: 'One signal and a short trend, then the records', col: 'Truck', a: 'Drill down keeps the filters you set', btn: 'Open 4', tone: 'calm',
      cells: [['T-208 · on plan', 'ok'], ['T-114 · 40 min of hours left', 'watch'], ['T-131 · on plan', 'ok'], ['T-122 · engine fault', 'risk'], ['T-097 · detention 2h', 'risk'], ['T-150 · service due', 'watch']],
      own: ['JK', 'MR', 'AL', 'DV', 'DV', 'SP'], rank: [4, 2, 5, 0, 1, 3] },
    { name: 'Billing and finance', q: 'Which delivered loads can’t be invoiced yet, and why?', n: '4', l: 'invoices blocked', s: 'QuickBooks sync · last run 06:05', col: 'Blocks invoice', a: 'Every row links back to the source record', btn: 'Request POD', tone: 'risk',
      cells: [['Missing POD', 'risk'], ['In transit', 'ok'], ['Accessorial not approved', 'watch'], ['In transit', 'ok'], ['Rate mismatch', 'watch'], ['Missing POD', 'risk']],
      own: ['RB', 'RB', 'KT', 'RB', 'KT', 'KT'], rank: [0, 4, 2, 5, 3, 1] },
    { name: 'Accounts and sales', q: 'Which accounts have stalled work?', n: '2', l: 'accounts stalled this week', s: 'A next action on every row', col: 'Account', a: 'Next-action prompt, not a passive list', btn: 'Follow up', tone: 'risk',
      cells: [['Acme Foods · renewal due', 'watch'], ['Harbor Retail · quote stalled 9d', 'risk'], ['Northline · proposal sent', 'ok'], ['Peak Supply · no reply 6d', 'risk'], ['Cobalt Mfg · on track', 'ok'], ['Lakeside Co · on track', 'ok']],
      own: ['NP', 'NP', 'LS', '', 'LS', 'NP'], rank: [2, 0, 3, 1, 4, 5] }
  ];
  const roles = $('[data-dbx-roles]');
  if (roles) {
    const tabs = $$('[role="tab"]', roles);
    const pans = $$('[role="tabpanel"]', roles);
    const ind = $('.dbx-tab-ind', roles);
    const stage = $('.dbx-stage', roles);
    const sRows = $$('.dbx-stage-rows li', stage);
    const f = (k) => $('[data-st-' + k + ']', stage);
    const DUR = 5200;
    let cur = 0, user = false, held = false, inView = false, t = 0, sw = 0;

    const paint = (r) => {
      f('name').textContent = r.name; f('q').textContent = r.q; f('n').textContent = r.n; f('l').textContent = r.l;
      f('s').textContent = r.s; f('col').textContent = r.col; f('a').textContent = r.a; f('btn').textContent = r.btn;
      stage.setAttribute('data-tone', r.tone);
      sRows.forEach((li, i) => {
        $('.c b', li).textContent = r.cells[i][0];
        li.className = 's-' + r.cells[i][1];
        const ow = $('.ow', li);
        ow.textContent = r.own[i] || '—';
        ow.classList.toggle('none', !r.own[i]);
      });
    };
    const rank = (r) => sRows.forEach((li, i) => { li.style.setProperty('--dl', (r.rank[i] * 0.045).toFixed(3) + 's'); li.style.setProperty('--r', r.rank[i]); });
    const runInd = () => {
      if (!ind) return;
      ind.classList.remove('is-run');
      ind.style.setProperty('--tp', user ? '1' : '0');
      if (user || reduce() || !inView) { ind.style.setProperty('--tp', '1'); return; }
      void ind.offsetWidth;
      ind.style.setProperty('--dur', DUR + 'ms');
      ind.classList.add('is-run');
      ind.style.setProperty('--tp', '1');
    };
    const select = (i, focus) => {
      cur = i;
      const r = ROLES[i];
      tabs.forEach((tb, j) => { tb.setAttribute('aria-selected', String(j === i)); tb.tabIndex = j === i ? 0 : -1; });
      pans.forEach((p, j) => { p.hidden = j !== i; p.classList.toggle('is-enter', j === i); });
      if (focus) tabs[i].focus();
      if (ind) ind.style.setProperty('--t', i);
      stage.setAttribute('data-role', i);
      rank(r);
      clearTimeout(sw);
      if (reduce()) paint(r);
      else { stage.classList.add('is-swap'); sw = setTimeout(() => { paint(r); stage.classList.remove('is-swap'); }, 240); }
      schedule();
    };
    const schedule = () => {
      clearTimeout(t);
      runInd();
      if (user || reduce() || !inView) return;
      t = setTimeout(() => { if (held) { schedule(); return; } select((cur + 1) % ROLES.length, false); }, DUR);
    };
    tabs.forEach((tb, i) => {
      tb.addEventListener('click', () => { user = true; if (i !== cur) select(i, false); else schedule(); });
      tb.addEventListener('keydown', (e) => {
        const k = e.key;
        let n = -1;
        if (k === 'ArrowRight' || k === 'ArrowDown') n = (i + 1) % tabs.length;
        else if (k === 'ArrowLeft' || k === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
        else if (k === 'Home') n = 0;
        else if (k === 'End') n = tabs.length - 1;
        if (n < 0) return;
        e.preventDefault(); user = true; select(n, true);
      });
    });
    roles.addEventListener('pointerenter', () => { held = true; });
    roles.addEventListener('pointerleave', () => { held = false; });
    /* JS takes over: one panel at a time (without JS, all four read in order). */
    pans.forEach((p, j) => { p.hidden = j !== 0; });
    paint(ROLES[0]); rank(ROLES[0]);
    seen(stage, (v) => { inView = v; if (v) schedule(); else { clearTimeout(t); runInd(); } }, 0.4);
  }

  /* ── Before / after slider ── */
  const cmp = $('[data-dbx-cmp]');
  if (cmp) {
    const range = $('.dbx-cmp-range', cmp);
    let touched = false, timers = [];
    const setCut = (v) => { cmp.style.setProperty('--cut', v + '%'); range.value = v; };
    const stop = () => { touched = true; timers.forEach(clearTimeout); cmp.classList.remove('is-sweep'); };
    range.addEventListener('input', () => { if (!touched) stop(); cmp.style.setProperty('--cut', range.value + '%'); });
    range.addEventListener('pointerdown', () => { if (!touched) stop(); });
    range.addEventListener('keydown', () => { if (!touched) stop(); });
    if (!reduce()) {
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting || touched) return;
        io.disconnect();
        cmp.classList.add('is-sweep');
        [[300, 82], [1700, 22], [3100, 50], [4300, null]].forEach(([ms, v]) => timers.push(setTimeout(() => {
          if (touched) return;
          if (v === null) cmp.classList.remove('is-sweep'); else setCut(v);
        }, ms)));
      }, { threshold: 0.55 });
      io.observe(cmp);
    }
  }

  /* ── ShiftRail queue: SLA bars drain while the queue is on screen ── */
  const q = $('[data-dbx-q]');
  if (q && !reduce()) {
    const items = $$('.dbx-q-list li', q).map((li) => ({ li, start: parseFloat(getComputedStyle(li).getPropertyValue('--sla')) || 0 }));
    let tick = 0, k = 0;
    seen(q, (v) => {
      clearInterval(tick);
      if (!v) return;
      tick = setInterval(() => {
        k = (k + 1) % 16;
        items.forEach(({ li, start }) => {
          if (!start) return;
          li.style.setProperty('--sla', Math.max(0.02, start - k * 0.012).toFixed(3));
        });
      }, 1000);
    }, 0.3);
    if (fine.matches) {
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
