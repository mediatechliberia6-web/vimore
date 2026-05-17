"use client";

import { useRouter } from "next/navigation";
import { StoreDoc, getStoreLogoUrl, isStoreBoosted, categoryToSlug } from "@/lib/stores";
import { Store, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoreCardProps {
  store: StoreDoc;
  size?: "normal" | "boosted";
}

export function StoreCard({ store, size = "normal" }: StoreCardProps) {
  const router = useRouter();
  const boosted = isStoreBoosted(store);
  const logoUrl = store.logo_file_id ? getStoreLogoUrl(store.logo_file_id) : null;

  return (
    <button
      onClick={() => router.push(`/marketplace/store/${store.$id}`)}
      className={cn(
        "flex-shrink-0 flex flex-col items-center text-center rounded-2xl border bg-white dark:bg-card transition-all duration-200 active:scale-95 hover:shadow-md hover:border-primary/30 snap-start",
        size === "boosted"
          ? "w-44 p-3.5 border-amber-400/50 bg-gradient-to-b from-amber-50/80 to-white dark:from-amber-900/10 dark:to-card shadow-amber-200/40 dark:shadow-amber-900/20 shadow-md"
          : "w-36 p-3 border-border/40"
      )}
    >
      <div className={cn(
        "relative rounded-xl overflow-hidden bg-secondary/30 flex items-center justify-center mb-2",
        size === "boosted" ? "w-20 h-20" : "w-16 h-16"
      )}>
        {logoUrl ? (
          <img src={logoUrl} alt={store.store_name} className="w-full h-full object-cover" />
        ) : (
          <Store className={cn("text-primary/40", size === "boosted" ? "h-9 w-9" : "h-7 w-7")} />
        )}
        {boosted && (
          <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-amber-400 flex items-center justify-center">
            <Zap className="h-2.5 w-2.5 text-white fill-white" />
          </div>
        )}
      </div>

      <p className={cn(
        "font-black leading-tight line-clamp-2 text-foreground",
        size === "boosted" ? "text-[13px]" : "text-[11px]"
      )}>
        {store.store_name}
      </p>

      {store.motto && (
        <p className={cn(
          "text-muted-foreground line-clamp-2 mt-0.5 leading-snug",
          size === "boosted" ? "text-[10px]" : "text-[9px]"
        )}>
          {store.motto}
        </p>
      )}

      <span className={cn(
        "mt-auto pt-2 px-2 py-0.5 rounded-full font-black uppercase tracking-tight",
        size === "boosted"
          ? "text-[8px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 mt-2"
          : "text-[8px] bg-primary/8 text-primary/60 mt-1.5"
      )}>
        {store.category}
      </span>
    </button>
  );
}

export function StoreCardSkeleton({ size = "normal" }: { size?: "normal" | "boosted" }) {
  return (
    <div className={cn(
      "flex-shrink-0 flex flex-col items-center rounded-2xl border border-border/20 bg-secondary/10 animate-pulse snap-start",
      size === "boosted" ? "w-44 p-3.5" : "w-36 p-3"
    )}>
      <div className={cn("rounded-xl bg-secondary/40 mb-2", size === "boosted" ? "w-20 h-20" : "w-16 h-16")} />
      <div className="h-3 w-20 rounded bg-secondary/40 mb-1.5" />
      <div className="h-2.5 w-16 rounded bg-secondary/30" />
    </div>
  );
}
