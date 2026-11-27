const puppeteer=require('d:/Dixit/Our-Website/Website-Updated-v2/kriva-technology/node_modules/puppeteer');
(async()=>{const b=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const routes={careers:'/careers',technologies:'/technologies','ai-assisted':'/services/ai-assisted-development','graphic':'/services/graphic-design','seo':'/services/seo-digital-marketing'};
const v=require(process.argv[3]).rewrites;
for (const [k,r0] of Object.entries(routes)) { const r=v.find(x=>x.destination.includes(k==='ai-assisted'?'ai-assisted-development':k==='graphic'?'graphic-design':k==='seo'?'seo-digital-marketing':k)); const route=r?r.source:r0;
 for (const w of [390,1440]) { const p=await b.newPage();await p.setViewport({width:w,height:w===390?844:900});await p.goto(process.argv[2]+route,{waitUntil:'load'});
  await p.evaluate(()=>scrollTo(0,900)); await new Promise(z=>setTimeout(z,500));
  const info=await p.evaluate(()=>Array.from(document.querySelectorAll('#mobChips')).map(n=>{const cs=getComputedStyle(n),r=n.getBoundingClientRect();return {visible:cs.display!=='none'&&cs.visibility!=='hidden'&&r.height>0,h:Math.round(r.height),top:Math.round(r.top),links:n.querySelectorAll('a').length,pos:cs.position}}));
  console.log(route,w,JSON.stringify(info)); if(w===390) await p.screenshot({path:process.argv[4]+'/'+k+'_390.png'}); await p.close(); } }
await b.close();})();
