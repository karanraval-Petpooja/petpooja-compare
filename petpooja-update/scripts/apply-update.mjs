#!/usr/bin/env node
// Petpooja Compare — Marketing MOJO AI + Invoice competitors + after-Oct pricing
// Safe, idempotent in-place patcher. Edits YOUR existing src/PetpoojaCompareFull.jsx.
// Usage:  node scripts/apply-update.mjs [path-to-PetpoojaCompareFull.jsx]
import fs from "node:fs";
import path from "node:path";

const candidates = [
  process.argv[2],
  "src/PetpoojaCompareFull.jsx",
  "petpooja-test/src/PetpoojaCompareFull.jsx",
  "PetpoojaCompareFull.jsx",
].filter(Boolean);

const file = candidates.find((p) => fs.existsSync(p));
if (!file) {
  console.error("❌ Could not find PetpoojaCompareFull.jsx.");
  console.error("   Run from your project root, or pass the path:");
  console.error("   node scripts/apply-update.mjs src/PetpoojaCompareFull.jsx");
  process.exit(1);
}

let src = fs.readFileSync(file, "utf8");
const original = src;
fs.writeFileSync(file + ".bak", src); // backup
const log = [];

function replaceOnce(label, find, repl, { skipIf } = {}) {
  if (skipIf && src.includes(skipIf)) { log.push(`• ${label}: already applied, skipped`); return; }
  const i = src.indexOf(find);
  if (i === -1) { log.push(`⚠ ${label}: pattern NOT found — apply this one by hand`); return; }
  if (src.indexOf(find, i + 1) !== -1) { log.push(`⚠ ${label}: pattern found MORE THAN ONCE — skipped for safety, do by hand`); return; }
  src = src.slice(0, i) + repl + src.slice(i + find.length);
  log.push(`✓ ${label}: applied`);
}

/* ---------- M-1: MOJO AI feature group ---------- */
replaceOnce(
  "M-1 MOJO AI group",
  `  marketing: [\n    { key: "acquire", title: "Acquire New Customers",`,
  `  marketing: [\n    { key: "ai", title: "AI Assistant", rows: [["mojoAI", "MOJO AI — ask your business questions (e.g. how many customers retained last month)"]] },\n    { key: "acquire", title: "Acquire New Customers",`,
  { skipIf: `["mojoAI"` }
);

/* ---------- M-2a: mktDefault override ---------- */
replaceOnce(
  "M-2a mktDefault",
  `trm: N, waba: P });`,
  `trm: N, waba: P, mojoAI: N });`,
  { skipIf: `waba: P, mojoAI: N });` }
);

/* ---------- M-2b: mktComp helper override ---------- */
replaceOnce(
  "M-2b mktComp",
  `digitalDisplay: N, trm: N, waba: P, ...over }`,
  `digitalDisplay: N, trm: N, waba: P, mojoAI: N, ...over }`,
  { skipIf: `waba: P, mojoAI: N, ...over }` }
);

/* ---------- I-3: add 3 invoice competitors ---------- */
replaceOnce(
  "I-3 invoice competitors",
  `  logicerp: invC("Logic ERP", "Manufacturing & retail ERP", "Manufacturing & retail", "Custom pricing", { loyalty: Y, hoWarehouse: Y }, "https://www.logicerp.com"),\n};`,
  `  logicerp: invC("Logic ERP", "Manufacturing & retail ERP", "Manufacturing & retail", "Custom pricing", { loyalty: Y, hoWarehouse: Y }, "https://www.logicerp.com"),\n  khatabook: invC("Khatabook", "Digital ledger + billing app", "Small shops & kirana", "Free · Premium ~₹156/mo", { hoWarehouse: N, multiUser: P, loyalty: N, shopify: N, websiteIntg: N, edc: N, tallyIntg: N, barcode: P }, "https://khatabook.com", false),\n  gogst: invC("GoGST Bill", "GST billing + inventory", "Retailers, wholesalers & manufacturers", "Free · Premium from ₹1,499/yr", { hoWarehouse: P, multiUser: Y, loyalty: N, shopify: N, websiteIntg: N, edc: N, tallyIntg: N, barcode: Y }, "https://gogstbill.com", false),\n  alignbooks: invC("AlignBooks", "Cloud accounting & inventory ERP", "MSMEs needing full accounting", "From ₹10,000 / yr (on request)", { hoWarehouse: Y, multiUser: Y, loyalty: P, shopify: P, websiteIntg: P, edc: P, tallyIntg: P, barcode: Y }, "https://www.alignbooks.com"),\n};`,
  { skipIf: `khatabook: invC(` }
);

/* ---------- I-4: add competitor pricing plans ---------- */
replaceOnce(
  "I-4 INV_PLANS entries",
  `  logicerp: [{ id: "std", name: "Standard", def: true, price: "Custom pricing", custom: true, note: "ERP for manufacturing & retail." }],\n};`,
  `  logicerp: [{ id: "std", name: "Standard", def: true, price: "Custom pricing", custom: true, note: "ERP for manufacturing & retail." }],\n  khatabook: [\n    { id: "free", name: "Free", def: true, price: "Free", note: "Digital ledger + basic GST billing on mobile.", rate: () => 0 },\n    { id: "premium", name: "Premium", price: "≈ ₹156 / mo", note: "Adds invoice customisation, payment reminders and more.", rate: () => 156 },\n  ],\n  gogst: [\n    { id: "free", name: "Free (Lifetime)", def: true, price: "Free", note: "Unlimited GST invoices, basic inventory & reports.", rate: () => 0 },\n    { id: "premium", name: "Premium", price: "From ₹1,499 / yr", note: "Adds staff accounts, expenses, e-way bill, more reports.", rate: () => Math.round(1499 / 12) },\n  ],\n  alignbooks: [\n    { id: "ultima", name: "Ultima", def: true, price: "From ₹10,000 (on request)", custom: true, note: "5 users, 5 branches, 9 modules — accounting, inventory, POS, HR/Payroll." },\n    { id: "erp", name: "ERP", price: "Price on request", custom: true, note: "10 users, 10 branches, adds CRM & custom integrations." },\n    { id: "enterprise", name: "Enterprise", price: "Price on request", custom: true, note: "50 users, 25 branches, full ERP." },\n  ],\n};`,
  { skipIf: `  khatabook: [\n    { id: "free"` }
);

fs.writeFileSync(file, src);

console.log(`\nPatched: ${file}`);
console.log(`Backup : ${file}.bak\n`);
console.log(log.join("\n"));

const warns = log.filter((l) => l.startsWith("⚠"));
console.log("\n----------------------------------------");
if (src === original) {
  console.log("No changes written (everything already applied, or nothing matched).");
} else {
  console.log("Done. Review the file, then: git add . && git commit && git push");
}
if (warns.length) {
  console.log(`\n${warns.length} item(s) need manual attention — see MANUAL-EDITS.md:`);
  console.log("  • I-1 (remove before/after toggle UI) and I-2 (single after-Oct pricing)");
  console.log("    are NOT auto-patched because their exact text varies. Do those two by hand.");
}
console.log("");
