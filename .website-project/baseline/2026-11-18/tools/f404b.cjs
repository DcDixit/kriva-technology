const puppeteer = require('d:/Dixit/Our-Website/Website-Updated-v2/kriva-technology/node_modules/puppeteer');
(async()=>{const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
for(const u of ['https://krivatechnologies.com/','https://krivatechnologies.com/about','https://krivatechnologies.com/pricing']){const p=await b.newPage();
p.on('console',m=>{if(m.type()==='error')console.log(u,'->',m.text(),JSON.stringify(m.location()))});
p.on('requestfinished',r=>{const s=r.response()&&r.response().status();if(s>=400)console.log(u,'REQ',s,r.url())});
await p.goto(u,{waitUntil:'networkidle2'});await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=700){scrollTo(0,y);await new Promise(r=>setTimeout(r,80))}});await new Promise(r=>setTimeout(r,1500));await p.close();}
await b.close()})();
