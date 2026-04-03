'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Compass, Bell, User, Menu, Loader2, Zap } from 'lucide-react';
import { account, databases, Query, COL, DATABASE_ID, formatTimeAgo } from '@/lib/appwrite';

type Notif = {
  id: string;
  type: string;
  message: string;
  time: string;
  isRead: boolean;
};

const navItems = [
  { icon: Home, label: 'Home', href: '/free-mode' },
  { icon: Compass, label: 'Explore', href: '/free-mode/explore' },
  { icon: Bell, label: 'Alerts', href: '/free-mode/notifications' },
  { icon: User, label: 'Profile', href: '/free-mode/profile' },
  { icon: Menu, label: 'Menu', href: '/free-mode/menu' },
];

export default function FreeModeNotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const u = await account.get();
        setAuthed(true);
        const res = await databases.listDocuments(DATABASE_ID, COL.NOTIFICATIONS, [
          Query.equal('recipient_id', u.$id),
          Query.orderDesc('$createdAt'),
          Query.limit(40),
        ]);
        setNotifs(res.documents.map((d: any) => ({
          id: d.$id,
          type: d.type || 'info',
          message: d.message || d.body || 'You have a new notification.',
          time: formatTimeAgo(d.$createdAt),
          isRead: d.is_read || false,
        })));
      } catch {
        setAuthed(false);
        setNotifs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808]">
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-primary/10 px-4 py-2.5 flex items-center gap-2 shadow-sm">
        <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
            <path d="M3 7L10 19L17 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 15L17 7L21 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="font-headline font-bold text-lg tracking-tight text-primary">Notifications</span>
      </header>

      <div className="flex items-center justify-center gap-2 bg-orange-500/5 border-b border-orange-500/10 px-4 py-2">
        <Zap className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
        <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
          Free Mode — Text Only · Optimised for Orange &amp; MTN networks
        </p>
      </div>

      <div className="max-w-[600px] mx-auto px-4 py-4 pb-24 space-y-2">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : !authed ? (
          <div className="py-16 text-center space-y-3">
            <p className="text-sm font-bold text-muted-foreground">Log in to see your notifications.</p>
            <Link href="/login" className="inline-block px-6 py-2.5 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-colors">
              Log in
            </Link>
          </div>
        ) : notifs.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-primary/20 rounded-2xl">
            <p className="text-sm font-bold text-muted-foreground">No notifications yet.</p>
          </div>
        ) : (
          notifs.map((n) => (
            <div key={n.id} className={`bg-white dark:bg-card rounded-2xl border px-4 py-3 flex items-start gap-3 ${n.isRead ? 'border-border/60' : 'border-primary/30 bg-primary/5'}`}>
              <Bell className={`w-4 h-4 mt-0.5 flex-shrink-0 ${n.isRead ? 'text-muted-foreground' : 'text-primary'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground/90 leading-snug">{n.message}</p>
                <span className="text-[11px] text-muted-foreground">{n.time}</span>
              </div>
              {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
            </div>
          ))
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-card/95 backdrop-blur-sm border-t border-border/60 flex items-center justify-around px-2 py-2">
        {navItems.map(({ icon: Icon, label, href }) => (
          <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${href === '/free-mode/notifications' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
            <Icon className="h-5 w-5" />
            <span className="text-[9px] font-black uppercase tracking-wide">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
