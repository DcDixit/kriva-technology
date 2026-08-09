const fs = require("fs");
const files = [
  "kriva-redesign.html",
  "kriva-case-fleetflow.html",
  "kriva-case-payroll-pro.html",
  "kriva-case-brandlift.html",
  "kriva-faq.html",
  "kriva-service-ai-assisted-development.html",
  "kriva-about.html",
  "kriva-services-index.html",
  "kriva-solution-saas.html",
  "kriva-work-index.html",
  "kriva-solution-trucking.html",
];
const keys = [
  "FleetRoute",
  "FlowLedger",
  "Meridian",
  "CarePath",
  "Anita Desai",
  "Marcus Cole",
  "Ravi Mehta",
  "Tom Ashworth",
  "Client attribution TBD",
  "−32%",
  "99.4%",
  "11 min",
  "30–50",
  "30-50",
  "faster",
];
for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const lines = fs.readFileSync(f, "utf8").split(/\n/);
  console.log("\n====", f, "====");
  lines.forEach((l, i) => {
    for (const key of keys) {
      if (l.includes(key)) {
        console.log(String(i + 1) + ": " + l.trim().slice(0, 200));
        break;
      }
    }
  });
}
const j = require("./_phase10_qa_results.json");
console.log("\nimgMissingAlt", JSON.stringify(j.technical.imgMissingAlt, null, 2));
const c = fs.readFileSync("kriva-contact.html", "utf8");
console.log(
  "contact wa count",
  (c.match(/wa\.me\/919724454455/g) || []).length
);
// strip style/script for cleaner percentage scan on homepage proof
function visibleish(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "");
}
const home = visibleish(fs.readFileSync("kriva-redesign.html", "utf8"));
console.log("\nhome visible % hits", home.match(/\b\d{1,3}\s*%/g));
console.log("home FleetRoute context:");
home.split(/\n/).forEach((l, i) => {
  if (/FleetRoute|FlowLedger|CarePath|attribution TBD|−32%|99\.4%/.test(l)) console.log(i + 1, l.trim().slice(0, 220));
});
