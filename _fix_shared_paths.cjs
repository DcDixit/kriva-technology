const fs = require("fs");
let files = 0;
for (const f of fs.readdirSync(".").filter((x) => /\.html$/i.test(x))) {
  let t = fs.readFileSync(f, "utf8");
  const n = t;
  t = t.replace(/(href|src)="shared\//g, '$1="/shared/');
  t = t.replace(/(href|src)='shared\//g, "$1='/shared/");
  if (t !== n) {
    fs.writeFileSync(f, t);
    files++;
  }
}
console.log("updated files", files);
const still = [];
for (const f of fs.readdirSync(".").filter((x) => /\.html$/i.test(x))) {
  const t = fs.readFileSync(f, "utf8");
  if (/(href|src)=["']shared\//.test(t)) still.push(f);
}
console.log("remaining relative", still);
