/**
 * Phase 10: Final Production QA (read-only audit; writes report JSON only).
 * Run: node _phase10_qa.cjs
 */
const fs = require("fs");
const path = require("path");
const http = require("http");
const { FILE_MAP, counts, missing, htmls, resolves } = require("./_crawl_links.js");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 5188);
const out = {
  generatedAt: new Date().toISOString(),
  port: PORT,
  routes: {},
  seo: { pages: [], issues: [] },
  credibility: {},
  technical: {},
  routing: {},
  http: { ok: [], fail: [], unknown404: null },
};

function get(urlPath) {
  return new Promise((resolve) => {
    const req = http.get(
      { hostname: "127.0.0.1", port: PORT, path: urlPath, timeout: 8000 },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          resolve({
            path: urlPath,
            status: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
      }
    );
    req.on("error", (e) => resolve({ path: urlPath, status: 0, err: e.message, body: "" }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ path: urlPath, status: 0, err: "timeout", body: "" });
    });
  });
}

function pick(html, re) {
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

function all(html, re) {
  const out = [];
  let m;
  const r = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  while ((m = r.exec(html))) out.push(m[1].trim());
  return out;
}

function stripTags(s) {
  return String(s || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function httpCrawl() {
  const routes = new Set(Object.keys(FILE_MAP));
  for (const f of fs.readdirSync(ROOT).filter((x) => /^kriva-service-.*\.html$/i.test(x))) {
    routes.add(`/services/${f.replace(/^kriva-service-/, "").replace(/\.html$/i, "")}`);
  }
  const list = [...routes].sort();
  for (const r of list) {
    const res = await get(r);
    if (res.status === 200) out.http.ok.push(r);
    else out.http.fail.push({ path: r, status: res.status, err: res.err });
    if (res.status === 200) {
      out.routes[r] = analyzeSeo(r, res.body);
    }
  }
  // trailing slash sample
  const slashSamples = ["/about/", "/services/", "/services/design-systems/", "/work/fleetflow-dispatch/"];
  out.routing.trailingSlash = [];
  for (const s of slashSamples) {
    const res = await get(s);
    out.routing.trailingSlash.push({ path: s, status: res.status });
  }
  // nested refresh = same as GET
  const nested = ["/services/ux-research", "/work/fleetflow-dispatch", "/insights/saas-mvp-uk-guide", "/solutions/saas"];
  out.routing.nestedDirect = [];
  for (const s of nested) {
    const res = await get(s);
    out.routing.nestedDirect.push({ path: s, status: res.status });
  }
  // assets
  const assets = ["/shared/chrome.css", "/shared/chrome.js", "/shared/og.js"];
  out.routing.assets = [];
  for (const s of assets) {
    const res = await get(s);
    out.routing.assets.push({ path: s, status: res.status, type: res.headers && res.headers["content-type"] });
  }
  // unknown
  const unk = await get("/this-path-does-not-exist-phase10");
  out.http.unknown404 = { path: unk.path, status: unk.status };
  // .html direct still works?
  const direct = await get("/kriva-about.html");
  out.routing.directHtml = { path: "/kriva-about.html", status: direct.status };
}

function analyzeSeo(route, html) {
  const title = pick(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const desc = pick(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)
    || pick(html, /<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
  const canonical = pick(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i)
    || pick(html, /<link\s+href=["']([^"']*)["']\s+rel=["']canonical["']/i);
  const ogTitle = pick(html, /<meta\s+property=["']og:title["']\s+content=["']([^"']*)["']/i)
    || pick(html, /<meta\s+content=["']([^"']*)["']\s+property=["']og:title["']/i);
  const ogDesc = pick(html, /<meta\s+property=["']og:description["']\s+content=["']([^"']*)["']/i)
    || pick(html, /<meta\s+content=["']([^"']*)["']\s+property=["']og:description["']/i);
  const ogUrl = pick(html, /<meta\s+property=["']og:url["']\s+content=["']([^"']*)["']/i)
    || pick(html, /<meta\s+content=["']([^"']*)["']\s+property=["']og:url["']/i);
  const robots = pick(html, /<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i);
  const h1s = all(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi).map(stripTags);
  const jsonLdBlocks = all(html, /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  const jsonLd = [];
  const jsonLdErrors = [];
  for (const block of jsonLdBlocks) {
    try {
      jsonLd.push(JSON.parse(block));
    } catch (e) {
      jsonLdErrors.push(e.message);
    }
  }
  const metaBlob = [title, desc, ogTitle, ogDesc].filter(Boolean).join(" | ");
  const placeholderMeta = /(placeholder|lorem ipsum|demo banner|coming soon|tbd|\[tbd\]|TODO|FIXME)/i.test(metaBlob);
  const expectedCanon = route === "/" ? "https://krivatechnologies.com/" : `https://krivatechnologies.com${route}`;
  return {
    route,
    title,
    desc,
    canonical,
    ogTitle,
    ogDesc,
    ogUrl,
    robots,
    h1Count: h1s.length,
    h1s,
    jsonLdCount: jsonLd.length,
    jsonLdErrors,
    placeholderMeta,
    expectedCanon,
    canonicalOk: canonical === expectedCanon || (route === "/" && canonical === "https://krivatechnologies.com"),
  };
}

function seoAggregate() {
  const pages = Object.values(out.routes);
  out.seo.pages = pages.map((p) => ({
    route: p.route,
    title: p.title,
    desc: p.desc,
    h1Count: p.h1Count,
    canonical: p.canonical,
    canonicalOk: p.canonicalOk,
    hasOgTitle: !!p.ogTitle,
    hasOgDesc: !!p.ogDesc,
    robots: p.robots,
    placeholderMeta: p.placeholderMeta,
    jsonLdCount: p.jsonLdCount,
    jsonLdErrors: p.jsonLdErrors,
  }));
  const titles = {};
  const descs = {};
  for (const p of pages) {
    if (!p.title) out.seo.issues.push({ type: "missing-title", route: p.route });
    else {
      titles[p.title] = titles[p.title] || [];
      titles[p.title].push(p.route);
    }
    if (!p.desc) out.seo.issues.push({ type: "missing-desc", route: p.route });
    else {
      descs[p.desc] = descs[p.desc] || [];
      descs[p.desc].push(p.route);
    }
    if (p.h1Count !== 1) out.seo.issues.push({ type: "h1-count", route: p.route, count: p.h1Count, h1s: p.h1s });
    if (!p.canonical) out.seo.issues.push({ type: "missing-canonical", route: p.route });
    else if (!p.canonicalOk) out.seo.issues.push({ type: "canonical-mismatch", route: p.route, got: p.canonical, expected: p.expectedCanon });
    if (!p.ogTitle) out.seo.issues.push({ type: "missing-og-title", route: p.route });
    if (!p.ogDesc) out.seo.issues.push({ type: "missing-og-desc", route: p.route });
    if (p.robots && /noindex/i.test(p.robots)) out.seo.issues.push({ type: "noindex", route: p.route, robots: p.robots });
    if (p.placeholderMeta) out.seo.issues.push({ type: "placeholder-meta", route: p.route });
    if (p.jsonLdErrors.length) out.seo.issues.push({ type: "jsonld-parse", route: p.route, errors: p.jsonLdErrors });
  }
  out.seo.duplicateTitles = Object.entries(titles).filter(([, r]) => r.length > 1);
  out.seo.duplicateDescs = Object.entries(descs).filter(([, r]) => r.length > 1);
  for (const [t, r] of out.seo.duplicateTitles) out.seo.issues.push({ type: "dup-title", title: t, routes: r });
  for (const [d, r] of out.seo.duplicateDescs) out.seo.issues.push({ type: "dup-desc", desc: d.slice(0, 80), routes: r });
}

function credibilityScan() {
  const patterns = {
    percentages: /\b\d{1,3}\s*%|\+\d{1,3}%|−\d{1,3}%|-\d{1,3}%/g,
    starRatings: /\b\d(?:\.\d)?\s*★|\b\d(?:\.\d)?\s*\/\s*5\b|\bstars?\b/gi,
    fleetRoute: /FleetRoute/gi,
    fleetFlow: /FleetFlow/gi,
    flowLedger: /FlowLedger/gi,
    payrollPro: /PayrollPro/gi,
    meridian: /Meridian/gi,
    brandLift: /BrandLift/gi,
    carePath: /CarePath/gi,
    anitaDesai: /Anita Desai/gi,
    marcusCole: /Marcus Cole/gi,
    raviMehta: /Ravi Mehta/gi,
    tomAshworth: /Tom Ashworth/gi,
    aiSpeed: /30\s*[–-]\s*50%|AI.{0,40}faster|faster with AI/gi,
    teamSize: /\b\d+\+?\s*(engineers|designers|people|team members|employees)\b/gi,
    deliveryTime: /\b\d+\s*to\s*\d+\s*weeks\b|\b\d+[-–]\d+\s*weeks\b/gi,
    tbdFlags: /flag tbd|Client attribution TBD|\[TBD\]|attribution TBD/gi,
    metricsRail: /−32%|11 min|99\.4%/g,
  };
  const byFile = {};
  for (const f of htmls) {
    const text = fs.readFileSync(path.join(ROOT, f), "utf8");
    const hits = {};
    for (const [name, re] of Object.entries(patterns)) {
      const m = text.match(re);
      if (m && m.length) hits[name] = [...new Set(m)].slice(0, 20);
    }
    if (Object.keys(hits).length) byFile[f] = hits;
  }
  out.credibility.byFile = byFile;
  out.credibility.summary = {
    filesWithFleetRoute: Object.entries(byFile).filter(([, h]) => h.fleetRoute).map(([f]) => f),
    filesWithFlowLedger: Object.entries(byFile).filter(([, h]) => h.flowLedger).map(([f]) => f),
    filesWithMeridian: Object.entries(byFile).filter(([, h]) => h.meridian).map(([f]) => f),
    filesWithCarePath: Object.entries(byFile).filter(([, h]) => h.carePath).map(([f]) => f),
    filesWithNamedPeople: Object.entries(byFile)
      .filter(([, h]) => h.anitaDesai || h.marcusCole || h.raviMehta || h.tomAshworth)
      .map(([f]) => f),
    filesWithAiSpeed: Object.entries(byFile).filter(([, h]) => h.aiSpeed).map(([f]) => f),
    filesWithTbd: Object.entries(byFile).filter(([, h]) => h.tbdFlags).map(([f]) => f),
    fleetFlowMetricFiles: Object.entries(byFile).filter(([, h]) => h.metricsRail).map(([f]) => f),
  };
}

function technicalScan() {
  const tech = {
    htmlCount: htmls.length,
    missingInternalHrefs: missing.map(([h, c]) => ({ href: h, count: c })),
    hrefUniqueCount: Object.keys(counts).length,
    chrome: { missingHeader: [], missingFooter: [], missingChromeCss: [], missingChromeJs: [], multiNav: [], multiFooter: [], multiWhatsapp: [] },
    duplicateIds: [],
    slotCount: 0,
    tbdFlagCount: 0,
    imgMissingAlt: [],
    brokenLocalAssets: [],
    scriptSrcs: {},
    cssHrefs: {},
  };

  for (const f of htmls) {
    const html = fs.readFileSync(path.join(ROOT, f), "utf8");
    const navs = (html.match(/<nav\b[^>]*class=["'][^"']*\bnav\b/gi) || []).length;
    const footers = (html.match(/<footer\b/gi) || []).length;
    const wa = (html.match(/wa\.me\/919724454455/g) || []).length;
    if (!/id=["']nav["']/.test(html)) tech.chrome.missingHeader.push(f);
    if (!/<footer\b/i.test(html)) tech.chrome.missingFooter.push(f);
    if (!/shared\/chrome\.css/.test(html)) tech.chrome.missingChromeCss.push(f);
    if (!/shared\/chrome\.js/.test(html)) tech.chrome.missingChromeJs.push(f);
    if (navs > 1) tech.chrome.multiNav.push({ f, navs });
    if (footers > 1) tech.chrome.multiFooter.push({ f, footers });
    if (wa > 1) tech.chrome.multiWhatsapp.push({ f, wa });

    const ids = all(html, /\bid=["']([^"']+)["']/gi);
    const seen = {};
    for (const id of ids) {
      seen[id] = (seen[id] || 0) + 1;
    }
    const dups = Object.entries(seen).filter(([, n]) => n > 1);
    if (dups.length) tech.duplicateIds.push({ f, dups });

    tech.slotCount += (html.match(/class=["'][^"']*\bslot\b/g) || []).length;
    tech.tbdFlagCount += (html.match(/flag tbd|class=["']flag tbd["']/gi) || []).length;

    // imgs
    const imgRe = /<img\b([^>]*)>/gi;
    let im;
    while ((im = imgRe.exec(html))) {
      const attrs = im[1];
      if (!/\balt=/.test(attrs)) tech.imgMissingAlt.push({ f, snippet: attrs.slice(0, 80) });
    }

    // local asset refs
    const assetRe = /(?:src|href)=["']((?:\.\/)?shared\/[^"']+)["']/gi;
    let am;
    while ((am = assetRe.exec(html))) {
      const p = am[1].replace(/^\.\//, "");
      if (!fs.existsSync(path.join(ROOT, p))) tech.brokenLocalAssets.push({ f, p });
    }

    const scripts = all(html, /<script[^>]*src=["']([^"']+)["']/gi);
    for (const s of scripts) {
      tech.scriptSrcs[s] = (tech.scriptSrcs[s] || 0) + 1;
    }
    const css = all(html, /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']stylesheet["']/gi)
      .concat(all(html, /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi));
    for (const c of css) tech.cssHrefs[c] = (tech.cssHrefs[c] || 0) + 1;
  }

  // vercel rewrite conflicts
  const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8"));
  const sources = vercel.rewrites.map((r) => r.source);
  const dests = vercel.rewrites.map((r) => r.destination);
  const dupSources = sources.filter((s, i) => sources.indexOf(s) !== i);
  tech.vercel = {
    rewriteCount: vercel.rewrites.length,
    cleanUrls: vercel.cleanUrls,
    trailingSlash: vercel.trailingSlash,
    duplicateSources: [...new Set(dupSources)],
    destinationsMissing: dests.filter((d) => !fs.existsSync(path.join(ROOT, d.replace(/^\//, "")))),
    mapVsVercel: {
      inMapNotVercel: Object.keys(FILE_MAP).filter((k) => !sources.includes(k)),
      inVercelNotMap: sources.filter((k) => !FILE_MAP[k] && !k.startsWith("/services/")),
    },
  };

  // service pages SEO presence for previously deferred
  const deferred = [
    "ux-research",
    "wireframing-prototyping",
    "design-systems",
    "web-application-design",
    "logo-design",
  ];
  tech.deferredServices = deferred.map((slug) => {
    const route = `/services/${slug}`;
    const seo = out.routes[route];
    return {
      slug,
      fileExists: fs.existsSync(path.join(ROOT, `kriva-service-${slug}.html`)),
      http200: out.http.ok.includes(route),
      title: seo && seo.title,
      desc: seo && seo.desc,
      canonical: seo && seo.canonical,
      h1Count: seo && seo.h1Count,
      jsonLdCount: seo && seo.jsonLdCount,
    };
  });

  out.technical = tech;
  out.linkCrawl = {
    htmlFiles: htmls.length,
    uniqueInternalHrefs: Object.keys(counts).length,
    missingCount: missing.length,
    missing,
  };
}

function chromeLinkInventory() {
  // Parse apply_chrome header/footer from a stamped page
  const sample = fs.readFileSync(path.join(ROOT, "kriva-redesign.html"), "utf8");
  const hrefs = [...sample.matchAll(/href=["']([^"']+)["']/gi)].map((m) => m[1]);
  const internal = hrefs.filter((h) => h.startsWith("/") && !h.startsWith("//"));
  const broken = internal.filter((h) => {
    const base = h.split("#")[0].split("?")[0];
    if (!base || base === "/") return false;
    return !resolves(base);
  });
  out.chromeLinks = {
    samplePage: "kriva-redesign.html",
    internalCount: internal.length,
    uniqueInternal: [...new Set(internal.map((h) => h.split("#")[0].split("?")[0]))],
    broken,
  };
}

(async () => {
  await httpCrawl();
  seoAggregate();
  credibilityScan();
  technicalScan();
  chromeLinkInventory();
  fs.writeFileSync(path.join(ROOT, "_phase10_qa_results.json"), JSON.stringify(out, null, 2));
  console.log(
    JSON.stringify(
      {
        html: htmls.length,
        httpOk: out.http.ok.length,
        httpFail: out.http.fail.length,
        unknown: out.http.unknown404,
        seoIssues: out.seo.issues.length,
        missingLinks: missing.length,
        deferred: out.technical.deferredServices,
        trailingSlash: out.routing.trailingSlash,
        assets: out.routing.assets,
        dupTitles: out.seo.duplicateTitles.length,
        dupDescs: out.seo.duplicateDescs.length,
        chromeBroken: out.chromeLinks.broken,
        slotCount: out.technical.slotCount,
        tbdFlags: out.technical.tbdFlagCount,
        dupIds: out.technical.duplicateIds.length,
        vercelDupSources: out.technical.vercel.duplicateSources,
        vercelMissingDest: out.technical.vercel.destinationsMissing,
      },
      null,
      2
    )
  );
})();
