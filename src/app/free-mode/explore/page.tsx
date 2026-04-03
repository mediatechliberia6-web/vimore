'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Home, Compass, Bell, User, Menu, Loader2, Search, Zap } from 'lucide-react';
import { databases, Query, COL, DATABASE_ID } from '@/lib/appwrite';

type FreeUser = {
  id: string;
  name: string;
  username: string;
  initials: string;
  posts: number;
  isVerified: boolean;
};

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

const navItems = [
  { icon: Home, label: 'Home', href: '/free-mode' },
  { icon: Compass, label: 'Explore', href: '/free-mode/explore' },
  { icon: Bell, label: 'Alerts', href: '/free-mode/notifications' },
  { icon: User, label: 'Profile', href: '/free-mode/profile' },
  { icon: Menu, label: 'Menu', href: '/free-mode/menu' },
];

export default function FreeModeExplorePage() {
  const [users, setUsers] = useState<FreeUser[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async (search: string) => {
    setLoading(true);
    try {
      const filters = search.trim()
        ? [Query.search('name', search.trim()), Query.limit(20)]
        : [Query.orderDesc('posts_count'), Query.limit(30)];
      const res = await databases.listDocuments(DATABASE_ID, COL.USERS, filters);
      setUsers(
        res.documents.map((d: any) => ({
          id: d.$id,
          name: d.name || 'User',
          username: d.username || 'user',
          initials: getInitials(d.name || 'U'),
          posts: d.posts_count || 0,
          isVerified: d.is_verified || false,
        }))
      );
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchUsers(query), 300);
    return () => clearTimeout(t);
  }, [query, fetchUsers]);

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808]">
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-primary/10 px-4 py-2.5 flex items-center gap-2 shadow-sm">
        <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
            <path d="M3 7L10 19L17 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 15L17 7L21 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="font-headline font-bold text-lg tracking-tight text-primary">Explore</span>
      </header>

      <div className="flex items-center justify-center gap-2 bg-orange-500/5 border-b border-orange-500/10 px-4 py-2">
        <Zap className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
        <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
          Free Mode — Text Only · Optimised for Orange &amp; MTN networks
        </p>
      </div>

      <div className="max-w-[600px] mx-auto px-4 py-4 pb-24 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people..."
            className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-white dark:bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">
          {query ? 'Search Results' : 'Active Creators'}
        </p>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-primary/20 rounded-2xl">
            <p className="text-sm font-bold text-muted-foreground">No users found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="bg-white dark:bg-card rounded-2xl border border-border/60 px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary text-sm font-black flex items-center justify-center flex-shrink-0 border border-primary/20">
                  {u.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-foreground truncate">{u.name}</span>
                    {u.isVerified && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                        Verified
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground">@{u.username} · {u.posts} posts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-card/95 backdrop-blur-sm border-t border-border/60 flex items-center justify-around px-2 py-2">
        {navItems.map(({ icon: Icon, label, href }) => (
          <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${href === '/free-mode/explore' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
            <Icon className="h-5 w-5" />
            <span className="text-[9px] font-black uppercase tracking-wide">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
