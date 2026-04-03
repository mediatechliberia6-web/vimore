'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Compass, Bell, User, Menu, Loader2, Zap, Heart, MessageCircle, UserPlus, Star, Info, MessageSquare } from 'lucide-react';
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

function notifIcon(type: string) {
  if (type === 'like') return <Heart className="w-4 h-4 text-red-500" />;
  if (type === 'comment') return <MessageCircle className="w-4 h-4 text-blue-500" />;
  if (type === 'follow' || type === 'friend_request') return <UserPlus className="w-4 h-4 text-green-500" />;
  if (type === 'SYSTEM') return <Info className="w-4 h-4 text-primary" />;
  if (type === 'message') return <MessageSquare className="w-4 h-4 text-purple-500" />;
  return <Star className="w-4 h-4 text-primary" />;
}

export default function FreeModeNotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let userId: string | null = null;
      try {
        const u = await account.get();
        userId = u.$id;
        setAuthed(true);
      } catch {
        setAuthed(false);
        setLoading(false);
        return;
      }

      try {
        const res = await databases.listDocuments(DATABASE_ID, COL.NOTIFICATIONS, [
          Query.equal('recipient_id', userId!),
          Query.orderDesc('$createdAt'),
          Query.limit(40),
        ]);
        setNotifs(res.documents.map((d: any) => ({
          id: d.$id,
          type: d.type || 'info',
          message: d.message || d.body || d.title || 'You have a new notification.',
          time: formatTimeAgo(d.$createdAt),
          isRead: d.is_read || false,
        })));
      } catch {
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
        {loading || authed === null ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : !authed ? (
          <div className="py-16 text-center space-y-3">
            <Bell className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <p className="text-sm font-bold text-muted-foreground">Log in to see your notifications.</p>
            <Link href="/free-mode/signup" className="inline-block px-6 py-2.5 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-colors">
              Log in
            </Link>
          </div>
        ) : notifs.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-primary/20 rounded-2xl space-y-2">
            <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto" />
            <p className="text-sm font-bold text-muted-foreground">No notifications yet.</p>
            <p className="text-[11px] text-muted-foreground/60">When someone likes or comments on your posts, you&apos;ll see it here.</p>
          </div>
        ) : (
          notifs.map((n) => (
            <div key={n.id} className={`bg-white dark:bg-card rounded-2xl border px-4 py-3 flex items-start gap-3 ${n.isRead ? 'border-border/60' : 'border-primary/30 bg-primary/5 dark:bg-primary/10'}`}>
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                {notifIcon(n.type)}
              </div>
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
