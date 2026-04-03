'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Compass, Bell, User, Menu, Zap, ChevronRight, Moon, Sun, Globe, Lock, LogOut, ArrowLeft, Info, Shield } from 'lucide-react';
import { account } from '@/lib/appwrite';

const navItems = [
  { icon: Home, label: 'Home', href: '/free-mode' },
  { icon: Compass, label: 'Explore', href: '/free-mode/explore' },
  { icon: Bell, label: 'Alerts', href: '/free-mode/notifications' },
  { icon: User, label: 'Profile', href: '/free-mode/profile' },
  { icon: Menu, label: 'Menu', href: '/free-mode/menu' },
];

export default function FreeModeSettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
    account.get().then(() => setAuthed(true)).catch(() => setAuthed(false));
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      window.location.href = '/free-mode/signup';
    } catch {
      window.location.href = '/free-mode/signup';
    }
  };

  const sections = [
    {
      title: 'Appearance',
      items: [
        {
          icon: darkMode ? Moon : Sun,
          label: darkMode ? 'Dark Mode' : 'Light Mode',
          desc: 'Toggle between light and dark theme',
          action: toggleDark,
          toggle: true,
          toggleValue: darkMode,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: User, label: 'My Profile', href: '/free-mode/profile', desc: 'View and edit your profile' },
        { icon: Lock, label: 'Privacy & Security', href: '/privacy', desc: 'Manage your privacy settings' },
        { icon: Globe, label: 'Switch to Full Mode', href: '/', desc: 'Unlock photos, music, calls & more' },
      ],
    },
    {
      title: 'About',
      items: [
        { icon: Info, label: 'Terms of Service', href: '/terms', desc: 'Read our terms' },
        { icon: Shield, label: 'Privacy Policy', href: '/privacy', desc: 'How we handle your data' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808]">
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-primary/10 px-4 py-2.5 flex items-center gap-3 shadow-sm">
        <Link href="/free-mode/menu" className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <span className="font-headline font-bold text-lg tracking-tight text-primary">Settings</span>
      </header>

      <div className="flex items-center justify-center gap-2 bg-orange-500/5 border-b border-orange-500/10 px-4 py-2">
        <Zap className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
        <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
          Free Mode — Text Only · Optimised for Orange &amp; MTN networks
        </p>
      </div>

      <div className="max-w-[600px] mx-auto px-4 py-4 pb-24 space-y-5">
        {sections.map(section => (
          <div key={section.title} className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 mb-2">{section.title}</p>
            <div className="bg-white dark:bg-card rounded-2xl border border-border/60 overflow-hidden divide-y divide-border/40">
              {section.items.map((item: any) => (
                item.toggle ? (
                  <button key={item.label} onClick={item.action} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-muted transition-colors text-left">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">{item.label}</p>
                      {item.desc && <p className="text-[11px] text-muted-foreground">{item.desc}</p>}
                    </div>
                    <div className={`w-10 h-5 rounded-full transition-colors ${item.toggleValue ? 'bg-primary' : 'bg-gray-200 dark:bg-muted'} flex items-center`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${item.toggleValue ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                  </button>
                ) : (
                  <Link key={item.label} href={item.href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-muted transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">{item.label}</p>
                      {item.desc && <p className="text-[11px] text-muted-foreground">{item.desc}</p>}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </Link>
                )
              ))}
            </div>
          </div>
        ))}

        {authed && (
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 mb-2">Session</p>
            <div className="bg-white dark:bg-card rounded-2xl border border-border/60 overflow-hidden">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left">
                <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <LogOut className="w-4 h-4 text-red-500" />
                </div>
                <p className="text-sm font-bold text-red-500">Log Out</p>
              </button>
            </div>
          </div>
        )}

        <div className="text-center pt-2">
          <p className="text-[10px] text-muted-foreground/60 font-bold">ViMore Free Mode · Media Tech Liberia</p>
          <p className="text-[9px] text-muted-foreground/40 mt-0.5">Text only · Low data · Built for Africa</p>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-card/95 backdrop-blur-sm border-t border-border/60 flex items-center justify-around px-2 py-2">
        {navItems.map(({ icon: Icon, label, href }) => (
          <Link key={href} href={href} className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-muted-foreground hover:text-primary transition-colors">
            <Icon className="h-5 w-5" />
            <span className="text-[9px] font-black uppercase tracking-wide">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
