"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/layout/main-nav";
import { ProductGrid } from "@/components/marketplace/ProductGrid";
import { Plus, ShoppingBag } from "lucide-react";

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

          <ProductGrid />
        </main>
      </div>
    </div>
  );
}
