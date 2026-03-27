'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, Zap, Home, Compass, Bell, User, Menu, Loader2 } from 'lucide-react';
import { ModeSwitcher } from '@/components/layout/mode-switcher';
import { databases, Query, COL, DATABASE_ID, formatTimeAgo } from '@/lib/appwrite';

type FreePost = {
  id: string;
  username: string;
  name: string;
  initials: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  isVerified: boolean;
};

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

function TextPostCard({
  username,
  name,
  initials,
  time,
  content,
  likes,
  comments,
  isVerified,
}: (typeof FREE_POSTS)[0]) {
  return (
    <article className="bg-white dark:bg-card rounded-2xl border border-border/60 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary text-sm font-black flex items-center justify-center flex-shrink-0 border border-primary/20">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-foreground truncate">{name}</span>
            {isVerified && (
              <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                Verified
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground">@{username} · {time}</span>
        </div>
      </div>

      <p className="text-sm text-foreground/90 leading-relaxed">{content}</p>

      <div className="flex items-center gap-4 pt-1 border-t border-border/40">
        <button className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500 transition-colors">
          <Heart className="w-4 h-4" />
          <span className="text-xs font-bold">{formatCount(likes)}</span>
        </button>
        <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs font-bold">{formatCount(comments)}</span>
        </button>
        <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors ml-auto">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
}

export default function FreeModePage() {
  const [posts, setPosts] = useState<FreePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const res = await databases.listDocuments(DATABASE_ID, COL.POSTS, [
          Query.orderDesc('$createdAt'),
          Query.limit(30),
        ]);
        const authorIds = [...new Set(res.documents.map((d: any) => d.author_id).filter(Boolean))];
        let authorsMap: Record<string, any> = {};
        if (authorIds.length > 0) {
          const ar = await databases.listDocuments(DATABASE_ID, COL.USERS, [Query.equal('$id', authorIds as string[])]);
          authorsMap = Object.fromEntries(ar.documents.map(u => [u.$id, u]));
        }
        const textPosts: FreePost[] = res.documents
          .filter((d: any) => !d.image_ids?.length && !d.video_id && d.content?.trim())
          .map((d: any) => {
            const author = authorsMap[d.author_id];
            const name = author?.name || 'User';
            return {
              id: d.$id,
              username: author?.username || 'user',
              name,
              initials: name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
              time: formatTimeAgo(d.$createdAt),
              content: d.content || '',
              likes: d.likes_count || 0,
              comments: d.comments_count || 0,
              isVerified: author?.is_verified || false,
            };
          });
        setPosts(textPosts);
      } catch {
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808]">
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-primary/10 px-4 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
              <path d="M3 7L10 19L17 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 15L17 7L21 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-headline font-bold text-lg tracking-tight text-primary">ViMore</span>
        </div>
        <div className="flex items-center gap-2">
          <ModeSwitcher />
        </div>
      </header>

      <div className="flex items-center justify-center gap-2 bg-orange-500/5 border-b border-orange-500/10 px-4 py-2">
        <Zap className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
        <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
          Free Mode — Text Only · Optimised for Orange &amp; MTN networks
        </p>
      </div>

      <div className="max-w-[600px] mx-auto px-4 py-4 space-y-3 pb-24">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Latest Posts</h2>
          <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">No images · No video · Low data</span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-primary/20 rounded-2xl">
            <p className="text-sm font-bold text-muted-foreground">No posts yet. Be the first to share something.</p>
          </div>
        ) : posts.map((post) => (
          <TextPostCard key={post.id} {...post} />
        ))}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-card/95 backdrop-blur-sm border-t border-border/60 flex items-center justify-around px-2 py-2">
        {[
          { icon: Home, label: 'Home', href: '/free-mode' },
          { icon: Compass, label: 'Explore', href: '/free-mode/explore' },
          { icon: Bell, label: 'Alerts', href: '/free-mode/notifications' },
          { icon: User, label: 'Profile', href: '/free-mode/profile' },
          { icon: Menu, label: 'Menu', href: '/free-mode/menu' },
        ].map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-muted-foreground hover:text-primary transition-colors"
          >
            <Icon className="h-5 w-5" />
            <span className="text-[9px] font-black uppercase tracking-wide">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
