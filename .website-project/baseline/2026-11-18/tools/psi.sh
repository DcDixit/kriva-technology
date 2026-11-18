for p in "" about services services/crm-development solutions/trucking-logistics work work/shiftrail-dispatch insights/dispatch-software-cost pricing contact solutions/trucking-company-websites; do
  f=psi/$(echo "${p:-home}" | tr / _).json
  curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://krivatechnologies.com/$p&strategy=mobile&category=performance&category=accessibility&category=seo&category=best-practices" -o "$f"
  node -e '
const j=require("./'"$f"'"); if(j.error){console.log("'"${p:-home}"'","ERR",j.error.code,j.error.message.slice(0,80));process.exit()}
const c=j.lighthouseResult.categories,a=j.lighthouseResult.audits;
const s=k=>a[k]?a[k].displayValue:"-";
console.log("'"${p:-home}"'".padEnd(36),["performance","accessibility","best-practices","seo"].map(k=>Math.round(c[k].score*100)).join("/"),"LCP",s("largest-contentful-paint"),"FCP",s("first-contentful-paint"),"TBT",s("total-blocking-time"),"CLS",s("cumulative-layout-shift"),"SI",s("speed-index"),"wt",s("total-byte-weight"),"| field:",j.loadingExperience&&j.loadingExperience.overall_category||"none")'
done
