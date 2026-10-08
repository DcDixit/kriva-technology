/* KRIVA homepage motion: reveals, hero board, audiences, workflow, decide, FAQ, form steps */
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
  document.querySelectorAll('[data-r],[data-s],[data-mask]').forEach((el) => {
    if (el.hasAttribute('data-mask')) el.classList.add('mask');
    io.observe(el);
  });
  if (reduce()) document.querySelectorAll('[data-r],[data-s],[data-mask]').forEach((el) => el.classList.add('in'));

  /* ── hero board ── */
  const board = document.getElementById('heroBoard');
  if (board) {
    const rows = [...board.querySelectorAll('[data-load]')];
    const sub = board.querySelector('[data-unowned]');
    const hint = board.querySelector('[data-board-hint]');
    const assignBtn = board.querySelector('[data-assign]');
    const resetBtn = board.querySelector('[data-reset]');
    const toast = board.querySelector('[data-toast]');
    let toastTimer;

    const assigned = new Set();

    const unownedCount = () =>
      rows.filter((r) => {
        const id = r.getAttribute('data-load');
        return !assigned.has(id) && r.getAttribute('data-owned') !== '1';
      }).length;

    const selected = () => rows.filter((r) => r.querySelector('input')?.checked);

    const paint = () => {
      const n = unownedCount();
      if (sub) {
        sub.textContent = n
          ? n + (n === 1 ? ' load has' : ' loads have') + ' no owner'
          : 'Every load has an owner';
        sub.classList.toggle('is-risk', n > 0);
        sub.classList.toggle('is-ok', n === 0);
      }
      rows.forEach((r) => {
        const id = r.getAttribute('data-load');
        const box = r.querySelector('input');
        const owner = r.querySelector('[data-owner]');
        r.classList.toggle('is-sel', !!(box && box.checked));
        if (assigned.has(id) && owner) {
          owner.textContent = 'R. Diaz';
          owner.style.color = '#3730A3';
        }
      });
      const sel = selected();
      if (assignBtn) {
        assignBtn.hidden = sel.length === 0;
        assignBtn.textContent = 'Assign ' + sel.length + ' → R. Diaz';
      }
      if (hint) hint.hidden = sel.length > 0 || assigned.size > 0;
      if (resetBtn) resetBtn.hidden = assigned.size === 0 || sel.length > 0;
    };

    rows.forEach((r) => {
      const box = r.querySelector('input');
      if (!box) return;
      box.addEventListener('change', paint);
    });
    if (assignBtn) {
      assignBtn.addEventListener('click', () => {
        const sel = selected();
        sel.forEach((r) => {
          assigned.add(r.getAttribute('data-load'));
          r.querySelector('input').checked = false;
        });
        if (toast) {
          toast.hidden = false;
          toast.textContent =
            'Assigned ' + sel.length + (sel.length === 1 ? ' load' : ' loads') + ' to R. Diaz · audited';
          clearTimeout(toastTimer);
          toastTimer = setTimeout(() => { toast.hidden = true; }, 3800);
        }
        paint();
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        assigned.clear();
        rows.forEach((r) => {
          const owner = r.querySelector('[data-owner]');
          const box = r.querySelector('input');
          if (box) box.checked = false;
          if (owner) {
            owner.textContent = r.getAttribute('data-owned') === '1' ? r.getAttribute('data-owner-name') : 'Unassigned';
            owner.style.color = r.getAttribute('data-owned') === '1' ? '#3B3E45' : '#8A3B0B';
          }
        });
        if (toast) toast.hidden = true;
        paint();
      });
    }
    paint();
  }

  /* ── audience tabs ── */
  const audTabs = [...document.querySelectorAll('.hp-atabs [role="tab"]')];
  const audPanels = [...document.querySelectorAll('.hp-aud-panel')];
  if (audTabs.length) {
    const selectAud = (btn, { focus = false } = {}) => {
      audTabs.forEach((t) => {
        const on = t === btn;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      audPanels.forEach((p) => {
        p.hidden = p.id !== btn.getAttribute('aria-controls');
      });
      if (focus) btn.focus();
    };
    audTabs.forEach((btn, i) => {
      btn.addEventListener('click', () => selectAud(btn));
      btn.addEventListener('keydown', (e) => {
        const map = { ArrowRight: i + 1, ArrowLeft: i - 1, ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: audTabs.length - 1 };
        if (!(e.key in map)) return;
        e.preventDefault();
        const next = audTabs[(map[e.key] + audTabs.length) % audTabs.length];
        selectAud(next, { focus: true });
      });
    });
  }

  /* ── workflow load console ── */
  const path = document.getElementById('wfPath');
  if (path) {
    const tabs = [...path.querySelectorAll('[role="tab"]')];
    const panels = [...document.querySelectorAll('#wfStage .hp-wf-panel')];
    const sub = document.getElementById('wfSub');
    const live = document.getElementById('wfLive');
    const count = document.getElementById('wfCount');
    const meter = document.getElementById('wfMeter');
    const playBtn = document.getElementById('wfPlay');
    let userTouched = false;
    let playing = !reduce();
    let playTimer;
    let primed = false;
    let playIndex = 0;

    const scrollTab = (btn) => {
      const max = path.scrollWidth - path.clientWidth;
      if (max <= 0) return;
      const left = btn.offsetLeft - (path.clientWidth - btn.offsetWidth) / 2;
      path.scrollTo({
        left: Math.max(0, Math.min(left, max)),
        behavior: reduce() ? 'auto' : 'smooth',
      });
    };

    const setPlayUi = () => {
      if (!playBtn) return;
      playBtn.setAttribute('aria-pressed', String(!playing));
      playBtn.setAttribute('aria-label', playing ? 'Pause walkthrough' : 'Play walkthrough');
      const label = playBtn.querySelector('[data-play-label]');
      const icon = playBtn.querySelector('[data-play-icon]');
      if (label) label.textContent = playing ? 'Pause' : 'Play';
      if (icon) {
        icon.innerHTML = playing
          ? '<rect x="2" y="1.5" width="2.6" height="9" rx=".6"></rect><rect x="7.4" y="1.5" width="2.6" height="9" rx=".6"></rect>'
          : '<path d="M3 1.5l7 4.5-7 4.5z"></path>';
      }
    };

    const select = (btn, { focus = false, fromUser = false } = {}) => {
      const id = btn.getAttribute('aria-controls');
      const idx = tabs.indexOf(btn);
      tabs.forEach((t) => {
        const on = t === btn;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach((p) => {
        p.hidden = p.id !== id;
      });
      if (sub) sub.textContent = btn.dataset.sub || '';
      if (live) {
        live.textContent = btn.dataset.live || '';
        live.parentElement.classList.remove('is-risk', 'is-ok', 'is-neutral');
        if (btn.dataset.tone) live.parentElement.classList.add('is-' + btn.dataset.tone);
      }
      if (count) count.textContent = btn.dataset.n || '';
      if (meter) {
        meter.style.setProperty('--p', btn.dataset.p || '.125');
        meter.style.setProperty('--tone', btn.dataset.color || '#F5A524');
      }
      if (focus) btn.focus();
      if (primed) scrollTab(btn);
      primed = true;
      playIndex = idx;
      if (fromUser) {
        userTouched = true;
        playing = false;
        clearTimeout(playTimer);
        playTimer = null;
        setPlayUi();
      }
    };

    tabs.forEach((btn, i) => {
      btn.addEventListener('click', () => select(btn, { fromUser: true }));
      btn.addEventListener('keydown', (e) => {
        const map = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
        if (!(e.key in map)) return;
        e.preventDefault();
        const next = tabs[(map[e.key] + tabs.length) % tabs.length];
        select(next, { focus: true, fromUser: true });
      });
    });
    select(tabs[0]);
    setPlayUi();

    const tick = () => {
      playTimer = null;
      if (!playing || playIndex >= tabs.length - 1) return;
      playIndex += 1;
      select(tabs[playIndex]);
      playTimer = setTimeout(tick, 3400);
    };

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        playing = !playing;
        userTouched = !playing;
        setPlayUi();
        clearTimeout(playTimer);
        playTimer = null;
        if (playing && playIndex < tabs.length - 1) {
          playTimer = setTimeout(tick, 800);
        }
      });
    }

    const consoleEl = document.getElementById('loadFlow');
    if (consoleEl && !reduce()) {
      const playIO = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) {
          clearTimeout(playTimer);
          playTimer = null;
          return;
        }
        if (!playing || playTimer || playIndex >= tabs.length - 1) return;
        playTimer = setTimeout(tick, 2200);
      }, { threshold: 0.28 });
      playIO.observe(consoleEl);
    }
  }

  /* ── decide checker ── */
  const decide = document.getElementById('decide');
  if (decide) {
    const boxes = [...decide.querySelectorAll('input[type="checkbox"][data-kind]')];
    const verdict = decide.querySelector('[data-verdict]');
    const kEl = verdict?.querySelector('[data-vk]');
    const hEl = verdict?.querySelector('[data-vh]');
    const pEl = verdict?.querySelector('[data-vp]');
    const copy = {
      none: {
        k: 'Your read',
        h: 'Tick what’s true for your team.',
        p: 'Eight honest signals — the same check we run on a fit call.',
        tone: '',
      },
      build: {
        k: 'Leaning · build or customize',
        h: 'Your workflow is probably the advantage.',
        p: 'Workarounds are likely costing more than a focused build would.',
        tone: 'build',
      },
      keep: {
        k: 'Leaning · keep and extend',
        h: 'Your current system likely fits.',
        p: 'Extend what you have. A fit call can still find the one integration or screen worth fixing.',
        tone: 'keep',
      },
      mix: {
        k: 'Mixed signals',
        h: 'Worth a 20-minute conversation.',
        p: 'Some of the system works, some of the desk works around it. That’s exactly what a fit call untangles.',
        tone: 'mix',
      },
    };
    const paint = () => {
      let kc = 0;
      let bc = 0;
      boxes.forEach((b) => {
        b.closest('.hp-chk')?.classList.toggle('is-on', b.checked);
        if (!b.checked) return;
        if (b.dataset.kind === 'keep') kc += 1;
        else bc += 1;
      });
      let key = 'none';
      if (kc + bc === 0) key = 'none';
      else if (bc >= 2 && bc > kc) key = 'build';
      else if (kc >= 2 && bc === 0) key = 'keep';
      else key = 'mix';
      const v = copy[key];
      if (key === 'build') v.p = 'With ' + bc + ' of 4 build signals, workarounds are likely costing more than a focused build would.';
      if (verdict) verdict.setAttribute('data-tone', v.tone);
      if (kEl) kEl.textContent = v.k;
      if (hEl) hEl.textContent = v.h;
      if (pEl) pEl.textContent = v.p;
    };
    boxes.forEach((b) => b.addEventListener('change', paint));
    paint();
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

  /* ── inquiry steps ── */
  const form = document.getElementById('pageInquiry');
  if (form) {
    const step1 = form.querySelector('[data-inq-step="1"]');
    const step2 = form.querySelector('[data-inq-step="2"]');
    const bar = form.querySelector('[data-step-label]');
    const pips = [...form.querySelectorAll('[data-step-pips] i')];
    const topicsInput = form.querySelector('[name="topics"]');
    const about = form.querySelector('[data-topics-echo]');
    const pills = [...form.querySelectorAll('.hp-pill')];

    const syncTopics = () => {
      const on = pills.filter((p) => p.getAttribute('aria-pressed') === 'true').map((p) => p.textContent.trim());
      if (topicsInput) topicsInput.value = on.join(', ');
      if (about) {
        about.hidden = on.length === 0;
        const b = about.querySelector('b');
        if (b) b.textContent = on.join(', ');
      }
    };

    pills.forEach((p) => {
      p.addEventListener('click', () => {
        const on = p.getAttribute('aria-pressed') === 'true';
        p.setAttribute('aria-pressed', String(!on));
        syncTopics();
      });
    });

    const showStep = (n) => {
      if (step1) step1.hidden = n !== 1;
      if (step2) step2.hidden = n !== 2;
      if (bar) bar.textContent = 'Step ' + n + ' of 2';
      pips.forEach((el, i) => el.classList.toggle('on', i < n));
      if (n === 2) {
        syncTopics();
        const name = document.getElementById('inq-name');
        if (name) setTimeout(() => name.focus(), 30);
      }
    };

    form.querySelectorAll('[data-go-step]').forEach((btn) => {
      btn.addEventListener('click', () => showStep(Number(btn.getAttribute('data-go-step'))));
    });

    form.addEventListener('submit', (e) => {
      if (step2 && step2.hidden) {
        e.preventDefault();
        e.stopImmediatePropagation();
        showStep(2);
      }
    }, true);
  }

  /* ── mobile sticky inquiry ── */
  const heroEl = document.querySelector('.hp-hero');
  const inquireEl = document.getElementById('inquire');
  const bar = document.getElementById('hpInqBar');
  if (heroEl && inquireEl && bar) {
    const mobile = () => matchMedia('(max-width:720px)').matches;
    const setVisible = (on) => {
      bar.hidden = !on;
      bar.classList.toggle('on', on);
      bar.setAttribute('aria-hidden', String(!on));
      bar.querySelectorAll('a').forEach((a) => { a.tabIndex = on ? 0 : -1; });
      document.body.classList.toggle('hp-inq-open', on);
    };
    const syncBar = () => {
      if (!mobile() || reduce()) {
        setVisible(false);
        return;
      }
      const heroOut = heroEl.getBoundingClientRect().bottom < 72;
      const formNear = inquireEl.getBoundingClientRect().top < window.innerHeight * 0.72;
      setVisible(heroOut && !formNear);
    };
    addEventListener('scroll', syncBar, { passive: true });
    addEventListener('resize', syncBar, { passive: true });
    syncBar();
  }
})();
