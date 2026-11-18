const puppeteer = require('d:/Dixit/Our-Website/Website-Updated-v2/kriva-technology/node_modules/puppeteer');
(async()=>{const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});const p=await b.newPage();
await p.goto('https://krivatechnologies.com/contact',{waitUntil:'networkidle2'});
console.log(JSON.stringify(await p.evaluate(()=>({
 fitOptions:[...document.querySelectorAll('#fitForm select[name=ptype] option')].map(o=>o.textContent.trim()),
 extraVisibleLists:[...document.querySelectorAll('#fitForm [role=listbox],#fitForm ul')].map(u=>u.className+':'+u.children.length+':'+(u.offsetParent?'visible':'hidden')),
 hp:[...document.querySelectorAll('[name=website_hp]')].map(i=>{const w=i.closest('[aria-hidden],.hp,[class*=hp],[hidden]');return {ariaHidden:!!i.closest('[aria-hidden=true]'),tab:i.tabIndex,autocomplete:i.autocomplete,label:i.labels?.[0]?.textContent.trim()}}),
 bookLinks:[...document.querySelectorAll('a[href*="calendly"],a[href*="cal.com"],iframe[src*="calendly"],a[href*="zcal"],a[href*="hubspot.com/meetings"]')].length,
 tel:[...document.querySelectorAll('a[href^="tel:"]')].length,
 wa:[...document.querySelectorAll('a[href*="wa.me"],a[href*="whatsapp"]')].length
}))));await b.close()})();
