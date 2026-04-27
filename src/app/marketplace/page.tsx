"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/layout/main-nav";
import { ProductGrid } from "@/components/marketplace/ProductGrid";
import { Plus, ShoppingBag, ShieldAlert } from "lucide-react";

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="max-w-[1440px] w-full grid grid-cols-1 md:grid-cols-[280px_1fr]">
        <aside className="hidden md:block border-r border-primary/5 bg-white dark:bg-card">
          <div className="sticky top-0 h-screen overflow-y-auto"><MainNav /></div>
        </aside>

        <main className="px-4 sm:px-6 py-6 pb-24 md:pb-6">
          <header className="flex items-start justify-between gap-3 mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-7 w-7 text-primary" />
                <h1 className="text-3xl font-black italic uppercase tracking-tighter">Marketplace</h1>
              </div>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Buy & Sell on ViMore</p>
            </div>
            <Link href="/marketplace/new">
              <Button className="rounded-2xl h-11 px-5 font-black uppercase tracking-widest gap-2 bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">List Product</span>
                <span className="sm:hidden">List</span>
              </Button>
            </Link>
          </header>

          <div className="mb-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-[11px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">Safety Tip — Always Receive Before Paying</p>
              <p className="text-xs text-amber-900/80 dark:text-amber-100/70 leading-relaxed">Inspect the product in person and confirm it matches the listing before sending any money. ViMore is not responsible for transactions completed off-platform. Report any suspicious sellers.</p>
            </div>
          </div>

          <ProductGrid />
        </main>
      </div>
    </div>
  );
}
