/* KRIVA GA4 — single tracker for every page.
   Property: 552202890 (https://analytics.google.com/analytics/web/#/a406452772p552202890/)
   Web Stream Measurement ID: G-FHG12KTF8C
   
   CRITICAL FIX: Properly configure GA4 consent mode and tracking.
   Analytics storage is GRANTED by default to allow data collection.
   Ad storage remains DENIED for user privacy. */
(function () {
  'use strict';
  
  // Only initialize once per page load
  if (window.__KRIVA_ANALYTICS__) return;
  window.__KRIVA_ANALYTICS__ = true;

  var MEASUREMENT_ID = 'G-FHG12KTF8C';
  var validId = /^G-[A-Z0-9]{6,}$/i.test(MEASUREMENT_ID) && !/^G-X+$/i.test(MEASUREMENT_ID);
  var debug = /(?:^|[?&])ga_debug=1(?:&|$)/.test(location.search);
  var local = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  var optedOut = !!(validId && window['ga-disable-' + MEASUREMENT_ID]);

  // Initialize data layer if not already present
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  window.krivaTrack = function (name, params) {
    send(name, params);
  };

  // Initialize gtag.js
  gtag('js', new Date());

  // Set default consent to GRANTED for analytics (most important fix)
  // Users can opt-out via ga-disable cookie or globally
  // Ads remain denied for privacy
  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': optedOut ? 'denied' : 'granted',
    'wait_for_update': 500,
    'region': 'US'
  });

  // Only collect if valid ID and not opted out (localhost+debug override for testing)
  var shouldCollect = validId && !optedOut;
  if (shouldCollect) {
    var config = {
      'anonymize_ip': true,
      'allow_google_signals': false,
      'allow_ad_personalization_signals': false,
      'send_page_view': true,
      'cookie_flags': 'SameSite=Lax;Secure',
      'debug_mode': debug
    };
    gtag('config', MEASUREMENT_ID, config);
  }

  function send(name, params) {
    if (!name) return;
    var payload = params ? Object.assign({}, params) : {};
    gtag('event', name, payload);
  }

  function textOf(el) {
    return (el.getAttribute('aria-label') || el.textContent || '')
      .replace(/[→←]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 80);
  }

  function regionOf(el) {
    if (el.closest('#nav, .nav')) return 'nav';
    if (el.closest('#sheet, .sheet')) return 'mobile_menu';
    if (el.closest('footer')) return 'footer';
    if (el.closest('.cta-band')) return 'cta_band';
    if (el.closest('.hero, header.hero')) return 'hero';
    return 'page';
  }

  function contactType(url) {
    if (/#book/i.test(url.hash)) return 'fit_call';
    if (/#brief/i.test(url.hash)) return 'project_brief';
    return 'contact';
  }

  document.addEventListener(
    'click',
    function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      var url;
      try {
        url = new URL(href, location.href);
      } catch (err) {
        return;
      }

      if (url.protocol === 'mailto:' || url.protocol === 'tel:') {
        send('contact_click', {
          method: url.protocol === 'tel:' ? 'phone' : 'email',
          link_url: href,
          cta_location: regionOf(a)
        });
        return;
      }

      if (url.origin === location.origin && /^\/contact\/?$/.test(url.pathname)) {
        send('cta_click', {
          cta_name: textOf(a) || contactType(url),
          cta_type: contactType(url),
          cta_location: regionOf(a),
          link_url: url.pathname + url.hash
        });
      }
    },
    true
  );

  function watchForm(id, name) {
    var form = document.getElementById(id);
    if (!form) return;
    var started = false;
    form.addEventListener(
      'focusin',
      function () {
        if (started) return;
        started = true;
        send('form_start', { form_id: id, form_name: name });
      },
      true
    );
  }
  watchForm('fitForm', 'fit_call');
  watchForm('briefForm', 'project_brief');

  window.addEventListener('kriva:lead', function (e) {
    var d = (e && e.detail) || {};
    send('generate_lead', {
      lead_type: d.type || 'inquiry',
      form_id: d.form_id || '',
      form_name: d.type || 'inquiry'
    });
  });

  if (/page not found/i.test(document.title)) {
    send('page_not_found', {
      page_path: location.pathname,
      page_location: location.href
    });
  }
})();
