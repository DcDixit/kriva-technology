/* Consent gate. Analytics and Clarity stay unloaded until Accept.
   Choice: localStorage "kriva_consent" = "accept" | "reject" (read by shared/analytics.js too; key and values unchanged).
   A "Cookie settings" control in the footer reopens this banner to change or withdraw the choice.
   Withdrawal turns analytics off, deletes the first-party analytics cookies and reloads the page,
   because a loaded gtag.js or Clarity script cannot be unloaded from a running page. */
(function () {
  'use strict';
  var KEY = 'kriva_consent';
  var GA_ID = window.__KRIVA_GA_ID || 'G-FHG12KTF8C';

  /* Not tracked (as before 22 Nov 2026): automated browsers never load or send; local and preview
     hosts never load (analytics.js still logs events to the console there). ?ga_debug=1 overrides both. */
  var debug = /(?:^|[?&])ga_debug=1(?:&|$)/.test(location.search);
  var host = location.hostname;
  var local = host === 'localhost' || host === '127.0.0.1' || /\.vercel\.app$/.test(host);
  var ua = navigator.userAgent || '';
  var bot = navigator.webdriver === true || /HeadlessChrome|Lighthouse|PTST|GTmetrix|Pingdom|Googlebot|bingbot|AdsBot|Google-InspectionTool/i.test(ua);
  if (bot && !debug) window.__krivaNoTrack = true;

  var opener = null;

  function read() {
    try { return localStorage.getItem(KEY); } catch (err) { return null; }
  }

  function write(value) {
    try { localStorage.setItem(KEY, value); } catch (err) {}
  }

  function decided(value) {
    return value === 'accept' || value === 'reject';
  }

  function load() {
    if (local && !debug) return;
    if (typeof window.krivaLoadAnalytics === 'function') window.krivaLoadAnalytics();
    /* Clarity needs an explicit consent signal after Accept, or it runs without cookies for
       EEA/UK/CH visitors. Sent only when the loader actually ran (not for bots, internal or GPC). */
    if (window.__KRIVA_GA_LOADED && !window.__KRIVA_CLARITY_CONSENT && typeof window.clarity === 'function') {
      window.__KRIVA_CLARITY_CONSENT = true;
      try { window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' }); } catch (err) {}
    }
  }

  /* First-party GA4 and Clarity cookies, on this host and every parent domain. */
  function clearCookies() {
    var names = [];
    String(document.cookie || '').split(';').forEach(function (part) {
      var name = part.split('=')[0].trim();
      if (/^(_ga$|_ga_|_gid$|_gat|_clck$|_clsk$)/.test(name)) names.push(name);
    });
    if (!names.length) return;
    var labels = host.split('.');
    var domains = [''];
    for (var i = 0; i < labels.length - 1; i++) domains.push('; domain=.' + labels.slice(i).join('.'));
    names.forEach(function (name) {
      domains.forEach(function (d) {
        document.cookie = name + '=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
      });
    });
  }

  function withdraw() {
    var wasLoaded = !!window.__KRIVA_GA_LOADED;
    window['ga-disable-' + GA_ID] = true;
    try { if (typeof window.gtag === 'function') window.gtag('consent', 'update', { analytics_storage: 'denied' }); } catch (err) {}
    try { if (typeof window.clarity === 'function') window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' }); } catch (err) {}
    try { if (typeof window.clarity === 'function') window.clarity('consent', false); } catch (err) {}
    clearCookies();
    if (wasLoaded) location.reload();
  }

  function bar() {
    return document.getElementById('kriva-consent');
  }

  function markChoice() {
    var el = bar();
    if (!el) return;
    var choice = read();
    var buttons = el.querySelectorAll('button[data-consent]');
    for (var i = 0; i < buttons.length; i++) {
      if (decided(choice)) buttons[i].setAttribute('aria-pressed', buttons[i].getAttribute('data-consent') === choice ? 'true' : 'false');
      else buttons[i].removeAttribute('aria-pressed');
    }
  }

  function close() {
    var el = bar();
    if (el) el.hidden = true;
    if (opener && typeof opener.focus === 'function') opener.focus();
    opener = null;
  }

  function choose(value) {
    var previous = read();
    write(value);
    close();
    if (value === 'accept') load();
    else if (previous === 'accept' || window.__KRIVA_GA_LOADED) withdraw();
    else clearCookies();
  }

  function build() {
    if (bar()) return bar();
    var el = document.createElement('div');
    el.id = 'kriva-consent';
    el.className = 'kriva-consent';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-labelledby', 'kriva-consent-title');
    el.innerHTML =
      '<p id="kriva-consent-title">Analytics stays off until you choose. Accept allows Google Analytics and Clarity. Reject keeps them off. <a href="/privacy">Privacy</a></p>' +
      '<div class="kriva-consent-actions">' +
      '<button type="button" data-consent="reject">Reject</button>' +
      '<button type="button" data-consent="accept">Accept</button>' +
      '</div>';
    el.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest && e.target.closest('button[data-consent]');
      if (!btn) return;
      choose(btn.getAttribute('data-consent'));
    });
    el.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && decided(read())) close();
    });
    el.hidden = true;
    document.body.appendChild(el);
    return el;
  }

  /* Reopen in place, from the footer control or any [data-consent-open] element. */
  function open(from) {
    var el = build();
    opener = from || null;
    markChoice();
    el.hidden = false;
    /* Move focus only when the visitor opened it; the first-visit banner does not steal focus. */
    var first = el.querySelector('button[data-consent]');
    if (from && first) first.focus();
  }

  function addFooterControl() {
    if (document.querySelector('.kriva-cookie-btn')) return;
    var terms = document.querySelector('footer a[href="/terms"]');
    if (!terms || !terms.parentNode) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'kriva-cookie-btn';
    btn.setAttribute('data-consent-open', '');
    btn.setAttribute('aria-controls', 'kriva-consent');
    btn.textContent = 'Cookie settings';
    terms.parentNode.insertBefore(btn, terms.nextSibling);
    terms.parentNode.insertBefore(document.createTextNode(' · '), btn);
  }

  function start() {
    var choice = read();
    build();
    addFooterControl();
    document.addEventListener('click', function (e) {
      var trigger = e.target && e.target.closest && e.target.closest('[data-consent-open]');
      if (!trigger) return;
      e.preventDefault();
      open(trigger);
    });
    /* A choice made in another tab applies here too. */
    window.addEventListener('storage', function (e) {
      if (e.key !== KEY) return;
      markChoice();
      if (e.newValue === 'accept') { close(); load(); }
      else if (e.newValue === 'reject') { close(); withdraw(); }
    });
    if (choice === 'accept') { load(); return; }
    if (choice === 'reject') { clearCookies(); return; }
    open(null);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
