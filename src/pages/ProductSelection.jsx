import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, LogOut, Search, Shield } from "lucide-react";
import { PRODUCTS, searchProducts } from "../data/products";
import { useAuth } from "../services/auth";
import { api } from "../services/api";
import { Logo, Avatar } from "../components/ui/primitives";

export default function ProductSelection() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const results = q.trim() ? searchProducts(q) : PRODUCTS;
  const first = user?.name?.split(" ")[0] || user?.email?.split("@")[0]?.split(/[.\-_]/)[0] || "there";

  const open = (p) => {
    api.track({ kind: "product", product: p.name, category: p.id }).catch(() => {});
    navigate(p.route);
  };
  const doLogout = async () => { await logout(); navigate("/login", { replace: true }); };

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur sm:px-6">
        <Link to="/home"><Logo /></Link>
        <span className="ml-1 hidden rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand-700 sm:inline">
          Competitive Intelligence Hub
        </span>
        <div className="ml-auto flex items-center gap-3">
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-ink-soft transition hover:bg-canvas">
              <Shield className="h-4 w-4" /> Admin
            </Link>
          )}
          {user && <Avatar email={user.email} src={user.avatarUrl} size={32} />}
          <button onClick={doLogout} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50">
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <p className="text-sm font-medium text-brand-700">Welcome to Petpooja</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Hi {first.charAt(0).toUpperCase() + first.slice(1)} — choose a product to compare
          </h1>
          <p className="mt-2 text-ink-muted">See how each Petpooja product stacks up against its competitors — features, pricing and who wins.</p>
        </div>

        <div className="relative mb-6 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products — POS, Attendo, Invoice…"
            className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-ink-muted focus:border-brand/40 focus:ring-4 focus:ring-brand/10" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {results.map((p, i) => (
            <motion.button key={p.id} onClick={() => open(p)}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-xl2 border border-line bg-surface p-6 text-left shadow-card transition duration-200 hover:-translate-y-1 hover:border-brand/40 hover:shadow-pop focus:outline-none focus:ring-4 focus:ring-brand/15">
              <span className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand/5 transition group-hover:scale-125" />
              <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-brand text-white shadow-sm"><p.icon className="h-6 w-6" /></span>
              <h2 className="font-display text-xl font-extrabold text-ink">{p.name}</h2>
              <p className="mt-1 text-sm text-ink-muted">{p.description}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="rounded-full bg-canvas px-3 py-1 text-xs font-semibold text-ink-soft">{p.competitors} competitor{p.competitors === 1 ? "" : "s"}</span>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">Compare <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
              </div>
            </motion.button>
          ))}
          {results.length === 0 && (
            <p className="col-span-full rounded-xl border border-dashed border-line bg-surface/60 p-10 text-center text-sm text-ink-muted">No products match the search.</p>
          )}
        </div>
      </main>
    </div>
  );
}
