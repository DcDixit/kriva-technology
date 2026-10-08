/* KRIVA tawk.to — delay the embed until chat is opened.
 Dashboard: https://dashboard.tawk.to/
 Embed URL shape: https://embed.tawk.to/{PROPERTY_ID}/{WIDGET_ID}

 The visible launcher matches the live Tawk bubble + attention grabber.
 Heavy embed.tawk.to / va.tawk.to scripts load only when the visitor opens chat. */
(function () {
  'use strict';
  if (window.__KRIVA_TAWK__) return;
  window.__KRIVA_TAWK__ = true;

  var PROPERTY_ID = '6ab17219c222fa34484b55ad';
  var WIDGET_ID = '1k32ibcvo';
  var valid =
    /^[a-f0-9]{24}$/i.test(PROPERTY_ID) && /^[a-z0-9_-]+$/i.test(WIDGET_ID);
  var pendingOpen = false;
  var ready = false;
  var leadSent = false;
  var embedInjected = false;
  var titleGuardInstalled = false;
  var facade = null;
  var loadTimer = 0;

  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_API.customStyle = {
    zIndex: 85,
    visibility: {
      desktop: { position: 'br', xOffset: 16, yOffset: 16 },
      mobile: { position: 'br', xOffset: 12, yOffset: 88 }
    }
  };

  function track(name, params) {
    if (typeof window.krivaTrack === 'function') window.krivaTrack(name, params);
  }

  function markLead(source) {
    if (leadSent) return;
    leadSent = true;
    track('generate_lead', {
      lead_type: 'live_chat',
      form_id: 'tawk',
      form_name: 'tawk_live_chat',
      currency: 'USD',
      value: 1,
      chat_source: source || 'tawk'
    });
  }

  /* Tawk flashes document.title to "1 new message" while a greeting is unread.
     That string is what GA4 stores as the page title. Ignore only that notice. */
  function installTitleGuard() {
    if (titleGuardInstalled) return;
    titleGuardInstalled = true;
    var titleDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'title');
    function isChatTabNotice(value) {
      return /^\d+\s+new messages?$/i.test(String(value || '').trim());
    }
    if (titleDesc && titleDesc.get && titleDesc.set) {
      Object.defineProperty(document, 'title', {
        configurable: true,
        enumerable: titleDesc.enumerable,
        get: function () {
          return titleDesc.get.call(document);
        },
        set: function (value) {
          if (isChatTabNotice(value)) return;
          titleDesc.set.call(document, value);
        }
      });
    }
  }

  function prefetchOrigins() {
    if (document.getElementById('kriva-tawk-preconnect')) return;
    var hosts = ['https://embed.tawk.to', 'https://va.tawk.to'];
    for (var i = 0; i < hosts.length; i++) {
      var l = document.createElement('link');
      if (i === 0) l.id = 'kriva-tawk-preconnect';
      l.rel = 'preconnect';
      l.href = hosts[i];
      l.crossOrigin = 'anonymous';
      document.head.appendChild(l);
    }
    var dns = document.createElement('link');
    dns.rel = 'dns-prefetch';
    dns.href = 'https://embed.tawk.to';
    document.head.appendChild(dns);
  }

  function maximize() {
    if (window.Tawk_API && typeof window.Tawk_API.maximize === 'function') {
      try {
        window.Tawk_API.maximize();
        return true;
      } catch (err) {}
    }
    return false;
  }

  function hideFacade() {
    if (!facade) return;
    facade.hidden = true;
    facade.setAttribute('aria-hidden', 'true');
  }

  function showFacade() {
    if (!facade || ready) return;
    facade.hidden = false;
    facade.removeAttribute('aria-hidden');
  }

  function syncNavChrome() {
    var nav = document.getElementById('nav');
    var open = !!(nav && nav.classList.contains('open'));
    if (ready) {
      if (typeof window.Tawk_API.hideWidget !== 'function') return;
      if (open) window.Tawk_API.hideWidget();
      else window.Tawk_API.showWidget();
      return;
    }
    if (open) hideFacade();
    else showFacade();
  }

  function bindChrome() {
    var nav = document.getElementById('nav');
    if (!nav || nav.__krivaTawkBound) return;
    nav.__krivaTawkBound = true;
    new MutationObserver(syncNavChrome).observe(nav, {
      attributes: true,
      attributeFilter: ['class']
    });
    syncNavChrome();
  }

  function failLoad() {
    embedInjected = false;
    if (loadTimer) {
      clearTimeout(loadTimer);
      loadTimer = 0;
    }
    showFacade();
  }

  function injectEmbed() {
    if (embedInjected || !valid) return;
    if (document.prerendering) return;
    embedInjected = true;
    installTitleGuard();
    prefetchOrigins();
    window.Tawk_LoadStart = new Date();

    var s1 = document.createElement('script');
    var s0 = document.getElementsByTagName('script')[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/' + PROPERTY_ID + '/' + WIDGET_ID;
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    s1.onerror = failLoad;
    if (s0 && s0.parentNode) s0.parentNode.insertBefore(s1, s0);
    else document.head.appendChild(s1);

    loadTimer = setTimeout(function () {
      if (!ready) failLoad();
    }, 15000);
  }

  window.krivaOpenChat = function () {
    pendingOpen = true;
    if (ready && maximize()) return true;
    if (valid) {
      injectEmbed();
      return true;
    }
    return false;
  };

  function onChatClick(e) {
    var a =
      e.target.closest &&
      e.target.closest('[data-kriva-chat], a[href="#chat"]');
    if (!a) return;
    e.preventDefault();
    if (window.krivaOpenChat()) return;
    location.href = 'mailto:hello@krivatechnologies.com';
  }

  window.Tawk_API.onLoad = function () {
    ready = true;
    if (loadTimer) {
      clearTimeout(loadTimer);
      loadTimer = 0;
    }
    hideFacade();
    try {
      window.Tawk_API.setAttributes(
        {
          page: location.pathname,
          page_title: document.title.slice(0, 80)
        },
        function () {}
      );
    } catch (err) {}
    bindChrome();
    if (pendingOpen || location.hash === '#chat') {
      pendingOpen = false;
      maximize();
    }
  };

  window.Tawk_API.onChatMaximized = function () {
    track('chat_open', { method: 'tawk', page_path: location.pathname });
  };

  window.Tawk_API.onPrechatSubmit = function () {
    markLead('prechat');
  };

  window.Tawk_API.onOfflineSubmit = function () {
    markLead('offline');
  };

  function injectFacadeStyles() {
    if (document.getElementById('kriva-tawk-facade-css')) return;
    var css = document.createElement('style');
    css.id = 'kriva-tawk-facade-css';
    css.textContent =
      '#kriva-tawk-facade{position:fixed;z-index:1000003;right:16px;bottom:16px;width:144px;height:136px;pointer-events:none}' +
      '#kriva-tawk-facade[hidden]{display:none!important}' +
      '#kriva-tawk-facade button{pointer-events:auto;appearance:none;-webkit-appearance:none;padding:0;border:0;background:transparent;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}' +
      '#kriva-tawk-facade .tawk-facade-close{position:absolute;top:0;right:0;width:20px;height:20px;color:#8a8a8a;font:16px/20px system-ui,sans-serif}' +
      '#kriva-tawk-facade .tawk-facade-grabber{position:absolute;left:0;top:16px;width:124px;height:95px}' +
      '#kriva-tawk-facade .tawk-facade-grabber img{display:block;width:124px;height:95px;pointer-events:none}' +
      '#kriva-tawk-facade .tawk-facade-bubble{position:absolute;right:0;bottom:0;width:60px;height:60px;border-radius:50%;background:#4F46E5;color:#fff;display:flex;align-items:center;justify-content:center}' +
      '#kriva-tawk-facade .tawk-facade-bubble svg{width:28px;height:28px;display:block}' +
      '#kriva-tawk-facade .tawk-facade-badge{position:absolute;top:-2px;right:-2px;min-width:18px;height:18px;padding:0 4px;border-radius:9px;background:#e53935;color:#fff;font:700 11px/18px system-ui,sans-serif;text-align:center}' +
      '@media(max-width:1099px){#kriva-tawk-facade{right:12px;bottom:calc(88px + env(safe-area-inset-bottom,0px))}}' +
      '@media(max-width:720px){#kriva-tawk-facade{width:56px;height:56px;transition:opacity .2s,transform .2s,visibility .2s}' +
      '#kriva-tawk-facade .tawk-facade-grabber,#kriva-tawk-facade .tawk-facade-close{display:none}' +
      '#kriva-tawk-facade .tawk-facade-bubble{width:56px;height:56px}' +
      '#kriva-tawk-facade.is-parked{opacity:0;visibility:hidden;transform:translateY(12px)}' +
      '#kriva-tawk-facade.is-parked button{pointer-events:none}}' +
      '@media(max-width:720px) and (prefers-reduced-motion:reduce){#kriva-tawk-facade{transition:none}}' +
      '@media print{#kriva-tawk-facade{display:none!important}}';
    document.head.appendChild(css);
  }

  function injectFacade() {
    if (facade || ready) return;
    injectFacadeStyles();
    facade = document.createElement('div');
    facade.id = 'kriva-tawk-facade';
    facade.innerHTML =
      '<button type="button" class="tawk-facade-close" aria-label="Dismiss greeting">×</button>' +
      '<button type="button" class="tawk-facade-grabber" aria-label="Open live chat">' +
      '<img src="/shared/tawk-grabber.svg" alt="" width="124" height="95">' +
      '</button>' +
      '<button type="button" class="tawk-facade-bubble" aria-label="Open live chat">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 3C6.5 3 2 6.7 2 11.2c0 2.6 1.4 4.9 3.6 6.5l-.6 3.4c-.1.6.5 1.1 1.1.9l3.7-1.3c.7.2 1.4.2 2.2.2 5.5 0 10-3.7 10-8.2S17.5 3 12 3zm-3.2 7.4c.7 0 1.2.5 1.2 1.2S9.5 12.8 8.8 12.8 7.6 12.3 7.6 11.6 8.1 10.4 8.8 10.4zm3.2 0c.7 0 1.2.5 1.2 1.2s-.5 1.2-1.2 1.2-1.2-.5-1.2-1.2.5-1.2 1.2-1.2zm3.2 0c.7 0 1.2.5 1.2 1.2s-.5 1.2-1.2 1.2-1.2-.5-1.2-1.2.5-1.2 1.2-1.2z"/></svg>' +
      '<span class="tawk-facade-badge">1</span>' +
      '</button>';
    function open(e) {
      e.preventDefault();
      if (window.krivaOpenChat()) return;
      location.href = 'mailto:hello@krivatechnologies.com';
    }
    facade.querySelector('.tawk-facade-bubble').addEventListener('click', open);
    facade.querySelector('.tawk-facade-grabber').addEventListener('click', open);
    facade.querySelector('.tawk-facade-close').addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var grabber = facade.querySelector('.tawk-facade-grabber');
      var closeBtn = facade.querySelector('.tawk-facade-close');
      if (grabber) grabber.hidden = true;
      if (closeBtn) closeBtn.hidden = true;
    });
    facade.querySelector('.tawk-facade-bubble').addEventListener('pointerenter', prefetchOrigins, { once: true });
    document.body.appendChild(facade);
    bindChrome();
    parkOnMobile();
  }

  /* On phones the bubble covers the hero CTAs; show it once the visitor scrolls past the first screen. */
  function parkOnMobile() {
    var mq = window.matchMedia('(max-width:720px)');
    function sync() {
      if (!facade) return;
      facade.classList.toggle('is-parked', mq.matches && window.scrollY < window.innerHeight * 0.6);
    }
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync, { passive: true });
    sync();
  }

  function start() {
    document.addEventListener('click', onChatClick, true);
    if (document.prerendering) {
      document.addEventListener(
        'prerenderingchange',
        function () {
          if (location.hash === '#chat') window.krivaOpenChat();
          else injectFacade();
        },
        { once: true }
      );
      return;
    }
    if (location.hash === '#chat') {
      pendingOpen = true;
      injectFacade();
      injectEmbed();
      return;
    }
    injectFacade();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
