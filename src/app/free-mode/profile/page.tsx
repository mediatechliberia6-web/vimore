'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Compass, Bell, User, Menu, Loader2, Zap, LogOut } from 'lucide-react';
import { account, databases, COL, DATABASE_ID, formatTimeAgo } from '@/lib/appwrite';

const navItems = [
  { icon: Home, label: 'Home', href: '/free-mode' },
  { icon: Compass, label: 'Explore', href: '/free-mode/explore' },
  { icon: Bell, label: 'Alerts', href: '/free-mode/notifications' },
  { icon: User, label: 'Profile', href: '/free-mode/profile' },
  { icon: Menu, label: 'Menu', href: '/free-mode/menu' },
];

type Profile = {
  name: string;
  username: string;
  initials: string;
  email: string;
  nationality: string;
  joinDate: string;
  posts: number;
  followers: number;
  following: number;
  gender: string;
};

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function FreeModeProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const u = await account.get();
        setAuthed(true);
        const doc = await databases.getDocument(DATABASE_ID, COL.USERS, u.$id);
        setProfile({
          name: doc.name || u.name || 'User',
          username: doc.username || 'user',
          initials: getInitials(doc.name || u.name || 'U'),
          email: doc.email || u.email || '',
          nationality: doc.nationality || '',
          joinDate: doc.join_date ? formatTimeAgo(doc.join_date) : '',
          posts: doc.posts_count || 0,
          followers: doc.followers_count || 0,
          following: doc.following_count || 0,
          gender: doc.gender || '',
        });
      } catch {
        setAuthed(false);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await account.deleteSession('current');
    } catch { /* ignore */ }
    window.location.href = '/free-mode';
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808]">
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-primary/10 px-4 py-2.5 flex items-center gap-2 shadow-sm">
        <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
            <path d="M3 7L10 19L17 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 15L17 7L21 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="font-headline font-bold text-lg tracking-tight text-primary">Profile</span>
      </header>

      <div className="flex items-center justify-center gap-2 bg-orange-500/5 border-b border-orange-500/10 px-4 py-2">
        <Zap className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
        <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
          Free Mode — Text Only · Optimised for Orange &amp; MTN networks
        </p>
      </div>

      <div className="max-w-[600px] mx-auto px-4 py-6 pb-24 space-y-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : !authed ? (
          <div className="py-16 text-center space-y-3">
            <p className="text-sm font-bold text-muted-foreground">Log in to view your profile.</p>
            <Link href="/login" className="inline-block px-6 py-2.5 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-colors">
              Log in
            </Link>
            <div className="pt-2">
              <Link href="/free-mode/signup" className="text-xs text-primary font-bold hover:underline">
                Don&apos;t have an account? Sign up →
              </Link>
            </div>
          </div>
        ) : profile ? (
          <>
            <div className="bg-white dark:bg-card rounded-2xl border border-border/60 p-6 flex flex-col items-center gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 text-primary text-2xl font-black flex items-center justify-center border-2 border-primary/20">
                {profile.initials}
              </div>
              <div>
                <h1 className="text-xl font-black text-foreground">{profile.name}</h1>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
                {profile.nationality && <p className="text-xs text-muted-foreground mt-0.5">{profile.nationality}</p>}
              </div>
              <div className="flex items-center gap-6 pt-1 border-t border-border/40 w-full justify-center">
                <div className="text-center">
                  <p className="text-lg font-black text-foreground">{profile.posts}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-foreground">{profile.followers}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-foreground">{profile.following}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Following</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-card rounded-2xl border border-border/60 p-4 space-y-3">
              {[
                { label: 'Email', value: profile.email },
                { label: 'Gender', value: profile.gender },
                { label: 'Joined', value: profile.joinDate },
              ].filter((r) => r.value).map((row) => (
                <div key={row.label} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                  <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{row.label}</span>
                  <span className="text-sm font-bold text-foreground">{row.value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-200 text-red-500 text-xs font-black uppercase tracking-widest hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              Log Out
            </button>
          </>
        ) : null}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-card/95 backdrop-blur-sm border-t border-border/60 flex items-center justify-around px-2 py-2">
        {navItems.map(({ icon: Icon, label, href }) => (
          <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${href === '/free-mode/profile' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
            <Icon className="h-5 w-5" />
            <span className="text-[9px] font-black uppercase tracking-wide">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
