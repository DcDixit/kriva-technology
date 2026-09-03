/** Public routes and site constants derived from vercel.json rewrites. */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { CONTACT_EMAIL } = require("./studio");

const ROOT = path.join(__dirname, "..");
const ORIGIN = "https://krivatechnologies.com";
const ENTITY_DESCRIPTION =
  "KRIVA Technologies is an in-house product studio that builds custom trucking software, B2B SaaS, and finance integrations for operators in the US, UK, UAE, and Canada.";
const SAME_AS = [
  "https://www.linkedin.com/company/kriva-technologies",
  "https://dribbble.com/krivatechnologies",
  "https://www.instagram.com/krivatechnologies",
  "https://x.com/krivatechnologies",
];
const AREA_SERVED = ["US", "GB", "AE", "CA"];
const KNOWS_ABOUT = [
  "Trucking software",
  "Dispatch CRM",
  "Transportation Management Systems",
  "Fleet management software",
  "B2B SaaS development",
  "QuickBooks integration",
  "Xero integration",
  "Driver mobile apps",
];

function vercelConfig() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8"));
}

/** Public HTML pages from Vercel rewrites. Excludes media/file and parameterized utility routes. */
function publicPages() {
  return vercelConfig()
    .rewrites.filter((r) => {
      const dest = r.destination || "";
      if (!dest.endsWith(".html")) return false;
      if (r.source.includes(":")) return false;
      if (dest.includes("/media/")) return false;
      return true;
    })
    .map((r) => ({
      path: r.source,
      file: r.destination.replace(/^\//, ""),
      url: r.source === "/" ? ORIGIN + "/" : ORIGIN + r.source,
    }));
}

function lastmodFor(file) {
  const rel = file.replace(/\\/g, "/");
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cs", "--", rel], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(out)) return out;
  } catch (_) {
    /* fall through */
  }
  const st = fs.statSync(path.join(ROOT, file));
  return st.mtime.toISOString().slice(0, 10);
}

function priorityFor(routePath) {
  if (routePath === "/") return "1.0";
  if (routePath === "/contact") return "0.9";
  if (
    routePath === "/solutions" ||
    routePath === "/services" ||
    routePath === "/work"
  ) {
    return "0.9";
  }
  if (routePath.startsWith("/solutions/")) return "0.9";
  if (routePath.startsWith("/work/")) return "0.8";
  if (routePath === "/about" || routePath === "/process") return "0.8";
  if (routePath.startsWith("/services/")) return "0.7";
  if (routePath === "/insights" || routePath === "/industries") return "0.7";
  if (routePath.startsWith("/insights/")) return "0.6";
  if (
    routePath === "/faq" ||
    routePath === "/technologies" ||
    routePath === "/careers"
  ) {
    return "0.6";
  }
  if (routePath === "/privacy" || routePath === "/terms") return "0.3";
  return "0.5";
}

function changefreqFor(routePath) {
  if (routePath === "/" || routePath === "/insights") return "weekly";
  if (routePath.startsWith("/insights/")) return "yearly";
  if (routePath === "/privacy" || routePath === "/terms") return "yearly";
  return "monthly";
}

module.exports = {
  ROOT,
  ORIGIN,
  CONTACT_EMAIL,
  ENTITY_DESCRIPTION,
  SAME_AS,
  AREA_SERVED,
  KNOWS_ABOUT,
  publicPages,
  lastmodFor,
  priorityFor,
  changefreqFor,
};
