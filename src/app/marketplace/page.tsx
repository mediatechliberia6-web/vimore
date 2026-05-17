"use client";

import { MainNav } from "@/components/layout/main-nav";
import { StoreDirectory } from "@/components/marketplace/StoreDirectory";
import { ShoppingBag, ShieldAlert } from "lucide-react";

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="max-w-[1440px] w-full grid grid-cols-1 md:grid-cols-[280px_1fr]">
        <aside className="hidden md:block border-r border-primary/5 bg-white dark:bg-card">
          <div className="sticky top-0 h-screen overflow-y-auto"><MainNav /></div>
        </aside>

        <main className="px-4 sm:px-6 py-6 pb-24 md:pb-6">
          <header className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="h-7 w-7 text-primary" />
              <h1 className="text-3xl font-black italic uppercase tracking-tighter">Marketplace</h1>
            </div>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Buy & sell from local stores</p>
          </header>

          <div className="mb-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-[11px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">Safety Notice</p>
              <p className="text-xs text-amber-900/80 dark:text-amber-100/70 leading-relaxed">
                Always meet in a safe public place. ViMore is not responsible for transactions between buyers and sellers.
              </p>
            </div>
          </div>

          <StoreDirectory />
        </main>
      </div>
    </div>
  );
}
