import { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { CheckCircle2, Info, MinusCircle, Sparkles, TrendingDown, Trophy, X, XCircle } from "lucide-react";
import * as E from "../../lib/comparisonEngine";

const supportPill = (s) => {
  const map = {
    full: ["✓ Full", "bg-emerald-50 text-emerald-700 ring-emerald-600/20"],
    partial: ["◐ Partial", "bg-amber-50 text-amber-700 ring-amber-600/20"],
    none: ["✕ None", "bg-rose-50 text-rose-600 ring-rose-500/20"],
  };
  const [label, cls] = map[s] || map.none;
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${cls}`}>{label}</span>;
};

// Shows whether an available feature is in the base plan or a paid add-on.
const PLAN_TEXT = { base: "In base plan", addon: "Paid add-on" };
const PlanTag = ({ plan }) =>
  plan ? (
    <span className={`inline-block text-[11px] font-medium ${plan === "base" ? "text-emerald-600" : "text-amber-600"}`}>
      {PLAN_TEXT[plan]}
    </span>
  ) : null;

// A comparison cell: support pill + optional base/add-on tag.
const Cell = ({ entry }) => (
  <div className="flex flex-col items-start gap-1">
    {supportPill(entry.support)}
    <PlanTag plan={entry.plan} />
  </div>
);

const ConfidenceBadge = ({ c }) => {
  const map = {
    verified: ["Verified", "bg-emerald-50 text-emerald-700"],
    review: ["Needs Review", "bg-amber-50 text-amber-700"],
    estimated: ["Estimated", "bg-slate-100 text-slate-600"],
  };
  const [label, cls] = map[c] || map.estimated;
  return <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${cls}`}>{label}</span>;
};

// ── Overview ────────────────────────────────────────────────────────────────
export function OverviewPanel({ product, competitorIds, inputs }) {
  const t = E.tally(product, competitorIds);
  const scores = E.overallScores(product, competitorIds);
  const hm = E.heatmap(product, competitorIds);
  const rec = E.recommendation(product, competitorIds, inputs);
  const cards = [
    { label: "Features Compared", value: t.compared, icon: Info, tone: "text-ink" },
    { label: "Petpooja Advantages", value: t.petpooja, icon: Trophy, tone: "text-emerald-600" },
    { label: "Competitor Advantages", value: t.competitor, icon: XCircle, tone: "text-rose-500" },
    { label: "Equal Features", value: t.equal, icon: MinusCircle, tone: "text-slate-500" },
    { label: "Petpooja Score", value: `${scores.petpooja}%`, icon: Sparkles, tone: "text-brand-700" },
    { label: "Est. Annual Savings", value: rec.annualSaving ? E.formatINR(rec.annualSaving) : "—", icon: TrendingDown, tone: "text-emerald-600" },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-line bg-surface p-4 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink-muted">{c.label}</span>
              <c.icon className={`h-4 w-4 ${c.tone}`} />
            </div>
            <p className={`mt-2 font-display text-2xl font-extrabold ${c.tone}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
          <h3 className="mb-4 font-display text-sm font-bold text-ink">Advantage Heatmap</h3>
          <div className="space-y-3">
            {hm.map((row) => (
              <div key={row.moduleId}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-ink">{row.module}</span>
                  <span className="text-ink-muted">Petpooja {row.petpooja}% · Comp {row.competitor}%</span>
                </div>
                <div className="flex gap-1">
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-canvas">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${row.petpooja}%` }} />
                  </div>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-canvas">
                    <div className="h-full rounded-full bg-slate-400" style={{ width: `${row.competitor}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-4 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand" /> Petpooja</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-400" /> Best competitor</span>
          </div>
        </div>

        <RecommendationCard rec={rec} />
      </div>
    </div>
  );
}

function RecommendationCard({ rec }) {
  const petWins = rec.winner === "petpooja";
  return (
    <div className={`rounded-xl border p-5 shadow-card ${petWins ? "border-brand/30 bg-brand-50/40" : "border-amber-300/50 bg-amber-50/50"}`}>
      <div className="mb-3 flex items-center gap-2">
        <Trophy className={`h-5 w-5 ${petWins ? "text-brand-700" : "text-amber-600"}`} />
        <h3 className="font-display text-sm font-bold text-ink">Final Recommendation</h3>
      </div>
      <p className="font-display text-xl font-extrabold text-ink">
        {petWins ? "Recommended: Petpooja" : "Competitor leads here"}
      </p>
      <div className="mt-4 space-y-2">
        <ScoreBar label="Petpooja" value={rec.petScore} tone="bg-brand" />
        <ScoreBar label="Best competitor" value={rec.compScore} tone="bg-slate-400" />
      </div>
      <ul className="mt-4 space-y-1.5">
        {rec.reasons.map((r, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {r}
          </li>
        ))}
      </ul>
      {!petWins && (
        <p className="mt-3 rounded-lg bg-white/70 p-2 text-xs text-amber-800">
          Shown honestly — the competitor scores higher on the current dataset. Use this as an improvement signal.
        </p>
      )}
    </div>
  );
}

function ScoreBar({ label, value, tone }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs"><span className="text-ink-soft">{label}</span><span className="font-semibold text-ink">{value}%</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-canvas"><div className={`h-full rounded-full ${tone}`} style={{ width: `${value}%` }} /></div>
    </div>
  );
}

// ── Module feature comparison + drawer ──────────────────────────────────────
export function ModulePanel({ product, module, competitorIds }) {
  const [active, setActive] = useState(null);
  const feats = E.featuresFor(product, module.id);
  const comps = product.competitors.filter((c) => competitorIds.includes(c.id));
  return (
    <div>
      <div className="mb-4">
        <h2 className="font-display text-xl font-extrabold text-ink">{module.name}</h2>
        <p className="text-sm text-ink-muted">{module.blurb}</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-line bg-surface shadow-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-4 py-3 font-medium">Feature</th>
              <th className="px-4 py-3 font-medium text-brand-700">Petpooja</th>
              {comps.map((c) => <th key={c.id} className="px-4 py-3 font-medium">{c.name}</th>)}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {feats.map((feat) => (
              <tr key={feat.id} className="cursor-pointer border-b border-line/60 transition hover:bg-canvas/60" onClick={() => setActive(feat)}>
                <td className="px-4 py-3 font-medium text-ink">{feat.name}</td>
                <td className="px-4 py-3"><Cell entry={feat.petpooja} /></td>
                {comps.map((c) => <td key={c.id} className="px-4 py-3"><Cell entry={feat.competitors[c.id] || { support: "none" }} /></td>)}
                <td className="px-4 py-3 text-right"><Info className="h-4 w-4 text-ink-muted" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {active && <FeatureDrawer feature={active} comps={comps} onClose={() => setActive(null)} />}
    </div>
  );
}

function FeatureDrawer({ feature, comps, onClose }) {
  const verdict = E.classifyFeature(feature, comps.map((c) => c.id));
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-line bg-surface shadow-pop animate-fade-up">
        <div className="flex items-start justify-between border-b border-line p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Feature detail</p>
            <h3 className="mt-1 font-display text-lg font-extrabold text-ink">{feature.name}</h3>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-canvas"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-5 p-5">
          <p className="text-sm text-ink-soft">{feature.desc}</p>
          <div className="rounded-xl border border-brand/20 bg-brand-50/40 p-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-display text-sm font-bold text-brand-700">Petpooja</span>
              {supportPill(feature.petpooja.support)}
            </div>
            <PlanTag plan={feature.petpooja.plan} />
            {feature.petpooja.note && <p className="mt-1 text-sm text-ink-soft">{feature.petpooja.note}</p>}
          </div>
          {comps.map((c) => {
            const cf = feature.competitors[c.id] || { support: "none" };
            return (
              <div key={c.id} className="rounded-xl border border-line bg-canvas/50 p-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-display text-sm font-bold text-ink">{c.name}</span>
                  {supportPill(cf.support)}
                </div>
                {cf.support !== "none" && <PlanTag plan={cf.plan} />}
                {cf.note && <p className="mt-1 text-sm text-ink-soft">{cf.note}</p>}
              </div>
            );
          })}
          <div className={`rounded-xl p-4 text-sm ${verdict === "petpooja" ? "bg-emerald-50 text-emerald-800" : verdict === "competitor" ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-700"}`}>
            <p className="font-semibold">
              {verdict === "petpooja" ? "Why Petpooja wins" : verdict === "competitor" ? "Competitor advantage" : "Even match"}
            </p>
            <p className="mt-1">
              {verdict === "petpooja" ? "Petpooja offers stronger support for this feature than the selected competitors."
                : verdict === "competitor" ? "A competitor leads here — an improvement opportunity for Petpooja."
                : "Both sides support this to a similar degree."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Pricing ─────────────────────────────────────────────────────────────────
export function PricingPanel({ product, competitorIds }) {
  const comps = product.competitors.filter((c) => competitorIds.includes(c.id));
  const p = product.pricing;
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">Pricing Comparison</h2>
          <p className="text-sm text-ink-muted">Updated {p.lastUpdated}</p>
        </div>
      </div>
      {p.note && <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">{p.note}</p>}
      <div className="overflow-x-auto rounded-xl border border-line bg-surface shadow-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium text-brand-700">Petpooja</th>
              {comps.map((c) => <th key={c.id} className="px-4 py-3 font-medium">{c.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {p.lines.map((line, i) => (
              <tr key={i} className="border-b border-line/60">
                <td className="px-4 py-3 font-medium text-ink">{line.label}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-ink">{line.petpooja.value} {line.petpooja.confidence && <ConfidenceBadge c={line.petpooja.confidence} />}</div>
                </td>
                {comps.map((c) => {
                  const cell = line.competitors[c.id];
                  return <td key={c.id} className="px-4 py-3 text-ink-soft">{cell ? <span className="flex items-center gap-2">{cell.value} {cell.confidence && <ConfidenceBadge c={cell.confidence} />}</span> : "—"}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── ROI Calculator ──────────────────────────────────────────────────────────
export function RoiPanel({ product, competitorIds }) {
  const uses = product.pricing.inputs;
  const [outlets, setOutlets] = useState(5);
  const [employees, setEmployees] = useState(20);
  const inputs = { outlets, employees };
  const primary = competitorIds[0];
  const sav = useMemo(() => (primary ? E.savings(product, primary, inputs) : null), [product, primary, outlets, employees]);
  const compName = product.competitors.find((c) => c.id === primary)?.name || "Competitor";

  const chartData = sav ? [
    { name: "Annual", Petpooja: sav.petpooja.annual, [compName]: sav.competitor.annual },
    { name: "3-Year", Petpooja: sav.petpooja.threeYear, [compName]: sav.competitor.threeYear },
  ] : [];

  return (
    <div>
      <h2 className="mb-1 font-display text-xl font-extrabold text-ink">ROI / Savings Calculator</h2>
      <p className="mb-4 text-sm text-ink-muted">Petpooja vs {compName}. Adjust the inputs.</p>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <div className="space-y-4 rounded-xl border border-line bg-surface p-5 shadow-card">
          {uses.outlets && <NumberField label="Number of outlets" value={outlets} onChange={setOutlets} min={1} max={200} />}
          {uses.employees && <NumberField label="Number of employees" value={employees} onChange={setEmployees} min={1} max={1000} />}
          {sav && (
            <div className="space-y-3 border-t border-line pt-4">
              <CostRow label="Petpooja annual" value={E.formatINR(sav.petpooja.annual)} strong />
              <CostRow label={`${compName} annual`} value={E.formatINR(sav.competitor.annual)} />
              <div className="rounded-lg bg-emerald-50 p-3">
                <p className="text-xs font-medium text-emerald-700">Estimated annual savings</p>
                <p className="font-display text-2xl font-extrabold text-emerald-700">
                  {sav.annualSaving >= 0 ? E.formatINR(sav.annualSaving) : "—"}
                </p>
                <p className="text-xs text-emerald-700/80">3-year: {E.formatINR(sav.threeYearSaving)}</p>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
          <h3 className="mb-4 font-display text-sm font-bold text-ink">Cost comparison</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ left: 4, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E9EE" vertical={false} />
              <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} />
              <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => E.formatINR(v)} contentStyle={{ borderRadius: 8, border: "1px solid #E7E9EE", fontSize: 12 }} />
              <Bar dataKey="Petpooja" fill="#E53935" radius={[6, 6, 0, 0]} maxBarSize={54} />
              <Bar dataKey={compName} fill="#94A3B8" radius={[6, 6, 0, 0]} maxBarSize={54} />
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-center text-xs text-ink-muted">Estimates from the pricing dataset — verify before quoting a customer.</p>
        </div>
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange, min, max }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink-soft">{label}</label>
      <input type="number" value={value} min={min} max={max}
        onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || min)))}
        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand/40 focus:ring-4 focus:ring-brand/10" />
    </div>
  );
}
function CostRow({ label, value, strong }) {
  return <div className="flex justify-between text-sm"><span className="text-ink-muted">{label}</span><span className={strong ? "font-bold text-brand-700" : "text-ink"}>{value}</span></div>;
}

// ── Why / Winner Analysis ───────────────────────────────────────────────────
export function WhyPanel({ product, competitorIds, inputs }) {
  const rec = E.recommendation(product, competitorIds, inputs);
  const gap = E.gapAnalysis(product, competitorIds);
  return (
    <div className="space-y-6">
      <RecommendationCard rec={rec} />
      <div className="grid gap-4 lg:grid-cols-3">
        <GapList title="Petpooja strong areas" tone="emerald" items={gap.strong} />
        <GapList title="Competitor strong areas" tone="amber" items={gap.weak} />
        <GapList title="Equal areas" tone="slate" items={gap.equalAreas} />
      </div>
    </div>
  );
}

export function GapPanel({ product, competitorIds }) {
  const gap = E.gapAnalysis(product, competitorIds);
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-extrabold text-ink">Competitive Gap Analysis</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        <GapList title="Petpooja strong areas" tone="emerald" items={gap.strong} />
        <GapList title="Competitor strong areas" tone="amber" items={gap.weak} />
        <GapList title="Equal areas" tone="slate" items={gap.equalAreas} />
      </div>
    </div>
  );
}

function GapList({ title, items, tone }) {
  const tones = { emerald: "text-emerald-700", amber: "text-amber-700", slate: "text-slate-600" };
  return (
    <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
      <h3 className={`mb-3 font-display text-sm font-bold ${tones[tone]}`}>{title} ({items.length})</h3>
      <ul className="space-y-1.5">
        {items.length === 0 ? <li className="text-sm text-ink-muted">None</li> : items.map((f) => (
          <li key={f.id} className="text-sm text-ink-soft">{f.name}</li>
        ))}
      </ul>
    </div>
  );
}

// ── Battlecard ──────────────────────────────────────────────────────────────
export function BattlecardPanel({ product, competitorIds }) {
  const comps = product.competitors.filter((c) => competitorIds.includes(c.id));
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-extrabold text-ink">Competitor Battlecards</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {comps.map((c) => (
          <div key={c.id} className="rounded-xl border border-line bg-surface p-5 shadow-card">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-display text-lg font-extrabold text-ink">{c.name}</h3>
              <ConfidenceBadge c={c.confidence} />
            </div>
            <p className="text-sm text-ink-soft">{c.who}</p>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="font-semibold text-emerald-700">Where they're strong</p>
                <ul className="mt-1 flex flex-wrap gap-1.5">
                  {c.strengths.map((s) => <li key={s} className="rounded-full bg-canvas px-2 py-0.5 text-xs text-ink-soft">{s}</li>)}
                </ul>
              </div>
              <div><p className="font-semibold text-brand-700">Where Petpooja wins</p><p className="mt-1 text-ink-soft">{c.pitch}</p></div>
              <div><p className="font-semibold text-amber-700">Watch-out</p><p className="mt-1 text-ink-soft">{c.weakness}</p></div>
              <div className="rounded-lg bg-canvas p-3"><p className="text-xs font-medium text-ink-muted">Pricing</p><p className="text-ink">{c.pricingNote}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
