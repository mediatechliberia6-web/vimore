"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/layout/main-nav";
import { ProductForm } from "@/components/marketplace/ProductForm";
import { usePosts } from "@/context/PostContext";
import { ArrowLeft } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const { currentUser, isLoading } = usePosts();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace("/login?next=/marketplace/new");
    }
  }, [isLoading, currentUser, router]);

  if (isLoading || !currentUser) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="max-w-[1440px] w-full grid grid-cols-1 md:grid-cols-[280px_1fr]">
        <aside className="hidden md:block border-r border-primary/5 bg-white dark:bg-card">
          <div className="sticky top-0 h-screen overflow-y-auto"><MainNav /></div>
        </aside>

        <main className="px-4 sm:px-6 py-6 pb-24 md:pb-6 max-w-2xl mx-auto w-full">
          <header className="flex items-center gap-2 mb-6">
            <Link href="/marketplace">
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter">List a Product</h1>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Reach buyers across ViMore</p>
            </div>
          </header>

          <ProductForm />
        </main>
      </div>
    </div>
  );
}
