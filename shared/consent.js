/* Consent gate. Analytics and Clarity stay unloaded until Accept. */
(function () {
  'use strict';
  var KEY = 'kriva_consent';

  function read() {
    try { return localStorage.getItem(KEY); } catch (err) { return null; }
  }

  function write(value) {
    try { localStorage.setItem(KEY, value); } catch (err) {}
  }

  function choose(value) {
    write(value);
    var bar = document.getElementById('kriva-consent');
    if (bar) bar.hidden = true;
    if (value === 'accept' && typeof window.krivaLoadAnalytics === 'function') {
      window.krivaLoadAnalytics();
    }
  }

  function banner() {
    if (document.getElementById('kriva-consent')) return;
    var bar = document.createElement('div');
    bar.id = 'kriva-consent';
    bar.className = 'kriva-consent';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-labelledby', 'kriva-consent-title');
    bar.innerHTML =
      '<p id="kriva-consent-title">Analytics stays off until you choose. Accept allows Google Analytics and Clarity. Reject keeps them off. <a href="/privacy">Privacy</a></p>' +
      '<div class="kriva-consent-actions">' +
      '<button type="button" data-consent="reject">Reject</button>' +
      '<button type="button" data-consent="accept">Accept</button>' +
      '</div>';
    bar.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest && e.target.closest('button[data-consent]');
      if (!btn) return;
      choose(btn.getAttribute('data-consent'));
    });
    document.body.appendChild(bar);
  }

  function start() {
    var choice = read();
    if (choice === 'accept') {
      if (typeof window.krivaLoadAnalytics === 'function') window.krivaLoadAnalytics();
      return;
    }
    if (choice === 'reject') return;
    banner();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
