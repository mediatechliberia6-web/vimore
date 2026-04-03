'use client';

import Link from 'next/link';
import { Home, Compass, Bell, User, Menu, Zap, ChevronRight, Globe, ShieldCheck, FileText, Star } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Home', href: '/free-mode' },
  { icon: Compass, label: 'Explore', href: '/free-mode/explore' },
  { icon: Bell, label: 'Alerts', href: '/free-mode/notifications' },
  { icon: User, label: 'Profile', href: '/free-mode/profile' },
  { icon: Menu, label: 'Menu', href: '/free-mode/menu' },
];

const menuSections = [
  {
    title: 'Account',
    items: [
      { icon: User, label: 'My Profile', href: '/free-mode/profile' },
      { icon: ShieldCheck, label: 'Privacy & Security', href: '/privacy' },
    ],
  },
  {
    title: 'Discover',
    items: [
      { icon: Globe, label: 'Browse Feed', href: '/free-mode' },
      { icon: Compass, label: 'Explore People', href: '/free-mode/explore' },
    ],
  },
  {
    title: 'Go Further',
    items: [
      { icon: Star, label: 'Upgrade to Full ViMore', href: '/', description: 'Unlock photos, music, calls & more' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { icon: FileText, label: 'Terms of Service', href: '/terms' },
      { icon: ShieldCheck, label: 'Privacy Policy', href: '/privacy' },
    ],
  },
];

export default function FreeModeMenuPage() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808]">
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-primary/10 px-4 py-2.5 flex items-center gap-2 shadow-sm">
        <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
            <path d="M3 7L10 19L17 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 15L17 7L21 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="font-headline font-bold text-lg tracking-tight text-primary">Menu</span>
      </header>

      <div className="flex items-center justify-center gap-2 bg-orange-500/5 border-b border-orange-500/10 px-4 py-2">
        <Zap className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
        <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
          Free Mode — Text Only · Optimised for Orange &amp; MTN networks
        </p>
      </div>

      <div className="max-w-[600px] mx-auto px-4 py-4 pb-24 space-y-5">
        {menuSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 mb-2">
              {section.title}
            </p>
            <div className="bg-white dark:bg-card rounded-2xl border border-border/60 overflow-hidden divide-y divide-border/40">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{item.label}</p>
                    {'description' in item && item.description && (
                      <p className="text-[11px] text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div className="text-center pt-2 pb-2">
          <p className="text-[10px] text-muted-foreground/60 font-bold">ViMore Free Mode · Media Tech Liberia</p>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-card/95 backdrop-blur-sm border-t border-border/60 flex items-center justify-around px-2 py-2">
        {navItems.map(({ icon: Icon, label, href }) => (
          <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${href === '/free-mode/menu' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
            <Icon className="h-5 w-5" />
            <span className="text-[9px] font-black uppercase tracking-wide">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
