import { Store, Users, Megaphone, ReceiptText } from "lucide-react";
import { PRODUCTS as CATALOG } from "./comparison/index";

/** Flat product list (no PPU/NPU). "Open" routes into the comparison workspace. */
const ICONS = { pos: Store, attendo: Users, marketing: Megaphone, invoice: ReceiptText };

export const PRODUCTS = CATALOG.map((p) => ({
  id: p.id, name: p.name, tagline: p.tagline, description: p.description,
  route: `/compare/${p.id}`, icon: ICONS[p.id] || Store, competitors: p.competitors.length,
}));

export const findProduct = (id) => PRODUCTS.find((p) => p.id === id);
export function searchProducts(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PRODUCTS.filter((p) => [p.name, p.description, p.tagline].some((f) => f.toLowerCase().includes(q)));
}
