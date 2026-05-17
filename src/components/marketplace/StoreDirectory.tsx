"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePosts } from "@/context/PostContext";
import { listAllStores, getMyStore, isStoreBoosted, StoreDoc, STORE_CATEGORIES } from "@/lib/stores";
import { StoreCard, StoreCardSkeleton } from "./StoreCard";
import { CategoryShelf } from "./CategoryShelf";
import { Search, Store, Zap, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const CACHE_KEY = "vimore_store_dir_cache_v1";
const CACHE_TTL = 1000 * 60 * 3;

export function StoreDirectory() {
  const router = useRouter();
  const { currentUser } = usePosts();
  const [stores, setStores] = useState<StoreDoc[]>([]);
  const [myStore, setMyStore] = useState<StoreDoc | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cached = typeof window !== "undefined" ? localStorage.getItem(CACHE_KEY) : null;
        if (cached) {
          try {
            const { ts, data } = JSON.parse(cached);
            if (Date.now() - ts < CACHE_TTL && Array.isArray(data)) {
              if (!cancelled) { setStores(data); setLoading(false); }
            }
          } catch {}
        }
        const fresh = await listAllStores(200);
        if (cancelled) return;
        setStores(fresh);
        setLoading(false);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: fresh })); } catch {}
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!currentUser?.$id) { setMyStore(null); return; }
    getMyStore(currentUser.$id).then(s => setMyStore(s ?? null));
  }, [currentUser?.$id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stores;
    return stores.filter(s =>
      s.store_name.toLowerCase().includes(q) ||
      s.motto.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.owner_username.toLowerCase().includes(q)
    );
  }, [stores, search]);

  const boostedStores = useMemo(() => filtered.filter(isStoreBoosted), [filtered]);
  const regularStores = useMemo(() => filtered.filter(s => !isStoreBoosted(s)), [filtered]);

  const byCategory = useMemo(() => {
    const map = new Map<string, StoreDoc[]>();
    for (const cat of STORE_CATEGORIES) {
      const catStores = regularStores.filter(s => s.category === cat);
      if (catStores.length > 0) map.set(cat, catStores);
    }
    return map;
  }, [regularStores]);

  const isSearching = search.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search stores, categories..."
            className="pl-10 pr-9 h-11 rounded-xl bg-secondary/30 border-none"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-muted-foreground/20 flex items-center justify-center">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <Button
          onClick={() => router.push(myStore ? `/marketplace/store/${myStore.$id}` : "/marketplace/store/new")}
          className={cn(
            "h-11 rounded-xl gap-2 font-black uppercase tracking-widest text-[10px] px-4 shrink-0",
            myStore ? "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20" : "bg-primary text-white hover:bg-primary/90"
          )}
          disabled={myStore === undefined}
        >
          {myStore ? <><Store className="h-4 w-4" /> My Store</> : <><Plus className="h-4 w-4" /> Open a Store</>}
        </Button>
      </div>

      {isSearching && (
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          {filtered.length} store{filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      {!isSearching && (
        <>
          {(loading || boostedStores.length > 0) && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-amber-400 flex items-center justify-center">
                  <Zap className="h-3.5 w-3.5 text-white fill-white" />
                </div>
                <div>
                  <h2 className="text-base font-black uppercase tracking-tight">Boosted Stores</h2>
                  <p className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Featured at top</p>
                </div>
              </div>
              <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
                <div className="flex gap-3 w-max" style={{ scrollSnapType: "x mandatory" }}>
                  {loading
                    ? Array.from({ length: 3 }).map((_, i) => <StoreCardSkeleton key={i} size="boosted" />)
                    : boostedStores.map(s => <StoreCard key={s.$id} store={s} size="boosted" />)
                  }
                </div>
              </div>
            </section>
          )}

          {!loading && boostedStores.length === 0 && !isSearching && (
            <div className="rounded-2xl border-2 border-dashed border-amber-300/50 bg-amber-50/50 dark:bg-amber-900/10 px-4 py-4 flex items-center gap-3">
              <Zap className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">Boost your store</p>
                <p className="text-[10px] text-amber-600/80 dark:text-amber-500/70">Appear at the top for just 3 Diamonds/day. Open your store to get started.</p>
              </div>
            </div>
          )}

          <div className="border-t border-border/20" />

          {loading
            ? STORE_CATEGORIES.slice(0, 4).map(cat => (
                <CategoryShelf key={cat} category={cat} stores={[]} loading />
              ))
            : Array.from(byCategory.entries()).map(([cat, catStores]) => (
                <CategoryShelf key={cat} category={cat} stores={catStores} />
              ))
          }

          {!loading && byCategory.size === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
              <Store className="h-12 w-12 text-muted-foreground/30" />
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">No stores yet</p>
                <p className="text-xs text-muted-foreground mt-1">Be the first to open a store on ViMore.</p>
              </div>
              <Button onClick={() => router.push("/marketplace/store/new")} className="rounded-2xl h-11 px-6 font-black uppercase tracking-widest gap-2 bg-primary">
                <Plus className="h-4 w-4" /> Open a Store
              </Button>
            </div>
          )}
        </>
      )}

      {isSearching && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map(s => (
            <div key={s.$id} className="flex justify-center">
              <StoreCard store={s} />
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <Store className="h-10 w-10 opacity-30" />
              <p className="text-sm font-bold uppercase tracking-widest">No stores found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
