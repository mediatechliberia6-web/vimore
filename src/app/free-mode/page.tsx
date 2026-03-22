'use client';

import Link from 'next/link';
import { Heart, MessageCircle, Share2, Zap, Globe, Home, Compass, Bell, User, Menu } from 'lucide-react';
import { ModeSwitcher } from '@/components/layout/mode-switcher';

const FREE_POSTS = [
  {
    id: '1',
    username: 'maya_chen',
    name: 'Maya Chen',
    initials: 'MC',
    time: '2m ago',
    content: 'Just finished a new digital art series exploring the intersection of culture and technology. Excited to share it with the community soon!',
    likes: 412,
    comments: 38,
    isVerified: true,
  },
  {
    id: '2',
    username: 'jordan_blake',
    name: 'Jordan Blake',
    initials: 'JB',
    time: '15m ago',
    content: 'New beat dropping tonight at 10PM WAT. Been working on this one for three weeks straight. The African percussion elements hit different.',
    likes: 289,
    comments: 54,
    isVerified: false,
  },
  {
    id: '3',
    username: 'sofia_l',
    name: 'Sofia Laurent',
    initials: 'SL',
    time: '1h ago',
    content: 'Reminder that your mental health is more important than your productivity. Take a break. Breathe. You are enough.',
    likes: 1820,
    comments: 203,
    isVerified: true,
  },
  {
    id: '4',
    username: 'kwame_a',
    name: 'Kwame Asante',
    initials: 'KA',
    time: '2h ago',
    content: 'The tech ecosystem in West Africa is growing at a rate that most global investors are still underestimating. We are building, and the world will catch up.',
    likes: 934,
    comments: 117,
    isVerified: true,
  },
  {
    id: '5',
    username: 'priya_m',
    name: 'Priya Mehta',
    initials: 'PM',
    time: '3h ago',
    content: 'Spent the morning teaching a free coding workshop for 40 young women in Monrovia. Seeing that spark of "I can do this" in someone\'s eyes is priceless.',
    likes: 2340,
    comments: 189,
    isVerified: false,
  },
  {
    id: '6',
    username: 'alex_rivers',
    name: 'Alex Rivers',
    initials: 'AR',
    time: '4h ago',
    content: 'ViMore Free Mode is now live — no images, no video, just pure connection. Built for Orange and MTN users across Liberia, Ghana, Nigeria, and beyond. Your voice matters even with 1 bar of signal.',
    likes: 5670,
    comments: 421,
    isVerified: true,
  },
  {
    id: '7',
    username: 'elena_v',
    name: 'Elena Vasquez',
    initials: 'EV',
    time: '5h ago',
    content: 'Language learning tip: the fastest way to become fluent is to make mistakes out loud, loudly, and without shame. Embarrassment is just unexperienced fluency.',
    likes: 3100,
    comments: 278,
    isVerified: false,
  },
  {
    id: '8',
    username: 'omar_s',
    name: 'Omar Siddiqui',
    initials: 'OS',
    time: '6h ago',
    content: 'Finished reading "Things Fall Apart" for the fourth time. Every read reveals a new layer. Achebe was operating on a frequency most writers never reach.',
    likes: 748,
    comments: 94,
    isVerified: false,
  },
];

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

        {FREE_POSTS.map((post) => (
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
