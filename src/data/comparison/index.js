import pos from "./pos";
import attendo from "./attendo";
import marketing from "./marketing";
import invoice from "./invoice";

// Flat product catalog (no PPU/NPU shown to users). Add a product = add a dataset + this list.
export const PRODUCTS = [pos, attendo, marketing, invoice];

export const getProduct = (id) => PRODUCTS.find((p) => p.id === id) || null;
export const allCompetitors = (product) => product.competitors.map((c) => c.id);
