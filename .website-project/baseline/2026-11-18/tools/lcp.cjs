const puppeteer = require('d:/Dixit/Our-Website/Website-Updated-v2/kriva-technology/node_modules/puppeteer');
(async()=>{const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
for (const u of ['solutions/trucking-logistics','solutions/trucking-company-websites','services']){
const p=await b.newPage();await p.setViewport({width:412,height:823,isMobile:true,hasTouch:true});
await p.evaluateOnNewDocument(()=>{window.__l=[];new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__l.push([Math.round(e.startTime),e.element?e.element.tagName+'.'+e.element.className:e.url,e.size]))).observe({type:'largest-contentful-paint',buffered:true});});
await p.goto('https://krivatechnologies.com/'+u,{waitUntil:'networkidle0'});await new Promise(r=>setTimeout(r,2500));
const r=await p.evaluate(()=>{const h=document.querySelector('h1');const chain=[];let e=h;while(e&&e!==document.body){const s=getComputedStyle(e);if(s.opacity!=='1'||s.transform!=='none'||s.clipPath!=='none'||s.visibility!=='visible'||s.animationName!=='none')chain.push(e.tagName+'.'+String(e.className).slice(0,40)+' op='+s.opacity+' anim='+s.animationName+' clip='+s.clipPath.slice(0,30));e=e.parentElement}return {lcp:window.__l,h1chain:chain}});
console.log(u,JSON.stringify(r));await p.close()}
await b.close()})();
