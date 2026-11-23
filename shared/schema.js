/** Reusable JSON-LD builders. Pages call graphForPage(); do not paste raw blocks. */
const {
  ORIGIN,
  CONTACT_EMAIL,
  ENTITY_DESCRIPTION,
  SAME_AS,
  AREA_SERVED,
  KNOWS_ABOUT,
} = require("./site");

const ORG_ID = ORIGIN + "/#organization";
const WEB_ID = ORIGIN + "/#website";

const CRUMB_NAME = {
  about: "About",
  process: "Process",
  technologies: "Technologies",
  industries: "Industries",
  faq: "FAQ",
  careers: "Careers",
  contact: "Contact",
  privacy: "Privacy",
  terms: "Terms",
  solutions: "Solutions",
  services: "Services",
  work: "Work",
  insights: "Insights",
  markets: "Markets",
  us: "United States",
  uk: "United Kingdom",
  uae: "United Arab Emirates",
  ca: "Canada",
  "trucking-logistics": "Trucking & logistics",
  saas: "SaaS",
  "accounting-integrations": "Accounting integrations",
  "car-transportation": "Auto transport software",
  "ai-assisted-development": "AI-assisted development",
  "api-integrations": "API integrations",
  "automation-systems": "Workflow automation",
  branding: "Branding",
  "crm-development": "Custom CRM development",
  "dashboard-design": "Fleet dashboards",
  "design-systems": "Design systems",
  "graphic-design": "Graphic design",
  "logo-design": "Logo design",
  "mobile-applications": "Mobile app development",
  "no-code-low-code": "No-code / low-code",
  "product-design": "Product and UI/UX design",
  "saas-platforms": "SaaS platforms",
  "seo-digital-marketing": "SEO & digital marketing",
  "ui-ux-design": "UI/UX design",
  "ux-research": "UX research",
  "web-application-design": "Web application design",
  "web-development": "Web development",
  "wireframing-prototyping": "Wireframing & prototyping",
  "shiftrail-dispatch": "ShiftRail dispatch",
  "payroll-pro-saas": "PayrollPro",
  "finance-sync-hub": "FinanceSync",
  "healthtrack-mobile": "HealthTrack",
  "brandlift-ecommerce": "BrandLift",
  "crm-pulse-dashboard": "CRMPulse",
  "ai-support-automation": "SupportAI",
  "marketplace-mvp": "LocalServe",
  "ai-in-product-design-2026": "AI in product design 2026",
  "saas-onboarding-patterns": "SaaS onboarding patterns",
  "saas-mvp-uk-guide": "SaaS MVP UK guide",
  "no-code-vs-custom-mvp": "No-code vs custom MVP",
  "trucking-dispatch-crm-guide": "Dispatch CRM for trucking",
  "crm-dashboard-ux-patterns": "CRM dashboard UX",
  "choosing-a-digital-agency": "Choosing a digital agency",
};

/** Case study → related Service/Solution URL (from the page’s own CTA / topic). */
const WORK_ABOUT = {
  "/work/shiftrail-dispatch": "/services/crm-development",
  "/work/payroll-pro-saas": "/solutions/saas",
  "/work/finance-sync-hub": "/solutions/accounting-integrations",
  "/work/healthtrack-mobile": "/services/mobile-applications",
  "/work/brandlift-ecommerce": "/services/branding",
  "/work/crm-pulse-dashboard": "/services/dashboard-design",
  "/work/ai-support-automation": "/services/automation-systems",
  "/work/marketplace-mvp": "/services/no-code-low-code",
};

const COUNTRY_NAME = {
  US: "United States",
  GB: "United Kingdom",
  AE: "United Arab Emirates",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
};

function areaServedForPath(path) {
  if (path === "/markets/us") return ["US"];
  if (path === "/markets/uk") return ["GB"];
  if (path === "/markets/de") return ["DE"];
  if (path === "/markets/uae") return ["AE"];
  if (path === "/markets/ca") return ["CA"];
  return AREA_SERVED.slice();
}

function organization() {
  return {
    "@type": "ProfessionalService",
    "@id": ORG_ID,
    name: "KRIVA Technologies",
    alternateName: "KRIVA",
    url: ORIGIN,
    logo: {
      "@type": "ImageObject",
      url: ORIGIN + "/apple-touch-icon.png",
      width: 180,
      height: 180,
    },
    image: ORIGIN + "/brand/og-default.png",
    description: ENTITY_DESCRIPTION,
    email: CONTACT_EMAIL,
    foundingDate: "2025",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ahmedabad",
      addressRegion: "Gujarat",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: CONTACT_EMAIL,
      url: ORIGIN + "/contact",
      areaServed: AREA_SERVED.slice(),
      availableLanguage: ["English"],
    },
    areaServed: AREA_SERVED.map((code) => ({
      "@type": "Country",
      name: COUNTRY_NAME[code] || code,
    })),
    knowsAbout: KNOWS_ABOUT.slice(),
    sameAs: SAME_AS.slice(),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "KRIVA software development services",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Dispatch CRM & TMS development", url: ORIGIN + "/solutions/trucking-logistics" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "B2B SaaS product design", url: ORIGIN + "/solutions/saas" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "QuickBooks & Xero integrations", url: ORIGIN + "/solutions/accounting-integrations" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Auto transport software", url: ORIGIN + "/solutions/car-transportation" } },
      ],
    },
  };
}

function website() {
  return {
    "@type": "WebSite",
    "@id": WEB_ID,
    name: "KRIVA Technologies",
    url: ORIGIN,
    inLanguage: ["en", "en-US", "en-GB", "en-AE", "en-CA", "en-AU"],
    publisher: { "@id": ORG_ID },
    about: { "@id": ORG_ID },
    description: ENTITY_DESCRIPTION,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".lede", ".eyebrow"],
    },
  };
}

function serviceNode({ name, description, url, areaServed }) {
  const regions = areaServed && areaServed.length ? areaServed : AREA_SERVED;
  return {
    "@type": "Service",
    "@id": url + "#service",
    name: String(name || "").replace(/[.]+$/, ""),
    serviceType: "Custom software development",
    provider: { "@id": ORG_ID },
    areaServed: regions.slice(),
    description,
    url,
  };
}

function faqPage(faqs, id) {
  return {
    "@type": "FAQPage",
    "@id": id,
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function blogPosting({ headline, datePublished, url, description }) {
  const node = {
    "@type": "BlogPosting",
    headline,
    datePublished,
    dateModified: datePublished,
    image: ORIGIN + "/brand/og-default.png",
    inLanguage: "en",
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
  };
  if (description) node.description = description;
  return node;
}

function articleNode({ headline, url, description, aboutUrl }) {
  const node = {
    "@type": "CreativeWork",
    genre: "Case study",
    headline,
    url,
    image: ORIGIN + "/brand/og-default.png",
    inLanguage: "en",
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    about: { "@id": aboutUrl + "#service" },
  };
  if (description) node.description = description;
  return node;
}

function breadcrumbList(routePath) {
  const parts = routePath.split("/").filter(Boolean);
  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: ORIGIN + "/",
    },
  ];
  let acc = "";
  parts.forEach((seg, i) => {
    acc += "/" + seg;
    items.push({
      "@type": "ListItem",
      position: i + 2,
      name: CRUMB_NAME[seg] || seg.replace(/-/g, " "),
      item: ORIGIN + acc,
    });
  });
  return {
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

function pageKind(routePath) {
  if (routePath === "/") return "home";
  if (routePath === "/markets" || /^\/markets\//.test(routePath)) return "market";
  if (routePath === "/faq") return "faq";
  if (/^\/services\/.+/.test(routePath)) return "service";
  if (/^\/solutions\/.+/.test(routePath)) return "solution";
  if (/^\/insights\/.+/.test(routePath)) return "insight";
  if (/^\/work\/.+/.test(routePath)) return "work";
  return "page";
}

function graphForPage({ path, url, h1, description, faqs, datePublished }) {
  const kind = pageKind(path);
  const nodes = [organization(), website()];
  if (kind !== "home") nodes.push(breadcrumbList(path));
  if (faqs && faqs.length) {
    nodes.push(faqPage(faqs, (kind === "home" ? ORIGIN + "/" : url) + "#faq"));
  }
  if (kind === "service" || kind === "solution" || kind === "market") {
    nodes.push(
      serviceNode({
        name: h1,
        description,
        url,
        areaServed: areaServedForPath(path),
      })
    );
  }
  if (kind === "insight") {
    nodes.push(
      blogPosting({
        headline: h1,
        datePublished,
        url,
        description,
      })
    );
  }
  if (kind === "work") {
    const aboutUrl = ORIGIN + (WORK_ABOUT[path] || "/services");
    nodes.push(
      articleNode({
        headline: h1,
        url,
        description,
        aboutUrl,
      })
    );
  }
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}

function jsonLdScript(graph) {
  return (
    '<script type="application/ld+json">\n' +
    JSON.stringify(graph, null, 2) +
    "\n</script>"
  );
}

/** Facts approved for public structured data. Anything else stays a TODO. */
const ORG_SAME_AS = [
  "https://www.instagram.com/kriva_technology/",
  "https://www.linkedin.com/company/kriva-technologies",
];

function organizationFact() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: "KRIVA Technologies",
    url: ORIGIN,
    email: CONTACT_EMAIL,
    foundingDate: "2025",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ahmedabad",
      addressRegion: "Gujarat",
      addressCountry: "IN",
    },
    areaServed: AREA_SERVED.map((code) => ({ "@type": "Country", name: COUNTRY_NAME[code] || code })),
    sameAs: ORG_SAME_AS.slice(),
  };
}

function breadcrumbFromRoute(route) {
  if (!route || route === "/") return null;
  const labels = require("../content/page-labels.cjs");
  const parts = route.split("/").filter(Boolean);
  const items = [{ "@type": "ListItem", position: 1, name: "Home", item: ORIGIN + "/" }];
  let acc = "";
  parts.forEach((part, index) => {
    acc += "/" + part;
    const name = labels[acc] || CRUMB_NAME[part] || part.replace(/-/g, " ");
    items.push({
      "@type": "ListItem",
      position: index + 2,
      name,
      item: ORIGIN + acc,
    });
  });
  return {
    "@type": "BreadcrumbList",
    "@id": ORIGIN + route + "#breadcrumb",
    itemListElement: items,
  };
}

function articleFact({ headline, datePublished, dateModified, image, url }) {
  return {
    "@type": "Article",
    "@id": url + "#article",
    headline,
    datePublished,
    dateModified,
    image,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: url,
  };
}

/** One graph: Organization, plus FAQ, Article, and BreadcrumbList when the page has them. */
function structuredDataGraph({ route, faqs, article }) {
  const nodes = [organizationFact()];
  const crumbs = breadcrumbFromRoute(route);
  if (crumbs) nodes.push(crumbs);
  if (faqs && faqs.length) nodes.push(faqPage(faqs, ORIGIN + route + "#faq"));
  if (article && article.headline) {
    nodes.push(articleFact({
      headline: article.headline,
      datePublished: article.datePublished,
      dateModified: article.dateModified || article.datePublished,
      image: article.image,
      url: ORIGIN + route,
    }));
  }
  return { "@context": "https://schema.org", "@graph": nodes };
}

module.exports = {
  ORG_ID,
  WEB_ID,
  WORK_ABOUT,
  areaServedForPath,
  organization,
  website,
  serviceNode,
  faqPage,
  blogPosting,
  articleNode,
  breadcrumbList,
  pageKind,
  graphForPage,
  jsonLdScript,
  ORG_SAME_AS,
  organizationFact,
  breadcrumbFromRoute,
  articleFact,
  structuredDataGraph,
};
