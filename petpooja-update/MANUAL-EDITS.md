# Two edits to do by hand (I-1 and I-2)

The patch script does **4 of the 6** changes automatically (MOJO AI + the 3 invoice
competitors + their pricing). These last two touch pricing/UI text that differs between
installs, so do them by hand in VS Code (Ctrl+H find & replace).

---

## I-1 — Remove the "Before 1 Oct 2026 / From 1 Oct 2026" toggle

**Delete this whole block** from `PetpoojaCompareFull.jsx`:

```jsx
          {prodKey === "invoice" && (
            <div className="pc-no-print" style={{ ...container, padding: "12px 20px 0", display: "flex", justifyContent: "center" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: C.card, border: `1px solid ${C.border}`, borderRadius: 999, padding: "6px 8px 6px 14px", boxShadow: "0 4px 16px rgba(16,24,40,.06)" }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: C.muted }}>Invoice plans:</span>
                {[["before", "Before 1 Oct 2026"], ["after", "From 1 Oct 2026"]].map(([v, l]) => <button key={v} onClick={() => setInvMode(v)} style={{ border: "none", cursor: "pointer", borderRadius: 999, padding: "7px 14px", fontSize: 12.5, fontWeight: 800, background: invMode === v ? C.red : "transparent", color: invMode === v ? "#fff" : C.dark }}>{l}</button>)}
              </div>
            </div>
          )}
```

> If your copy's text is slightly different: search for `Before 1 Oct 2026` and delete the
> whole `{prodKey === "invoice" && ( ... )}` wrapper around it.
> You can leave `invMode` / `setInvMode` / `effProd` alone — with `plansAfter` gone they
> harmlessly fall back to `plans`.

---

## I-2 — Keep only after-Oct pricing + move AI Try-On into Basic

Find the invoice product's `plans: [ ... ]` array **and** the `plansAfter: [ ... ]` array
right after it. **Replace both** with just this single `plans` array:

```js
    plans: [
      { id: "basic", name: "Basic", def: true, y1: 6000, y3: 10000, renewal: 3500, renewalLabel: "Renewal / year", note: "Billing & POS, Multi-Counter / Multi-User, HO & Warehouse Management, Inventory, Reporting, Accounting features, Mobile B2C app, Weighing scale, AI Try-On (clothing), Unlimited WhatsApp E-Bills via WABA. All core retail needs, no extra add-ons required." },
      { id: "advance", name: "Advance", badge: "Complete", y1: 12000, y3: 16000, renewal: 5000, renewalLabel: "Renewal / year", note: "Everything in Basic + Purchase AI, Shopify, WhatsApp Messaging, Petpooja Loyalty, Tally, Merchant Website, EDC Payment, Static QR (upcoming), ADSR, AI Theft Detection, WhatsApp Order (upcoming)." },
    ],
```

The key change: **AI Try-On (clothing)** now sits in the **Basic** note, and is removed
from Advance. Only after-Oct numbers remain (Basic 6000/10000/3500, Advance 12000/16000/5000).

---

After both: `git add . && git commit -m "Marketing MOJO AI + invoice competitors, after-Oct pricing" && git push`
