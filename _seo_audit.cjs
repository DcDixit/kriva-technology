const fs = require("fs");
const path = require("path");

const root = __dirname;
const htmls = fs
  .readdirSync(root)
  .filter((f) => f.endsWith(".html") && !f.startsWith("node_modules"))
  .sort();

function attr(html, tag, name) {
  const re = new RegExp(`<${tag}[^>]*\\s${name}=["']([^"']*)["'][^>]*>`, "i");
  const m = html.match(re);
  return m ? m[1] : null;
}

function allAttrs(html, tag, name) {
  const re = new RegExp(`<${tag}[^>]*\\s${name}=["']([^"']*)["'][^>]*>`, "gi");
  const out = [];
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}

function textBetween(html, openRe, closeRe) {
  const m = html.match(openRe);
  if (!m) return null;
  const start = m.index + m[0].length;
  const rest = html.slice(start);
  const c = rest.match(closeRe);
  if (!c) return rest.slice(0, 400);
  return rest.slice(0, c.index);
}

function strip(s) {
  return (s || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function schemaTypes(html) {
  const types = [];
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const j = JSON.parse(m[1]);
      const items = Array.isArray(j) ? j : j["@graph"] ? j["@graph"] : [j];
      for (const it of items) {
        if (it && it["@type"]) types.push(it["@type"]);
      }
    } catch (e) {
      types.push("PARSE_ERROR");
    }
  }
  return types;
}

const FILE_MAP = {
  "kriva-redesign.html": "/",
  "kriva-about.html": "/about",
  "kriva-contact.html": "/contact",
  "kriva-process.html": "/process",
  "kriva-faq.html": "/faq",
  "kriva-privacy.html": "/privacy",
  "kriva-terms.html": "/terms",
  "kriva-technologies.html": "/technologies",
  "kriva-services-index.html": "/services",
  "kriva-solutions-index.html": "/solutions",
  "kriva-work-index.html": "/work",
  "kriva-insights-index.html": "/insights",
  "kriva-careers.html": "/careers",
  "kriva-industries.html": "/industries",
  "kriva-solution-trucking.html": "/solutions/trucking-logistics",
  "kriva-solution-saas.html": "/solutions/saas",
  "kriva-solution-accounting.html": "/solutions/accounting-integrations",
  "kriva-solution-car-transport.html": "/solutions/car-transportation",
  "kriva-case-fleetflow.html": "/work/shiftrail-dispatch",
  "kriva-case-payroll-pro.html": "/work/payroll-pro-saas",
  "kriva-case-finance-sync.html": "/work/finance-sync-hub",
  "kriva-case-healthtrack.html": "/work/healthtrack-mobile",
  "kriva-case-brandlift.html": "/work/brandlift-ecommerce",
  "kriva-case-crm-pulse.html": "/work/crm-pulse-dashboard",
  "kriva-case-ai-support.html": "/work/ai-support-automation",
  "kriva-case-marketplace.html": "/work/marketplace-mvp",
  "kriva-insight-ai-in-product-design-2026.html": "/insights/ai-in-product-design-2026",
  "kriva-insight-saas-onboarding-patterns.html": "/insights/saas-onboarding-patterns",
  "kriva-insight-saas-mvp-uk-guide.html": "/insights/saas-mvp-uk-guide",
  "kriva-insight-no-code-vs-custom-mvp.html": "/insights/no-code-vs-custom-mvp",
  "kriva-insight-trucking-dispatch-crm-guide.html": "/insights/trucking-dispatch-crm-guide",
  "kriva-insight-crm-dashboard-ux-patterns.html": "/insights/crm-dashboard-ux-patterns",
  "kriva-insight-choosing-a-digital-agency.html": "/insights/choosing-a-digital-agency",
  "404.html": "/404",
};

function expectedPath(file) {
  if (FILE_MAP[file]) return FILE_MAP[file];
  const m = file.match(/^kriva-service-(.+)\.html$/);
  if (m) return "/services/" + m[1];
  return null;
}

const rows = [];
const titles = {};
const descs = {};
const h1s = {};
const canons = {};

for (const f of htmls) {
  const html = fs.readFileSync(path.join(root, f), "utf8");
  const title = strip(textBetween(html, /<title[^>]*>/i, /<\/title>/i));
  const desc = attr(html, "meta", "name") && html.match(/<meta[^>]*name=["']description["'][^>]*>/i);
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    || html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
  const description = descMatch ? descMatch[1] : null;
  const canonical = (html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i) || [])[1] || null;
  const robots = (html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i) || [])[1] || null;
  const ogTitle = (html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i) || [])[1] || null;
  const ogDesc = (html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i) || [])[1] || null;
  const ogUrl = (html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']*)["']/i) || [])[1] || null;
  const ogImage = (html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i) || [])[1] || null;
  const ogType = (html.match(/<meta[^>]*property=["']og:type["'][^>]*content=["']([^"']*)["']/i) || [])[1] || null;
  const twCard = (html.match(/<meta[^>]*name=["']twitter:card["'][^>]*content=["']([^"']*)["']/i) || [])[1] || null;
  const twTitle = (html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']*)["']/i) || [])[1] || null;
  const h1raw = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => strip(m[1]));
  const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => strip(m[1]));
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)];
  const imgsNoAlt = imgs.filter((m) => !/\salt=/i.test(m[0]));
  const imgsEmptyAlt = imgs.filter((m) => /\salt=["']\s*["']/i.test(m[0]));
  const imgsDecorative = imgs.filter((m) => /\salt=["']["']/i.test(m[0]));
  const schemas = schemaTypes(html);
  const ga = /G-FHG12KTF8C/.test(html) || /analytics\.js/.test(html);
  const lang = (html.match(/<html[^>]*lang=["']([^"']*)["']/i) || [])[1] || null;
  const viewport = /<meta[^>]*name=["']viewport["']/i.test(html);
  const charset = /<meta[^>]*charset=/i.test(html);
  const hreflang = [...html.matchAll(/hreflang=["']([^"']*)["']/gi)].map((m) => m[1]);
  const ogLocale = (html.match(/<meta[^>]*property=["']og:locale["'][^>]*content=["']([^"']*)["']/i) || [])[1] || null;
  const wordish = strip(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " "));
  const words = wordish.split(/\s+/).filter(Boolean).length;
  const cssLinks = [...html.matchAll(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi)].length;
  const jsScripts = [...html.matchAll(/<script\b[^>]*>/gi)].length;
  const lazyImgs = imgs.filter((m) => /loading=["']lazy["']/i.test(m[0])).length;
  const fetchPri = imgs.filter((m) => /fetchpriority=["']high["']/i.test(m[0])).length;
  const internalHrefs = [...html.matchAll(/href=["'](\/[^"'#?]*)/gi)].map((m) => m[1]);
  const expected = expectedPath(f);
  const canonPath = canonical ? canonical.replace("https://krivatechnologies.com", "") : null;
  const issues = [];
  if (!title) issues.push("missing title");
  if (title && title.length > 65) issues.push(`title long (${title.length})`);
  if (title && title.length < 30) issues.push(`title short (${title.length})`);
  if (!description) issues.push("missing description");
  if (description && description.length > 160) issues.push(`desc long (${description.length})`);
  if (description && description.length < 70) issues.push(`desc short (${description.length})`);
  if (!canonical) issues.push("missing canonical");
  if (expected && canonPath && canonPath !== expected && canonPath !== expected + "/") {
    issues.push(`canonical mismatch: ${canonPath} vs ${expected}`);
  }
  if (h1raw.length === 0) issues.push("missing H1");
  if (h1raw.length > 1) issues.push(`multiple H1 (${h1raw.length})`);
  if (!ogTitle) issues.push("missing og:title");
  if (!ogDesc) issues.push("missing og:description");
  if (!ogUrl) issues.push("missing og:url");
  if (!ogImage) issues.push("missing og:image");
  if (!twCard) issues.push("missing twitter:card");
  if (!ga && f !== "404.html") issues.push("missing GA");
  if (schemas.includes("PARSE_ERROR")) issues.push("schema parse error");
  if (imgsNoAlt.length) issues.push(`imgs missing alt (${imgsNoAlt.length})`);
  if (f !== "404.html" && robots && /noindex/i.test(robots)) issues.push("noindex");

  titles[title] = (titles[title] || []).concat(f);
  descs[description] = (descs[description] || []).concat(f);
  h1s[h1raw[0]] = (h1s[h1raw[0]] || []).concat(f);
  canons[canonical] = (canons[canonical] || []).concat(f);

  rows.push({
    file: f,
    expected,
    title,
    titleLen: title ? title.length : 0,
    description,
    descLen: description ? description.length : 0,
    canonical,
    robots,
    ogTitle: !!ogTitle,
    ogDesc: !!ogDesc,
    ogUrl,
    ogImage,
    ogType,
    twCard: !!twCard,
    twTitle: !!twTitle,
    h1: h1raw,
    h2count: h2s.length,
    h2s: h2s.slice(0, 8),
    schemas,
    words,
    imgs: imgs.length,
    imgsNoAlt: imgsNoAlt.length,
    imgsEmptyAlt: imgsEmptyAlt.length,
    lazyImgs,
    fetchPri,
    cssLinks,
    jsScripts,
    ga,
    lang,
    viewport,
    charset,
    hreflang,
    ogLocale,
    internalHrefs: [...new Set(internalHrefs)],
    issues,
  });
}

const dupTitles = Object.entries(titles).filter(([, v]) => v.length > 1 && v[0]);
const dupDescs = Object.entries(descs).filter(([k, v]) => k && v.length > 1);
const dupH1s = Object.entries(h1s).filter(([k, v]) => k && v.length > 1);
const dupCanons = Object.entries(canons).filter(([k, v]) => k && v.length > 1);

const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace("https://krivatechnologies.com", "") || "/");
const indexable = rows.filter((r) => r.file !== "404.html");
const missingFromSitemap = indexable.filter((r) => r.expected && !sitemapUrls.includes(r.expected));
const extraInSitemap = sitemapUrls.filter((u) => !indexable.some((r) => r.expected === u));

console.log("=== PAGES ===", htmls.length);
console.log("\n=== PER PAGE ===");
for (const r of rows) {
  console.log(
    `\n[${r.file}] ${r.expected || "?"}\n  T(${r.titleLen}): ${r.title}\n  D(${r.descLen}): ${r.description}\n  C: ${r.canonical}\n  H1: ${r.h1.join(" | ") || "(none)"}\n  schema: ${r.schemas.join(", ") || "(none)"}\n  words:${r.words} h2:${r.h2count} imgs:${r.imgs} css:${r.cssLinks} js:${r.jsScripts}\n  issues: ${r.issues.join("; ") || "OK"}`
  );
}

console.log("\n\n=== DUPLICATE TITLES ===");
for (const [k, v] of dupTitles) console.log(v.join(", "), "=>", k);

console.log("\n=== DUPLICATE DESCS ===");
for (const [k, v] of dupDescs) console.log(v.join(", "), "=>", k.slice(0, 80));

console.log("\n=== DUPLICATE H1s ===");
for (const [k, v] of dupH1s) console.log(v.join(", "), "=>", k);

console.log("\n=== DUPLICATE CANONICALS ===");
for (const [k, v] of dupCanons) console.log(v.join(", "), "=>", k);

console.log("\n=== SITEMAP MISSING ===");
console.log(missingFromSitemap.map((r) => r.file + " " + r.expected).join("\n") || "none");
console.log("\n=== SITEMAP EXTRA ===");
console.log(extraInSitemap.join("\n") || "none");

console.log("\n=== ISSUE SUMMARY ===");
const issueCount = {};
for (const r of rows) for (const i of r.issues) {
  const key = i.replace(/ \(.*\)/, "").replace(/: .*/, "");
  issueCount[key] = (issueCount[key] || 0) + 1;
}
console.log(issueCount);

fs.writeFileSync(path.join(root, "_seo_audit_out.json"), JSON.stringify({ rows, sitemapUrls, missingFromSitemap: missingFromSitemap.map(r=>r.file), extraInSitemap, dupTitles, dupDescs, dupH1s }, null, 2));
console.log("\nWrote _seo_audit_out.json");
