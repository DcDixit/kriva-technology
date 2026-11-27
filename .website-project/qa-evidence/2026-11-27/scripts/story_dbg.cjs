const puppeteer=require('d:/Dixit/Our-Website/Website-Updated-v2/kriva-technology/node_modules/puppeteer');
(async()=>{const b=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
for (const w of [390,1440]) {const p=await b.newPage();await p.setViewport({width:w,height:900});await p.goto('http://localhost:5195/work/ai-support-automation',{waitUntil:'load'});
 await p.evaluate(()=>{document.querySelector('#kriva-consent')&&(document.querySelector('#kriva-consent').hidden=true);document.getElementById('approach').scrollIntoView();});
 await new Promise(z=>setTimeout(z,1500));
 const v=await p.evaluate(()=>{const vis=e=>{if(!e)return null;const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return {shown:r.height>0&&cs.display!=='none'&&cs.visibility!=='hidden'&&parseFloat(cs.opacity)>0.1,text:e.innerText.replace(/\s+/g,' ').slice(0,60)}};
  const s0=document.querySelector('.story-scene[data-scene="0"]');
  return {storyBar:vis(document.querySelector('.story-bar')),scene0Tagline:vis(s0.querySelector('.tagline')),scene0Pu:vis(s0.querySelector('.pu')),skel:vis(s0.querySelector('.skel')),otherScenes:Array.from(document.querySelectorAll('.story-scene')).map(s=>s.dataset.scene+':'+(s.querySelector('.pu')&&s.querySelector('.pu').getAttribute('aria-label')))}});
 console.log(w,JSON.stringify(v));
 const el=await p.$('.story-media'); await el.screenshot({path:process.argv[2]+'/story_'+w+'_'+(process.argv[3]||'before')+'.png'}); await p.close();}
await b.close();})();
