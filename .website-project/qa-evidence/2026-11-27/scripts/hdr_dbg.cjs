const puppeteer=require('d:/Dixit/Our-Website/Website-Updated-v2/kriva-technology/node_modules/puppeteer');
(async()=>{const b=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
for (const route of ['/about','/careers']) { const p=await b.newPage();await p.setViewport({width:390,height:844});await p.goto(process.argv[2]+route,{waitUntil:'load'});
 await p.evaluate(()=>{const c=document.querySelector('#kriva-consent');if(c)c.hidden=true});
 for (const y of [0,1200]) { await p.evaluate(y=>scrollTo(0,y),y); await new Promise(z=>setTimeout(z,700));
  const s=await p.evaluate(()=>{const h=document.querySelector('header');const r=h.getBoundingClientRect();const cs=getComputedStyle(h);const logo=h.querySelector('[class*="logo"]');const lr=logo.getBoundingClientRect();const burger=h.querySelector('.burger');
   return {headerTop:Math.round(r.top),headerH:Math.round(r.height),transform:cs.transform,opacity:cs.opacity,cls:h.className,bg:cs.backgroundColor,logoTop:Math.round(lr.top),logoColor:getComputedStyle(logo).color,logoFilter:getComputedStyle(logo).filter,burgerColor:burger&&getComputedStyle(burger).color,
    chips:Array.from(document.querySelectorAll('.mob-chips')).map(n=>{const r=n.getBoundingClientRect();const cs=getComputedStyle(n);return {top:Math.round(r.top),h:Math.round(r.height),z:cs.zIndex,bg:cs.backgroundColor,pos:cs.position}})}});
  console.log(route,'scrollY='+y,JSON.stringify(s)); await p.screenshot({path:process.argv[3]+'/dbg'+route.replace('/','_')+'_'+y+'.png',clip:{x:0,y:0,width:390,height:150}}); }
 await p.close(); }
await b.close();})();
