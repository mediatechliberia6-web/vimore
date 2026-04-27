"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, ShoppingBag } from "lucide-react";
import { listProducts, ProductDoc, ProductCurrency } from "@/lib/marketplace";
import { ProductCard } from "./ProductCard";

const CACHE_KEY = "vimore_marketplace_cache_v1";
const CACHE_TTL_MS = 1000 * 60 * 2;

export function ProductGrid() {
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState<"ALL" | ProductCurrency>("ALL");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cached = typeof window !== 'undefined' ? localStorage.getItem(CACHE_KEY) : null;
        if (cached) {
          try {
            const { ts, data } = JSON.parse(cached);
            if (Date.now() - ts < CACHE_TTL_MS && Array.isArray(data)) {
              if (!cancelled) { setProducts(data); setLoading(false); }
            }
          } catch {}
        }
        const fresh = await listProducts({ limit: 100 });
        if (cancelled) return;
        setProducts(fresh);
        setLoading(false);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: fresh })); } catch {}
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(p => {
      if (p.status !== 'active') return false;
      if (currencyFilter !== "ALL" && p.priceCurrency !== currencyFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.sellerUsername.toLowerCase().includes(q)
      );
    });
  }, [products, search, currencyFilter]);

  const onDeleted = (id: string) => {
    setProducts(prev => prev.filter(p => p.$id !== id));
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data } = JSON.parse(cached);
        const next = (data || []).filter((p: ProductDoc) => p.$id !== id);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: next }));
      }
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, location, seller..."
            className="pl-10 h-11 rounded-xl bg-secondary/30 border-none"
          />
        </div>
        <div className="flex items-center gap-1 bg-secondary/30 rounded-xl p-1">
          {(["ALL", "LRD", "USD"] as const).map(opt => (
            <Button
              key={opt}
              type="button"
              size="sm"
              variant={currencyFilter === opt ? "default" : "ghost"}
              onClick={() => setCurrencyFilter(opt)}
              className="h-9 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest"
            >
              {opt === "ALL" ? "All" : opt}
            </Button>
          ))}
        </div>
      </div>

      {loading && products.length === 0 ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground gap-3">
          <ShoppingBag className="h-12 w-12 opacity-30" />
          <p className="text-sm font-bold uppercase tracking-widest">No listings yet</p>
          <p className="text-xs max-w-xs">Be the first to list a product on the ViMore Marketplace.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map(p => (
            <ProductCard key={p.$id} product={p} onDeleted={onDeleted} />
          ))}
        </div>
      )}
    </div>
  );
}
