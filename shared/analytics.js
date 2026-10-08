/* KRIVA GA4, single tracker for every page.
 Property: 552202890 (https://analytics.google.com/analytics/web/#/a406452772p552202890/)
 Web stream Measurement ID: G-FHG12KTF8C */
(function () {
 'use strict';
 if (window.__KRIVA_ANALYTICS__) return;
 window.__KRIVA_ANALYTICS__ = true;

 var MEASUREMENT_ID = 'G-FHG12KTF8C';
 var validId = /^G-[A-Z0-9]{6,}$/i.test(MEASUREMENT_ID) && !/^G-X+$/i.test(MEASUREMENT_ID);
 var debug = /(?:^|[?&])ga_debug=1(?:&|$)/.test(location.search);
 var local = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
 var optedOut = !!(validId && window['ga-disable-' + MEASUREMENT_ID]);

 window.dataLayer = window.dataLayer || [];
 if (typeof window.gtag !== 'function') {
 window.gtag = function () { window.dataLayer.push(arguments); };
 }
 var gtag = window.gtag;
 /* Filter URLs must not go through history.replaceState after gtag.js wraps it.
 The live tag has history page views on, so that wrapper sends a second page_view. */
 window.krivaReplaceUrl = function (url) {
 var fn = window.__krivaNativeReplaceState || History.prototype.replaceState;
 try { fn.call(history, null, '', url); } catch (err) {}
 };
 window.krivaTrack = function (name, params) {
 if (name === 'generate_lead') { sendLead(params || {}); return; }
 send(name, params);
 };

 /* Page view is queued in the synchronous head snippet, before gtag.js.
 Do not config again here. On a cached click to the next page, gtag.js
 runs before this deferred file, and a late config was ignored, so only
 the landing page recorded a view. */
 if (optedOut) {
 gtag('consent', 'update', { analytics_storage: 'denied' });
 }

 var RESERVED = { page_view: 1, user_engagement: 1, scroll: 1, session_start: 1, first_visit: 1 };
 function send(name, params) {
 if (!name || RESERVED[name]) return;
 if (!validId || optedOut || (local && !debug)) return;
 var payload = params ? Object.assign({}, params) : {};
 gtag('event', name, payload);
 }

 function sendLead(d) {
 d = d || {};
 var type = d.type || d.lead_type || 'inquiry';
 var formId = d.form_id || '';
 var dedupKey = 'kriva_ga_lead_' + location.pathname + '|' + formId + '|' + type;
 try {
 if (sessionStorage.getItem(dedupKey)) return;
 sessionStorage.setItem(dedupKey, '1');
 } catch (err) {
 window.__KRIVA_LEAD_KEYS__ = window.__KRIVA_LEAD_KEYS__ || {};
 if (window.__KRIVA_LEAD_KEYS__[dedupKey]) return;
 window.__KRIVA_LEAD_KEYS__[dedupKey] = true;
 }
 var params = {
 lead_type: type, form_id: formId, form_name: d.form_name || type, currency: 'USD', value: 1
 };
 if (d.chat_source) params.chat_source = d.chat_source;
 send('generate_lead', params);
 if (type === 'live_chat') return;
 send('form_submit', {
 form_id: params.form_id, form_name: params.form_name, form_destination: location.pathname, lead_type: params.lead_type
 });
 send('contact_form_submit', params);
 }

 function textOf(el) {
 var title = el.querySelector && el.querySelector('.t');
 return (el.getAttribute('aria-label') || (title || el).textContent || '')
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
 if (el.closest('.hero, header.hero, .hp-hero')) return 'hero';
 if (el.closest('.hp-mcta')) return 'sticky_bar';
 if (el.closest('.hp-inq')) return 'inquiry_section';
 if (el.closest('.hp-faq, .faq')) return 'faq';
 return 'page';
 }

 function contactType(url) {
 if (/#book/i.test(url.hash)) return 'fit_call';
 if (/#brief/i.test(url.hash)) return 'project_brief';
 return 'contact';
 }

 document.addEventListener(
 'click', function (e) {
 var a = e.target.closest && e.target.closest('a[href]');
 if (!a) return;
 var href = a.getAttribute('href');
 if (!href) return;

 if (href === '#inquire') {
 send('cta_click', {
 cta_name: textOf(a) || 'Send inquiry', cta_type: 'page_inquiry', cta_location: regionOf(a), link_url: location.pathname + href
 });
 return;
 }

 if (href === '#book') {
 send('cta_click', {
 cta_name: textOf(a) || 'Book a 20-min call', cta_type: 'fit_call', cta_location: regionOf(a), link_url: location.pathname + href
 });
 return;
 }

 if (href === '#brief' || href === '#brief-form') {
 send('cta_click', {
 cta_name: textOf(a) || 'Send project brief', cta_type: 'project_brief', cta_location: regionOf(a), link_url: location.pathname + href
 });
 return;
 }

 if (href.charAt(0) === '#') return;

 var url;
 try {
 url = new URL(href, location.href);
 } catch (err) {
 return;
 }

 if (url.protocol === 'mailto:' || url.protocol === 'tel:') {
 var method = url.protocol === 'tel:' ? 'phone' : 'email';
 send('contact_click', {
 method: method, link_url: href, cta_location: regionOf(a)
 });
 if (method === 'email') {
 send('email_click', { link_url: href, cta_location: regionOf(a) });
 } else {
 send('phone_click', { link_url: href, cta_location: regionOf(a) });
 }
 return;
 }

 if (url.origin === location.origin && url.hash === '#inquire') {
 send('cta_click', {
 cta_name: textOf(a) || 'Send inquiry', cta_type: 'page_inquiry', cta_location: regionOf(a), link_url: url.pathname + url.hash
 });
 return;
 }

 if (url.origin === location.origin && /^\/contact\/?$/.test(url.pathname)) {
 send('cta_click', {
 cta_name: textOf(a) || contactType(url), cta_type: contactType(url), cta_location: regionOf(a), link_url: url.pathname + url.hash
 });
 return;
 }

 if (url.origin === location.origin && /^\/markets(\/|$)/.test(url.pathname)) {
 send('select_content', {
 content_type: 'market_page', item_id: url.pathname.replace(/\/$/, '') || '/markets', cta_location: regionOf(a)
 });
 }
 }, true
 );

 function watchForm(id, name) {
 var form = document.getElementById(id);
 if (!form) return;
 var started = false;
 form.addEventListener(
 'focusin', function () {
 if (started) return;
 started = true;
 send('form_start', { form_id: id, form_name: name });
 }, true
 );
 }
 watchForm('fitForm', 'fit_call');
 watchForm('briefForm', 'project_brief');
 watchForm('pageInquiry', 'page_inquiry');

 /* One successful submission = one lead. generate_lead is the conversion.
 form_submit fires on success only. Chat leads use the same dedup and do not
 also emit form_submit. Mark generate_lead as the only key event in GA4 Admin. */
 window.addEventListener('kriva:lead', function (e) {
 sendLead((e && e.detail) || {});
 });

 if (/page not found/i.test(document.title)) {
 send('page_not_found', {
 page_path: location.pathname, page_location: location.origin + location.pathname + location.search
 });
 }
})();
