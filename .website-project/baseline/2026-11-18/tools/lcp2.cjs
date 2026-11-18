const puppeteer = require('d:/Dixit/Our-Website/Website-Updated-v2/kriva-technology/node_modules/puppeteer');
(async()=>{const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
for (const u of ['solutions/trucking-logistics','services']){
const p=await b.newPage();await p.setViewport({width:412,height:823,isMobile:true});
await p.evaluateOnNewDocument(()=>{document.addEventListener('DOMContentLoaded',()=>{const f=e=>{const s=getComputedStyle(e);return e.tagName+'.'+String(e.className).slice(0,50)+' op='+s.opacity+' vis='+s.visibility+' anim='+s.animationName+' cv='+s.contentVisibility};window.__d=[f(document.documentElement),f(document.body),f(document.querySelector('main')||document.body),f(document.querySelector('h1'))];});});
await p.goto('https://krivatechnologies.com/'+u,{waitUntil:'networkidle0'});
console.log(u,JSON.stringify(await p.evaluate(()=>window.__d)));
const css=await p.evaluate(()=>[...document.styleSheets].flatMap(s=>{try{return [...s.cssRules]}catch(e){return[]}}).map(r=>r.cssText).filter(t=>/^(html|body|main)[^{]*\{[^}]*(opacity: 0|visibility: hidden)/.test(t)||/@keyframes/.test(t)&&/opacity/.test(t)).slice(0,6).map(t=>t.slice(0,160)));
console.log(' css:',JSON.stringify(css));
await p.close()}
await b.close()})();
