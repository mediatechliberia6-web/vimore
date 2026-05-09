
"use client";

import { ArrowLeft, Building2, Sparkles, Globe, Zap, Heart, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const leaders = [
  {
    name: "Amos B. Kortu",
    title: "Founder & CEO",
    company: "Media Tech Liberia",
    image: "/amos-kortu.png",
    gradient: "from-violet-600 via-purple-500 to-indigo-600",
    ring: "ring-violet-400/40",
    glow: "shadow-violet-500/20",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    icon: Sparkles,
    tagline: "The visionary who sparked the dream",
  },
];

const storyParagraphs = [
  `Every great movement begins with a single, burning idea. For Amos B. Kortu, that idea was rooted in a profound belief: that Africa — and Liberia in particular — deserved its own world-class technology platform. A platform built not by outsiders, but by Liberians who understood the heartbeat of their nation, its culture, its stories, and its people. Armed with nothing but vision, determination, and an unshakeable faith in what could be, Amos set out to build something that had never existed before in the region — a full-scale social media and creator economy platform designed from the ground up for African voices.`,

  `Amos's conviction was simple but radical: technology is a language, and every people deserves to speak it in their own voice. He believed that Liberia's young generation was brimming with talent — developers, designers, creators, storytellers — who simply needed the right stage. So he set to work building that stage, day after day, through late nights and early mornings, pouring his energy into designing systems, crafting visions, and rallying early believers to the cause. What emerged was not just an app, but an ecosystem with a heartbeat.`,

  `Media Tech Liberia didn't just want to build a product. It wanted to build a movement. A place where creators could monetize their talent, where communities could form and flourish, where stories from the streets of Monrovia could reach every corner of the globe. The platform — ViMore — became the living embodiment of that dream: a next-generation social network with feeds, reels, direct messaging, AI-powered tools, and a full creator economy. For the first time, Liberian creators would have a stage that was truly theirs.`,

  `Building a technology company in West Africa comes with its own unique set of challenges — from infrastructure limitations to funding hurdles, from connectivity gaps to the constant pressure to compete with global giants. But Amos turned every challenge into fuel. Every setback became a setup for a greater comeback. The Media Tech Liberia team pressed forward, release after release, update after update, always staying close to their users and always listening to the communities they were built to serve.`,

  `Under Amos's leadership, the team hired young Liberian developers, designers, and creatives — proving that the talent to build world-class technology had always existed in Africa. It simply needed the right opportunity, the right leadership, and the right belief. The philosophy was clear: build with integrity, lead with empathy, and never stop innovating.`,

  `ViMore grew. Stories multiplied. Creators found their voices. Communities connected across distances that once felt impossible to bridge. And with each milestone, the vision of Amos B. Kortu became clearer — not just a platform, but a movement. A digital renaissance for Liberia and for Africa. A declaration that innovation has no zip code, and that greatness can emerge from anywhere when people dare to dream boldly enough.`,

  `Today, Media Tech Liberia stands as a testament to what happens when passion meets purpose, and when courage refuses to bow to circumstance. It is a company that carries the flag of African excellence into every server, every line of code, and every feature that rolls out to its growing community of users. With Amos B. Kortu as its Founder and CEO, Media Tech Liberia is not just writing its own story — it is helping an entire generation write theirs.`,

  `The mission is far from finished. In fact, it has only just begun. New features are coming. New markets are opening. New partnerships are forming. And through it all, the same fire that started in the heart of a Liberian dreamer continues to burn — lighting the way for millions who believe that Africa's digital future is not something to wait for. It is something to build. Right now. Together.`,
];

export default function MTLPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#050505] transition-colors duration-300">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-border h-16 px-4 flex items-center gap-4">
        <Link href="/menu">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary/80 active:scale-90 transition-all">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold font-headline tracking-tight text-foreground">MTL Information</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 pb-24 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 via-primary to-indigo-700 blur-2xl opacity-30 scale-110" />
              <Image
                src="/mtl-logo.png"
                alt="Media Tech Liberia Logo"
                width={160}
                height={160}
                className="relative rounded-full shadow-2xl shadow-blue-900/40 border-4 border-white/10"
                priority
              />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
            <Zap className="h-3 w-3" />
            Powering Africa's Digital Future
          </div>
          <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
            Media Tech <span className="text-primary">Liberia</span>
          </h2>
          <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-700 dark:text-amber-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
            <Star className="h-3 w-3" />
            Founded December 19, 2025 · Monrovia, Liberia
          </div>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-md mx-auto">
            A next-generation technology company building the social media and creator economy platform for Africa — born in Liberia, built for the world.
          </p>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic pt-2">
            ViMore launched April 14, 2026
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Our Leadership</h3>
          </div>

          <div className="space-y-5">
            {leaders.map((leader, i) => {
              const Icon = leader.icon;
              return (
                <div
                  key={leader.name}
                  className={cn(
                    "relative bg-white dark:bg-card rounded-[2rem] border border-border/60 shadow-xl overflow-hidden",
                    `shadow-[0_8px_40px_-12px] ${leader.glow}`
                  )}
                >
                  <div className={cn("absolute inset-0 opacity-[0.04] bg-gradient-to-br", leader.gradient)} />

                  <div className="relative flex items-start gap-5 p-6">
                    <div className={cn("relative shrink-0 rounded-2xl overflow-hidden ring-4", leader.ring)}>
                      <Image
                        src={leader.image}
                        alt={leader.name}
                        width={100}
                        height={120}
                        className="object-cover object-top w-[100px] h-[120px]"
                        priority={i === 0}
                      />
                      <div className={cn("absolute inset-0 bg-gradient-to-t from-black/30 to-transparent")} />
                    </div>

                    <div className="flex flex-col gap-2 flex-1 min-w-0 pt-1">
                      <div className={cn("inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest", leader.badge)}>
                        <Icon className="h-2.5 w-2.5" />
                        {leader.title}
                      </div>
                      <h4 className="text-xl font-black tracking-tight text-foreground leading-tight">{leader.name}</h4>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{leader.company}</p>
                      <div className="mt-1 flex items-start gap-1.5">
                        <Star className="h-3 w-3 text-primary/50 shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground italic leading-snug">{leader.tagline}</p>
                      </div>
                    </div>
                  </div>

                  <div className={cn("h-1 w-full bg-gradient-to-r", leader.gradient)} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-2 px-1">
            <Building2 className="h-4 w-4 text-primary" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Our Story</h3>
          </div>

          <div className="bg-white dark:bg-card rounded-[2rem] border border-border/60 shadow-xl shadow-black/5 p-6 space-y-5">
            {storyParagraphs.map((para, i) => (
              <p
                key={i}
                className={cn(
                  "text-sm leading-relaxed text-foreground/80",
                  i === 0 && "text-base font-semibold text-foreground/90 leading-relaxed",
                  i === storyParagraphs.length - 1 && "font-semibold text-foreground/90"
                )}
              >
                {i === 0 && (
                  <span className="float-left text-5xl font-black text-primary leading-none mr-2 mt-1">
                    {para[0]}
                  </span>
                )}
                {i === 0 ? para.slice(1) : para}
              </p>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 py-6 opacity-50">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground">Media Tech Liberia</p>
          <p className="text-[9px] font-bold uppercase tracking-widest text-primary italic">Built in Liberia. Built for the World.</p>
        </div>
      </main>
    </div>
  );
}
