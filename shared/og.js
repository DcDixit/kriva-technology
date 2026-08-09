/**
 * Shared Open Graph / Twitter card contract for the static redesign.
 *
 * Drop the real file at: brand/og-default.png (1200×630).
 * Do not invent a fake image.
 *
 * Then run: node apply_launch_inputs.cjs --og
 * If the file exists, every public page gets consistent og:image / twitter:image tags.
 * If missing, pages keep the safe omit (HTML comment marker only).
 */

const fs = require("fs");
const path = require("path");

const SITE = "https://krivatechnologies.com";
const OG_PATH = "/brand/og-default.png";
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const OG_ALT = "KRIVA — Trucking & SaaS product development";
const OG_MARKER_START = "<!-- KRIVA_OG_IMAGE_START -->";
const OG_MARKER_END = "<!-- KRIVA_OG_IMAGE_END -->";

function localOgPath(rootDir) {
  return path.join(rootDir, "brand", "og-default.png");
}

function assetExists(rootDir) {
  return fs.existsSync(localOgPath(rootDir));
}

function ogImageMetaTags({ enabled = false } = {}) {
  if (!enabled) {
    return [
      OG_MARKER_START,
      "<!-- og:image withheld until brand/og-default.png is supplied (1200×630). -->",
      OG_MARKER_END,
    ].join("\n");
  }
  const url = `${SITE}${OG_PATH}`;
  return [
    OG_MARKER_START,
    `<meta property="og:image" content="${url}">`,
    `<meta property="og:image:width" content="${OG_WIDTH}">`,
    `<meta property="og:image:height" content="${OG_HEIGHT}">`,
    `<meta property="og:image:alt" content="${OG_ALT}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:image" content="${url}">`,
    OG_MARKER_END,
  ].join("\n");
}

/** Auto: enabled only when the file is on disk. */
function ogImageMetaTagsAuto(rootDir) {
  return ogImageMetaTags({ enabled: assetExists(rootDir) });
}

module.exports = {
  SITE,
  OG_PATH,
  OG_WIDTH,
  OG_HEIGHT,
  OG_ALT,
  OG_MARKER_START,
  OG_MARKER_END,
  localOgPath,
  assetExists,
  ogImageMetaTags,
  ogImageMetaTagsAuto,
};
