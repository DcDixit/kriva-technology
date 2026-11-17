/* KRIVA Solutions · SaaS product development (body.sx-saas), on top of solutions-x.js.
   Hero activation object, journey meters, product switcher, stage chooser, before/after, finance flow.
   The HTML ships in its final state, so the page reads fully without JS or with reduced motion. */
(function () {
  'use strict';
  const body = document.body;
  if (!body || !body.classList.contains('sx-saas')) return;
  const root = document.documentElement;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const seen = (el, fn, threshold = 0.3) => new IntersectionObserver(([e]) => fn(e.isIntersecting), { threshold }).observe(el);

  /* ── Hero: a new workspace walks from signup to the activation event ── */
  const act = $('[data-sas-act]');
  if (act) {
    const steps = $$('.sas-act-steps li', act);
    const setupT = $('[data-sas-setup]', act);
    const setupB = $('[data-sas-setup-bar]', act);
    const valueT = $('[data-sas-value]', act);
    const valueB = $('[data-sas-value-bar]', act);
    const ev = $('[data-sas-ev]', act);
    const setupPct = [25, 50, 75, 100, 100];
    let timers = [], live = false;
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const state = (n) => { // n = number of completed steps (0..5)
      steps.forEach((li, i) => { li.classList.toggle('is-done', i < n); li.classList.toggle('is-now', i === n); });
      const s = n ? setupPct[n - 1] : 0;
      setupT.textContent = s + '%';
      setupB.style.setProperty('--v', s / 100);
      const v = n >= 5;
      act.classList.toggle('is-pending', !v);
      valueT.textContent = v ? 'Reached' : 'Not yet';
      valueB.style.setProperty('--v', v ? 1 : 0);
      ev.textContent = n ? steps[n - 1].getAttribute('data-ev') : 'waiting…';
    };
    const run = () => {
      timers.forEach(clearTimeout); timers = [];
      state(0);
      for (let n = 1; n <= 5; n++) later(() => state(n), 700 + n * (n === 5 ? 1500 : 1050));
      later(run, 700 + 5 * 1500 + 4200);
    };
    if (!reduce()) {
      state(0);
      seen(act, (on) => {
        if (on && !live) { live = true; run(); }
        else if (!on && live) { live = false; timers.forEach(clearTimeout); timers = []; state(5); }
      }, 0.35);
      const hero = $('.sas-hero');
      if (hero && fine) {
        hero.addEventListener('pointermove', (e) => {
          const b = act.getBoundingClientRect();
          const r = hero.getBoundingClientRect();
          act.style.setProperty('--ry', (clamp((e.clientX - (b.left + b.width / 2)) / (r.width / 2), -1, 1) * 5).toFixed(2) + 'deg');
          act.style.setProperty('--rx', (clamp((e.clientY - (b.top + b.height / 2)) / (r.height / 2), -1, 1) * -4).toFixed(2) + 'deg');
        }, { passive: true });
        hero.addEventListener('pointerleave', () => { act.style.setProperty('--rx', '0deg'); act.style.setProperty('--ry', '0deg'); });
      }
    }
  }

  /* ── Journey: setup meter fills by stage 04, the used meter only moves at 05 ── */
  const jr = $('[data-sas-journey]');
  const jItems = jr ? $$('.sas-j-list li', jr) : [];
  const jCard = jr ? $('.sas-j-card', jr) : null;
  const flags = [
    'Account created. Setup has started; nothing has been used yet.',
    'The workspace exists. Still no real work in it.',
    'Safe defaults let work start. Value has not happened yet.',
    'The setup checklist is complete. The product still has not been used.',
    'Activation event: the first real outcome, the moment value happens.',
    'The checklist went green at stage 04. Value arrived at stage 05.'
  ];
  const usedLabel = (u) => (u >= 100 ? 'Daily use' : u > 0 ? 'First value' : 'Not yet');
  let jNow = -1;
  const setJ = (i) => {
    if (!jCard || i === jNow) return;
    jNow = i;
    const li = jItems[i];
    const s = +li.getAttribute('data-setup');
    const u = +li.getAttribute('data-used');
    jItems.forEach((x, j) => x.classList.toggle('is-on', j === i));
    $('[data-j-now]', jCard).textContent = String(i + 1).padStart(2, '0');
    $('[data-j-name]', jCard).textContent = $('h3', li).textContent;
    $('[data-j-setup]', jCard).textContent = s >= 100 ? 'Complete' : s + '%';
    $('[data-j-setup-bar]', jCard).style.setProperty('--v', s / 100);
    $('[data-j-used]', jCard).textContent = usedLabel(u);
    $('[data-j-used-bar]', jCard).style.setProperty('--v', u / 100);
    $('[data-j-flag]', jCard).textContent = flags[i];
    jCard.classList.toggle('is-unused', u === 0);
  };
  const jOK = () => !!jr && !reduce() && innerWidth > 1000 && innerHeight >= 680;
  const setJx = () => {
    const on = jOK();
    root.classList.toggle('sas-jx', on);
    if (!on && jItems.length) { jNow = -1; setJ(jItems.length - 1); jItems.forEach((x) => x.classList.remove('is-on')); }
  };

  /* ── Parallax photos ── */
  const pars = $$('[data-sas-par] img');

  let ticking = false;
  const frame = () => {
    ticking = false;
    const vh = innerHeight;
    if (root.classList.contains('sas-jx')) {
      let best = 0;
      jItems.forEach((li, i) => { if (li.getBoundingClientRect().top < vh * 0.55) best = i; });
      setJ(best);
    }
    if (!reduce() && innerWidth > 760) {
      pars.forEach((img) => {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) img.style.setProperty('--py', ((r.top + r.height / 2 - vh / 2) * -0.08).toFixed(1) + 'px');
      });
    }
  };
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  setJx();
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', () => { setJx(); request(); }, { passive: true });
  frame();

  /* ── Product surfaces: tabs, demo micro-animations, gentle auto-advance ── */
  const sw = $('[data-sas-sw]');
  const tabs = $$('.sas-tabs [role="tab"]');
  const panels = {
    'tab-mvp': ['panel-mvp', 'view-mvp'],
    'tab-onboarding': ['panel-onboarding', 'view-onboarding'],
    'tab-roles': ['panel-roles', 'view-roles'],
    'tab-home': ['panel-home', 'view-home']
  };
  let homePlayed = false, onboardPlayed = false, rolesPlayed = false;
  function playOnboarding() {
    if (reduce() || onboardPlayed) return;
    onboardPlayed = true;
    const go = document.getElementById('obConnectGo');
    const row = document.querySelector('[data-connect-row]');
    if (!go || !row) return;
    setTimeout(() => {
      go.textContent = 'Imported';
      row.classList.remove('now');
      row.classList.add('done');
      const small = row.querySelector('small');
      if (small) small.textContent = 'Done';
    }, 700);
  }
  function playRoles() {
    if (reduce() || rolesPlayed) return;
    rolesPlayed = true;
    const rows = [...document.querySelectorAll('#viewRolesFrame .sas-role')];
    if (rows.length < 3) return;
    rows.forEach((r) => r.classList.remove('on'));
    rows[2].classList.add('on');
    setTimeout(() => { rows[2].classList.remove('on'); rows[1].classList.add('on'); }, 700);
  }
  function playHome() {
    if (homePlayed) return;
    homePlayed = true;
    const bank = document.getElementById('exBank');
    const blocked = document.getElementById('homeBlocked');
    const status = document.getElementById('homeStatus');
    const finish = () => {
      if (bank) { bank.classList.remove('hot'); bank.classList.add('ok'); bank.querySelector('span').textContent = 'Bank verified · pay run unblocked'; bank.querySelector('small').textContent = 'Ok'; }
      if (blocked) { blocked.classList.remove('warn'); blocked.querySelector('b').textContent = '0'; blocked.querySelector('em').textContent = 'Pay run · ready'; }
      if (status) status.textContent = 'Next: NI numbers';
    };
    if (reduce()) { finish(); return; }
    setTimeout(finish, 900);
  }
  function selectSurface(id) {
    tabs.forEach((t) => {
      const on = t.id === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    Object.entries(panels).forEach(([key, ids]) => {
      const show = key === id;
      ids.forEach((pid) => { const el = document.getElementById(pid); if (el) el.hidden = !show; });
    });
    if (id === 'tab-onboarding') playOnboarding();
    if (id === 'tab-roles') playRoles();
    if (id === 'tab-home') playHome();
  }
  const cycle = 6500;
  let auto = 0, stopped = false, inView = false;
  const stopAuto = () => { clearInterval(auto); auto = 0; if (sw) sw.classList.remove('is-auto'); };
  const restartBar = () => { if (!sw) return; sw.classList.remove('is-auto'); void sw.offsetWidth; sw.classList.add('is-auto'); };
  const startAuto = () => {
    stopAuto();
    // wide screens only: on narrow layouts the panel sits above the frame, so swapping it would shift the page
    if (!sw || stopped || !inView || reduce() || innerWidth <= 1000) return;
    sw.style.setProperty('--sas-cycle', cycle + 'ms');
    restartBar();
    auto = setInterval(() => {
      const i = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
      selectSurface(tabs[(i + 1) % tabs.length].id);
      restartBar();
    }, cycle);
  };
  const userTook = () => { stopped = true; stopAuto(); };
  tabs.forEach((btn, i) => {
    btn.tabIndex = i === 0 ? 0 : -1;
    btn.addEventListener('click', () => { userTook(); selectSurface(btn.id); });
    btn.addEventListener('keydown', (e) => {
      let next = i;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = i + 1;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = i - 1;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      else return;
      e.preventDefault();
      userTook();
      next = (next + tabs.length) % tabs.length;
      tabs[next].focus();
      selectSurface(tabs[next].id);
    });
  });
  if (sw) {
    sw.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') stopAuto(); });
    sw.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') startAuto(); });
    sw.addEventListener('focusin', userTook);
    seen(sw, (on) => { inView = on; on ? startAuto() : stopAuto(); }, 0.4);
  }

  /* ── Launch / Improve / Scale: the track follows the stage; a stage can seed the inquiry ── */
  const stage = $('[data-sas-stage]');
  if (stage) {
    const paths = $$('.sas-path', stage);
    let sel = -1;
    const point = (i) => stage.style.setProperty('--k', ((i + 0.5) / paths.length).toFixed(4));
    paths.forEach((p, i) => {
      p.addEventListener('pointerenter', () => point(i));
      p.addEventListener('focusin', () => point(i));
      const b = $('.sas-pick', p);
      if (!b) return;
      b.hidden = false;
      b.addEventListener('click', () => {
        sel = i;
        paths.forEach((o, j) => {
          o.classList.toggle('is-sel', j === i);
          const ob = $('.sas-pick', o);
          if (ob) ob.setAttribute('aria-pressed', String(j === i));
        });
        point(i);
        const ta = $('#inq-details');
        if (ta) {
          const prefix = 'Stage:';
          const rest = ta.value.split('\n').filter((l) => l.indexOf(prefix) !== 0).join('\n').trim();
          ta.value = prefix + ' ' + p.getAttribute('data-stage') + ' (' + p.getAttribute('data-brief') + ').\n' + rest;
          ta.dispatchEvent(new Event('input', { bubbles: true }));
        }
        const target = $('#inquire');
        if (target) target.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'start' });
        if (ta) setTimeout(() => { ta.focus({ preventScroll: true }); ta.setSelectionRange(ta.value.length, ta.value.length); }, reduce() ? 0 : 800);
      });
    });
    stage.addEventListener('pointerleave', () => point(sel < 0 ? 1 : sel));
    point(1);
  }

  /* ── Proof: before / after toggle; plays once when it first comes into view ── */
  const ba = $('[data-sas-ba]');
  if (ba) {
    const tg = $('.sas-ba-toggle', ba);
    const btns = $$('button', tg);
    const show = (v) => {
      ba.setAttribute('data-show', v);
      btns.forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute('data-ba') === v)));
    };
    tg.hidden = false;
    ba.classList.add('is-js');
    show('after');
    let touched = false, played = false;
    btns.forEach((b) => b.addEventListener('click', () => { touched = true; show(b.getAttribute('data-ba')); }));
    if (!reduce()) {
      seen(ba, (on) => {
        if (!on || played || touched) return;
        played = true;
        show('before');
        setTimeout(() => { if (!touched) show('after'); }, 1800);
      }, 0.5);
    }
  }

  /* ── Finance: one subscription event walks to the ledger, then to the exception queue ── */
  const flow = $('[data-sas-flow]');
  if (flow) {
    const items = $$('li', flow);
    if (reduce()) items.forEach((li) => li.classList.add('is-on'));
    else {
      let t = 0, i = -1;
      const walk = () => {
        i = (i + 1) % (items.length + 2);
        items.forEach((li, j) => li.classList.toggle('is-on', j <= i));
        t = setTimeout(walk, i >= items.length - 1 ? 1400 : 850);
      };
      seen(flow, (on) => { clearTimeout(t); if (on) { i = -1; walk(); } else items.forEach((li) => li.classList.add('is-on')); }, 0.4);
    }
  }
})();
