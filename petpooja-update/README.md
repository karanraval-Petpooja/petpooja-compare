# Petpooja Compare — update pack

Updates `PetpoojaCompareFull.jsx`:
- **Marketing:** adds **MOJO AI** (owner asks business questions) as a new "AI Assistant" feature; competitors show ✕, Petpooja shows ✓.
- **Invoice:** adds **Khatabook, GoGST Bill, AlignBooks** competitors + their pricing; moves **AI Try-On** into the **Basic** plan; drops old before-Oct pricing & the toggle.

## How to use

1. Copy this `petpooja-update` folder into your project (next to `src/`), e.g. into
   `C:\Users\Petpooja-1317\Desktop\petpooja-app\petpooja-test\`.

2. From your project root (the folder that has `src/`), run:

   ```
   node petpooja-update/scripts/apply-update.mjs
   ```

   It auto-applies 4 of the 6 changes **to your own file** (a `.bak` backup is saved next
   to it), and prints a ✓/⚠ report. Nothing is typed from scratch, so your logo and any
   manual edits stay intact. Safe to run twice — already-applied changes are skipped.

3. Do the **two remaining edits by hand** — see `MANUAL-EDITS.md` (I-1 remove the
   before/after toggle, I-2 keep only after-Oct pricing with AI Try-On in Basic).

4. Ship it:

   ```
   npm run dev          # check locally
   git add .
   git commit -m "Marketing MOJO AI + invoice competitors, after-Oct pricing"
   git push
   ```

If the script prints ⚠ for any item (text didn't match your copy), that exact snippet is in
`MANUAL-EDITS.md` or in the chat — paste it by hand.
