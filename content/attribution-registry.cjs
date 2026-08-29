/**
 * INTERNAL attribution registry: launch final.
 * All entries omitted until client confirms name/role/company in writing.
 */

const attributions = [
  {
    id: "fleetroute-fleetflow",
    conflict: "FleetRoute ↔ FleetFlow",
    priority: "P0",
    status: "omit",
    confirmed: { publishQuote: false },
    applyTargets: [
      { file: "kriva-redesign.html", section: "Proof: lead quote" },
      { file: "kriva-case-fleetflow.html", section: "Case quote block" },
    ],
  },
  {
    id: "flowledger-payrollpro",
    conflict: "FlowLedger ↔ PayrollPro",
    priority: "P0",
    status: "omit",
    confirmed: { publishQuote: false },
    applyTargets: [
      { file: "kriva-redesign.html", section: "Proof: second quote" },
      { file: "kriva-case-payroll-pro.html", section: "Case quote block" },
      { file: "content/cases-data.cjs", section: "PayrollPro testimonial" },
    ],
  },
  {
    id: "meridian-brandlift",
    conflict: "Meridian ↔ BrandLift",
    priority: "P0",
    status: "omit",
    confirmed: { publishQuote: false },
    applyTargets: [
      { file: "kriva-case-brandlift.html", section: "Outcome attribution note" },
    ],
  },
  {
    id: "carepath-quote",
    conflict: "CarePath quote (homepage)",
    priority: "P0",
    status: "omit",
    confirmed: { publishQuote: false },
    applyTargets: [{ file: "kriva-redesign.html", section: "Proof: third quote" }],
  },
];

function byId(id) {
  return attributions.find((a) => a.id === id) || null;
}

function pending() {
  return attributions.filter((a) => a.status === "pending");
}

module.exports = { attributions, byId, pending };
