/**
 * Deferred service URLs — Phase 9.
 * Do not build pages, redirects, or change canonical strategy until you decide hosting.
 */

const deferredServiceUrls = [
  "/services/design-systems",
  "/services/web-application-design",
  "/services/ux-research",
  "/services/wireframing-prototyping",
  "/services/logo-design",
];

const hostingOptions = {
  A_proxy_live: {
    label: "Reverse-proxy / rewrite these five paths to the live Next (or existing) pages",
    notes: "Best if live pages already rank and must keep answering.",
  },
  B_static_404_until_built: {
    label: "Allow static redesign host to 404 until standalone pages are built later",
    notes: "Hub cards still advertise reserved URLs. No redirects.",
  },
  C_holding_later: {
    label: "Later: non-indexable holding response (only if you explicitly request it)",
    notes: "Not implemented in Phase 9. Do not invent holding pages now.",
  },
};

const decision = null; // set to 'A_proxy_live' | 'B_static_404_until_built' | 'C_holding_later' when you choose

module.exports = { deferredServiceUrls, hostingOptions, decision };
