const puppeteer=require('d:/Dixit/Our-Website/Website-Updated-v2/kriva-technology/node_modules/puppeteer');
(async()=>{const [origin,vj]=process.argv.slice(2);const v=require(vj).rewrites.filter(r=>!/[:(*]/.test(r.source));
const files=require('fs').readdirSync(require('path').dirname(vj)).filter(f=>/^kriva-.*\.html$/.test(f)&&/svx-moved/.test(require('fs').readFileSync(require('path').join(require('path').dirname(vj),f),'utf8')));
const b=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});const p=await b.newPage();await p.setViewport({width:390,height:844});
for (const f of files){const r=v.find(x=>x.destination==='/'+f);if(!r)continue;await p.goto(origin+r.source,{waitUntil:'load'});await new Promise(z=>setTimeout(z,300));
 const s=await p.evaluate(()=>{const hero=document.querySelector('main > header, main > section');const chips=Array.from(document.querySelectorAll('.mob-chips'));
  const sheetRules=[];return {heroTop:Math.round(hero.getBoundingClientRect().top),heroDark:hero.hasAttribute('data-dark'),chips:chips.map(c=>{const cs=getComputedStyle(c);return (cs.display==='none'?'hidden':cs.position+':'+Math.round(c.getBoundingClientRect().height))+(c.closest('main')?'(in main)':'(before main)')}).join(' '),logoFilter:getComputedStyle(document.querySelector('header [class*="logo"]')).filter}});
 console.log(r.source.padEnd(34),JSON.stringify(s));}
await b.close();})();
