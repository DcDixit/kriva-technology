/* KRIVA homepage motion: reveals, hero board, workflow, FAQ */
(function () {
  'use strict';
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const reduce = () => mqReduce.matches;

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('[data-r],[data-s]').forEach((el) => io.observe(el));

  /* ── hero board play ── */
  const board = document.getElementById('heroBoard');
  if (board) {
    const pick = document.getElementById('heroPickRow');
    const pickChip = document.getElementById('heroPickChip');
    const bulk = document.getElementById('heroBulk');
    const assign = document.getElementById('heroAssign');
    const riskRow = document.getElementById('heroRiskRow');
    const slaChip = document.getElementById('heroSlaChip');
    const riskN = document.getElementById('heroRisk');
    const exc = document.getElementById('heroExc');
    const excMove = document.getElementById('heroExcMove');
    const audit = document.getElementById('heroAudit');

    const finish = () => {
      board.classList.add('lit', 'played');
      if (pick) {
        pick.classList.add('is-on');
        const tick = pick.querySelector('.tick');
        if (tick) tick.classList.add('on');
      }
      if (pickChip) {
        pickChip.textContent = 'Assigned';
        pickChip.className = 'chip s1';
      }
      if (bulk) bulk.textContent = '1 selected';
      if (assign) assign.classList.add('shift-act--pri');
      if (riskRow) riskRow.classList.add('is-risk');
      if (slaChip) {
        slaChip.textContent = 'At risk';
        slaChip.className = 'chip s1';
      }
      if (riskN) riskN.textContent = '3';
      if (exc && excMove) exc.insertBefore(excMove, exc.firstElementChild);
      if (audit) audit.hidden = false;
    };

    const play = () => {
      if (reduce()) {
        finish();
        return;
      }
      const wait = (ms, fn) => setTimeout(fn, ms);
      board.classList.add('lit');
      wait(220, () => {
        if (pick) {
          pick.classList.add('is-on');
          const tick = pick.querySelector('.tick');
          if (tick) tick.classList.add('on');
        }
        if (bulk) bulk.textContent = '1 selected';
      });
      wait(520, () => {
        if (assign) assign.classList.add('shift-act--pri');
        if (pickChip) {
          pickChip.textContent = 'Assigned';
          pickChip.className = 'chip s1';
        }
      });
      wait(900, () => {
        if (riskRow) riskRow.classList.add('is-risk');
        if (slaChip) {
          slaChip.textContent = 'At risk';
          slaChip.className = 'chip s1';
        }
        if (riskN) riskN.textContent = '3';
      });
      wait(1220, () => {
        if (exc && excMove) exc.insertBefore(excMove, exc.firstElementChild);
        excMove?.classList.add('is-up');
      });
      wait(1500, () => {
        if (audit) audit.hidden = false;
        board.classList.add('played');
      });
    };

    const boardIO = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      boardIO.disconnect();
      play();
    }, { threshold: 0.28 });
    boardIO.observe(board);
  }

  /* ── problem tabs ── */
  const tabs = [...document.querySelectorAll('.prob-tabs [role="tab"]')];
  const panels = [...document.querySelectorAll('.prob-panel')];
  if (tabs.length) {
    const select = (btn) => {
      const id = btn.getAttribute('aria-controls');
      tabs.forEach((t) => {
        const on = t === btn;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach((p) => {
        const on = p.id === id;
        p.classList.toggle('on', on);
        p.hidden = !on;
      });
    };
    tabs.forEach((btn, i) => {
      btn.addEventListener('click', () => select(btn));
      btn.addEventListener('keydown', (e) => {
        const map = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
        if (!(e.key in map)) return;
        e.preventDefault();
        const next = tabs[(map[e.key] + tabs.length) % tabs.length];
        select(next);
        next.focus();
      });
    });
  }

  /* ── workflow one-time progression ── */
  const flow = document.getElementById('loadFlow');
  if (flow) {
    const steps = [...flow.children];
    const done = () => steps.forEach((s) => s.classList.add('on'));
    const flowIO = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      flowIO.disconnect();
      if (reduce()) {
        done();
        return;
      }
      steps.forEach((s, i) => {
        setTimeout(() => s.classList.add('on'), 80 + i * 70);
      });
    }, { threshold: 0.18 });
    flowIO.observe(flow);
  }

  /* ── FAQ accordion ── */
  const faqs = [...document.querySelectorAll('.faq-q')];
  faqs.forEach((btn) => {
    const item = btn.closest('.faq-item');
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      faqs.forEach((other) => {
        if (other === btn) return;
        other.setAttribute('aria-expanded', 'false');
        other.closest('.faq-item')?.classList.remove('open');
      });
      btn.setAttribute('aria-expanded', String(!open));
      item.classList.toggle('open', !open);
    });
    btn.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || btn.getAttribute('aria-expanded') !== 'true') return;
      btn.setAttribute('aria-expanded', 'false');
      item.classList.remove('open');
    });
  });

  /* ── horizontal scroll cue ── */
  document.querySelectorAll('.shift-scroll').forEach((scroller) => {
    const cue = scroller.querySelector('.scroll-cue');
    if (!cue) return;
    const check = () => {
      const overflow = scroller.scrollWidth > scroller.clientWidth + 8;
      cue.hidden = !overflow;
    };
    check();
    addEventListener('resize', check, { passive: true });
  });
})();
