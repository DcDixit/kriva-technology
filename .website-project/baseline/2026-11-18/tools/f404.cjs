const puppeteer = require('d:/Dixit/Our-Website/Website-Updated-v2/kriva-technology/node_modules/puppeteer');
(async()=>{const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});const p=await b.newPage();
const c=await p.createCDPSession();await c.send('Network.enable');c.on('Network.responseReceived',e=>{if(e.response.status>=400)console.log(e.response.status,e.response.url)});
for(const u of ['https://krivatechnologies.com/about','https://krivatechnologies.com/pricing']){await p.goto(u,{waitUntil:'networkidle2'});}
await b.close()})();
