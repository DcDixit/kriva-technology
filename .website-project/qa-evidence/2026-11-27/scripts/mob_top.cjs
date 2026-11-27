const puppeteer=require('d:/Dixit/Our-Website/Website-Updated-v2/kriva-technology/node_modules/puppeteer');
(async()=>{const b=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
for (const [o,label] of [['http://localhost:5184','clean'],['https://krivatechnologies.com','live']]) { const p=await b.newPage();await p.setViewport({width:390,height:844});await p.goto(o+'/careers',{waitUntil:'load'});
 const y=await p.evaluate(()=>{const n=document.querySelectorAll('#mobChips');const r=n[0].getBoundingClientRect();return {first:Math.round(r.top+scrollY),second:Math.round(n[1].getBoundingClientRect().top+scrollY),h:Math.round(r.height)}});
 await p.evaluate(t=>scrollTo(0,Math.max(0,t-300)),y.first); await new Promise(z=>setTimeout(z,600));
 await p.screenshot({path:process.argv[2]+'/careers_rows_'+label+'.png'}); console.log(label,JSON.stringify(y)); await p.close(); }
await b.close();})();
