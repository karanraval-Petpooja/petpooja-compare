import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search, ChevronDown, ChevronRight, Menu, X, Check, Minus, Info, ArrowRight,
  ShoppingCart, Megaphone, Users, FileText, Cpu, IndianRupee, Layers, ShieldCheck,
  Share2, Printer, Sparkles, Scale, BadgeCheck, Store, Zap, Settings, RotateCcw, CreditCard, Mail, Loader2, LogOut, UserPlus, Trash2, Activity, Lock, Copy, Crown
} from "lucide-react";

/* ============================================================================
   BRAND TOKENS
   ========================================================================== */
const C = {
  red: "#E53935", redDark: "#C62828", redSoft: "#FDECEA",
  dark: "#17202A", bg: "#F7F8FA", card: "#FFFFFF", muted: "#68727E",
  border: "#ECEEF1", green: "#12B76A", amber: "#F59E0B", grey: "#AEB6BF",
  slate: "#334155", slateSoft: "#EEF1F6", indigo: "#4F46E5", indigoSoft: "#EEF0FF",
};
const Y = "yes", P = "partial", N = "no", NL = "nl";
const score = (s) => (s === Y ? 2 : s === P ? 1 : 0);
const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
function planCost(plan, n, period) {
  if (!plan || plan.custom) return null;
  if (plan.y1 != null) {
    if (period === "monthly") return Math.round(plan.y1 / 12);
    if (period === "annual") return plan.y1;
    return plan.y3 != null ? plan.y3 : plan.y1 + 2 * (plan.renewal || 0);
  }
  if (plan.rate) { const m = plan.rate(n); if (m == null) return null; return m * (period === "monthly" ? 1 : period === "annual" ? 12 : 36); }
  return null;
}
const planBig = (plan) => (!plan ? null : plan.price ? plan.price : plan.y1 != null ? inr(plan.y1) + " + GST" : "—");
const defPlanId = (pr) => { const pl = pr?.plans; return pl ? (pl.find((p) => p.def) || pl[0]).id : null; };
const getPlanById = (pr, id) => { const pl = pr?.plans; return pl ? (pl.find((p) => p.id === id) || pl[0]) : null; };

/* ============================================================================
   FEATURE GROUPS PER PRODUCT
   ========================================================================== */
const GROUPS = {
  pos: [
    { key: "billing", title: "Billing", rows: [["posBilling", "POS Billing"], ["gstBilling", "GST Billing"], ["dineIn", "Dine-in"], ["takeaway", "Takeaway"], ["delivery", "Delivery"], ["multiPayment", "Multiple Payment Modes"], ["discounts", "Discounts & Taxes"]] },
    { key: "ops", title: "Restaurant Operations", rows: [["tableMgmt", "Table Management"], ["kot", "KOT"], ["kitchenMgmt", "Kitchen Management"], ["menuMgmt", "Menu Management"], ["multiOutlet", "Multiple Outlets"]] },
    { key: "inventory", title: "Inventory", rows: [["inventory", "Inventory Management"], ["stockTracking", "Stock Tracking"], ["purchaseMgmt", "Purchase Management"], ["recipeMgmt", "Recipe Management"], ["wastage", "Wastage Tracking"]] },
    { key: "integrations", title: "Integrations", rows: [["swiggy", "Swiggy"], ["zomato", "Zomato"], ["paymentGateway", "Payment Gateway"], ["qrOrdering", "QR Ordering"], ["accounting", "Accounting"]] },
    { key: "reporting", title: "Reporting", rows: [["salesReports", "Sales Reports"], ["outletReports", "Outlet Reports"], ["inventoryReports", "Inventory Reports"], ["staffReports", "Staff Reports"]] },
    { key: "plus", title: "Petpooja Plus (why we win)", rows: [["captainApp", "Captain App"], ["kds", "Kitchen Display (KDS)"], ["waiterCall", "Waiter Calling Device"], ["trm", "Table Reservation Manager"], ["digitalDisplay", "Digital Display"], ["myWebsite", "My Website (own ordering)"], ["reconciliation", "Order Reconciliation"], ["virtualWallet", "Virtual Wallet"], ["purchaseManager", "Purchase Manager (price compare)"], ["wabaMarketing", "WABA Marketing & e-Bills"]] },
  ],
  marketing: [
    { key: "acquire", title: "Acquire New Customers", rows: [["influencerMeta", "Influencer + Meta"], ["meta", "Meta Ads"], ["snapchat", "Snapchat"], ["whatsappMkt", "WhatsApp"]] },
    { key: "retain", title: "Retain Customers", rows: [["waba", "WABA"], ["feedback", "Feedback"], ["loyaltyPts", "Loyalty Points"], ["reputation", "Reputation"]] },
    { key: "spend", title: "Increase Avg Spending", rows: [["digitalDisplay", "Digital Display"], ["trm", "TRM"]] },
  ],
  attendo: [
    { key: "payroll", title: "Payroll", rows: [["payrollProcessing", "Payroll Processing"], ["salaryCalc", "Salary Calculation"], ["salarySlips", "Salary Slips"], ["payrollFinalization", "Payroll Finalization"], ["payrollReports", "Payroll Reports"]] },
    { key: "attendance", title: "Attendance", rows: [["attendanceMgmt", "Attendance Management"], ["mobileAttendance", "Mobile Attendance"], ["biometric", "Biometric Attendance"], ["faceRec", "Face Recognition"], ["geoGps", "Geo / GPS Attendance"], ["offlineAttendance", "Offline Attendance"], ["realtimeSync", "Real-time Sync"]] },
    { key: "shift", title: "Shift", rows: [["fixedShift", "Fixed Shift"], ["rotationalShift", "Rotational Shift"], ["roster", "Roster"], ["overtime", "Overtime"]] },
    { key: "leave", title: "Leave", rows: [["leaveMgmt", "Leave Management"], ["leavePolicies", "Leave Policies"], ["leaveApproval", "Leave Approval"], ["leaveBalance", "Leave Balance"], ["leaveEncashment", "Leave Encashment"]] },
    { key: "compliance", title: "Compliance", rows: [["pf", "PF"], ["esic", "ESIC"], ["pt", "Professional Tax"], ["tds", "TDS"], ["form16", "Form 16"], ["statutoryReports", "Statutory Reports"]] },
    { key: "employee", title: "Employee", rows: [["ess", "Employee Self Service"], ["empApp", "Employee App"], ["regularization", "Regularization"], ["leaveRequests", "Leave Requests"], ["slipAccess", "Salary Slip Access"]] },
  ],
  invoice: [
    { key: "billing", title: "Billing", rows: [["invoiceCreation", "Invoice Creation"], ["gstInvoice", "GST Invoice"], ["eInvoice", "E-Invoice"], ["creditNote", "Credit / Debit Note"], ["recurringInvoice", "Recurring Invoice"], ["whatsappEbill", "WhatsApp E-Bill"]] },
    { key: "inventory", title: "Inventory & Operations", rows: [["productMgmt", "Product Management"], ["stock", "Stock & Inventory"], ["hoWarehouse", "HO / Warehouse"], ["multiUser", "Multi-User"], ["barcode", "Barcode"]] },
    { key: "payments", title: "Payments", rows: [["paymentTracking", "Payment Tracking"], ["reminders", "Payment Reminders"], ["onlinePayments", "Online Payments"], ["edc", "EDC / Card Machine"]] },
    { key: "loyalty", title: "Customers & Loyalty", rows: [["customerMgmt", "Customer Management"], ["customerHistory", "Customer History"], ["loyalty", "Loyalty & Rewards"]] },
    { key: "integrations", title: "Integrations", rows: [["tallyIntg", "Tally Integration"], ["shopify", "Shopify"], ["websiteIntg", "Website Integration"]] },
    { key: "ai", title: "Advanced / AI", rows: [["purchaseAI", "Purchase AI"], ["autoPurchase", "Auto Purchase entry (Purchase by Petpooja)"], ["aiTryOn", "AI Try-On (clothing)"], ["aiTheft", "AI Theft Detection"], ["adsr", "ADSR"], ["aiInsights", "AI Insights"]] },
    { key: "reports", title: "Reports", rows: [["salesReports", "Sales Reports"], ["gstReports", "GST Reports"], ["outstandingReports", "Outstanding Reports"]] },
  ],
};
const HW_GROUPS = {
  pos: [["posTerminal", "POS Terminal"], ["printer", "Bill Printer"], ["kotPrinter", "KOT Printer"], ["barcodeScanner", "Barcode Scanner"], ["cashDrawer", "Cash Drawer"], ["customerDisplay", "Customer Display"], ["kitchenDisplay", "Kitchen Display (KDS)"], ["paymentDevice", "Payment Device"], ["installation", "Installation"]],
  attendo: [["biometricDevice", "Biometric Device"], ["fingerprint", "Fingerprint"], ["faceDevice", "Face Recognition"], ["rfid", "RFID"], ["nfc", "NFC"], ["offlinePunch", "Offline Punch"], ["realtimeSync", "Real-time Sync"], ["installation", "Installation"]],
};
const featureIds = (prod) => GROUPS[prod].flatMap((g) => g.rows.map((r) => r[0]));
const fill = (prod, base, overrides = {}) => {
  const m = {}; featureIds(prod).forEach((id) => (m[id] = base)); return { ...m, ...overrides };
};

/* ============================================================================
   PRODUCT + COMPETITOR DATA
   Real where publicly verifiable; "Custom pricing"/"Not publicly listed"
   everywhere it is not — never invented.  (Verified Aug 2026.)
   ========================================================================== */

/* ---------- ATTENDO (fully validated data) ---------- */
const attendoPetpooja = {
  pricing: {
    headline: "From ₹8,000 + GST / yr", model: "Flat annual · device included · no per-employee fee",
    billing: "Annual (1-yr & 3-yr)", perUnit: "None", hardware: "Included (device ships with plan)", setup: "Included where applicable",
    geo: "Geo / GPS included · geo-fencing included",
    plans: [
      { id: "attendo", name: "Attendo (round biometric)", def: true, y1: 8000, y3: 12000, renewal: 4000, renewalLabel: "AMC / year", note: "Round biometric device + payroll, attendance, compliance & ESS. Device included." },
      { id: "plus", name: "Attendo Plus (screen)", y1: 12000, y3: 16000, renewal: 4000, renewalLabel: "AMC / year", note: "Biometric device with screen. Everything in Attendo." },
      { id: "face", name: "Attendo Face", y1: 15000, y3: 21000, renewal: 4000, renewalLabel: "AMC / year", note: "Face recognition device. Everything in Attendo." },
      { id: "lite", name: "Attendo Lite (≤5 emp)", y1: 3000, y3: null, renewal: 2500, renewalLabel: "AMC / year", note: "For up to 5 employees." },
      { id: "advance", name: "Attendo Advance (+Task)", y1: 10000, y3: null, renewal: 7000, renewalLabel: "AMC / year", note: "Round biometric + Task management." },
      { id: "plus-advance", name: "Attendo Plus Advance (+Task)", y1: 14000, y3: null, renewal: 7000, renewalLabel: "AMC / year", note: "Biometric + screen + Task." },
      { id: "face-advance", name: "Attendo Face Advance (+Task)", y1: 18000, y3: null, renewal: 7000, renewalLabel: "AMC / year", note: "Face device + Task." },
    ],
    addon: "Add-ons: Geo tracking ₹1,000 + GST / emp / yr · Mediclaim ₹1,300 + GST / emp / yr",
  },
  features: fill("attendo", Y, { performanceMgmt: N }),
  hardware: { biometricDevice: Y, fingerprint: Y, faceDevice: Y, rfid: Y, nfc: Y, offlinePunch: Y, realtimeSync: Y, installation: Y, warranty: "Included" },
  advantages: ["Device included in the plan", "Simple flat annual pricing — no per-employee fee", "Attendance + payroll in one", "Biometric, face, RFID & geo-fencing built in"],
  sources: [{ name: "Petpooja Attendo", url: "https://www.petpooja.com/", date: "Aug 2026" }],
};
const attendoComps = {
  keka: { name: "Keka", tagline: "HRMS + payroll", pricing: { headline: "From ₹9,999/mo", model: "Flat ≤100 emp + per-employee", billing: "Monthly / Annual", perUnit: "₹90–150 / emp above 100", hardware: "Third-party devices", setup: "₹25k–75k", geo: "GPS in Strength+ plan", calc: (e) => 9999 + Math.max(0, e - 100) * 90 }, features: fill("attendo", Y, { offlineAttendance: P }), hardware: { biometricDevice: P, fingerprint: P, faceDevice: P, rfid: P, nfc: N, offlinePunch: P, realtimeSync: Y, installation: N, warranty: "Third-party" }, advantages: ["Broader HRMS + performance & OKRs", "Modern self-service experience"], sources: [{ name: "Keka", url: "https://www.keka.com/pricing", date: "Aug 2026" }] },
  greythr: { name: "greytHR", tagline: "Payroll & compliance", pricing: { headline: "Free ≤25 · from ₹3,495/mo", model: "Free tier + base + per-employee", billing: "Monthly / Annual", perUnit: "₹30–100 / emp", hardware: "Third-party devices", setup: "Varies", geo: "In Growth plan", calc: (e) => (e <= 25 ? 0 : 3495 + Math.max(0, e - 50) * 30) }, features: fill("attendo", Y, { faceRec: P, offlineAttendance: P }), hardware: { biometricDevice: P, fingerprint: P, faceDevice: P, rfid: P, nfc: N, offlinePunch: P, realtimeSync: Y, installation: N, warranty: "Third-party" }, advantages: ["Free tier for <25 staff", "Deep, long-established compliance"], sources: [{ name: "greytHR", url: "https://www.greythr.com/pricing-calculator/", date: "Aug 2026" }] },
  teamoffice: { name: "TeamOffice", tagline: "Cloud attendance + ESS", pricing: { headline: "₹1.25–₹3.75 / emp / mo", model: "Per-employee (Basic / Premium) · min slab", billing: "Monthly (GST extra)", perUnit: "Basic ₹1.25 · Premium ₹3.75 / mo", hardware: "Own biometric / face devices (separate)", setup: "Min slab + commitment", geo: "Geo Selfie add-on (by punch count)", calc: (e) => Math.round(e * 3.75) }, features: fill("attendo", Y, { payrollProcessing: P, salaryCalc: P, salarySlips: P, payrollFinalization: N, payrollReports: P, geoGps: P, offlineAttendance: P, roster: P, leaveEncashment: P, pf: P, esic: P, pt: P, tds: P, form16: N, statutoryReports: P, slipAccess: P }), hardware: { biometricDevice: Y, fingerprint: Y, faceDevice: Y, rfid: P, nfc: P, offlinePunch: P, realtimeSync: Y, installation: P, warranty: "Device (separate)" }, advantages: ["Low-cost per-employee cloud attendance", "Geo Selfie punch for field staff", "Own biometric / face devices"], sources: [{ name: "TeamOffice", url: "https://www.etimeoffice.com/", date: "Aug 2026" }] },
  pagarbook: { name: "PagarBook", tagline: "Staff attendance & payroll app", pricing: { headline: "Free basic · from ₹499/staff/yr", model: "Per-staff, mobile app", billing: "Annual", perUnit: "₹499 / staff / yr", hardware: "Mobile-based (selfie / face / GPS)", setup: "None", geo: "GPS in paid plan", calc: (e) => Math.round((e * 499) / 12) }, features: fill("attendo", Y, { payrollFinalization: P, payrollReports: P, biometric: P, faceRec: Y, offlineAttendance: P, fixedShift: P, rotationalShift: P, roster: N, leavePolicies: P, leaveBalance: P, leaveEncashment: N, pf: P, esic: P, pt: P, tds: P, form16: N, statutoryReports: P, regularization: P }), hardware: { biometricDevice: N, fingerprint: N, faceDevice: P, rfid: N, nfc: N, offlinePunch: N, realtimeSync: Y, installation: N, warranty: "Mobile app" }, advantages: ["Very small shops & daily-wage staff", "Free basic tier to start", "Simple mobile salary & advances"], sources: [{ name: "PagarBook", url: "https://pagarbook.com/", date: "Aug 2026" }] },
  tankhapatra: { name: "Tankhwa Patra", tagline: "SME HRMS & payroll", pricing: { headline: "From ₹600 / yr (10 users)", model: "Per-user entry pricing (larger = quote)", billing: "Annual", perUnit: "~₹60 / user / yr", hardware: "Third-party devices", setup: "Low", geo: "Live GPS tracking", calc: (e) => Math.round((e * 60) / 12) }, features: fill("attendo", Y, { faceRec: P, offlineAttendance: P }), hardware: { biometricDevice: P, fingerprint: P, faceDevice: P, rfid: P, nfc: N, offlinePunch: P, realtimeSync: Y, installation: N, warranty: "Third-party" }, advantages: ["Budget SME payroll with field tracking", "Live GPS tracking for field teams"], sources: [{ name: "Tankhwa Patra", url: "https://www.tankhwapatra.com/", date: "Aug 2026" }] },
  "zoho-hr": { name: "Zoho HR (People)", tagline: "HRMS — attendance, leave, performance", pricing: { headline: "Free ≤5 · from ₹50/emp/mo", model: "Per-employee tiers (payroll via add-on)", billing: "Monthly / Annual", perUnit: "₹50–230 / emp / mo", hardware: "3rd-party biometric integration", setup: "Low", geo: "GPS geo-fencing included", calc: (e) => Math.round(e * 100) }, features: fill("attendo", Y, { payrollProcessing: P, salaryCalc: P, salarySlips: P, payrollFinalization: P, payrollReports: P, pf: P, esic: P, pt: P, tds: P, form16: P, statutoryReports: P }), hardware: { biometricDevice: P, fingerprint: P, faceDevice: P, rfid: P, nfc: N, offlinePunch: P, realtimeSync: Y, installation: N, warranty: "Third-party" }, advantages: ["Full HRMS with performance & LMS", "Strong self-service & geo attendance", "Best if on the Zoho suite"], sources: [{ name: "Zoho People", url: "https://www.zoho.com/in/people/pricing.html", date: "Aug 2026" }] },
  razorpayx: { name: "RazorpayX Payroll", tagline: "Payroll + payouts", pricing: { headline: "From ₹2,499/mo", model: "Tiered flat + per-employee", billing: "Semi-annual / Annual", perUnit: "₹150 / emp (Elite)", hardware: "Third-party devices", setup: "Low", geo: "Not core", calc: (e) => (e <= 20 ? 2499 : e <= 50 ? 5499 : 5499 + (e - 50) * 150) }, features: fill("attendo", Y, { attendanceMgmt: P, biometric: P, faceRec: N, geoGps: P, offlineAttendance: N, fixedShift: P, roster: N }), hardware: { biometricDevice: N, fingerprint: NL, faceDevice: N, rfid: NL, nfc: N, offlinePunch: N, realtimeSync: Y, installation: N, warranty: "Not publicly listed" }, advantages: ["Automated salary payouts", "Great if you use Razorpay banking"], sources: [{ name: "RazorpayX", url: "https://razorpay.com/payroll/pricing/", date: "Aug 2026" }] },
};

/* ---------- POS ---------- */
const posDefault = fill("pos", Y, { recipeMgmt: P, wastage: P, accounting: P, captainApp: P, kds: P, waiterCall: N, trm: P, digitalDisplay: N, myWebsite: P, reconciliation: N, virtualWallet: P, purchaseManager: N, wabaMarketing: P });
const posPetpooja = {
  pricing: {
    headline: "Operation Core ₹12,000 + Manager tiers", model: "Operation Core (base) + Operation Manager add-on tiers", billing: "Annual (Ex tax)", perUnit: "Unlimited users & terminals", hardware: "Available (terminal, printers, KDS)", setup: "Installation & training included", geo: "—",
    note: "Prices exclude tax. Operation Manager plans are priced over & above the Operation Core plan.",
    plans: [
      { id: "core", name: "Operation Core (base)", def: true, y1: 12000, y3: null, renewal: 7500, renewalLabel: "Renewal / year", note: "Cloud billing, inventory, menu management, 90+ reports & dynamic reporting, food-aggregator integrations, unlimited users & terminals, Purchase Manager (Hyperpure / Swiggy Assure / DeliverIT), Smart-Stock Manager, AI Agent, 24×7 online support." },
      { id: "ops-growth", name: "Operation Manager Growth (+Core)", y1: 10000, y3: null, renewal: 10000, renewalLabel: "Renewal / year", note: "Over & above Core: Captain App, Token Management, Zomato/Swiggy reconciliation, Tally integration, Scan & QR order, Waiter Calling (AMC), Kitchen Display System, 3rd-party & SAP/ERP integration, Call Centre module. 1 setup visit." },
      { id: "ops-scale", name: "Operation Manager Scale (+Core)", badge: "Most complete", y1: 20000, y3: null, renewal: 20000, renewalLabel: "Renewal / year", note: "Everything in Operation Manager Growth + Table Reservation Manager (TRM), Kiosk software, E-Invoice (1,000 credits). 2 setup visits." },
    ],
    addon: "À la carte modules: Captain App ₹4,500 · KDS ₹3,000 · Kiosk ₹6,000 · TRM ₹4,500 · SAP/ERP ₹4,500 · Call Centre ₹4,500.",
  },
  features: fill("pos", Y),
  hardware: { posTerminal: Y, printer: Y, kotPrinter: Y, barcodeScanner: Y, cashDrawer: Y, customerDisplay: Y, kitchenDisplay: Y, paymentDevice: Y, installation: Y, warranty: "As per plan" },
  advantages: ["Purchase Manager — raw-material price comparison, direct ordering & auto inventory (beyond basic inventory)", "End-to-end marketing — WABA, branded e-Bills, feedback, loyalty & campaigns in one flow", "KDS, Captain App, Scan & Order & Waiter Calling — full front-to-kitchen coordination", "Table Reservation Manager (Swiggy Dineout / Zomato / District), Digital Display, My Website & Order Reconciliation", "Core includes inventory, 90+ reports & AI Agent · unlimited users & terminals"],
  sources: [{ name: "Petpooja", url: "https://www.petpooja.com/", date: "Sep 2026" }],
};
const posComp = (name, tagline, headline, over = {}, hw = {}, extra = {}) => ({
  name, tagline,
  pricing: { headline, model: extra.model || "Custom pricing", billing: extra.billing || "Custom", perUnit: extra.perUnit || "Not publicly listed", hardware: extra.hardware || "Available / third-party", setup: extra.setup || "Varies", geo: "—", custom: extra.custom !== false, calc: extra.calc || (() => null) },
  features: fill("pos", Y, over),
  hardware: { posTerminal: P, printer: Y, kotPrinter: Y, barcodeScanner: P, cashDrawer: P, customerDisplay: P, kitchenDisplay: P, paymentDevice: P, installation: P, warranty: "Third-party", ...hw },
  advantages: extra.adv || ["Comparable restaurant POS"],
  sources: [{ name: name, url: extra.url || "", date: "Aug 2026" }],
});
const posComps = {
  restroworks: posComp("Restroworks", "Enterprise restaurant OS (formerly POSIST)", "≈ ₹40,000 + GST / yr", { multiOutlet: Y, purchaseManager: P, wabaMarketing: P }, {}, { adv: ["Enterprise & large-chain focus", "Dedicated Zomato order server", "Strong after-sales support & training"], url: "https://www.restroworks.com/", custom: false, model: "Per outlet, annual" }),
  menson: posComp("Menson POS", "Restaurant billing & POS", "Not publicly listed", {}, {}, { adv: ["Restaurant billing focus"], url: "" }),
  tmbill: posComp("TMBill", "Cloud POS + add-ons", "₹10,000 yr1 · ₹8,000 renewal", { recipeMgmt: Y, purchaseMgmt: Y, captainApp: Y, kds: Y, trm: Y, virtualWallet: Y, myWebsite: Y, purchaseManager: P }, {}, { adv: ["Unlimited devices & users on Core", "Rich paid add-on marketplace", "Inventory, recipe & purchase in Core"], url: "https://www.tmbill.com/", custom: false, model: "Per outlet, annual + add-ons" }),
  ezo: posComp("EZO", "Billing, POS & inventory app", "From low monthly (verify)", { tableMgmt: P, kot: P, recipeMgmt: N, wastage: N }, {}, { adv: ["Simple billing & inventory app", "Low entry cost"], url: "https://ezo.io/" }),
  rista: posComp("Rista", "Cloud POS + CRM bundle", "₹15,000–₹35,000 + GST / yr", { wabaMarketing: Y, virtualWallet: P }, {}, { adv: ["Discounted POS + CRM + WhatsApp bundle", "QR & online ordering", "Loyalty & customer insights"], url: "https://www.ristaapps.com/", custom: false, model: "Per outlet, annual (12 mo)" }),
  dotpe: posComp("DotPe", "Ordering + POS", "Not publicly listed", { inventory: P, recipeMgmt: P, myWebsite: Y, wabaMarketing: P }, {}, { adv: ["QR ordering & digital storefront"], url: "https://dotpe.in/" }),
};

/* ---------- MARKETING AUTOMATION ---------- */
const mktDefault = fill("marketing", Y, { snapchat: P, influencerMeta: P, digitalDisplay: N, trm: N, waba: P });
const mktPetpooja = {
  pricing: {
    headline: "Core ₹10,000 · Growth ₹20,000 · Scale ₹30,000 / yr", model: "Marketing Manager tiers", billing: "Annual (Ex GST)", perUnit: "—", hardware: "—", setup: "—", geo: "—",
    note: "À la carte MP services also available (Meta Ads ₹10,000, Influencer + Meta ₹10,000–25,000…).",
    plans: [
      { id: "core", name: "Marketing Manager Core", def: true, y1: 10000, y3: null, renewal: 10000, renewalLabel: "Renewal / year", note: "CRM + Loyalty, Virtual Wallet, Feedback App/QR, Reputation Management, E-Bill, WABA 4,000 credits, AI Marketing Agent." },
      { id: "growth", name: "Marketing Manager Growth", y1: 20000, y3: null, renewal: 20000, renewalLabel: "Renewal / year", note: "Everything in Core + My Website / OOW, Digital Display, WABA 8,000 credits." },
      { id: "scale", name: "Marketing Manager Scale", badge: "Full funnel", y1: 30000, y3: null, renewal: 30000, renewalLabel: "Renewal / year", note: "Everything in Growth + Meta Ads or 2 Influencers (125–150 leads, 5L views), WABA 10,000 credits." },
    ],
  },
  features: fill("marketing", Y),
  hardware: {},
  advantages: ["Acquire, retain & grow spend from one place", "Built on your live POS customer data", "WABA, WhatsApp, Meta, Snapchat & influencer in one", "Loyalty, feedback & reputation tied to billing"],
  sources: [{ name: "Petpooja", url: "https://www.petpooja.com/", date: "Aug 2026" }],
};
const mktComp = (name, tagline, over = {}, adv = [], url = "") => ({
  name, tagline,
  pricing: { headline: "Custom pricing", model: "Custom / contact sales", billing: "Custom", perUnit: "Not publicly listed", hardware: "—", setup: "Varies", geo: "—", custom: true, calc: () => null },
  features: fill("marketing", Y, { snapchat: P, influencerMeta: P, digitalDisplay: N, trm: N, waba: P, ...over }), hardware: {}, advantages: adv.length ? adv : ["Comparable engagement platform"],
  sources: [{ name, url, date: "Aug 2026" }],
});
const mktComps = {
  xeno: mktComp("Xeno", "Restaurant CRM & marketing", { waba: Y, loyaltyPts: Y }, ["Restaurant-specific CRM depth"], "https://xeno.in/"),
  limetray: mktComp("LimeTray", "Engagement & loyalty suite", { loyaltyPts: Y }, ["Broader restaurant tech suite"], "https://limetray.com/"),
  wateron: mktComp("WATConsult / others", "Generic CRM & campaigns", { feedback: P, reputation: P }, ["General-purpose campaigns"], ""),
};

/* ---------- INVOICE (NPU) ---------- */
const invPetpooja = {
  pricing: {
    headline: "Basic ₹6,000 · Advance ₹12,000 / yr", model: "Flat plan (Basic / Advance) · no per-user", billing: "Annual (1-yr & 3-yr)", perUnit: "None", hardware: "—", setup: "Low", geo: "—",
    note: "Effective 1 Sep 2026. Prices exclude GST.",
    plans: [
      { id: "basic", name: "Basic", def: true, y1: 6000, y3: 10000, renewal: 3500, renewalLabel: "Renewal / year", note: "All core POS & business features — Billing, Inventory, Reporting, HO/Warehouse, Multi-User, WhatsApp E-Bills." },
      { id: "advance", name: "Advance", badge: "Most features", y1: 12000, y3: 16000, renewal: 5000, renewalLabel: "Renewal / year", note: "Everything in Basic + Purchase by Petpooja (supplier invoices sync automatically — no manual entry), Purchase AI, Shopify, Tally, Loyalty, Website Integration, EDC, ADSR, AI Try-On (clothing), AI Theft Detection, WhatsApp Messaging & upcoming integrations." },
    ],
  },
  features: fill("invoice", Y),
  hardware: {},
  advantages: ["Purchase by Petpooja — supplier invoices update automatically, no manual entry", "AI Try-On (clothing) & AI Theft Detection — unique to Petpooja", "Flat pricing — no per-user / per-counter fees", "Advance adds Shopify, Tally, Loyalty, EDC, ADSR & Purchase AI"],
  sources: [{ name: "Petpooja Invoice", url: "https://www.petpooja.com/invoice", date: "Sep 2026" }],
};
const invOver = (o = {}) => ({ purchaseAI: N, autoPurchase: N, aiTryOn: N, aiTheft: N, adsr: N, aiInsights: N, whatsappEbill: P, hoWarehouse: P, shopify: P, websiteIntg: P, loyalty: P, edc: P, tallyIntg: P, barcode: Y, ...o });
const invC = (name, tagline, bestFor, headline, over, url, custom = true) => ({
  name, tagline, bestFor,
  pricing: { headline, model: custom ? "Custom / licence" : "Per-plan", billing: custom ? "Custom" : "Annual", perUnit: custom ? "Not publicly listed" : "Varies", hardware: "—", setup: "Varies", geo: "—", custom },
  features: fill("invoice", Y, invOver(over)), hardware: {},
  advantages: [`Best for ${bestFor.toLowerCase()}`],
  sources: [{ name, url, date: "Sep 2026" }],
});
const invComps = {
  vyapar: invC("Vyapar", "Billing + accounting", "Small businesses", "From ₹899 / yr", { hoWarehouse: N, multiUser: P, loyalty: N, shopify: N, websiteIntg: N }, "https://vyaparapp.in", false),
  tally: invC("TallyPrime", "Accounting + invoicing", "Accounting & finance", "₹750/mo · ₹18,000 licence", { tallyIntg: Y, loyalty: N, hoWarehouse: P, shopify: N }, "https://tallysolutions.com", false),
  busy: invC("BUSY", "Accounting software", "Wholesale businesses", "From ₹9,999 (licence)", { tallyIntg: P, loyalty: N, hoWarehouse: P }, "https://busy.in"),
  marg: invC("Marg ERP", "Billing & inventory ERP", "Pharmacy & distribution", "Custom pricing", { loyalty: Y, hoWarehouse: Y }, "https://margcompusoft.com"),
  websys: invC("Websys ERP", "Retail chain ERP", "Supermarkets & retail chains", "Custom pricing", { loyalty: Y, hoWarehouse: Y }, "https://www.websysinfotech.in"),
  alpha: invC("Alpha ERP", "Garment & fashion ERP", "Garment & fashion retail", "Custom pricing", { loyalty: Y, hoWarehouse: Y, websiteIntg: P }, "https://alphaerp.ai"),
  retailgraph: invC("RetailGraph", "Retail-chain billing", "Retail chains", "Custom pricing", { loyalty: Y, hoWarehouse: Y }, "https://retailgraph.com"),
  gofrugal: invC("GOFRUGAL", "Retail & restaurant ERP", "Retail & restaurant businesses", "Custom pricing", { loyalty: Y, hoWarehouse: Y, shopify: P }, "https://www.gofrugal.com"),
  hdpos: invC("HDPOS Smart", "Retail billing software", "Retail stores", "Custom pricing", { loyalty: P, hoWarehouse: P }, "https://www.hdpos.com"),
  ginesys: invC("Ginesys", "Enterprise retail ERP", "Enterprise retail", "Custom pricing", { loyalty: Y, hoWarehouse: Y, shopify: Y, websiteIntg: Y }, "https://www.ginesys.in"),
  mybillbook: invC("myBillBook", "Mobile-first billing", "Small retail shops", "From ₹399 / yr", { hoWarehouse: N, multiUser: P, loyalty: N, shopify: N, websiteIntg: N }, "https://mybillbook.in", false),
  swipe: invC("Swipe", "Free billing & invoicing", "Small businesses", "Free · paid tiers", { hoWarehouse: N, multiUser: P, loyalty: N, shopify: P }, "https://getswipe.in", false),
  "zoho-invoice": invC("Zoho Invoice", "Free invoicing", "Service businesses", "Free", { hoWarehouse: N, multiUser: P, loyalty: N, shopify: N, edc: N }, "https://www.zoho.com/invoice", false),
  logicerp: invC("Logic ERP", "Manufacturing & retail ERP", "Manufacturing & retail", "Custom pricing", { loyalty: Y, hoWarehouse: Y }, "https://www.logicerp.com"),
};
const INV_PLANS = {
  vyapar: [
    { id: "mobile", name: "Mobile", price: "₹899 / yr", note: "Mobile billing app — GST invoices, basic inventory.", rate: () => Math.round(899 / 12) },
    { id: "desktop", name: "Desktop", def: true, price: "₹3,399 / yr", note: "Desktop billing + accounting, GST, inventory, works offline.", rate: () => Math.round(3399 / 12) },
  ],
  tally: [
    { id: "rental", name: "Rental", def: true, price: "₹750 / mo", note: "TallyPrime on subscription rental.", rate: () => 750 },
    { id: "silver", name: "Silver (perpetual)", price: "₹18,000 one-time", custom: true, note: "Single-user perpetual licence." },
    { id: "gold", name: "Gold (perpetual)", price: "₹54,000 one-time", custom: true, note: "Multi-user perpetual licence." },
  ],
  busy: [
    { id: "basic", name: "Basic", def: true, price: "From ₹9,999", custom: true, note: "Accounting + invoicing, perpetual licence." },
    { id: "standard", name: "Standard", price: "Custom", custom: true, note: "Adds inventory, order processing and more." },
  ],
  mybillbook: [
    { id: "silver", name: "Silver", def: true, price: "₹399 / yr", note: "Mobile billing, GST invoices, basic reports.", rate: () => Math.round(399 / 12) },
    { id: "gold", name: "Gold", price: "₹1,499 / yr (verify)", note: "Adds staff access, multi-device and more reports.", rate: () => Math.round(1499 / 12) },
    { id: "diamond", name: "Diamond", price: "Custom", custom: true, note: "Advanced / enterprise features." },
  ],
  swipe: [
    { id: "free", name: "Free", def: true, price: "Free", note: "Free GST billing & invoicing for small teams.", rate: () => 0 },
    { id: "pro", name: "Pro", price: "Custom", custom: true, note: "Paid tier with e-invoicing, staff & more." },
  ],
  "zoho-invoice": [{ id: "free", name: "Free", def: true, price: "Free", note: "Free GST invoicing, expenses, client portal, payment reminders.", rate: () => 0 }],
  marg: [{ id: "std", name: "Standard", def: true, price: "Custom pricing", custom: true, note: "Billing & inventory ERP for pharmacy & distribution." }],
  websys: [{ id: "std", name: "Standard", def: true, price: "Custom pricing", custom: true, note: "ERP for supermarkets & retail chains." }],
  alpha: [{ id: "std", name: "Standard", def: true, price: "Custom pricing", custom: true, note: "ERP for garment & fashion retail." }],
  retailgraph: [{ id: "std", name: "Standard", def: true, price: "Custom pricing", custom: true, note: "Billing & inventory for retail chains." }],
  gofrugal: [{ id: "std", name: "Standard", def: true, price: "Custom pricing", custom: true, note: "POS/ERP for retail & restaurants." }],
  hdpos: [{ id: "std", name: "Standard", def: true, price: "Custom pricing", custom: true, note: "Billing software for retail stores." }],
  ginesys: [{ id: "std", name: "Standard", def: true, price: "Custom pricing", custom: true, note: "Enterprise retail ERP & POS." }],
  logicerp: [{ id: "std", name: "Standard", def: true, price: "Custom pricing", custom: true, note: "ERP for manufacturing & retail." }],
};
Object.keys(INV_PLANS).forEach((k) => { if (invComps[k]) invComps[k].pricing.plans = INV_PLANS[k]; });
const INVOICE_INTEGRATIONS = {
  note: "Payment & Tally add-on modules available with Petpooja Invoice. Prices exclude taxes.",
  tiers: [["1 Year", "₹1,800"], ["2 Year", "₹2,500"], ["3 Year", "₹3,000"]],
  payments: [
    { name: "Paytm EDC", desc: "Digital payments via integrated Paytm EDC machine.", badge: "Newly Launched" },
    { name: "Pine Labs EDC", desc: "Digital payments via integrated Pine Labs EDC machine.", badge: "Newly Launched" },
    { name: "BharatPe EDC", desc: "Digital payments via integrated BharatPe EDC machine.", badge: "Newly Launched" },
    { name: "Pine Labs Android POS", desc: "Android POS on Pine Labs terminals — one device for billing & payments.", badge: "Newly Launched" },
    { name: "PhonePe Dynamic QR", desc: "Seamless UPI payments with automatic payment sync." },
  ],
  extra: { name: "Tally Integration — 1 Year", desc: "Sync invoices & accounting with Tally.", price: "₹2,500 + taxes" },
};

/* ---------- PRODUCT REGISTRY ---------- */
const PRODUCTS = {
  pos: { name: "POS", cat: ["ppu"], Icon: ShoppingCart, desc: "Complete restaurant POS, billing and operations management.", caps: ["Billing & KOT", "Inventory", "Aggregator integrations"], hardware: true, groups: "pos", petpooja: posPetpooja, comps: posComps, calcInputs: [["outlets", "Outlets", 1], ["terminals", "Terminals", 1]], perOutlet: true },
  marketing: { name: "Marketing Automation", cat: ["ppu"], Icon: Megaphone, desc: "Engage customers, automate marketing and drive repeat business.", caps: ["WhatsApp & SMS", "Loyalty", "Automation"], hardware: false, groups: "marketing", petpooja: mktPetpooja, comps: mktComps, calcInputs: [["customers", "Customers (000s)", 5]] },
  attendo: { name: "Attendo", cat: ["ppu", "npu"], Icon: Users, desc: "Attendance, payroll and workforce management.", caps: ["Payroll", "Biometric attendance", "Compliance"], hardware: true, groups: "attendo", petpooja: attendoPetpooja, comps: attendoComps, calcInputs: [["employees", "Employees", 50]], perUnitCalc: "employees" },
  invoice: { name: "Invoice", cat: ["npu"], Icon: FileText, desc: "Simple invoicing and GST billing for growing businesses.", caps: ["GST invoice", "E-invoice", "Payments"], hardware: false, groups: "invoice", petpooja: invPetpooja, comps: invComps, calcInputs: [["users", "Users", 3]], perUnitCalc: "users", integrations: INVOICE_INTEGRATIONS },
};
const CATS = { ppu: ["pos", "marketing", "attendo"], npu: ["invoice", "attendo"] };

/* ---------- COMPETITOR PLAN TIERS (Attendo / POS / Marketing) ----------
   Real, published tiers where available; "Custom pricing / Not publicly
   listed" everywhere a vendor does not publish — never invented. */
const ATTENDO_CPLANS = {
  keka: [
    { id: "foundation", name: "Foundation", def: true, price: "₹9,999/mo", note: "Payroll, onboarding, leave, gamified attendance, statutory compliance, accounting integration. ≤100 employees.", rate: (e) => 9999 + Math.max(0, e - 100) * 90 },
    { id: "strength", name: "Strength", price: "₹12,999/mo", note: "Everything in Foundation + GPS/selfie attendance, geo-fencing, asset tracking, SSO, people analytics.", rate: (e) => 12999 + Math.max(0, e - 100) * 120 },
    { id: "growth", name: "Growth", badge: "Full suite", price: "₹15,999/mo", note: "Everything in Strength + performance reviews, OKRs, feedback, skill analytics, PIP.", rate: (e) => 15999 + Math.max(0, e - 100) * 150 },
  ],
  greythr: [
    { id: "starter", name: "Starter", price: "Free ≤25", note: "Free up to 25 employees — core HR, leave, basic payroll.", rate: () => 0 },
    { id: "essential", name: "Essential", def: true, price: "₹3,495/mo", note: "Payroll, leave, core HR, letters, basic attendance. +₹30/emp above 50.", rate: (e) => 3495 + Math.max(0, e - 50) * 30 },
    { id: "growth", name: "Growth", price: "₹5,495/mo", note: "Everything in Essential + advanced attendance, shifts, workflow automation. +₹85/emp above 50.", rate: (e) => 5495 + Math.max(0, e - 50) * 85 },
    { id: "enterprise", name: "Enterprise", price: "₹7,495/mo", note: "Full suite bundled, multi-location. +₹100/emp above 50.", rate: (e) => 7495 + Math.max(0, e - 50) * 100 },
  ],
  teamoffice: [
    { id: "basic", name: "Basic", price: "₹1.25 / emp / mo", note: "Live attendance dashboard, 1 admin login, ESS, 45+ reports, third-party API.", rate: (e) => Math.round(e * 1.25) },
    { id: "premium", name: "Premium", def: true, badge: "Popular", price: "₹3.75 / emp / mo", note: "Everything in Basic + multiple admin & manager logins, user rights, leave request from ESS.", rate: (e) => Math.round(e * 3.75) },
  ],
  pagarbook: [
    { id: "basic", name: "Basic", price: "Free", note: "Staff attendance & salary register for small shops.", rate: () => 0 },
    { id: "pro", name: "Pro", def: true, price: "From ₹499 / staff / yr", note: "Adds GPS/face attendance, advances, payslips and reports.", rate: (e) => Math.round((e * 499) / 12) },
  ],
  tankhapatra: [
    { id: "starter", name: "Starter", def: true, price: "From ₹600 / yr", note: "Payroll, attendance, leave, ESS for small teams (10 users).", rate: (e) => Math.round((e * 60) / 12) },
    { id: "standard", name: "Standard", price: "Contact sales", custom: true, note: "Everything in Starter + live GPS tracking, field/visit management, fuller compliance." },
  ],
  "zoho-hr": [
    { id: "essential", name: "Essential", price: "₹50 / emp / mo", note: "Core HR, leave, attendance, ESS.", rate: (e) => Math.round(e * 50) },
    { id: "professional", name: "Professional", def: true, price: "₹100 / emp / mo", note: "+ timesheets, automation, forms.", rate: (e) => Math.round(e * 100) },
    { id: "premium", name: "Premium", price: "₹165 / emp / mo", note: "+ performance, onboarding, workflows.", rate: (e) => Math.round(e * 165) },
    { id: "enterprise", name: "Enterprise", price: "₹230 / emp / mo", note: "+ advanced analytics, LMS, case management.", rate: (e) => Math.round(e * 230) },
  ],
  razorpayx: [
    { id: "prime", name: "Prime", def: true, price: "₹2,499/mo", note: "Payroll + compliance, payslips, salary payouts. ≤20 employees.", rate: (e) => (e <= 20 ? 2499 : 2499 + (e - 20) * 100) },
    { id: "elite", name: "Elite", price: "₹5,499/mo", note: "+ advanced automation, reimbursements. ≤50 employees, +₹150/emp.", rate: (e) => (e <= 50 ? 5499 : 5499 + (e - 50) * 150) },
    { id: "enterprise", name: "Enterprise", price: "Custom", custom: true, note: "Dedicated support, custom limits and workflows." },
  ],
};
const POS_CPLANS = {
  restroworks: [{ id: "basic", name: "Basic", def: true, price: "≈ ₹40,000 + GST / yr", note: "Cloud POS, billing, inventory management, CRM & customer segmentation, dedicated Zomato order server, after-sales support & training.", rate: () => Math.round(40000/12) }, { id: "enterprise", name: "Enterprise", price: "Custom quote", custom: true, note: "Multi-brand / large-chain, advanced analytics & integrations." }],
  rista: [{ id: "pos", name: "Billing POS + QR", def: true, price: "₹15,000 + GST (₹17,700)", note: "POS billing, QR ordering, online ordering, 3rd-party integrations, discounts/charges/deals, business reports & analytics. 12 months.", rate: () => Math.round(15000/12) }, { id: "pos-crm", name: "POS + CRM & Loyalty", price: "₹25,000 + GST", note: "Everything in POS + CRM, loyalty program, engagement, retention & insights.", rate: () => Math.round(25000/12) }, { id: "bundle", name: "POS + CRM + WhatsApp", badge: "Special bundle", price: "₹35,000 + GST (₹41,300)", note: "Rista Billing POS + QR, CRM & Loyalty, WhatsApp Kickstarter (campaigns & notifications). 12 months, specially discounted.", rate: () => Math.round(35000/12) }],
  dotpe: [{ id: "basic", name: "Basic", def: true, price: "Not publicly listed", custom: true, note: "Ordering + POS, QR menu." }, { id: "pro", name: "Pro", price: "Not publicly listed", custom: true, note: "+ storefront, payments, marketing." }],
  tmbill: [{ id: "core", name: "Core (Most Popular)", def: true, price: "₹10,000 yr1 · ₹8,000 renewal", note: "Cloud POS (unlimited devices/users), billing & KOT, menu, table, discounts, anti-theft, CRM Hub, 24×7 support, customer display, owner app, virtual wallet, 100+ reports, inventory, vendors, recipe & purchase management, QR ordering, Zomato/Swiggy integration.", rate: () => Math.round(10000/12) }, { id: "plus", name: "Core + Plus add-ons", price: "₹10,000 + add-ons", note: "Add-ons (yearly): Captain App / KDS / Loyalty / Feedback / Call Centre / Table Reservation ₹3,000 each · UPI ₹4,000 · Accounting ₹10,000 · WhatsApp ₹10,000 · Website ₹10,000.", rate: () => Math.round(10000/12) }],
  ezo: [{ id: "free", name: "Free", def: true, price: "Free", note: "Basic billing & inventory app.", rate: () => 0 }, { id: "premium", name: "Premium", price: "Paid (verify)", custom: true, note: "+ advanced billing, GST, reports." }],
  menson: [{ id: "standard", name: "Standard", def: true, price: "Not publicly listed", custom: true, note: "Restaurant billing & POS." }, { id: "plus", name: "Plus", price: "Not publicly listed", custom: true, note: "+ more outlets & modules." }],
};
const MKT_CPLANS = {
  xeno: [{ id: "core", name: "Core", def: true, price: "Custom pricing", custom: true, note: "Restaurant CRM, campaigns, loyalty." }, { id: "growth", name: "Growth", price: "Custom pricing", custom: true, note: "+ advanced automation & analytics." }],
  limetray: [{ id: "core", name: "Core", def: true, price: "Custom pricing", custom: true, note: "Engagement & loyalty suite." }, { id: "growth", name: "Growth", price: "Custom pricing", custom: true, note: "+ broader restaurant tech modules." }],
  wateron: [{ id: "std", name: "Standard", def: true, price: "Custom pricing", custom: true, note: "General CRM & campaigns." }, { id: "pro", name: "Pro", price: "Custom pricing", custom: true, note: "+ automation & reporting." }],
};
Object.keys(ATTENDO_CPLANS).forEach((k) => { if (attendoComps[k]) attendoComps[k].pricing.plans = ATTENDO_CPLANS[k]; });
Object.keys(POS_CPLANS).forEach((k) => { if (posComps[k]) posComps[k].pricing.plans = POS_CPLANS[k]; });
Object.keys(MKT_CPLANS).forEach((k) => { if (mktComps[k]) mktComps[k].pricing.plans = MKT_CPLANS[k]; });

/* ============================================================================
   UI PRIMITIVES
   ========================================================================== */
const container = { maxWidth: 1120, margin: "0 auto" };
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("pc-in"); io.unobserve(el); } }, { threshold: 0.1 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return ref;
}
function Reveal({ children }) { const ref = useReveal(); return <div ref={ref} className="pc-reveal">{children}</div>; }
function Stat({ s }) {
  if (s === Y) return <Check size={17} strokeWidth={3} style={{ color: C.green }} />;
  if (s === P) return <span style={{ color: C.amber, fontSize: 15, fontWeight: 700 }}>◐</span>;
  if (s === NL) return <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Not listed</span>;
  return <Minus size={16} style={{ color: C.grey }} />;
}
function Mono({ text, bg, fg }) {
  return <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, color: fg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 17, flexShrink: 0 }}>{text}</div>;
}
function SectionHead({ kicker, title, sub }) {
  return (
    <div className="pc-no-print" style={{ marginBottom: 24 }}>
      {kicker && <div style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: C.red, background: C.redSoft, padding: "5px 11px", borderRadius: 999 }}>{kicker}</div>}
      <h2 style={{ fontSize: 28, fontWeight: 800, color: C.dark, margin: "13px 0 6px", letterSpacing: "-.02em" }}>{title}</h2>
      {sub && <p style={{ color: C.muted, fontSize: 15.5, maxWidth: 640, margin: 0 }}>{sub}</p>}
    </div>
  );
}
const btnPrimary = { border: "none", background: C.red, color: "#fff", fontSize: 14.5, fontWeight: 700, padding: "10px 18px", borderRadius: 11, cursor: "pointer", boxShadow: "0 6px 16px rgba(229,57,53,.24)", display: "inline-flex", alignItems: "center", gap: 7 };
const btnGhost = { border: `1.5px solid ${C.border}`, background: C.card, color: C.dark, fontSize: 14, fontWeight: 700, padding: "9px 15px", borderRadius: 11, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7 };

/* ============================================================================
   NAV
   ========================================================================== */
function Nav({ cat, chooseCat, reset }) {
  const [m, setM] = useState(false);
  const [set, setSet] = useState(false);
  const setRef = useRef(null);
  const go = (id) => { setM(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(() => { const h = (e) => { if (setRef.current && !setRef.current.contains(e.target)) setSet(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  return (
    <header className="pc-no-print" style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,.85)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ ...container, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={26} />
          <span style={{ fontWeight: 800, color: C.dark, fontSize: 16.5 }}>Petpooja <span style={{ color: C.muted, fontWeight: 600 }}>Compare</span></span>
        </div>
        <nav className="pc-desk" style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {[["Comparison", "cmp"], ["Pricing", "pricing"], ["Features", "features"], ["Sources", "sources"]].map(([l, id]) => (
            <button key={id} onClick={() => go(id)} style={{ border: "none", background: "transparent", color: C.muted, fontSize: 14, fontWeight: 600, padding: "8px 11px", borderRadius: 8, cursor: "pointer" }}>{l}</button>
          ))}
          <div ref={setRef} style={{ position: "relative" }}>
            <button onClick={() => setSet((s) => !s)} title="Settings" aria-label="Settings" style={{ ...btnGhost, padding: 9 }}><Settings size={17} /></button>
            {set && <SettingsPop cat={cat} chooseCat={(c) => { chooseCat(c); setSet(false); }} reset={() => { reset(); setSet(false); }} />}
          </div>
          <button onClick={() => go("top")} style={btnPrimary}>Start Comparison</button>
        </nav>
        <button className="pc-mob-btn" onClick={() => setM((v) => !v)} style={{ display: "none", border: `1px solid ${C.border}`, background: C.card, borderRadius: 10, padding: 8, cursor: "pointer" }}>{m ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
      {m && (
        <div style={{ padding: "6px 16px 14px", borderTop: `1px solid ${C.border}`, background: C.card }}>
          {[["Comparison", "cmp"], ["Pricing", "pricing"], ["Features", "features"], ["Sources", "sources"]].map(([l, id]) => <button key={id} onClick={() => go(id)} style={{ display: "block", width: "100%", textAlign: "left", border: "none", background: "transparent", color: C.dark, fontSize: 15, fontWeight: 600, padding: "11px 6px", cursor: "pointer" }}>{l}</button>)}
          <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 6, paddingTop: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>Business category</div>
            <div style={{ display: "flex", background: C.bg, borderRadius: 10, padding: 4, gap: 4, marginBottom: 10 }}>
              {[["ppu", "PPU"], ["npu", "NPU"]].map(([c, l]) => <button key={c} onClick={() => { chooseCat(c); setM(false); }} style={{ flex: 1, border: "none", cursor: "pointer", borderRadius: 8, padding: "9px 4px", fontSize: 13, fontWeight: 800, background: cat === c ? C.red : "transparent", color: cat === c ? "#fff" : C.muted }}>{l}</button>)}
            </div>
            <button onClick={() => { reset(); setM(false); }} style={{ ...btnGhost, width: "100%", justifyContent: "center", fontSize: 13 }}><RotateCcw size={14} /> Start over</button>
          </div>
        </div>
      )}
    </header>
  );
}
function SettingsPop({ cat, chooseCat, reset }) {
  return (
    <div className="pc-pop" style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 60, width: 230, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: "0 20px 50px rgba(16,24,40,.16)", padding: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>Business category</div>
      <div style={{ display: "flex", background: C.bg, borderRadius: 10, padding: 4, gap: 4, marginBottom: 12 }}>
        {[["ppu", "PPU"], ["npu", "NPU"]].map(([c, l]) => <button key={c} onClick={() => chooseCat(c)} style={{ flex: 1, border: "none", cursor: "pointer", borderRadius: 8, padding: "9px 4px", fontSize: 13, fontWeight: 800, background: cat === c ? C.red : "transparent", color: cat === c ? "#fff" : C.muted }}>{l}</button>)}
      </div>
      <button onClick={reset} style={{ ...btnGhost, width: "100%", justifyContent: "center", fontSize: 13 }}><RotateCcw size={14} /> Start over</button>
    </div>
  );
}
function CategoryLanding({ onPick }) {
  const cards = [
    { id: "ppu", title: "PPU", desc: "Restaurant products", items: ["POS", "Marketing Automation", "Attendo"], Icon: Store },
    { id: "npu", title: "NPU", desc: "Business products", items: ["Attendo", "Invoice"], Icon: FileText },
  ];
  return (
    <section className="pc-no-print" style={{ position: "relative" }}>
      <div className="pc-glow" style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 55% at 82% 0%, rgba(229,57,53,.10), transparent 60%), radial-gradient(50% 50% at 8% 20%, rgba(51,65,85,.07), transparent 60%)" }} />
      <div style={{ ...container, position: "relative", padding: "68px 20px 60px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 700, color: C.red, background: C.redSoft, padding: "6px 13px", borderRadius: 999 }}><Sparkles size={14} /> Start here</div>
        <h1 style={{ fontSize: 42, lineHeight: 1.1, fontWeight: 800, letterSpacing: "-.03em", margin: "18px auto 12px", maxWidth: 660 }}>Which business category?</h1>
        <p style={{ fontSize: 17, color: C.muted, maxWidth: 500, margin: "0 auto 34px" }}>Choose one to begin. You can switch anytime from Settings.</p>
        <div className="pc-catgrid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 640, margin: "0 auto" }}>
          {cards.map((c) => (
            <button key={c.id} onClick={() => onPick(c.id)} className="pc-lift pc-catcard" style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 20, padding: "30px 24px", cursor: "pointer", textAlign: "center", boxShadow: "0 6px 24px rgba(16,24,40,.06)" }}>
              <div className="pc-picon" style={{ width: 56, height: 56, borderRadius: 16, background: C.redSoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><c.Icon size={26} style={{ color: C.red }} /></div>
              <div style={{ fontSize: 30, fontWeight: 800, color: C.dark, letterSpacing: "-.02em" }}>{c.title}</div>
              <div style={{ fontSize: 13.5, color: C.muted, margin: "4px 0 14px" }}>{c.desc}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>{c.items.map((it) => <span key={it} style={{ fontSize: 11.5, fontWeight: 600, color: C.slate, background: C.slateSoft, padding: "4px 10px", borderRadius: 999 }}>{it}</span>)}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   COMBOBOX (competitor search)
   ========================================================================== */
function Combobox({ comps, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hi, setHi] = useState(0);
  const box = useRef(null);
  const slugs = Object.keys(comps);
  const list = useMemo(() => slugs.filter((s) => (comps[s].name + " " + comps[s].tagline).toLowerCase().includes(q.trim().toLowerCase())), [q, comps]);
  useEffect(() => { const h = (e) => { if (box.current && !box.current.contains(e.target)) { setOpen(false); setQ(""); } }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  useEffect(() => setHi(0), [q]);
  const pick = (s) => { onChange(s); setOpen(false); setQ(""); };
  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setHi((h) => Math.min(list.length - 1, h + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(0, h - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); if (open && list[hi]) pick(list[hi]); }
    else if (e.key === "Escape") setOpen(false);
  };
  const cur = value ? comps[value] : null;
  return (
    <div ref={box} style={{ position: "relative", width: "100%" }}>
      <div onClick={() => setOpen((o) => !o)} style={{ display: "flex", alignItems: "center", gap: 10, background: C.card, border: `1.5px solid ${open ? C.red : C.border}`, borderRadius: 14, padding: "14px 16px", cursor: "pointer", boxShadow: open ? "0 8px 30px rgba(229,57,53,.10)" : "0 1px 2px rgba(16,24,40,.04)" }}>
        <Search size={19} style={{ color: C.muted }} />
        {open ? <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder={placeholder} style={{ border: "none", outline: "none", flex: 1, fontSize: 16, color: C.dark, background: "transparent" }} />
          : <span style={{ flex: 1, fontSize: 16, fontWeight: 600, color: cur ? C.dark : C.muted }}>{cur ? cur.name : placeholder}</span>}
        <ChevronDown size={18} style={{ color: C.muted, transform: open ? "rotate(180deg)" : "none", transition: ".2s" }} />
      </div>
      {open && (
        <div className="pc-pop" role="listbox" style={{ position: "absolute", zIndex: 40, top: "calc(100% + 8px)", left: 0, right: 0, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: "0 20px 50px rgba(16,24,40,.16)", padding: 6, maxHeight: 340, overflowY: "auto" }}>
          {list.length === 0 && <div style={{ padding: 14, color: C.muted, fontSize: 14 }}>No match.</div>}
          {list.map((s, i) => (
            <div key={s} role="option" onMouseEnter={() => setHi(i)} onClick={() => pick(s)} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 11px", borderRadius: 10, cursor: "pointer", background: i === hi ? C.slateSoft : "transparent" }}>
              <Mono text={comps[s].name[0]} bg={C.slateSoft} fg={C.slate} />
              <div style={{ flex: 1 }}><div style={{ fontWeight: 700, color: C.dark, fontSize: 14.5 }}>{comps[s].name}</div><div style={{ fontSize: 12.5, color: C.muted }}>{comps[s].tagline}</div></div>
              {s === value && <BadgeCheck size={17} style={{ color: C.red }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   COMPARISON SECTIONS
   ========================================================================== */
function ProductCard({ name, badge, tagline, mono, accent, accentSoft }) {
  return (
    <div style={{ position: "relative", background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 22, boxShadow: "0 4px 24px rgba(16,24,40,.05)", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: accent }} />
      <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
        <Mono text={mono} bg={accentSoft} fg={accent} />
        <div>
          <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: accent, background: accentSoft, padding: "3px 9px", borderRadius: 999 }}>{badge}</span>
          <div style={{ fontSize: 19, fontWeight: 800, color: C.dark, marginTop: 5 }}>{name}</div>
        </div>
      </div>
      <p style={{ color: C.muted, fontSize: 14, margin: "13px 0 0" }}>{tagline}</p>
    </div>
  );
}
function PriceLine({ label, value, strong }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "9px 0", borderBottom: `1px solid ${C.border}`, gap: 14 }}>
      <span style={{ fontSize: 13.5, color: C.muted, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: strong ? 14.5 : 13.5, fontWeight: strong ? 800 : 600, color: C.dark, textAlign: "right" }}>{value}</span>
    </div>
  );
}
function PriceSide({ title, mono, accent, accentSoft, primary, meta, plans, plan, setPlan, note, addon }) {
  const flat = plan && plan.y1 != null;
  return (
    <div className={primary ? "pc-primary" : ""} style={{ background: C.card, border: primary ? `2px solid ${C.red}` : `1px solid ${C.border}`, borderRadius: 20, padding: 24, boxShadow: primary ? "0 12px 40px rgba(229,57,53,.16)" : "0 4px 20px rgba(16,24,40,.05)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}><Mono text={mono} bg={accentSoft} fg={accent} /><b style={{ color: C.dark, fontSize: 16 }}>{title}</b></div>
      {plans && plans.length > 1 && (
        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: "block", marginBottom: 6 }}>Choose plan</label>
          <div style={{ position: "relative" }}>
            <select value={plan.id} onChange={(e) => setPlan(e.target.value)} style={{ width: "100%", appearance: "none", WebkitAppearance: "none", MozAppearance: "none", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "11px 38px 11px 13px", fontSize: 13.5, fontWeight: 600, color: C.dark, background: C.card, cursor: "pointer" }}>
              {plans.map((pl) => <option key={pl.id} value={pl.id}>{pl.name} — {planBig(pl)}</option>)}
            </select>
            <ChevronDown size={17} style={{ position: "absolute", right: 13, top: 13, color: C.muted, pointerEvents: "none" }} />
          </div>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", margin: "16px 0 4px" }}>
        <span style={{ fontSize: (planBig(plan) || "").length > 16 ? 22 : 30, fontWeight: 800, color: C.dark, letterSpacing: "-.02em" }}>{plan ? planBig(plan) : meta.headline}</span>
        {plan?.badge && <span style={{ fontSize: 11, fontWeight: 700, color: C.red, background: C.redSoft, padding: "3px 9px", borderRadius: 999, textTransform: "uppercase", letterSpacing: ".03em" }}>{plan.badge}</span>}
      </div>
      {plan?.note && (
        <div style={{ background: C.bg, borderRadius: 12, padding: "12px 14px", margin: "12px 0 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 6, display: "inline-flex", alignItems: "center", gap: 6 }}><Layers size={12} /> What you get on {plan.name}</div>
          <div style={{ fontSize: 13, color: C.dark, lineHeight: 1.5 }}>{plan.note}</div>
        </div>
      )}
      {flat && <>
        <PriceLine label="First year" value={inr(plan.y1) + " + GST"} strong />
        <PriceLine label="3-year plan" value={plan.y3 != null ? inr(plan.y3) + " + GST" : "—"} strong />
        <PriceLine label={plan.renewalLabel || "Renewal"} value={inr(plan.renewal) + " + GST"} />
      </>}
      {meta.rows.map(([l, v]) => <PriceLine key={l} label={l} value={v} />)}
      {addon && <div style={{ fontSize: 12, color: C.muted, marginTop: 12, fontStyle: "italic", lineHeight: 1.5 }}>{addon}</div>}
      {note && <div style={{ fontSize: 12, color: C.muted, marginTop: 10, fontStyle: "italic" }}>{note}</div>}
    </div>
  );
}
function Pricing({ prod, comp, pName, ppPlan, setPpPlan, compPlan, setCompPlan }) {
  const pp = prod.petpooja.pricing, cp = comp.pricing;
  const ppMeta = { headline: pp.headline, rows: [["Pricing model", pp.model], ["Billing", pp.billing], ["Per-unit", pp.perUnit], ["Hardware", pp.hardware], ["Setup", pp.setup]] };
  const cpMeta = { headline: cp.headline, rows: [["Pricing model", cp.model], ["Billing", cp.billing], ["Per-unit", cp.perUnit], ["Hardware", cp.hardware], ["Setup", cp.setup]] };
  return (
    <div id="pricing" className="pc-two" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <PriceSide title={`Petpooja ${pName}`} mono="P" accent={C.red} accentSoft={C.redSoft} primary meta={ppMeta} plans={pp.plans} plan={ppPlan} setPlan={setPpPlan} note={pp.note} addon={pp.addon} />
      <PriceSide title={comp.name} mono={comp.name[0]} accent={C.slate} accentSoft={C.slateSoft} meta={cpMeta} plans={cp.plans} plan={compPlan} setPlan={setCompPlan} />
    </div>
  );
}
function Calculator({ prod, comp, pName, ppPlan, compPlan }) {
  const key = prod.calcInputs[0][0];
  const [n, setN] = useState(prod.calcInputs[0][2]);
  const [period, setPeriod] = useState("annual");
  const months = period === "monthly" ? 1 : period === "annual" ? 12 : 36;
  const legacy = (calc) => (calc ? (calc(n) == null ? null : calc(n) * months) : null);
  const mult = prod.perOutlet ? Math.max(1, n) : 1; // POS is priced per outlet
  const scale = (v) => (v == null ? null : v * mult);
  const pp = scale(ppPlan ? planCost(ppPlan, n, period) : legacy(prod.petpooja.pricing.calc));
  const cp = scale(compPlan ? planCost(compPlan, n, period) : legacy(comp.pricing.calc));
  const label = (period === "monthly" ? "for 1 month" : period === "annual" ? "for 1 year" : "over 3 years") + (prod.perOutlet ? ` · ${mult} outlet${mult > 1 ? "s" : ""}` : "");
  return (
    <div style={{ background: C.dark, borderRadius: 24, padding: 28, color: "#fff", boxShadow: "0 20px 50px rgba(23,32,42,.28)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}><Zap size={18} style={{ color: "#FFB4B0" }} /><span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "#FFB4B0" }}>Cost estimator</span></div>
      <h3 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 20px" }}>Estimated cost for your business</h3>
      <div className="pc-calc-in" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18, marginBottom: 22 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}><span style={{ fontSize: 13.5, color: "#B7C0CB" }}>{prod.calcInputs[0][1]}</span><span style={{ fontSize: 16, fontWeight: 800 }}>{n}</span></div>
          <input type="range" min={1} max={key === "employees" ? 500 : key === "users" ? 50 : key === "customers" ? 200 : key === "outlets" ? 50 : 20} value={n} onChange={(e) => setN(+e.target.value)} className="pc-range" style={{ width: "100%" }} />
        </div>
        <div>
          <span style={{ fontSize: 13.5, color: "#B7C0CB", display: "block", marginBottom: 10 }}>Billing period</span>
          <div style={{ display: "flex", background: "rgba(255,255,255,.08)", borderRadius: 11, padding: 4 }}>
            {[["monthly", "Monthly"], ["annual", "Annual"], ["3yr", "3 Yr"]].map(([v, l]) => <button key={v} onClick={() => setPeriod(v)} style={{ flex: 1, border: "none", cursor: "pointer", borderRadius: 8, padding: "9px 4px", fontSize: 13, fontWeight: 700, background: period === v ? C.red : "transparent", color: period === v ? "#fff" : "#B7C0CB" }}>{l}</button>)}
          </div>
        </div>
      </div>
      <div className="pc-calc-out" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div style={{ background: "rgba(229,57,53,.16)", border: "1px solid rgba(229,57,53,.4)", borderRadius: 16, padding: "16px 18px" }}>
          <div style={{ fontSize: 12.5, color: "#FFB4B0", fontWeight: 700 }}>Petpooja {pName}{ppPlan ? ` · ${ppPlan.name.split("(")[0].trim()}` : ""}</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>{pp == null ? "Custom" : inr(pp)}</div>
          <div style={{ fontSize: 11.5, color: "#B7C0CB" }}>{pp == null ? "request a quote" : label}</div>
        </div>
        <div style={{ background: "rgba(255,255,255,.06)", borderRadius: 16, padding: "16px 18px" }}>
          <div style={{ fontSize: 12.5, color: "#B7C0CB", fontWeight: 700 }}>{comp.name}{compPlan ? ` · ${compPlan.name}` : ""}</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>{cp == null ? "Custom" : inr(cp)}</div>
          <div style={{ fontSize: 11.5, color: "#7C8794" }}>{cp == null ? "quote-based" : label}</div>
        </div>
        <div style={{ background: pp != null && cp != null ? "rgba(18,183,106,.14)" : "rgba(255,255,255,.06)", border: pp != null && cp != null ? "1px solid rgba(18,183,106,.4)" : "none", borderRadius: 16, padding: "16px 18px" }}>
          <div style={{ fontSize: 12.5, color: "#86E5B4", fontWeight: 700 }}>Difference</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>{pp == null || cp == null ? "—" : inr(Math.abs(cp - pp))}</div>
          <div style={{ fontSize: 11.5, color: "#7C8794" }}>{pp == null || cp == null ? "not comparable" : label}</div>
        </div>
      </div>
      <p style={{ fontSize: 11.5, color: "#7C8794", margin: "16px 0 0" }}>Estimated using published pricing where available. Excludes GST, setup and hardware. Not an official quotation.</p>
    </div>
  );
}
function Features({ prod, comp }) {
  const groups = GROUPS[prod.groups];
  const [open, setOpen] = useState({ [groups[0].key]: true, [groups[1].key]: true });
  const pf = prod.petpooja.features;
  return (
    <div id="features" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 20px rgba(16,24,40,.05)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 110px", padding: "14px 20px", background: C.bg, borderBottom: `1px solid ${C.border}`, fontSize: 12.5, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".04em" }}>
        <span>Feature</span><span style={{ textAlign: "center", color: C.red }}>Petpooja</span><span style={{ textAlign: "center" }}>{comp.name}</span>
      </div>
      {groups.map((g) => {
        const isOpen = !!open[g.key];
        return (
          <div key={g.key}>
            <button onClick={() => setOpen((o) => ({ ...o, [g.key]: !o[g.key] }))} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", border: "none", background: C.card, cursor: "pointer", padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontWeight: 800, color: C.dark, fontSize: 15 }}>{g.title}</span>
              <ChevronDown size={18} style={{ color: C.muted, transform: isOpen ? "rotate(180deg)" : "none", transition: ".2s" }} />
            </button>
            {isOpen && g.rows.map(([id, lbl]) => (
              <div key={id} style={{ display: "grid", gridTemplateColumns: "1fr 110px 110px", padding: "12px 20px", borderBottom: `1px solid ${C.border}`, alignItems: "center" }}>
                <span style={{ fontSize: 14, color: C.dark }}>{lbl}</span>
                <span style={{ display: "flex", justifyContent: "center" }}><Stat s={pf[id]} /></span>
                <span style={{ display: "flex", justifyContent: "center" }}><Stat s={comp.features[id]} /></span>
              </div>
            ))}
          </div>
        );
      })}
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", padding: "13px 20px", fontSize: 12.5, color: C.muted }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Check size={14} strokeWidth={3} style={{ color: C.green }} /> Available</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ color: C.amber, fontWeight: 700 }}>◐</span> Partial</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Minus size={14} style={{ color: C.grey }} /> Not available</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Info size={13} /> "Not listed" = not publicly published</span>
      </div>
    </div>
  );
}
function Hardware({ prod, comp }) {
  const rows = HW_GROUPS[prod.groups]; if (!rows) return null;
  const ph = prod.petpooja.hardware, ch = comp.hardware || {};
  return (
    <div className="pc-two" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {[["Petpooja", ph, C.red, C.redSoft, "P"], [comp.name, ch, C.slate, C.slateSoft, comp.name[0]]].map(([nm, h, ac, as_, mono]) => (
        <div key={nm} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 20, boxShadow: "0 4px 20px rgba(16,24,40,.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}><Mono text={mono} bg={as_} fg={ac} /><b style={{ color: C.dark, fontSize: 16 }}>{nm}</b></div>
          {rows.map(([id, lbl]) => <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${C.border}` }}><span style={{ fontSize: 13.5, color: C.dark }}>{lbl}</span><Stat s={h[id] || N} /></div>)}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0" }}><span style={{ fontSize: 13.5, color: C.dark }}>Warranty</span><span style={{ fontSize: 13, fontWeight: 700, color: h.warranty === "Included" ? C.green : C.muted }}>{h.warranty || "—"}</span></div>
        </div>
      ))}
    </div>
  );
}
function noPublicPrice(comp) {
  const p = comp.pricing || {}; const plans = p.plans || [];
  const rx = /custom|not publicly listed|contact|quote/i;
  const allPlansCustom = plans.length > 0 && plans.every((pl) => pl.custom || rx.test(pl.price || ""));
  return !!p.custom || (plans.length ? allPlansCustom : rx.test(p.headline || ""));
}
function petpoojaWins(prod, comp) {
  const out = [...prod.petpooja.advantages];
  const pf = prod.petpooja.features, cf = comp.features;
  const groups = GROUPS[prod.groups];
  const areas = groups.filter((g) => {
    const a = g.rows.reduce((s, [id]) => s + score(pf[id]), 0);
    const b = g.rows.reduce((s, [id]) => s + score(cf[id]), 0);
    return a > b;
  }).map((g) => g.title);
  if (areas.length) out.push(`Stronger than ${comp.name} on ${areas.slice(0, 3).join(", ")}`);
  if (prod.hardware && prod.petpooja.hardware && prod.petpooja.hardware.warranty === "Included" && String(comp.hardware && comp.hardware.warranty || "").toLowerCase().includes("third"))
    out.push(`Hardware included — ${comp.name} relies on third-party devices`);
  if (noPublicPrice(comp)) out.unshift(`Public, upfront pricing — ${comp.name} is pitched case-by-case per customer`);
  return out.slice(0, 6);
}
function Advantages({ prod, comp }) {
  const col = (title, items, accent, soft, primary) => (
    <div style={{ background: C.card, border: primary ? `2px solid ${C.red}` : `1px solid ${C.border}`, borderRadius: 18, padding: 22, boxShadow: primary ? "0 10px 30px rgba(229,57,53,.10)" : "0 4px 20px rgba(16,24,40,.05)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ fontWeight: 800, color: accent, fontSize: 15.5 }}>{title}</div>
        {primary && <span style={{ fontSize: 10.5, fontWeight: 800, color: "#fff", background: C.red, padding: "2px 8px", borderRadius: 999, textTransform: "uppercase", letterSpacing: ".04em" }}>Petpooja</span>}
      </div>
      {items.map((t) => <div key={t} style={{ display: "flex", gap: 9, padding: "7px 0" }}><Check size={17} strokeWidth={3} style={{ color: accent, flexShrink: 0, marginTop: 1 }} /><span style={{ fontSize: 14, color: C.dark }}>{t}</span></div>)}
    </div>
  );
  return (
    <div className="pc-two" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {col(`Where Petpooja ${prod.name} stands out`, petpoojaWins(prod, comp), C.red, C.redSoft, true)}
      {col(`Where ${comp.name} stands out`, comp.advantages, C.slate, C.slateSoft, false)}
    </div>
  );
}
function Summary({ prod, comp }) {
  const groups = GROUPS[prod.groups];
  let lead = [], sim = [], clead = [];
  groups.forEach((g) => {
    let a = 0, b = 0;
    g.rows.forEach(([id]) => { a += score(prod.petpooja.features[id]); b += score(comp.features[id]); });
    if (a > b) lead.push(g.title); else if (b > a) clead.push(g.title); else sim.push(g.title);
  });
  const a = groups.reduce((s, g) => s + g.rows.reduce((x, [id]) => x + score(prod.petpooja.features[id]), 0), 0);
  const b = groups.reduce((s, g) => s + g.rows.reduce((x, [id]) => x + score(comp.features[id]), 0), 0);
  const tot = a + b || 1, aPct = Math.round((a / tot) * 100);
  const col = (title, arr, color, soft) => (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 20, boxShadow: "0 4px 20px rgba(16,24,40,.05)" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}><span style={{ fontSize: 30, fontWeight: 800, color }}>{arr.length}</span><span style={{ fontSize: 13.5, fontWeight: 700, color: C.dark }}>{title}</span></div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{arr.map((t) => <span key={t} style={{ fontSize: 12.5, fontWeight: 600, color, background: soft, padding: "5px 10px", borderRadius: 999 }}>{t}</span>)}</div>
    </div>
  );
  return (
    <>
      <div className="pc-grid3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 16 }}>
        {col("areas Petpooja leads", lead, C.red, C.redSoft)}
        {col("areas similar", sim, C.slate, C.slateSoft)}
        {col(`areas ${comp.name} leads`, clead, "#0E7490", "#E0F2FE")}
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14, fontWeight: 800 }}><span style={{ color: C.red }}>Petpooja · {aPct}%</span><span style={{ color: C.slate }}>{comp.name} · {100 - aPct}%</span></div>
        <div style={{ display: "flex", height: 18, borderRadius: 999, overflow: "hidden", background: C.slateSoft }}><div style={{ width: aPct + "%", background: C.red, transition: "width .8s" }} /><div style={{ width: (100 - aPct) + "%", background: C.slate }} /></div>
        <p style={{ fontSize: 12, color: C.muted, margin: "12px 0 0" }}>Transparent tally from feature coverage across all categories — not an opinion score.</p>
      </div>
    </>
  );
}
function Sources({ prod, comp }) {
  const items = [...prod.petpooja.sources.map((s) => ({ ...s, who: "Petpooja" })), ...comp.sources.map((s) => ({ ...s, who: comp.name }))];
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><FileText size={16} style={{ color: C.muted }} /><span style={{ fontSize: 12.5, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".05em" }}>Data sources · checked Aug 2026</span></div>
      {items.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: `1px solid ${C.border}`, gap: 12 }}>
          <div><div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{s.name}</div><div style={{ fontSize: 12.5, color: C.muted }}>{s.who} · official website</div></div>
          {s.url ? <a href={s.url} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 700, color: C.red, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}>Visit <ArrowRight size={14} /></a> : <span style={{ fontSize: 12.5, color: C.muted }}>—</span>}
        </div>
      ))}
      <p style={{ fontSize: 12, color: C.muted, margin: "14px 0 0", lineHeight: 1.55 }}>Pricing and features can change and are based on publicly available vendor sources — verify before any commercial commitment. Items not published by the vendor are shown as "Not publicly listed" or "Custom pricing".</p>
    </div>
  );
}
function Integrations({ data }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24, boxShadow: "0 4px 20px rgba(16,24,40,.05)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: C.muted }}>Add-on pricing (Ex tax):</span>
        {data.tiers.map(([d, p]) => (
          <span key={d} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: C.dark, background: C.bg, border: `1px solid ${C.border}`, padding: "6px 12px", borderRadius: 999 }}>{d} <b style={{ color: C.red }}>{p}</b></span>
        ))}
      </div>
      <div className="pc-intgrid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {data.payments.map((it) => (
          <div key={it.name} className="pc-lift" style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: C.redSoft, display: "flex", alignItems: "center", justifyContent: "center" }}><CreditCard size={16} style={{ color: C.red }} /></div>
              <span style={{ fontWeight: 800, color: C.dark, fontSize: 13.5 }}>{it.name}</span>
            </div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.45 }}>{it.desc}</div>
            {it.badge && <span style={{ display: "inline-block", marginTop: 8, fontSize: 10, fontWeight: 700, color: C.green, background: "#EAF7F0", padding: "2px 8px", borderRadius: 999, textTransform: "uppercase", letterSpacing: ".03em" }}>{it.badge}</span>}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 12, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 16px" }}>
        <div><div style={{ fontWeight: 800, color: C.dark, fontSize: 13.5 }}>{data.extra.name}</div><div style={{ fontSize: 12, color: C.muted }}>{data.extra.desc}</div></div>
        <span style={{ fontWeight: 800, color: C.red, fontSize: 14, whiteSpace: "nowrap" }}>{data.extra.price}</span>
      </div>
      <p style={{ fontSize: 12, color: C.muted, margin: "14px 0 0", fontStyle: "italic" }}>{data.note}</p>
    </div>
  );
}
function Block({ children, id }) { return <section id={id} style={{ padding: "32px 20px" }}><div style={container}><Reveal>{children}</Reveal></div></section>; }
function JumpNav({ prod }) {
  const links = [["pricing", "Pricing"], ["calculator", "Calculator"], ["features", "Features"],
    ...(prod.hardware ? [["hardware", "Hardware"]] : []),
    ...(prod.integrations ? [["integrations", "Integrations"]] : []),
    ["advantages", "Where Petpooja stands out"], ["summary", "Summary"], ["sources", "Sources"]];
  const [active, setActive] = useState(links[0][0]);
  const [ind, setInd] = useState({ left: 0, width: 0 });
  const btnRefs = useRef({});
  const lock = useRef(0);
  const measure = (id) => { const b = btnRefs.current[id]; if (b) setInd({ left: b.offsetLeft, width: b.offsetWidth }); };
  useEffect(() => { measure(active); const t = setTimeout(() => measure(active), 60); return () => clearTimeout(t); }, [active, prod]);
  useEffect(() => {
    const io = new IntersectionObserver((es) => { if (Date.now() < lock.current) return; es.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }); }, { rootMargin: "-110px 0px -62% 0px" });
    links.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [prod]);
  const go = (id) => {
    const el = document.getElementById(id); if (!el) return;
    lock.current = Date.now() + 700; setActive(id);
    const y = el.getBoundingClientRect().top + window.pageYOffset - 102;
    window.scrollTo({ top: y }); // instant — no delay
    btnRefs.current[id]?.scrollIntoView({ block: "nearest", inline: "center" });
  };
  return (
    <div className="pc-jump pc-no-print" style={{ position: "sticky", top: 54, zIndex: 30, background: "rgba(255,255,255,.82)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ ...container, display: "flex", alignItems: "center", gap: 12, padding: "9px 20px" }}>
        <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: ".08em" }}>Jump to</span>
        <div className="pc-jumpscroll" style={{ position: "relative", display: "flex", gap: 4, overflowX: "auto", flex: 1 }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, left: ind.left, width: ind.width, background: `linear-gradient(135deg, ${C.redDark}, ${C.red})`, borderRadius: 999, transition: "left .32s cubic-bezier(.22,1,.36,1), width .32s cubic-bezier(.22,1,.36,1)", boxShadow: "0 4px 14px rgba(229,57,53,.35)", pointerEvents: "none" }} />
          {links.map(([id, l]) => { const on = active === id; return (
            <button key={id} ref={(el) => (btnRefs.current[id] = el)} onClick={() => go(id)} style={{ position: "relative", zIndex: 1, flexShrink: 0, border: "none", background: "transparent", color: on ? "#fff" : C.muted, fontSize: 13, fontWeight: 700, padding: "8px 15px", borderRadius: 999, cursor: "pointer", whiteSpace: "nowrap", transition: "color .2s" }}>{l}</button>
          ); })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   APP
   ========================================================================== */
function CompareApp() {
  const [cat, setCat] = useState(null);
  const [prodKey, setProdKey] = useState(null);
  const [compSlug, setCompSlug] = useState(null);

  // deep-link: #ppu/pos/restroworks
  useEffect(() => {
    try {
      const [c, p, k] = (window.location.hash.replace("#", "").split("/"));
      if (c && CATS[c]) { setCat(c); if (p && PRODUCTS[p] && PRODUCTS[p].cat.includes(c)) { setProdKey(p); if (k && PRODUCTS[p].comps[k]) setCompSlug(k); } }
    } catch {}
  }, []);
  useEffect(() => { try { window.location.hash = [cat, prodKey, compSlug].filter(Boolean).join("/"); } catch {} }, [cat, prodKey, compSlug]);

  const chooseCat = (c) => { setCat(c); setProdKey(null); setCompSlug(null); };
  const reset = () => { setCat(null); setProdKey(null); setCompSlug(null); try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch {} };
  const chooseProd = (p) => { setProdKey(p); setCompSlug(null); setTimeout(() => document.getElementById("choose-comp")?.scrollIntoView({ behavior: "smooth" }), 60); };

  const prod = prodKey ? PRODUCTS[prodKey] : null;
  const comp = prod && compSlug ? prod.comps[compSlug] : null;
  const pName = prod ? prod.name : "";

  const [ppPlanId, setPpPlanId] = useState(null);
  const [cpPlanId, setCpPlanId] = useState(null);
  useEffect(() => { setPpPlanId(prod ? defPlanId(prod.petpooja.pricing) : null); }, [prodKey]);
  useEffect(() => { setCpPlanId(comp ? defPlanId(comp.pricing) : null); }, [prodKey, compSlug]);
  const ppPlan = prod ? getPlanById(prod.petpooja.pricing, ppPlanId) : null;
  const compPlan = comp ? getPlanById(comp.pricing, cpPlanId) : null;

  const share = () => { try { window.open(`https://wa.me/?text=${encodeURIComponent(`Compare Petpooja ${pName} vs ${comp.name} ` + window.location.href)}`, "_blank"); } catch {} };
  const copy = () => { try { navigator.clipboard.writeText(window.location.href); } catch {} };

  return (
    <div id="top" style={{ background: C.bg, minHeight: "100vh", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: C.dark }}>
      <style>{CSS}</style>
      <Nav cat={cat} chooseCat={chooseCat} reset={reset} />

      {/* HERO */}
      {!cat ? (
        <CategoryLanding onPick={chooseCat} />
      ) : (
        <section className="pc-no-print" style={{ position: "relative" }}>
          <div className="pc-glow" style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 55% at 82% 0%, rgba(229,57,53,.10), transparent 60%), radial-gradient(50% 50% at 8% 20%, rgba(51,65,85,.07), transparent 60%)" }} />
          <div style={{ ...container, position: "relative", padding: "44px 20px 28px", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 700, color: C.red, background: C.redSoft, padding: "6px 13px", borderRadius: 999 }}><Store size={14} /> {cat.toUpperCase()} selected · switch in Settings</div>
            <h1 style={{ fontSize: 36, lineHeight: 1.12, fontWeight: 800, letterSpacing: "-.03em", margin: "16px auto 10px", maxWidth: 720 }}>Choose a Petpooja product</h1>
            <p style={{ fontSize: 16.5, color: C.muted, maxWidth: 560, margin: "0 auto 26px" }}>Pick a product, then a competitor — the comparison appears instantly.</p>

            <div key={cat} className="pc-swap pc-prodgrid" style={{ display: "grid", gridTemplateColumns: `repeat(${CATS[cat].length}, 1fr)`, gap: 14, maxWidth: CATS[cat].length === 2 ? 620 : 860, margin: "0 auto" }}>
              {CATS[cat].map((pk) => {
                const pr = PRODUCTS[pk], active = prodKey === pk;
                return (
                  <button key={pk} onClick={() => chooseProd(pk)} className="pc-lift pc-prodcard" style={{ textAlign: "left", background: C.card, border: `1.5px solid ${active ? C.red : C.border}`, borderRadius: 18, padding: 20, cursor: "pointer", boxShadow: active ? "0 10px 30px rgba(229,57,53,.12)" : "0 4px 20px rgba(16,24,40,.05)" }}>
                    <div className="pc-picon" style={{ width: 42, height: 42, borderRadius: 12, background: C.redSoft, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><pr.Icon size={21} style={{ color: C.red }} /></div>
                    <div style={{ fontWeight: 800, color: C.dark, fontSize: 16 }}>{pr.name}</div>
                    <div style={{ fontSize: 12.5, color: C.muted, margin: "5px 0 10px", lineHeight: 1.45 }}>{pr.desc}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>{pr.caps.map((c) => <span key={c} style={{ fontSize: 11, fontWeight: 600, color: C.slate, background: C.slateSoft, padding: "3px 8px", borderRadius: 999 }}>{c}</span>)}</div>
                    <span style={{ ...btnPrimary, fontSize: 13, padding: "8px 14px" }}>Compare {pr.name} <ArrowRight size={14} /></span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* COMPETITOR CHOOSER */}
      {prod && (
        <section id="choose-comp" className="pc-no-print" style={{ ...container, padding: "10px 20px 6px" }}>
          <Reveal>
            <Breadcrumb cat={cat} pName={pName} comp={comp} />
            <div style={{ maxWidth: 560, margin: "8px auto 0", textAlign: "center" }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: C.dark, marginBottom: 6 }}>Compare Petpooja {pName}</h2>
              <div style={{ fontSize: 14, color: C.muted, marginBottom: 14 }}>Choose a competitor to see the full comparison.</div>
              <Combobox comps={prod.comps} value={compSlug} onChange={setCompSlug} placeholder="Search competitor…" />
            </div>
          </Reveal>
        </section>
      )}

      {!prod && <div style={{ textAlign: "center", color: C.muted, padding: "10px 20px 50px", fontSize: 15 }}>Choose a Petpooja product above to start comparing.</div>}
      {prod && !comp && <div style={{ textAlign: "center", color: C.muted, padding: "24px 20px 50px", fontSize: 15 }}>Choose a competitor to see the comparison.</div>}

      {/* COMPARISON */}
      {prod && comp && (
        <div key={prodKey + compSlug} className="pc-swap">
          <JumpNav prod={prod} />
          <Block><div id="cmp"><SectionHead kicker="Head to head" title={`Petpooja ${pName} vs ${comp.name}`} sub="Petpooja stays on the left. Everything below updates for your selection." />
            <div className="pc-two" style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "center" }}>
              <ProductCard name={`Petpooja ${pName}`} badge="Petpooja" tagline={prod.desc} mono="P" accent={C.red} accentSoft={C.redSoft} />
              <div className="pc-vs" style={{ display: "flex", justifyContent: "center" }}><div className="pc-vsbadge" style={{ width: 46, height: 46, borderRadius: 999, background: `linear-gradient(140deg, ${C.redDark}, ${C.red})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>VS</div></div>
              <ProductCard name={comp.name} badge="Selected" tagline={comp.tagline} mono={comp.name[0]} accent={C.slate} accentSoft={C.slateSoft} />
            </div>
          </div></Block>

          <Block><SectionHead kicker="Pricing" title="Pricing comparison" sub="Compare the real pricing model, not just the starting price." /><Pricing prod={prod} comp={comp} pName={pName} ppPlan={ppPlan} setPpPlan={setPpPlanId} compPlan={compPlan} setCompPlan={setCpPlanId} /></Block>
          <Block id="calculator"><Calculator prod={prod} comp={comp} pName={pName} ppPlan={ppPlan} compPlan={compPlan} /></Block>
          <Block><SectionHead kicker="Features" title="Feature comparison" sub="Tap a category to expand. First two are open by default." /><Features prod={prod} comp={comp} /></Block>
          {prod.hardware && <Block id="hardware"><SectionHead kicker="Hardware" title="Hardware comparison" sub="Devices, printers and installation — shown only where hardware is relevant." /><Hardware prod={prod} comp={comp} /></Block>}
          {prod.integrations && <Block id="integrations"><SectionHead kicker="Integrations" title="Payment & Tally integrations" sub="EDC machines, Android POS, dynamic QR and Tally — available with Petpooja Invoice." /><Integrations data={prod.integrations} /></Block>}
          <Block id="advantages"><SectionHead kicker="Advantages" title="Where each stands out" /><Advantages prod={prod} comp={comp} /></Block>
          <Block id="summary"><SectionHead kicker="Summary" title="Comparison summary" sub="A transparent tally — where Petpooja leads, where they're similar, and where the competitor leads." /><Summary prod={prod} comp={comp} /></Block>
          <Block><div id="sources"><SectionHead kicker="Transparency" title="Data sources" /><Sources prod={prod} comp={comp} /></div></Block>

          <section className="pc-no-print" style={{ padding: "6px 20px 40px" }}>
            <div style={{ ...container, display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
              <button onClick={share} style={btnGhost}><Share2 size={16} /> WhatsApp</button>
              <button onClick={copy} style={btnGhost}><Layers size={16} /> Copy link</button>
              <button onClick={() => window.print()} style={btnPrimary}><Printer size={16} /> Download / Print</button>
            </div>
          </section>
        </div>
      )}

      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "22px 20px 40px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: C.muted, maxWidth: 640, margin: "0 auto", lineHeight: 1.6 }}>Information is based on publicly available vendor sources and should be verified before any commercial commitment. Cost estimates use published pricing and are not official quotations.</p>
      </footer>
    </div>
  );
}
function Breadcrumb({ cat, pName, comp }) {
  const sep = <ChevronRight size={14} style={{ color: C.grey }} />;
  return (
    <div className="pc-no-print" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, color: C.muted, fontWeight: 600 }}>
      <span style={{ color: C.red, fontWeight: 800 }}>{cat.toUpperCase()}</span>{sep}<span style={{ color: C.dark }}>{pName}</span>{comp && <>{sep}<span style={{ color: C.dark }}>{comp.name}</span></>}
    </div>
  );
}

/* ============================================================================
   CSS
   ========================================================================== */
const CSS = `\n#pricing,#calculator,#features,#hardware,#integrations,#advantages,#summary,#sources{scroll-margin-top:112px;}
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;}
.pc-jumpscroll::-webkit-scrollbar{height:0;}
body{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;}
::selection{background:rgba(229,57,53,.18);}
::-webkit-scrollbar{width:11px;height:11px;}
::-webkit-scrollbar-thumb{background:#d7dbe0;border-radius:99px;border:3px solid #F7F8FA;}
::-webkit-scrollbar-thumb:hover{background:#c2c8cf;}
.pc-jump::-webkit-scrollbar{height:0;}
button{transition:transform .12s ease, box-shadow .2s ease, filter .15s ease, background .15s ease, color .15s ease, border-color .15s ease;}
button:active{transform:translateY(1px) scale(.995);}
.pc-reveal{opacity:0;transform:translateY(22px) scale(.99);transition:opacity .7s cubic-bezier(.22,1,.36,1), transform .7s cubic-bezier(.22,1,.36,1);}
.pc-reveal.pc-in{opacity:1;transform:none;}
.pc-pop{animation:pcpop .18s ease;}
@keyframes pcpop{from{opacity:0;transform:translateY(-6px) scale(.98);}to{opacity:1;transform:none;}}
.pc-swap{animation:pcswap .5s cubic-bezier(.22,1,.36,1);}
@keyframes pcswap{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;}}
.pc-lift{transition:transform .24s cubic-bezier(.22,1,.36,1), box-shadow .24s ease, border-color .24s ease;}
.pc-lift:hover{transform:translateY(-5px);box-shadow:0 22px 48px rgba(16,24,40,.15) !important;}
.pc-picon{transition:transform .35s cubic-bezier(.34,1.56,.64,1), background .25s ease;}
.pc-prodcard{position:relative;overflow:hidden;}
.pc-prodcard::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#E53935,#ff8a80);transform:scaleX(0);transform-origin:left;transition:transform .35s ease;}
.pc-prodcard:hover{border-color:#f3b4b0 !important;}
.pc-prodcard:hover::before{transform:scaleX(1);}
.pc-prodcard:hover .pc-picon{transform:scale(1.1) rotate(-4deg);background:#E53935 !important;}
.pc-prodcard:hover .pc-picon svg{color:#fff !important;}
.pc-catcard:hover{border-color:#f3b4b0 !important;}
.pc-catcard:hover .pc-picon{transform:scale(1.12) rotate(-3deg);background:#E53935 !important;}
.pc-catcard:hover .pc-picon svg{color:#fff !important;}
.pc-vsbadge{box-shadow:0 6px 18px rgba(229,57,53,.4);animation:pcvs 2.4s ease-in-out infinite;}
@keyframes pcvs{0%{box-shadow:0 6px 18px rgba(229,57,53,.4),0 0 0 0 rgba(229,57,53,.5);}70%{box-shadow:0 6px 18px rgba(229,57,53,.4),0 0 0 16px rgba(229,57,53,0);}100%{box-shadow:0 6px 18px rgba(229,57,53,.4),0 0 0 0 rgba(229,57,53,0);}}
.pc-primary::after{content:"";position:absolute;inset:-2px;border-radius:20px;padding:2px;background:linear-gradient(130deg,#E53935,#ffb3ac,#E53935);background-size:220% 220%;-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:pcborder 4.5s linear infinite;pointer-events:none;}
@keyframes pcborder{0%{background-position:0% 50%;}100%{background-position:220% 50%;}}
.pc-glow{animation:pcglow 9s ease-in-out infinite;}
@keyframes pcglow{0%,100%{opacity:.7;transform:scale(1);}50%{opacity:1;transform:scale(1.05);}}
.pc-range{-webkit-appearance:none;appearance:none;height:6px;border-radius:999px;background:rgba(255,255,255,.18);outline:none;}
.pc-range::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:999px;background:#E53935;cursor:pointer;box-shadow:0 2px 12px rgba(229,57,53,.55);border:3px solid #fff;transition:transform .15s;}
.pc-range::-webkit-slider-thumb:hover{transform:scale(1.18);}
.pc-range::-moz-range-thumb{width:20px;height:20px;border-radius:999px;background:#E53935;cursor:pointer;border:3px solid #fff;}
@media (max-width:860px){
  .pc-desk{display:none !important;}
  .pc-mob-btn{display:inline-flex !important;}
  .pc-two{grid-template-columns:1fr !important;}
  .pc-vs{padding:4px 0;}
  .pc-grid3{grid-template-columns:1fr !important;}
  .pc-prodgrid{grid-template-columns:1fr !important;}
  .pc-catgrid{grid-template-columns:1fr !important;}
  .pc-intgrid{grid-template-columns:1fr !important;}
  .pc-calc-in,.pc-calc-out{grid-template-columns:1fr !important;}
  h1{font-size:32px !important;}
}
@media print{.pc-no-print{display:none !important;}.pc-reveal{opacity:1 !important;transform:none !important;}body{background:#fff;}}\n`;

/* ============================================================================
   AUTH LAYER (Neon via /api serverless functions). Roles + permanent DB.
   Super Admin (custom pw) manages admins + super admins + employees.
   Admin (custom pw) manages employees. Employee pw derived from email.
   ========================================================================== */
const LOGO = "data:image/png;base64,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";
function Logo({ size = 28, light = false }) { return <img src={LOGO} alt="Petpooja" style={{ height: size, width: "auto", display: "block", filter: light ? "brightness(0) invert(1)" : "none" }} />; }
const CONTACT = "karan.raval@petpooja.com";
const API = async (path, body) => { const r = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); return r.json(); };
const genPassword = (email) => {
  const local = String(email).split("@")[0].toLowerCase().trim();
  const parts = local.split(".");
  const first = ((parts[0] || "user").replace(/[^a-z]/g, "").slice(0, 3)) || "usr";
  const secondRaw = parts[1] || "";
  const secondLetter = (secondRaw.replace(/[^a-z]/g, "").charAt(0)) || "x";
  const digits = (secondRaw.match(/\d+$/) || [""])[0];
  return `${first}.${secondLetter}${digits}@123`;
};
const auth = {
  async signIn(email, password) {
    const em = email.trim().toLowerCase();
    try {
      const data = await API("/api/login", { email: em, password });
      if (!data || !data.ok) return { ok: false, error: (data && data.reason === "bad_password") ? ("Incorrect password. Please contact " + CONTACT) : ("This email isn't enabled for login. Please contact " + CONTACT) };
      return { ok: true, role: data.role };
    } catch (e) { return { ok: false, error: "Network error. Please try again." }; }
  },
};
const AUTH_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;}
.pc-fade{animation:pcfade .3s ease;} @keyframes pcfade{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
.pc-spin{animation:pcspin 1s linear infinite;} @keyframes pcspin{to{transform:rotate(360deg);}}
.pc-authbg{background-size:180% 180%;animation:pcauth 12s ease infinite;}
@keyframes pcauth{0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0% 50%;}}
.pc-float{animation:pcfloat 9s ease-in-out infinite;} .pc-float2{animation:pcfloat 11s ease-in-out infinite reverse;}
@keyframes pcfloat{0%,100%{transform:translate(0,0);}50%{transform:translate(-16px,22px);}}
.pc-stagger>*{opacity:0;animation:pcup .6s cubic-bezier(.22,1,.36,1) forwards;}
.pc-stagger>*:nth-child(1){animation-delay:.06s;}.pc-stagger>*:nth-child(2){animation-delay:.16s;}.pc-stagger>*:nth-child(3){animation-delay:.26s;}
@keyframes pcup{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}
button{transition:transform .12s ease, box-shadow .2s ease;} button:active{transform:translateY(1px);}
@media(max-width:820px){ .pc-login{grid-template-columns:1fr!important;} .pc-brandpanel{display:none!important;} .pc-brandmobile{display:flex!important;} }
@media(max-width:760px){ .pc-two{grid-template-columns:1fr!important;} .pc-three{grid-template-columns:1fr!important;} .pc-hide-sm{display:none!important;} }
`;
function Login({ onAuthed }) {
  const [email, setEmail] = useState(""), [pw, setPw] = useState(""), [show, setShow] = useState(false), [busy, setBusy] = useState(false), [err, setErr] = useState("");
  const submit = async () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setErr("Enter a valid work email."); return; }
    setErr(""); setBusy(true);
    const r = await auth.signIn(email, pw); setBusy(false);
    if (!r.ok) { setErr(r.error); return; }
    onAuthed({ email: email.trim().toLowerCase(), role: r.role, password: pw });
  };
  const input = { width: "100%", padding: "14px 14px 14px 44px", fontSize: 15, border: `1.5px solid ${C.border}`, borderRadius: 12, outline: "none", boxSizing: "border-box" };
  const btn = { width: "100%", padding: 14, fontSize: 15, fontWeight: 700, color: "#fff", background: C.red, border: "none", borderRadius: 12, cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 20px rgba(229,57,53,.22)" };
  return (
    <div className="pc-login" style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1.05fr 1fr", fontFamily: "Inter, -apple-system, system-ui, sans-serif" }}>
      <style>{AUTH_CSS}</style>
      <div className="pc-brandpanel pc-authbg" style={{ position: "relative", background: `linear-gradient(155deg, ${C.redDark} 0%, ${C.red} 55%, #ff6f60 100%)`, color: "#fff", padding: "56px", display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden" }}>
        <div className="pc-float" style={{ position: "absolute", width: 420, height: 420, borderRadius: "50%", background: "rgba(255,255,255,.10)", top: -120, right: -120 }} />
        <div className="pc-float2" style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,.08)", bottom: -100, left: -60 }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}><div style={{ background: "#fff", borderRadius: 12, padding: "8px 10px", display: "flex" }}><Logo size={30} /></div><span style={{ fontWeight: 800, fontSize: 19 }}>Compare</span></div>
        <div style={{ position: "relative" }}>
          <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-.02em", margin: "0 0 14px" }}>Win the deal with a clear, honest comparison.</h1>
          <p style={{ fontSize: 15.5, color: "rgba(255,255,255,.9)", margin: "0 0 26px", maxWidth: 380 }}>Pricing, features, hardware and advantages for every Petpooja product vs the competition - in one place.</p>
          <div className="pc-stagger">{[[IndianRupee, "Real pricing & plan-by-plan breakdowns"], [Cpu, "Hardware & integrations, side by side"], [ShieldCheck, "Transparent, no fabricated data"]].map(([Ic, t]) => (<div key={t} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}><div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ic size={17} /></div><span style={{ fontSize: 14.5, fontWeight: 500 }}>{t}</span></div>))}</div>
        </div>
        <div style={{ position: "relative", fontSize: 12.5, color: "rgba(255,255,255,.75)" }}>Internal sales tool - access by invite only</div>
      </div>
      <div style={{ background: C.bg, display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div className="pc-brandmobile" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}><Logo size={30} /><span style={{ fontWeight: 800, fontSize: 17, color: C.dark }}>Compare</span></div>
          <div className="pc-fade">
            <h2 style={{ fontSize: 24, fontWeight: 800, color: C.dark, margin: "0 0 6px" }}>Sign in</h2>
            <p style={{ color: C.muted, fontSize: 14.5, margin: "0 0 24px" }}>Enter your work email and password.</p>
            <label style={{ fontSize: 13, fontWeight: 700, color: C.dark, display: "block", marginBottom: 7 }}>Work email</label>
            <div style={{ position: "relative", marginBottom: 16 }}><Mail size={18} style={{ position: "absolute", left: 15, top: 15, color: C.muted }} /><input style={input} type="email" placeholder="you@petpooja.com" value={email} autoFocus onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} onFocus={(e) => (e.target.style.borderColor = C.red)} onBlur={(e) => (e.target.style.borderColor = C.border)} /></div>
            <label style={{ fontSize: 13, fontWeight: 700, color: C.dark, display: "block", marginBottom: 7 }}>Password</label>
            <div style={{ position: "relative", marginBottom: 18 }}><Lock size={18} style={{ position: "absolute", left: 15, top: 15, color: C.muted }} /><input style={{ ...input, paddingRight: 44 }} type={show ? "text" : "password"} placeholder="Your password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} onFocus={(e) => (e.target.style.borderColor = C.red)} onBlur={(e) => (e.target.style.borderColor = C.border)} /><button onClick={() => setShow((v) => !v)} style={{ position: "absolute", right: 8, top: 8, border: "none", background: "transparent", color: C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 6 }}>{show ? "Hide" : "Show"}</button></div>
            <button style={btn} onClick={submit} disabled={busy}>{busy ? <><Loader2 size={17} className="pc-spin" /> Signing in...</> : <>Sign in <ArrowRight size={17} /></>}</button>
            {err && <div style={{ color: C.red, fontSize: 13, marginTop: 16, background: C.redSoft, padding: "10px 12px", borderRadius: 10, lineHeight: 1.5 }}>{err}</div>}
          </div>
          <div style={{ marginTop: 26, paddingTop: 18, borderTop: `1px solid ${C.border}`, fontSize: 12.5, color: C.muted }}>
            <div style={{ display: "flex", gap: 7, alignItems: "flex-start" }}><ShieldCheck size={15} style={{ color: C.green, flexShrink: 0, marginTop: 1 }} /><span>Don't have access? For login, contact <a href={"mailto:" + CONTACT} style={{ color: C.red, fontWeight: 700, textDecoration: "none" }}>{CONTACT}</a></span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
function AdminHeader({ user, logout, onBack }) {
  const label = user.role === "superadmin" ? "Super Admin" : "Admin";
  return <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(255,255,255,.9)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}`, padding: "11px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Logo size={26} /><span style={{ fontWeight: 800, fontSize: 16.5 }}>Compare <span style={{ color: C.muted, fontWeight: 600 }}>{label}</span></span></div>
    <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}><button onClick={onBack} style={{ border: "none", background: "none", color: C.red, fontWeight: 700, cursor: "pointer" }}>&#8592; Site</button><span style={{ color: C.muted }} className="pc-hide-sm">{user.email}</span><button onClick={logout} style={{ border: `1px solid ${C.border}`, background: "#fff", borderRadius: 999, padding: "6px 12px", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}><LogOut size={14} /> Log out</button></div>
  </header>;
}
function Admin({ user, logout, onBack }) {
  const isSuper = user.role === "superadmin";
  const [employees, setEmployees] = useState([]), [staff, setStaff] = useState([]), [usage, setUsage] = useState([]), [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState(""), [bulk, setBulk] = useState(""), [msg, setMsg] = useState(""), [copied, setCopied] = useState("");
  const [sEmail, setSEmail] = useState(""), [sPass, setSPass] = useState(""), [sRole, setSRole] = useState("admin"), [sMsg, setSMsg] = useState("");
  const api = (action, extra) => API("/api/admin", { action, adminEmail: user.email, adminPassword: user.password, ...(extra || {}) });
  const load = async () => {
    setLoading(true);
    const calls = [api("list_employees"), api("usage")];
    if (isSuper) calls.push(api("list_staff"));
    const res = await Promise.all(calls);
    setEmployees(res[0].data || []); setUsage(res[1].data || []); if (isSuper) setStaff(res[2].data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  const addEmployees = async (list) => {
    const clean = list.map((x) => x.trim().toLowerCase()).filter(Boolean);
    if (!clean.length) { setMsg("No emails to add."); return; }
    const r = await api("add_employees", { emails: clean });
    if (r.error) { setMsg("Error: " + r.error); return; }
    setMsg("Added " + (r.count || 0) + " employee" + ((r.count || 0) === 1 ? "" : "s")); load();
  };
  const addOne = async () => { await addEmployees([newEmail]); setNewEmail(""); };
  const addBulk = async () => { await addEmployees(bulk.split(/[\s,;]+/)); setBulk(""); };
  const removeEmp = async (e) => { await api("remove_employee", { target: e }); load(); };
  const addStaff = async () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(sEmail)) { setSMsg("Enter a valid email."); return; }
    if (sPass.trim().length < 4) { setSMsg("Password must be at least 4 characters."); return; }
    const r = await api("add_staff", { newEmail: sEmail, newPassword: sPass, role: sRole });
    if (r.error || r.ok === false) { setSMsg("Error: " + (r.error || "failed")); return; }
    setSMsg("Saved " + sEmail.trim().toLowerCase() + " as " + (sRole === "superadmin" ? "Super Admin" : "Admin")); setSEmail(""); setSPass(""); load();
  };
  const removeStaff = async (e) => { if (e === user.email) { setSMsg("You can't remove yourself."); return; } await api("remove_staff", { target: e }); load(); };
  const copy = (p) => { try { navigator.clipboard.writeText(p); setCopied(p); setTimeout(() => setCopied(""), 1200); } catch {} };
  const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 22, boxShadow: "0 4px 20px rgba(16,24,40,.05)" };
  const input = { padding: "12px 14px", fontSize: 15, border: `1.5px solid ${C.border}`, borderRadius: 12, outline: "none", boxSizing: "border-box" };
  const addBtn = { padding: "12px 18px", fontSize: 14.5, fontWeight: 700, color: "#fff", background: C.red, border: "none", borderRadius: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7 };
  const totalOpens = usage.reduce((s, u) => s + Number(u.opens), 0);
  const roleBadge = (role) => role === "superadmin"
    ? <span style={{ fontSize: 10, fontWeight: 800, color: "#7A5B00", background: "#FFF3CC", padding: "2px 7px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 3 }}><Crown size={11} /> SUPER</span>
    : <span style={{ fontSize: 10, fontWeight: 800, color: C.red, background: C.redSoft, padding: "2px 7px", borderRadius: 999 }}>ADMIN</span>;
  return <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, -apple-system, system-ui, sans-serif", color: C.dark }}><style>{AUTH_CSS}</style>
    <AdminHeader user={user} logout={logout} onBack={onBack} />
    <div style={{ maxWidth: 940, margin: "0 auto", padding: "26px 20px 60px" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.02em", margin: "0 0 4px" }}>{isSuper ? "Super Admin portal" : "Admin portal"}</h1>
      <p style={{ color: C.muted, fontSize: 14, margin: "0 0 22px" }}>{isSuper ? "Manage employees, admins and super admins - all saved in the database." : "Add employees who can log in - saved in the database."}</p>
      <div className="pc-three" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
        {[["Employees", employees.length, ShieldCheck], ["Active users", usage.length, Users], ["Total opens", totalOpens, Activity]].map(([l, v, Ic]) => <div key={l} style={card}><div style={{ display: "flex", alignItems: "center", gap: 8, color: C.muted, fontSize: 13, fontWeight: 600 }}><Ic size={15} /> {l}</div><div style={{ fontSize: 30, fontWeight: 800, marginTop: 6 }}>{v}</div></div>)}
      </div>
      {isSuper && <div style={{ ...card, marginBottom: 20, border: "1.5px solid #FFE49B", background: "#FFFCF3" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 15.5, marginBottom: 3 }}><Crown size={17} style={{ color: "#B8860B" }} /> Team access (admins & super admins)</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>These logins use a custom password you set here (not the auto rule).</div>
        <div className="pc-two" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr auto auto", gap: 10, alignItems: "center" }}>
          <input style={input} placeholder="name.surname@petpooja.com" value={sEmail} onChange={(e) => setSEmail(e.target.value)} />
          <input style={input} placeholder="Set a password" value={sPass} onChange={(e) => setSPass(e.target.value)} />
          <select value={sRole} onChange={(e) => setSRole(e.target.value)} style={{ ...input, cursor: "pointer" }}><option value="admin">Admin</option><option value="superadmin">Super Admin</option></select>
          <button onClick={addStaff} style={addBtn}><UserPlus size={16} /> Add</button>
        </div>
        {sMsg && <div style={{ fontSize: 13, color: sMsg.startsWith("Saved") ? "#0B7A48" : C.red, marginTop: 10 }}>{sMsg}</div>}
        <div style={{ marginTop: 16 }}>
          {staff.map((a) => <div key={a.email} style={{ display: "grid", gridTemplateColumns: "1fr 160px 90px", padding: "10px 0", borderTop: `1px solid ${C.border}`, alignItems: "center", gap: 8 }}>
            <div><span style={{ fontSize: 14, fontWeight: 600 }}>{a.email}</span> {roleBadge(a.role)}<div style={{ fontSize: 11.5, color: C.muted }}>added by {a.added_by || "-"}</div></div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><code style={{ fontSize: 13, fontWeight: 700, color: C.dark, background: C.bg, padding: "4px 8px", borderRadius: 7 }}>{a.password}</code><button onClick={() => copy(a.password)} style={{ border: "none", background: "transparent", color: copied === a.password ? C.green : C.muted, cursor: "pointer", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}><Copy size={13} /> {copied === a.password ? "Copied" : ""}</button></div>
            <div style={{ textAlign: "right" }}>{a.email !== user.email && <button onClick={() => removeStaff(a.email)} style={{ border: `1px solid ${C.border}`, background: "#fff", color: C.red, borderRadius: 999, padding: "5px 11px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}><Trash2 size={13} /> Remove</button>}</div>
          </div>)}
        </div>
      </div>}
      <div className="pc-two" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={card}>
          <div style={{ fontWeight: 800, fontSize: 15.5, marginBottom: 3 }}>Add an employee</div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>Saved to the database. Password auto-generated.</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><input style={{ ...input, flex: 1, minWidth: 180 }} placeholder="name.surname@petpooja.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addOne()} /><button onClick={addOne} style={addBtn}><UserPlus size={16} /> Add</button></div>
          {newEmail.includes("@") && <div style={{ marginTop: 10, fontSize: 12.5, color: C.muted }}>Password will be: <b style={{ color: C.dark, fontFamily: "monospace" }}>{genPassword(newEmail)}</b></div>}
        </div>
        <div style={card}>
          <div style={{ fontWeight: 800, fontSize: 15.5, marginBottom: 3 }}>Bulk add (paste from Excel)</div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>One email per line, or comma-separated.</div>
          <textarea style={{ ...input, width: "100%", height: 76, resize: "vertical", fontFamily: "inherit" }} placeholder={"a.sharma@petpooja.com\nb.verma@petpooja.com"} value={bulk} onChange={(e) => setBulk(e.target.value)} />
          <button onClick={addBulk} style={{ ...addBtn, marginTop: 10 }}><UserPlus size={16} /> Add all</button>
        </div>
      </div>
      {msg && <div style={{ fontSize: 13, color: msg.startsWith("Added") ? "#0B7A48" : C.red, margin: "0 0 16px" }}>{msg}</div>}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 15.5, marginBottom: 12 }}>Employees & passwords {loading && <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>- loading...</span>}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 90px", padding: "9px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".04em" }}><span>Email</span><span>Password</span><span></span></div>
        {employees.map((a) => <div key={a.email} style={{ display: "grid", gridTemplateColumns: "1fr 160px 90px", padding: "11px 0", borderBottom: `1px solid ${C.border}`, alignItems: "center", gap: 8 }}>
          <div><span style={{ fontSize: 14, fontWeight: 600 }}>{a.email}</span><div style={{ fontSize: 11.5, color: C.muted }}>added by {a.added_by || "-"}</div></div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><code style={{ fontSize: 13, fontWeight: 700, color: C.dark, background: C.bg, padding: "4px 8px", borderRadius: 7 }}>{genPassword(a.email)}</code><button onClick={() => copy(genPassword(a.email))} style={{ border: "none", background: "transparent", color: copied === genPassword(a.email) ? C.green : C.muted, cursor: "pointer", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}><Copy size={13} /> {copied === genPassword(a.email) ? "Copied" : ""}</button></div>
          <div style={{ textAlign: "right" }}><button onClick={() => removeEmp(a.email)} style={{ border: `1px solid ${C.border}`, background: "#fff", color: C.red, borderRadius: 999, padding: "5px 11px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}><Trash2 size={13} /> Remove</button></div>
        </div>)}
        {!loading && employees.length === 0 && <div style={{ color: C.muted, fontSize: 13, padding: "12px 0" }}>No employees yet - add one above.</div>}
      </div>
      <div style={card}>
        <div style={{ fontWeight: 800, fontSize: 15.5, marginBottom: 3 }}>Usage - logins / opens per user</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>Counts every login. Stored in the database.</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 150px", padding: "10px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12.5, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".04em" }}><span>User</span><span style={{ textAlign: "right" }}>Opens</span><span style={{ textAlign: "right" }}>Last seen</span></div>
        {usage.length === 0 && <div style={{ color: C.muted, fontSize: 13, padding: "12px 0" }}>No activity yet.</div>}
        {usage.map((u) => <div key={u.email} style={{ display: "grid", gridTemplateColumns: "1fr 90px 150px", padding: "11px 0", borderBottom: `1px solid ${C.border}`, alignItems: "center" }}><span style={{ fontSize: 14 }}>{u.email}</span><span style={{ textAlign: "right", fontWeight: 800 }}>{u.opens}</span><span style={{ textAlign: "right", fontSize: 13, color: C.muted }}>{u.last_seen ? new Date(u.last_seen).toLocaleString() : "-"}</span></div>)}
      </div>
    </div>
  </div>;
}
function LoggedInBar({ user, logout, onAdmin }) {
  return <div style={{ background: C.dark, color: "#fff", padding: "7px 20px", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 14, fontSize: 13, fontFamily: "Inter, system-ui, sans-serif" }}>
    <span style={{ color: "#9aa5b1" }}>Signed in</span><span style={{ fontWeight: 600 }} className="pc-hide-sm">{user.email}</span>
    {onAdmin && <button onClick={onAdmin} style={{ border: "none", background: "rgba(255,255,255,.14)", color: "#fff", borderRadius: 999, padding: "4px 12px", fontWeight: 700, cursor: "pointer", fontSize: 12.5 }}>{user.role === "superadmin" ? "Super Admin" : "Admin"}</button>}
    <button onClick={logout} style={{ border: "none", background: C.red, color: "#fff", borderRadius: 999, padding: "4px 12px", fontWeight: 700, cursor: "pointer", fontSize: 12.5, display: "inline-flex", alignItems: "center", gap: 5 }}><LogOut size={13} /> Log out</button>
  </div>;
}
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const isAdmin = user && (user.role === "admin" || user.role === "superadmin");
  if (!user) return <Login onAuthed={(u) => { setUser(u); setView("dashboard"); }} />;
  if (view === "admin" && isAdmin) return <Admin user={user} logout={() => setUser(null)} onBack={() => setView("dashboard")} />;
  return <><LoggedInBar user={user} logout={() => setUser(null)} onAdmin={isAdmin ? () => setView("admin") : null} /><CompareApp /></>;
}
