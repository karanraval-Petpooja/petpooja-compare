import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, BarChart3, ChevronDown, ChevronRight, LayoutGrid, Menu, Minimize2,
  Presentation, Receipt, Sword, Target, Trophy, X,
} from "lucide-react";
import { getProduct, PRODUCTS } from "../../data/comparison/index";
import { CONFIDENCE_LABEL } from "../../lib/comparisonEngine";
import { useAuth } from "../../services/auth";
import { Logo, Avatar } from "../../components/ui/primitives";
import {
  OverviewPanel, ModulePanel, PricingPanel, RoiPanel, WhyPanel, GapPanel, BattlecardPanel,
} from "./comparePanels";

export default function ComparisonWorkspace() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const product = getProduct(productId);

  const [section, setSection] = useState("overview");
  const [present, setPresent] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [productMenu, setProductMenu] = useState(false);
  const productMenuRef = useRef(null);
  const inputs = useMemo(() => ({ outlets: 5, employees: 20 }), []);

  // Single competitor, driven by the URL hash (e.g. /compare/attendo#keka).
  const hashId = location.hash.replace(/^#/, "");
  const activeCompetitor = product?.competitors.some((c) => c.id === hashId)
    ? hashId
    : product?.competitors[0]?.id;

  useEffect(() => {
    const onClick = (e) => { if (productMenuRef.current && !productMenuRef.current.contains(e.target)) setProductMenu(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!product) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas">
        <div className="text-center">
          <p className="text-ink-muted">Product not found.</p>
          <Link to="/home" className="mt-2 inline-block text-sm font-semibold text-brand-700">Back to products</Link>
        </div>
      </div>
    );
  }

  const competitorIds = [activeCompetitor];
  const pickCompetitor = (id) => navigate(`/compare/${product.id}#${id}`, { replace: true });
  const switchProduct = (id) => { setProductMenu(false); setSection("overview"); navigate(`/compare/${id}`); };

  const nav = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    ...product.modules.map((m) => ({ id: `module:${m.id}`, label: m.name, icon: ChevronRight, module: m })),
    { id: "pricing", label: "Pricing", icon: Receipt },
    { id: "roi", label: "ROI Calculator", icon: BarChart3 },
    { id: "why", label: "Winner Analysis", icon: Trophy },
    { id: "battlecard", label: "Battlecard", icon: Sword },
    { id: "gap", label: "Gap Analysis", icon: Target },
  ];
  const activeModule = section.startsWith("module:") ? product.modules.find((m) => m.id === section.split(":")[1]) : null;
  const sectionLabel = nav.find((n) => n.id === section)?.label || "Overview";

  const renderSection = () => {
    if (activeModule) return <ModulePanel product={product} module={activeModule} competitorIds={competitorIds} />;
    switch (section) {
      case "pricing": return <PricingPanel product={product} competitorIds={competitorIds} />;
      case "roi": return <RoiPanel product={product} competitorIds={competitorIds} />;
      case "why": return <WhyPanel product={product} competitorIds={competitorIds} inputs={inputs} />;
      case "battlecard": return <BattlecardPanel product={product} competitorIds={competitorIds} />;
      case "gap": return <GapPanel product={product} competitorIds={competitorIds} />;
      default: return <OverviewPanel product={product} competitorIds={competitorIds} inputs={inputs} />;
    }
  };

  const NavList = ({ onPick }) => (
    <nav className="flex flex-col gap-0.5 p-3">
      {nav.map((n) => (
        <button key={n.id} onClick={() => { setSection(n.id); onPick?.(); }}
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
            section === n.id ? "bg-brand-50 text-brand-700" : "text-ink-soft hover:bg-canvas hover:text-ink"}`}>
          <n.icon className={`h-4 w-4 shrink-0 ${section === n.id ? "text-brand-700" : "text-ink-muted"}`} />
          <span className="truncate">{n.label}</span>
        </button>
      ))}
    </nav>
  );

  const CompetitorTabs = () => (
    <div className="flex items-center gap-2 overflow-x-auto">
      <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-ink-muted">Compare vs:</span>
      {product.competitors.map((c) => {
        const on = c.id === activeCompetitor;
        return (
          <button key={c.id} onClick={() => pickCompetitor(c.id)}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition ${
              on ? "border-brand bg-brand text-white" : "border-line bg-surface text-ink-soft hover:border-brand/40"}`}>
            {c.name}<span className={`ml-1 font-normal ${on ? "opacity-80" : "text-ink-muted"}`}>· {CONFIDENCE_LABEL[c.confidence]}</span>
          </button>
        );
      })}
    </div>
  );

  if (present) {
    return (
      <div className="min-h-screen bg-canvas">
        <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface px-6 py-3">
          <div className="flex items-center gap-3"><Logo /><span className="font-display font-bold text-ink">{product.name}</span><span className="text-ink-muted">— {sectionLabel} · vs {product.competitors.find((c)=>c.id===activeCompetitor)?.name}</span></div>
          <button onClick={() => setPresent(false)} className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-ink-soft hover:bg-canvas"><Minimize2 className="h-4 w-4" /> Exit</button>
        </div>
        <div className="border-b border-line bg-surface px-6 py-2"><CompetitorTabs /></div>
        <div className="mx-auto max-w-5xl px-6 py-8">{renderSection()}</div>
        <div className="fixed bottom-5 left-1/2 flex -translate-x-1/2 gap-2 overflow-x-auto rounded-full border border-line bg-surface px-2 py-1.5 shadow-pop">
          {nav.filter((n) => !n.id.startsWith("module:")).map((n) => (
            <button key={n.id} onClick={() => setSection(n.id)} className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${section === n.id ? "bg-brand text-white" : "text-ink-soft hover:bg-canvas"}`}>{n.label}</button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
        <div className="flex h-16 items-center gap-3 px-3 sm:px-5">
          <button onClick={() => setMobileNav(true)} className="grid h-9 w-9 place-items-center rounded-lg text-ink-soft hover:bg-canvas lg:hidden"><Menu className="h-5 w-5" /></button>
          <Link to="/home"><Logo /></Link>

          {/* Product switcher */}
          <div className="relative ml-1" ref={productMenuRef}>
            <button onClick={() => setProductMenu((v) => !v)} className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-ink transition hover:bg-canvas">
              {product.name} <ChevronDown className={`h-4 w-4 text-ink-muted transition ${productMenu ? "rotate-180" : ""}`} />
            </button>
            {productMenu && (
              <div className="absolute left-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-surface shadow-pop">
                {PRODUCTS.map((p) => (
                  <button key={p.id} onClick={() => switchProduct(p.id)}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-canvas ${p.id === product.id ? "font-semibold text-brand-700" : "text-ink-soft"}`}>
                    {p.name}{p.id === product.id && <span className="text-xs">●</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="ml-1 hidden min-w-0 items-center gap-1 text-sm text-ink-muted md:flex">
            <ChevronRight className="h-4 w-4 text-line" /><span className="truncate font-medium text-ink">{sectionLabel}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link to="/home" className="hidden items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-ink-soft transition hover:bg-canvas sm:flex"><ArrowLeft className="h-4 w-4" /> Products</Link>
            <button onClick={() => setPresent(true)} title="Presentation mode" className="grid h-9 w-9 place-items-center rounded-lg text-ink-soft transition hover:bg-canvas"><Presentation className="h-5 w-5" /></button>
            {user && <Avatar email={user.email} src={user.avatarUrl} size={32} />}
          </div>
        </div>
        <div className="border-t border-line px-3 py-2 sm:px-5"><CompetitorTabs /></div>
      </header>

      <div className="flex flex-1">
        <aside className="sticky top-[104px] hidden h-[calc(100vh-104px)] w-60 shrink-0 overflow-y-auto border-r border-line bg-surface lg:block"><NavList /></aside>
        {mobileNav && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileNav(false)} />
            <div className="absolute left-0 top-0 h-full w-64 bg-surface shadow-pop">
              <div className="flex h-14 items-center justify-between border-b border-line px-4"><span className="font-display font-bold">{product.name}</span><button onClick={() => setMobileNav(false)}><X className="h-5 w-5 text-ink-muted" /></button></div>
              <NavList onPick={() => setMobileNav(false)} />
            </div>
          </div>
        )}
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
            <div className="mb-3 flex items-center gap-2 text-xs text-ink-muted">
              <span className="font-display text-sm font-semibold text-ink">{product.name}</span>
              <span>·</span><span>vs {product.competitors.find((c) => c.id === activeCompetitor)?.name}</span>
              <span>·</span><span>Data updated {product.lastUpdated}</span>
            </div>
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
