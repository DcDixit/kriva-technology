const puppeteer=require('d:/Dixit/Our-Website/Website-Updated-v2/kriva-technology/node_modules/puppeteer');
(async()=>{const b=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
for (const [slug,idx] of [['saas-onboarding-patterns','mid'],['trucking-dispatch-crm-guide','first']]) {
 const p=await b.newPage();await p.setViewport({width:390,height:844});await p.goto('http://localhost:5184/insights/'+slug,{waitUntil:'load'});
 const info=await p.evaluate(idx=>{const ps=Array.from(document.querySelector('.ix-prose').querySelectorAll('p')).filter(p=>p.textContent.replace(/\s+/g,' ').trim().length>80);const el=idx==='mid'?ps[Math.floor(ps.length/2)]:ps[0];
  el.setAttribute('data-dbg','1');return {html:el.innerHTML.slice(0,160),hidden:getComputedStyle(el).opacity+'/'+getComputedStyle(el).visibility+'/'+el.closest('[aria-hidden]')}},idx);
 const node=await p.$('[data-dbg]'); const s=await p.accessibility.snapshot({root:node,interestingOnly:false});
 const names=[];(function walk(n){if(n.name)names.push(n.name);(n.children||[]).forEach(walk)})(s||{});
 console.log(slug,'|',JSON.stringify(info),'\n  a11y role:',s&&s.role,'| text nodes:',JSON.stringify(names.slice(0,6)).slice(0,300));await p.close();}
await b.close();})();
