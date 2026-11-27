/* For specific percentage values, find the visible element and report the nearest mock-up container's visible label. */
const puppeteer=require('d:/Dixit/Our-Website/Website-Updated-v2/kriva-technology/node_modules/puppeteer');
(async()=>{const b=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});const p=await b.newPage();await p.setViewport({width:1440,height:900});
for (const [route,val] of [['/work/ai-support-automation','62%'],['/services/dashboard-design','94.2%'],['/solutions','64%']]) {
 await p.goto(process.argv[2]+route,{waitUntil:'load'});
 const r=await p.evaluate(val=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;const hits=[];while((n=w.nextNode())){if(n.textContent.includes(val))hits.push(n.parentElement);}
  return hits.map(el=>{let c=el;for(let i=0;i<12&&c.parentElement;i++){c=c.parentElement;const t=(c.innerText||'')+' '+(c.getAttribute('aria-label')||'');if(/illustrative|sample/i.test(t)||c.tagName==='FIGURE'||c.tagName==='SECTION')break;}
   const t=(c.innerText||'').replace(/\s+/g,' ');const lab=t.match(/[^.]{0,60}(Illustrative|sample data|Sample)[^.]{0,60}/i);
   return {container:c.tagName.toLowerCase()+'.'+String(c.className).split(' ')[0],ariaHidden:!!el.closest('[aria-hidden="true"]'),label:lab?lab[0].trim():'NO visible label in container',containerAria:c.getAttribute('aria-label')}})},val);
 console.log(route,val,JSON.stringify(r));}
await b.close();})();
