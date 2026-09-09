/** Regional landing pages — unique copy per market for SEO + GEO. */
const { ORIGIN } = require("../shared/site");

module.exports = {
  markets: [
    {
      slug: "us",
      file: "kriva-market-us.html",
      path: "/markets/us",
      hreflang: "en-us",
      countryCode: "US",
      country: "United States",
      ogLocale: "en_US",
      title: "Custom Trucking & SaaS Software for US Teams | KRIVA",
      meta:
        "US trucking dispatch CRM, fleet dashboards, driver apps, and B2B SaaS from an in-house Ahmedabad studio with US-hour overlap, weekly demos, and phased rollout.",
      eyebrow: "United States",
      h1: "Software for US trucking desks and SaaS teams.",
      lede:
        "We build dispatch CRM, TMS overlays, fleet dashboards, and B2B SaaS for US carriers, brokers, and operators — with overlap for Central and Eastern call hours and rollout that does not stop the shift.",
      focus: [
        {
          title: "Dispatch CRM & TMS overlays",
          body:
            "Bulk assignment, SLA on the row, supervisor overrides, and exception queues built for 200–500 route desks — without forcing a full TMS rip-and-replace.",
          href: "/solutions/trucking-logistics",
          label: "Trucking solutions",
        },
        {
          title: "Driver & field mobile",
          body:
            "Load acceptance, status updates, document capture, and offline-tolerant flows for drivers and field leads who will not use a shrunk desktop board.",
          href: "/services/mobile-applications",
          label: "Driver mobile apps",
        },
        {
          title: "QuickBooks & operational finance",
          body:
            "Sync, reconciliation, and exception dashboards when billing still lives in QuickBooks and ops needs a single source of truth.",
          href: "/solutions/accounting-integrations",
          label: "Accounting integrations",
        },
      ],
      proof: {
        case: { href: "/work/shiftrail-dispatch", label: "ShiftRail dispatch CRM" },
        guide: {
          href: "/insights/trucking-dispatch-crm-guide",
          label: "Dispatch CRM guide for US trucking",
        },
      },
      delivery: [
        "US-hour overlap for standups and fit calls",
        "Async updates in Slack between sessions",
        "Phased rollout with feature flags beside live TMS",
        "You own repos, Figma, and docs at handoff",
      ],
    },
    {
      slug: "uk",
      file: "kriva-market-uk.html",
      path: "/markets/uk",
      hreflang: "en-gb",
      countryCode: "GB",
      country: "United Kingdom",
      ogLocale: "en_GB",
      title: "B2B SaaS & Product Design for UK Startups | KRIVA",
      meta:
        "UK-focused SaaS MVP design, onboarding UX, Xero integrations, and multi-tenant admin panels from KRIVA — in-house design and engineering with clear scope and weekly demos.",
      eyebrow: "United Kingdom",
      h1: "SaaS product design and integrations for UK teams.",
      lede:
        "From MVP scope to activation metrics investors ask about — we design and build B2B SaaS, admin panels, and Xero-ready finance workflows for UK founders and product leads.",
      focus: [
        {
          title: "SaaS MVP & onboarding",
          body:
            "Role-based entry, progressive disclosure, and time-to-value flows scoped for a 12-week launch — not a feature wishlist that delays your first paid pilot.",
          href: "/solutions/saas",
          label: "SaaS solutions",
        },
        {
          title: "Xero & finance integrations",
          body:
            "Sync, mapping, and reconciliation UX finance teams can audit — built for UK accounting norms and multi-entity setups.",
          href: "/solutions/accounting-integrations",
          label: "Xero integrations",
        },
        {
          title: "Multi-tenant admin & permissions",
          body:
            "Customer vs admin surfaces, seat management, and permission models that scale past the first ten accounts.",
          href: "/services/saas-platforms",
          label: "SaaS product design",
        },
      ],
      proof: {
        case: { href: "/work/payroll-pro-saas", label: "PayrollPro SaaS onboarding" },
        guide: { href: "/insights/saas-mvp-uk-guide", label: "SaaS MVP guide for UK startups" },
      },
      delivery: [
        "GMT-friendly call windows",
        "Investor-ready activation instrumentation from day one",
        "Written scope before build starts",
        "Handoff: Figma, GitHub, and runbooks",
      ],
    },
    {
      slug: "uae",
      file: "kriva-market-uae.html",
      path: "/markets/uae",
      hreflang: "en-ae",
      countryCode: "AE",
      country: "United Arab Emirates",
      ogLocale: "en_AE",
      title: "Logistics & SaaS Software for UAE Operators | KRIVA",
      meta:
        "Custom logistics dashboards, fleet ops software, B2B SaaS, and finance integrations for UAE operators — remote-first delivery from Ahmedabad with Gulf-time overlap.",
      eyebrow: "United Arab Emirates",
      h1: "Logistics and SaaS software for UAE operators.",
      lede:
        "Fleet visibility, dispatch consoles, customer portals, and finance integrations for UAE logistics, transport, and B2B SaaS teams that need software matched to how the desk actually runs.",
      focus: [
        {
          title: "Fleet & logistics dashboards",
          body:
            "Exception handling, SLA visibility, and supervisor queues for high-volume transport ops — not generic admin templates.",
          href: "/services/dashboard-design",
          label: "Fleet dashboards",
        },
        {
          title: "Car transport & broker ops",
          body:
            "Quote-to-POD flows, carrier dispatch, tracking, and customer portals for auto-transport and relocation operators.",
          href: "/solutions/car-transportation",
          label: "Car transportation software",
        },
        {
          title: "B2B SaaS platforms",
          body:
            "Multi-tenant products with Arabic/English-ready UX architecture, permissions, and onboarding that converts trials.",
          href: "/solutions/saas",
          label: "SaaS solutions",
        },
      ],
      proof: {
        case: { href: "/work/crm-pulse-dashboard", label: "CRMPulse operations dashboard" },
        guide: { href: "/insights/saas-onboarding-patterns", label: "SaaS onboarding patterns" },
      },
      delivery: [
        "Gulf Standard Time overlap for working sessions",
        "Bilingual-ready UX structure where needed",
        "Integrations with regional payment and accounting tools",
        "Security-conscious handoff and documentation",
      ],
    },
    {
      slug: "ca",
      file: "kriva-market-ca.html",
      path: "/markets/ca",
      hreflang: "en-ca",
      countryCode: "CA",
      country: "Canada",
      ogLocale: "en_CA",
      title: "Trucking & SaaS Software for Canadian Teams | KRIVA",
      meta:
        "Dispatch CRM, fleet software, and B2B SaaS for Canadian carriers and product teams — in-house design and engineering with North American hour overlap and clear IP handoff.",
      eyebrow: "Canada",
      h1: "Trucking and SaaS software for Canadian teams.",
      lede:
        "Custom dispatch CRM, fleet dashboards, driver apps, and B2B SaaS for Canadian operators — built with North American timezone overlap and finance integrations your back office trusts.",
      focus: [
        {
          title: "Dispatch & fleet operations",
          body:
            "Load boards, bulk reassignment, and exception workflows for Canadian carriers and brokers running mixed TMS and spreadsheet ops.",
          href: "/solutions/trucking-logistics",
          label: "Trucking solutions",
        },
        {
          title: "Accounting sync",
          body:
            "QuickBooks and Xero connectors with reconciliation views — fewer month-end surprises for finance.",
          href: "/solutions/accounting-integrations",
          label: "Finance integrations",
        },
        {
          title: "SaaS product delivery",
          body:
            "Onboarding, admin panels, and activation analytics for Canadian B2B SaaS founders shipping their next milestone.",
          href: "/solutions/saas",
          label: "SaaS solutions",
        },
      ],
      proof: {
        case: { href: "/work/finance-sync-hub", label: "FinanceSync reconciliation hub" },
        guide: { href: "/insights/crm-dashboard-ux-patterns", label: "CRM dashboard UX patterns" },
      },
      delivery: [
        "Eastern and Central time overlap",
        "PIPEDA-conscious privacy practices in delivery",
        "Phased rollout without stopping operations",
        "Full code and design ownership at close",
      ],
    },
  ],
  indexPath: "/markets",
  indexFile: "kriva-markets-index.html",
  indexTitle: "Markets We Serve · US, UK, UAE & Canada | KRIVA",
  indexMeta:
    "KRIVA builds custom trucking software, B2B SaaS, and finance integrations for teams in the United States, United Kingdom, United Arab Emirates, and Canada.",
};
