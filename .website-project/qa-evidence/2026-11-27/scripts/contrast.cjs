const puppeteer=require('d:/Dixit/Our-Website/Website-Updated-v2/kriva-technology/node_modules/puppeteer');
(async()=>{const b=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});const p=await b.newPage();await p.goto('http://localhost:5195/work/ai-support-automation',{waitUntil:'load'});
const r=await p.evaluate(()=>{const lum=c=>{const m=c.match(/[\d.]+/g).map(Number).slice(0,3).map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});return 0.2126*m[0]+0.7152*m[1]+0.0722*m[2]};
 const ratio=(a,b)=>{const x=lum(a),y=lum(b);return +((Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)).toFixed(2)};
 const bar=document.querySelector('.story-bar');const bg=getComputedStyle(bar).backgroundColor;
 const f=bar.querySelector('.flag'),m=document.getElementById('storyMeta'),n=document.getElementById('storyName');
 const other=document.querySelector('.tagline .flag');
 return {barBg:bg,flag:{color:getComputedStyle(f).color,size:getComputedStyle(f).fontSize,ratio:ratio(getComputedStyle(f).color,bg)},meta:{color:getComputedStyle(m).color,ratio:ratio(getComputedStyle(m).color,bg)},name:{ratio:ratio(getComputedStyle(n).color,bg)},otherFlagOnPage:other&&{color:getComputedStyle(other).color,bg:getComputedStyle(other.closest('.tagline')).backgroundColor}}});
console.log(JSON.stringify(r));await b.close();})();
