#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const {
 CTA_PRIMARY_LABEL, CTA_PRIMARY_COMPACT_LABEL, CTA_SECONDARY_LABEL, } = require("./shared/studio");

const ROOT = __dirname;
const issues = [];

function walk(dir, files = []) {
 for (const name of fs.readdirSync(dir)) {
 if (name === "node_modules" || name === ".git") continue;
 const full = path.join(dir, name);
 if (fs.statSync(full).isDirectory()) walk(full, files);
 else if (name.endsWith(".html")) files.push(full);
 }
 return files;
}

const banned = [
 "discovery call", "Request fit call", "Book a discovery", "Request a discovery", "Book a 20-minute", "Send brief</span>", ];

let bookCount = 0;
let briefCount = 0;

for (const file of walk(ROOT)) {
 const text = fs.readFileSync(file, "utf8");
 const rel = path.relative(ROOT, file);
 for (const term of banned) {
 if (text.includes(term)) issues.push(`${rel}: contains "${term}"`);
 }
 if (/nav-cta[\s\S]{0,220}btn sm[\s\S]{0,100}Book a free 20-min fit call/.test(text)) {
 issues.push(`${rel}: nav header still uses full primary label`);
 }
 bookCount += (text.match(/href="(?:\/contact)?#book"/g) || []).length;
 briefCount += (text.match(/href="(?:\/contact)?#brief"/g) || []).length;
}

console.log("Canonical labels:");
console.log(` Primary (full): ${CTA_PRIMARY_LABEL}`);
console.log(` Primary (nav): ${CTA_PRIMARY_COMPACT_LABEL}`);
console.log(` Secondary: ${CTA_SECONDARY_LABEL}`);
console.log(`contact#book links: ${bookCount}`);
console.log(`contact#brief links: ${briefCount}`);
if (issues.length) {
 console.log("\nISSUES:");
 issues.forEach((i) => console.log(" -", i));
 process.exit(1);
}
console.log("\nAudit OK, no banned labels or nav inconsistencies.");
