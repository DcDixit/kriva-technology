/* Pixel-compare pairs of PNGs in a browser canvas. Usage: node png_pixdiff.cjs <dir> <prefix> <widths> */
const fs=require('fs'),path=require('path');
const puppeteer=require('d:/Dixit/Our-Website/Website-Updated-v2/kriva-technology/node_modules/puppeteer');
const [DIR,PRE,W]=process.argv.slice(2);
(async()=>{const b=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});const p=await b.newPage();
for(const w of W.split(',')){const a=fs.readFileSync(path.join(DIR,`${PRE}_${w}_base.png`)).toString('base64'),c=fs.readFileSync(path.join(DIR,`${PRE}_${w}_cand.png`)).toString('base64');
const r=await p.evaluate(async(a,c)=>{const ld=s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src='data:image/png;base64,'+s});const [x,y]=await Promise.all([ld(a),ld(c)]);
if(x.width!==y.width||x.height!==y.height)return{size:[x.width,x.height,y.width,y.height]};const cv=document.createElement('canvas');cv.width=x.width;cv.height=x.height;const g=cv.getContext('2d');g.drawImage(x,0,0);const da=g.getImageData(0,0,x.width,x.height).data;g.clearRect(0,0,x.width,x.height);g.drawImage(y,0,0);const db=g.getImageData(0,0,x.width,x.height).data;let n=0;for(let i=0;i<da.length;i+=4)if(da[i]!==db[i]||da[i+1]!==db[i+1]||da[i+2]!==db[i+2])n++;return{size:[x.width,x.height],diffPx:n}},a,c);
console.log(w,JSON.stringify(r));}await b.close();})();
