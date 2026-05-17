"use client";

import Link from "next/link";
import { StoreDoc, categoryToSlug } from "@/lib/stores";
import { StoreCard, StoreCardSkeleton } from "./StoreCard";
import { ArrowRight } from "lucide-react";

const SHELF_MAX = 10;

interface CategoryShelfProps {
  category: string;
  stores: StoreDoc[];
  loading?: boolean;
}

export function CategoryShelf({ category, stores, loading }: CategoryShelfProps) {
  const slug = categoryToSlug(category);
  const visible = stores.slice(0, SHELF_MAX);
  const hasMore = stores.length > SHELF_MAX;

  if (!loading && stores.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-0">
        <div>
          <h2 className="text-base font-black uppercase tracking-tight">{category}</h2>
          {!loading && (
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
              {stores.length} store{stores.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {(hasMore || stores.length > 3) && (
          <Link
            href={`/marketplace/category/${slug}`}
            className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:underline"
          >
            See All <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
        <div
          className="flex gap-3 w-max"
          style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <StoreCardSkeleton key={i} />)
            : visible.map(store => <StoreCard key={store.$id} store={store} />)
          }

          {hasMore && !loading && (
            <Link
              href={`/marketplace/category/${slug}`}
              className="flex-shrink-0 w-28 flex flex-col items-center justify-center text-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors snap-start p-3 gap-2"
            >
              <ArrowRight className="h-5 w-5 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-widest text-primary leading-tight">
                See More →
              </span>
              <span className="text-[8px] text-muted-foreground font-bold">
                {stores.length - SHELF_MAX} more
              </span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
