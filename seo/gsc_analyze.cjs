#!/usr/bin/env node
/**
 * GSC baseline analyzer — reads real CSV exports only. No fabricated data.
 *
 * Setup:
 *   1. Export from Google Search Console (see seo/gsc-baseline-workflow.txt)
 *   2. Save files to seo/gsc/data/ using the template filenames
 *   3. Run: node seo/gsc_analyze.cjs
 *
 * Outputs: seo/gsc/reports/latest-analysis.json
 */
const fs = require("fs");
const path = require("path");
const PAGE_MAP = require("../content/seo-page-map.cjs");

const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(__dirname, "gsc", "data");
const REPORT_DIR = path.join(__dirname, "gsc", "reports");

const FILES = {
  queries: "queries.csv",
  pages: "pages.csv",
  countries: "countries.csv",
  queriesByCountry: "queries-by-country.csv",
  opportunities: "keyword-opportunities.csv",
};

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const cols = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQ = !inQ;
        continue;
      }
      if (c === "," && !inQ) {
        cols.push(cur.trim());
        cur = "";
        continue;
      }
      cur += c;
    }
    cols.push(cur.trim());
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? "";
    });
    return row;
  });
}

function readIfExists(name) {
  const fp = path.join(DATA_DIR, name);
  if (!fs.existsSync(fp)) return null;
  const raw = fs.readFileSync(fp, "utf8");
  if (/^#|example|template/i.test(raw.split("\n")[0])) {
    return null;
  }
  const rows = parseCsv(raw);
  if (!rows.length) return null;
  return rows;
}

function normQuery(q) {
  return String(q || "").toLowerCase().trim();
}

function matchCluster(query) {
  const q = normQuery(query);
  for (const cluster of PAGE_MAP.clusters) {
    for (const sig of cluster.querySignals) {
      if (q.includes(sig) || sig.includes(q)) {
        return cluster;
      }
    }
  }
  return null;
}

function num(v) {
  const n = parseFloat(String(v).replace(/[%$,]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function main() {
  const queries = readIfExists(FILES.queries);
  const pages = readIfExists(FILES.pages);
  const countries = readIfExists(FILES.countries);
  const queriesByCountry = readIfExists(FILES.queriesByCountry);
  const opportunities = readIfExists(FILES.opportunities);

  if (!queries && !pages && !countries) {
    console.error(
      "No GSC data found. Export CSVs from Search Console and save to seo/gsc/data/\n" +
        "  Required: queries.csv, pages.csv, countries.csv\n" +
        "  Optional: queries-by-country.csv, keyword-opportunities.csv\n" +
        "See seo/gsc-baseline-workflow.txt for export steps."
    );
    process.exit(1);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    dataFiles: Object.fromEntries(
      Object.entries(FILES).map(([k, v]) => [k, fs.existsSync(path.join(DATA_DIR, v))])
    ),
    usTrucking: { mappedQueries: [], gaps: [], topPages: [] },
    marketComparison: {},
    pagePerformance: [],
    urlValidationCandidates: [],
    recommendations: [],
  };

  const queryKey = queries?.[0] ? Object.keys(queries[0]).find((k) => /query|top queries/i.test(k)) : null;
  const pageKey = pages?.[0] ? Object.keys(pages[0]).find((k) => /page|top pages/i.test(k)) : null;
  const countryKey = countries?.[0] ? Object.keys(countries[0]).find((k) => /^country$/i.test(k)) : null;

  if (queries && queryKey) {
    const usCluster = PAGE_MAP.clusters.find((c) => c.id === "us-trucking-dispatch");
    for (const row of queries) {
      const query = row[queryKey];
      const cluster = matchCluster(query);
      const impressions = num(row.Impressions ?? row.impressions);
      const position = num(row.Position ?? row.position);
      const clicks = num(row.Clicks ?? row.clicks);
      if (cluster?.id === "us-trucking-dispatch") {
        report.usTrucking.mappedQueries.push({
          query,
          impressions,
          clicks,
          position,
          suggestedPages: cluster.pages.map((p) => p.path),
        });
      } else if (impressions > 0 && !cluster) {
        report.usTrucking.gaps.push({ query, impressions, clicks, position });
      }
      if (impressions > 0) {
        report.urlValidationCandidates.push({
          query,
          impressions,
          position,
          passesRuleA: impressions > 0,
          note: "Rule A: impressions exist — still requires editorial review before any new URL",
        });
      }
    }
    report.usTrucking.mappedQueries.sort((a, b) => b.impressions - a.impressions);
    report.usTrucking.gaps.sort((a, b) => b.impressions - a.impressions);
  }

  if (pages && pageKey) {
    for (const row of pages) {
      const url = row[pageKey];
      report.pagePerformance.push({
        url,
        clicks: num(row.Clicks ?? row.clicks),
        impressions: num(row.Impressions ?? row.impressions),
        position: num(row.Position ?? row.position),
      });
    }
    report.pagePerformance.sort((a, b) => b.impressions - a.impressions);
    report.usTrucking.topPages = report.pagePerformance
      .filter((p) => /trucking|dispatch|fleet|logistics|crm/i.test(p.url))
      .slice(0, 15);
  }

  const marketCodes = { US: "United States", GB: "United Kingdom", AE: "United Arab Emirates", CA: "Canada" };
  if (countries && countryKey) {
    for (const [code, label] of Object.entries(marketCodes)) {
      const row = countries.find((r) => {
        const c = String(r[countryKey]);
        return c === code || c === label || c.includes(label.split(" ")[0]);
      });
      if (row) {
        report.marketComparison[code] = {
          label,
          marketPage: PAGE_MAP.markets[code]?.path,
          clicks: num(row.Clicks ?? row.clicks),
          impressions: num(row.Impressions ?? row.impressions),
          position: num(row.Position ?? row.position),
          ctr: row.CTR ?? row.ctr ?? "",
        };
      }
    }
  }

  if (queriesByCountry) {
    report.queriesByCountry = {};
    const qk = Object.keys(queriesByCountry[0]).find((k) => /query/i.test(k));
    const ck = Object.keys(queriesByCountry[0]).find((k) => /country/i.test(k));
    for (const [code, label] of Object.entries(marketCodes)) {
      const rows = queriesByCountry.filter((r) => {
        const c = String(r[ck] || "");
        return c === code || c === label;
      });
      report.queriesByCountry[code] = rows
        .map((r) => ({
          query: r[qk],
          impressions: num(r.Impressions ?? r.impressions),
          position: num(r.Position ?? r.position),
          cluster: matchCluster(r[qk])?.id ?? null,
        }))
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 25);
    }
  }

  if (opportunities) {
    const qk = Object.keys(opportunities[0]).find((k) => /keyword|query/i.test(k));
    for (const row of opportunities) {
      const position = num(row.Position ?? row.position ?? row["Average position"]);
      const cpc = num(row.CPC ?? row.cpc ?? row["CPC (USD)"]);
      if (position >= 11 && position <= 20 && cpc > 8) {
        report.urlValidationCandidates.push({
          query: row[qk],
          position,
          cpc,
          passesRuleB: true,
          note: "Rule B: positions 11–20, CPC > $8 — review before any new URL",
        });
      }
    }
  }

  if (!report.usTrucking.mappedQueries.length && queries) {
    report.recommendations.push("US trucking cluster: no query matches yet — check querySignals in content/seo-page-map.cjs");
  }
  report.recommendations.push("Prioritize on-page optimization on mapped pages before creating any geo URLs.");
  report.recommendations.push("Compare US vs UK/UAE/CA in marketComparison before market-specific content changes.");

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const out = path.join(REPORT_DIR, "latest-analysis.json");
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(`Analysis written to ${out}`);
  console.log(`US trucking queries mapped: ${report.usTrucking.mappedQueries.length}`);
  console.log(`Keyword gaps (unmapped with impressions): ${report.usTrucking.gaps.length}`);
  console.log(`Markets with country data: ${Object.keys(report.marketComparison).length}`);
}

main();
