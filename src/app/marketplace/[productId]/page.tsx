"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { MainNav } from "@/components/layout/main-nav";
import { ContactButtons } from "@/components/marketplace/ContactButtons";
import { ReportProductDialog } from "@/components/marketplace/ReportProductDialog";
import { usePosts } from "@/context/PostContext";
import { useToast } from "@/hooks/use-toast";
import { ProductDoc, getProduct, deleteProduct, getProductImageUrl, formatPrice } from "@/lib/marketplace";
import { ArrowLeft, MapPin, Trash2, Flag, Loader2, Calendar } from "lucide-react";

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const router = useRouter();
  const { currentUser } = usePosts();
  const { toast } = useToast();
  const [product, setProduct] = useState<ProductDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const p = await getProduct(productId);
      if (cancelled) return;
      setProduct(p);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [productId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest">Loading...</div>;
  }
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <p className="text-sm uppercase tracking-widest">Listing not found</p>
        <Link href="/marketplace"><Button variant="secondary" className="rounded-xl">Back to Marketplace</Button></Link>
      </div>
    );
  }

  const isOwner = currentUser?.$id === product.sellerId;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProduct(product.$id);
      toast({ title: "Listing removed" });
      router.replace("/marketplace");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Could not delete", description: err?.message || "Try again." });
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="max-w-[1440px] w-full grid grid-cols-1 md:grid-cols-[280px_1fr]">
        <aside className="hidden md:block border-r border-primary/5 bg-white dark:bg-card">
          <div className="sticky top-0 h-screen overflow-y-auto"><MainNav /></div>
        </aside>

        <main className="px-4 sm:px-6 py-6 pb-24 md:pb-6 max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-between mb-4">
            <Link href="/marketplace">
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div className="flex items-center gap-1">
              {!isOwner && currentUser && (
                <ReportProductDialog product={product}>
                  <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground hover:text-destructive gap-1.5">
                    <Flag className="h-4 w-4" /> <span className="text-[10px] font-black uppercase tracking-widest">Report</span>
                  </Button>
                </ReportProductDialog>
              )}
              {isOwner && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-xl text-destructive hover:bg-destructive/10 gap-1.5" disabled={deleting}>
                      {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      <span className="text-[10px] font-black uppercase tracking-widest">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-3xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-black italic uppercase tracking-tighter">Delete listing?</AlertDialogTitle>
                      <AlertDialogDescription>This permanently removes "{product.name}" and its photos.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          <div className="aspect-square bg-secondary/40 rounded-3xl overflow-hidden mb-3">
            {product.imageFileIds[activeImg] ? (
              <img
                src={getProductImageUrl(product.imageFileIds[activeImg], 'detail')}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest">No Image</div>
            )}
          </div>

          {product.imageFileIds.length > 1 && (
            <div className="flex gap-2 mb-4">
              {product.imageFileIds.map((id, i) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  className={`relative h-16 w-16 rounded-xl overflow-hidden border-2 ${i === activeImg ? 'border-primary' : 'border-transparent opacity-60'}`}
                >
                  <img src={getProductImageUrl(id, 'thumb')} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter">{product.name}</h1>
              <p className="text-3xl font-black text-primary mt-1">{formatPrice(product.priceAmount, product.priceCurrency)}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{product.location}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(product.$createdAt).toLocaleDateString()}</span>
            </div>

            <Link href={`/profile/${product.sellerUsername}`} className="block bg-secondary/40 rounded-2xl p-3 hover:bg-secondary/60 transition-colors">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Seller</p>
              <p className="text-sm font-bold">{product.sellerName}</p>
              <p className="text-xs text-muted-foreground">@{product.sellerUsername}</p>
            </Link>

            <div className="bg-card border border-border/40 rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Description</p>
              <p className="text-sm whitespace-pre-wrap">{product.description}</p>
            </div>

            {!isOwner && (
              <div className="sticky bottom-4 bg-background/95 backdrop-blur rounded-2xl p-3 border border-border/40 shadow-lg">
                <ContactButtons product={product} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
