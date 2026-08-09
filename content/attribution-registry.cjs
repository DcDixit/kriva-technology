/**
 * INTERNAL attribution registry — Phase 9.
 * Do not publish unverified person/company bylines.
 * When you confirm an entry, set status + confirmed, then run:
 *   node apply_launch_inputs.cjs --attribution
 *
 * status: pending | confirmed | omit
 */

const attributions = [
  {
    id: "fleetroute-fleetflow",
    conflict: "FleetRoute ↔ FleetFlow",
    priority: "P0",
    status: "pending",
    candidate: {
      name: "Marcus Cole",
      role: "VP Operations",
      companies: ["FleetRoute Logistics (US)", "FleetFlow"],
    },
    quote:
      "Handle time dropped by a third and we didn't add a single dispatcher.",
    caseQuote:
      "They delivered a dispatch console our ops team actually enjoys using. Handle time dropped 32% without adding headcount.",
    displayedState:
      "Quote retained; person/company byline withheld as “Client attribution TBD”. Internal note names FleetRoute ↔ FleetFlow.",
    confirmationRequired:
      "Approve publish name, role, and exact company string (FleetRoute Logistics vs FleetFlow vs other), or choose omit (remove quote).",
    applyTargets: [
      {
        file: "kriva-redesign.html",
        section: "Proof — lead quote",
        marker: 'data-attr-id="fleetroute-fleetflow"',
      },
      {
        file: "kriva-case-fleetflow.html",
        section: "Case quote block",
        marker: 'data-attr-id="fleetroute-fleetflow"',
      },
    ],
    confirmed: null,
    // Example when ready:
    // confirmed: { name: "…", role: "…", company: "…", initials: "MC", publishQuote: true }
  },
  {
    id: "flowledger-payrollpro",
    conflict: "FlowLedger ↔ PayrollPro",
    priority: "P0",
    status: "pending",
    candidate: {
      name: "Ravi Mehta",
      role: "Head of Product",
      companies: ["FlowLedger (UK B2B SaaS)", "PayrollPro"],
    },
    quote: "Activation moved within six weeks of the onboarding rebuild going live.",
    displayedState:
      "Quote retained on homepage + PayrollPro case; byline withheld as “Client attribution TBD”. Internal note names FlowLedger ↔ PayrollPro.",
    confirmationRequired:
      "Approve publish name, role, and exact company string (FlowLedger vs PayrollPro vs other), or omit quote.",
    applyTargets: [
      {
        file: "kriva-redesign.html",
        section: "Proof — second quote",
        marker: 'data-attr-id="flowledger-payrollpro"',
      },
      {
        file: "kriva-case-payroll-pro.html",
        section: "Case quote block",
        marker: 'data-attr-id="flowledger-payrollpro"',
      },
      {
        file: "content/cases-data.cjs",
        section: "PayrollPro testimonial object",
        marker: "testimonial (PayrollPro)",
      },
    ],
    confirmed: null,
  },
  {
    id: "meridian-brandlift",
    conflict: "Meridian ↔ BrandLift",
    priority: "P0",
    status: "pending",
    candidate: {
      name: "Anita Desai",
      role: "Founder",
      companies: ["Meridian D2C", "BrandLift"],
    },
    quote: null,
    displayedState:
      "No public quote. BrandLift outcome section shows TBD note only (Meridian ↔ BrandLift inventory link).",
    confirmationRequired:
      "Provide approved quote + name/role/company for BrandLift, or confirm keep omitted forever.",
    applyTargets: [
      {
        file: "kriva-case-brandlift.html",
        section: "Outcome TBD attribution note",
        marker: 'data-attr-id="meridian-brandlift"',
      },
      {
        file: "content/cases-data.cjs",
        section: "BrandLift attributionNote / testimonial",
        marker: "attributionNote (BrandLift)",
      },
      {
        file: "kriva-redesign.html",
        section: "Homepage proof (only if quote approved for homepage)",
        marker: "optional — not currently rendered",
      },
    ],
    confirmed: null,
  },
  {
    id: "carepath-quote",
    conflict: "CarePath quote (homepage)",
    priority: "P0",
    status: "pending",
    candidate: {
      name: "Tom Ashworth",
      role: "CTO",
      companies: ["CarePath Health"],
    },
    quote: "One team designing and building meant nothing was lost in translation.",
    displayedState:
      "Quote retained on homepage; byline withheld as “Client attribution TBD”. Not tied to a published case URL.",
    confirmationRequired:
      "Approve publish name/role/company, or omit quote. Confirm whether any case study should link.",
    applyTargets: [
      {
        file: "kriva-redesign.html",
        section: "Proof — third quote",
        marker: 'data-attr-id="carepath-quote"',
      },
    ],
    confirmed: null,
  },
];

function byId(id) {
  return attributions.find((a) => a.id === id) || null;
}

function pending() {
  return attributions.filter((a) => a.status === "pending");
}

module.exports = { attributions, byId, pending };
