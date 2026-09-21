/* KRIVA tawk.to, one live-chat widget on every page.
 Dashboard: https://dashboard.tawk.to/
 Administration → Channels → Chat Widget → Widget Code
 Embed URL shape: https://embed.tawk.to/{PROPERTY_ID}/{WIDGET_ID} */
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

 window.Tawk_API = window.Tawk_API || {};
 window.Tawk_LoadStart = new Date();
 window.Tawk_API.customStyle = {
 zIndex: 85, visibility: {
 desktop: { position: 'br', xOffset: 16, yOffset: 16 }, mobile: { position: 'br', xOffset: 12, yOffset: 88 }
 }
 };

 function track(name, params) {
 if (typeof window.krivaTrack === 'function') window.krivaTrack(name, params);
 }

 function markLead(source) {
 if (leadSent) return;
 leadSent = true;
 track('generate_lead', {
 lead_type: 'live_chat', form_id: 'tawk', form_name: 'tawk_live_chat', currency: 'USD', value: 1, chat_source: source || 'tawk'
 });
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

 window.krivaOpenChat = function () {
 if (ready && maximize()) return true;
 if (valid) {
 pendingOpen = true;
 return true;
 }
 return false;
 };

 function onChatClick(e) {
 var a = e.target.closest && e.target.closest('[data-kriva-chat], a[href="#chat"]');
 if (!a) return;
 e.preventDefault();
 if (window.krivaOpenChat()) return;
 location.href = 'mailto:hello@krivatechnologies.com';
 }

 document.addEventListener('click', onChatClick, true);

 if (location.hash === '#chat') pendingOpen = true;

 if (!valid) return;

 window.Tawk_API.onLoad = function () {
 ready = true;
 try {
 window.Tawk_API.setAttributes(
 {
 page: location.pathname, page_title: document.title.slice(0, 80)
 }, function () {}
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

 function bindChrome() {
 var nav = document.getElementById('nav');
 if (!nav) return;
 var sync = function () {
 if (typeof window.Tawk_API.hideWidget !== 'function') return;
 if (nav.classList.contains('open')) window.Tawk_API.hideWidget();
 else window.Tawk_API.showWidget();
 };
 new MutationObserver(sync).observe(nav, {
 attributes: true, attributeFilter: ['class']
 });
 sync();
 }

 var s1 = document.createElement('script');
 var s0 = document.getElementsByTagName('script')[0];
 s1.async = true;
 s1.src = 'https://embed.tawk.to/' + PROPERTY_ID + '/' + WIDGET_ID;
 s1.charset = 'UTF-8';
 s1.setAttribute('crossorigin', '*');
 if (s0 && s0.parentNode) s0.parentNode.insertBefore(s1, s0);
 else document.head.appendChild(s1);
})();
