const puppeteer=require('d:/Dixit/Our-Website/Website-Updated-v2/kriva-technology/node_modules/puppeteer');
(async()=>{const b=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const [origin,out]=process.argv.slice(2);
for (const route of ['/services/graphic-design','/technologies','/careers','/services/branding']) { const p=await b.newPage();await p.setViewport({width:390,height:844});await p.goto(origin+route,{waitUntil:'load'});
 await p.evaluate(()=>{const c=document.querySelector('#kriva-consent');if(c)c.hidden=true}); await new Promise(z=>setTimeout(z,600));
 const s=await p.evaluate(()=>{const h=document.querySelector('header');h.style.visibility='hidden';
  const stack=[[30,35],[360,35]].map(([x,y])=>document.elementsFromPoint(x,y).slice(0,4).map(e=>{const cs=getComputedStyle(e);return e.tagName.toLowerCase()+'.'+String(e.className).split(' ')[0]+'['+cs.backgroundColor+(cs.backgroundImage!=='none'?' img':'')+']'}).join(' > '));
  h.style.visibility='';const hero=document.querySelector('main section, main > *');const hr=hero.getBoundingClientRect();
  const logo=h.querySelector('[class*="logo"]');const lb=getComputedStyle(logo);
  return {bodyClass:document.body.className,headerClass:h.className,headerData:JSON.stringify(h.dataset),logoFilter:lb.filter,burgerColor:getComputedStyle(h.querySelector('.burger')).color,firstMainChild:hero.tagName+'.'+String(hero.className).split(' ').slice(0,2).join('.')+' top='+Math.round(hr.top),behind:stack}});
 console.log(route,JSON.stringify(s,null,0)); await p.screenshot({path:out+'/top'+route.replace(/\//g,'_')+'.png',clip:{x:0,y:0,width:390,height:200}}); await p.close(); }
await b.close();})();
