#!/usr/bin/env node
/**
 * Fix 03, LCP priority hints and lazy-loading discipline.
 * The first in-content image of each page is the LCP candidate: it must be eager
 * with fetchpriority=high. Everything after the first two images should be lazy.
 * The nav wordmark is tiny/inline and is left alone.
 */
const fs = require('fs');

const setAttr = (tag, name, value) => {
 const re = new RegExp(`\\s${name}=(["'])[^"']*\\1`, 'i');
 if (re.test(tag)) return tag.replace(re, ` ${name}="${value}"`);
 return tag.replace(/\s*\/?>$/, (end) => ` ${name}="${value}"${end.trim().startsWith('/') ? ' />' : '>'}`);
};
const delAttr = (tag, name) => tag.replace(new RegExp(`\\s${name}=(["'])[^"']*\\1`, 'i'), '');

let changed = 0;
for (const f of fs.readdirSync('.').filter((x) => x.endsWith('.html'))) {
 const src = fs.readFileSync(f, 'utf8');
 const imgs = [...src.matchAll(/<img\b[^>]*>/gi)];
 if (!imgs.length) continue;

 let out = src;
 let contentIdx = 0;
 for (const m of imgs) {
 const tag = m[0];
 if (/mark-logo/.test(tag)) continue; // nav wordmark
 contentIdx++;
 let next = tag;

 if (contentIdx === 1) {
 // LCP candidate, must not be lazy, must be high priority
 next = delAttr(next, 'loading');
 next = setAttr(next, 'fetchpriority', 'high');
 next = setAttr(next, 'decoding', 'async');
 } else if (contentIdx > 2 && !/loading=/i.test(next)) {
 next = setAttr(next, 'loading', 'lazy');
 if (!/decoding=/i.test(next)) next = setAttr(next, 'decoding', 'async');
 }

 if (next !== tag) out = out.replace(tag, next);
 }
 if (out !== src) {
 fs.writeFileSync(f, out);
 changed++;
 console.log(' ' + f);
 }
}
console.log(`\n${changed} page(s) updated.`);
