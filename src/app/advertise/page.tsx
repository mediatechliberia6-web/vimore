"use client";

import Link from "next/link";
import { Phone, MessageCircle, CheckCircle2, Zap, Star, Music2, Download, Clapperboard, ArrowRight, Sparkles, Globe, Users, TrendingUp, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PHONE_PRIMARY = "+231778451835";
const PHONE_SECONDARY = "+231889322188";

function PriceCard({ icon: Icon, title, price, unit, description, features, accent, badge }: {
  icon: React.ElementType;
  title: string;
  price: string;
  unit: string;
  description: string;
  features: string[];
  accent: string;
  badge?: string;
}) {
  return (
    <div className={cn(
      "relative rounded-[2rem] p-8 border space-y-6 transition-all hover:scale-[1.02] duration-300",
      accent === 'primary' ? "bg-primary/5 border-primary/20 shadow-2xl shadow-primary/10" :
      accent === 'blue' ? "bg-blue-500/5 border-blue-500/20" :
      accent === 'accent' ? "bg-accent/5 border-accent/20" :
      "bg-card border-border"
    )}>
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-white font-black uppercase text-[10px] tracking-widest px-4 py-1 shadow-lg shadow-primary/30">{badge}</Badge>
        </div>
      )}
      <div className={cn(
        "h-14 w-14 rounded-2xl flex items-center justify-center",
        accent === 'primary' ? "bg-primary/10 text-primary" :
        accent === 'blue' ? "bg-blue-500/10 text-blue-500" :
        accent === 'accent' ? "bg-accent/10 text-accent" :
        "bg-secondary text-muted-foreground"
      )}>
        <Icon className="h-7 w-7" />
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-black italic uppercase tracking-tighter">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className={cn("text-4xl font-black tracking-tighter",
            accent === 'primary' ? "text-primary" :
            accent === 'blue' ? "text-blue-500" :
            accent === 'accent' ? "text-accent" : "text-foreground"
          )}>{price}</span>
          <span className="text-sm text-muted-foreground font-bold">{unit}</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <ul className="space-y-2">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <CheckCircle2 className={cn("h-4 w-4 mt-0.5 shrink-0",
              accent === 'primary' ? "text-primary" :
              accent === 'blue' ? "text-blue-500" :
              accent === 'accent' ? "text-accent" : "text-green-500"
            )} />
            <span className="text-muted-foreground">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdvertisePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-primary/10 blur-[200px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/10 blur-[180px] rounded-full" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-20 text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-2">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-black text-primary uppercase tracking-widest">ViMore Advertising Platform</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black italic uppercase tracking-tighter leading-[0.9] text-foreground">
            Put Your Brand<br />
            <span className="text-primary">Where Hearts Beat</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Reach thousands of passionate users on ViMore — the platform built for real human connection. 
            Your brand doesn't just get seen here. It gets <em>felt.</em>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
            {[
              { icon: Users, label: "Real Engaged Users" },
              { icon: Globe, label: "Borderless Reach" },
              { icon: TrendingUp, label: "Consistent Visibility" },
              { icon: Shield, label: "Brand Safe" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">How It Works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Simple, honest, and effective. No hidden fees, no complicated dashboards — just your message reaching the right people.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Choose Your Format", desc: "Pick from Story Ads, Download Ads, or Music Audio Ads depending on where you want to connect with users." },
            { step: "02", title: "Provide Your Content", desc: "Send us your photo, video, or audio. No creative? No problem — we can craft a stunning ad for you." },
            { step: "03", title: "Confirm & Pay", desc: "Contact us via WhatsApp or call to confirm your campaign days and complete your payment securely." },
            { step: "04", title: "Go Live", desc: "Your ad starts running immediately and stays live consistently until every day you paid for is complete." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="space-y-3 p-6 bg-card rounded-3xl border border-border hover:border-primary/20 transition-colors">
              <span className="text-5xl font-black text-primary/20 italic tracking-tighter leading-none">{step}</span>
              <h3 className="font-black uppercase tracking-tight text-base">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Transparent Pricing</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Minimum 10 days per campaign. Every dollar you invest shows your brand to real people, every single day — no fluff, no waste.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <PriceCard
            icon={Clapperboard}
            title="Story Ads"
            price="$1.00"
            unit="/ day (Photo) · $1.50 / day (Video)"
            description="Your ad appears as a full-screen story after every 2 stories a user watches. Looks exactly like a native story — just with your brand."
            features={[
              "Full-screen story format",
              "Photo ($1/day) or Video ($1.50/day)",
              "Shown after every 2 organic stories",
              "Includes a tappable call-to-action button",
              "Minimum 10 days"
            ]}
            accent="primary"
            badge="Most Popular"
          />
          <PriceCard
            icon={Download}
            title="Download Ads"
            price="$1.00"
            unit="/ day (Photo) · $1.50 / day (Video)"
            description="Your ad plays as a 30-second interstitial whenever a user taps any download button on ViMore — music, photos, or videos."
            features={[
              "30-second prime placement",
              "Guaranteed full attention",
              "Photo or Video format",
              "Includes a clickable action button",
              "Minimum 10 days"
            ]}
            accent="blue"
          />
          <PriceCard
            icon={Music2}
            title="Music Audio Ads"
            price="$0.50"
            unit="/ day"
            description="A 45-second audio spot that plays between every 2 songs on ViMore Sonic. Users hear your message loud and clear — no skipping allowed."
            features={[
              "Up to 45 seconds of pure audio",
              "Plays after every 2 songs",
              "Cannot be skipped",
              "Perfect for brand voice & jingles",
              "Minimum 10 days"
            ]}
            accent="accent"
          />
        </div>

        {/* Add-on */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/15 rounded-3xl p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
            <Zap className="h-7 w-7 text-primary animate-pulse" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black uppercase tracking-tight">Download Boost Add-On</h3>
              <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[10px] uppercase">Add-On</Badge>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Already running a Story or Music ad? Add <strong>+$0.50/day</strong> to make it also appear on the download interstitial placement. 
              Once you've paid for your main campaign, this add-on plugs right in — maximum exposure, minimal cost.
            </p>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-3xl font-black text-primary tracking-tighter">+$0.50</span>
            <p className="text-xs text-muted-foreground font-bold">/ day add-on</p>
          </div>
        </div>
      </section>

      {/* We Create For You */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-card border border-border rounded-[2.5rem] p-10 sm:p-14 text-center space-y-6">
          <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
            <Star className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-3">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Don't Have Creative?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-base">
              No photo, no video, no audio? That's completely fine. <strong>ViMore will craft a professional, eye-catching ad for you.</strong> 
              Just share your brand details, your message, and what you want to achieve — and we'll build something that resonates and converts. 
              Just keep in mind, custom creative production requires a minimum of <strong>10 days</strong> of ad spend to qualify.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-primary font-bold">
            <CheckCircle2 className="h-4 w-4" />
            We provide the creative. You provide the vision.
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: TrendingUp, title: "Consistent Exposure", desc: "ViMore will show your ad consistently across every eligible session until every paid day is fully served." },
            { icon: Shield, title: "Brand Safety", desc: "Your ad appears in a clean, curated environment. No competing clutter, no irrelevant content around your message." },
            { icon: Globe, title: "Growing Audience", desc: "ViMore is a growing platform with passionate users who engage deeply with content — your ad finds real people." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 bg-card rounded-3xl border border-border space-y-3">
              <Icon className="h-6 w-6 text-primary" />
              <h3 className="font-black uppercase tracking-tight">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border border-primary/15 rounded-[3rem] p-10 sm:p-16 text-center space-y-10">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full" />
          </div>
          <div className="relative space-y-4">
            <h2 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter leading-tight">
              Ready to Grow<br />Your Business?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed text-base">
              Reach out directly to our team. We respond fast, we're easy to work with, and we genuinely care about making your campaign a success. 
              Your brand deserves to be heard — let's make it happen together.
            </p>
          </div>

          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-5">
            <a
              href={`https://wa.me/${PHONE_PRIMARY.replace(/\+/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-black uppercase text-sm tracking-widest px-8 py-4 rounded-2xl shadow-xl shadow-green-500/20 transition-all active:scale-95 hover:scale-[1.02]"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp Us
              <ArrowRight className="h-4 w-4" />
            </a>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <a
                href={`tel:${PHONE_PRIMARY}`}
                className="flex items-center gap-2 bg-card border border-border hover:border-primary/30 text-foreground font-black uppercase text-sm tracking-widest px-6 py-4 rounded-2xl transition-all hover:bg-primary/5 active:scale-95"
              >
                <Phone className="h-4 w-4 text-primary" />
                {PHONE_PRIMARY}
              </a>
              <a
                href={`tel:${PHONE_SECONDARY}`}
                className="flex items-center gap-2 bg-card border border-border hover:border-primary/30 text-foreground font-black uppercase text-sm tracking-widest px-6 py-4 rounded-2xl transition-all hover:bg-primary/5 active:scale-95"
              >
                <Phone className="h-4 w-4 text-primary" />
                {PHONE_SECONDARY}
              </a>
            </div>
          </div>

          <div className="relative pt-4 border-t border-border/50 space-y-2">
            <p className="font-black italic uppercase tracking-widest text-foreground text-lg">Amos B. Kortu</p>
            <p className="text-sm text-muted-foreground font-bold">Founder & CEO, Media Tech Liberia</p>
            <p className="text-xs text-muted-foreground/60 uppercase tracking-widest font-bold">ViMore · Powered by Media Tech Liberia</p>
          </div>
        </div>
      </section>

      {/* Footer note */}
      <div className="text-center pb-20 px-6">
        <p className="text-xs text-muted-foreground/50 max-w-lg mx-auto leading-relaxed">
          All campaigns require a minimum of 10 days. Pricing is in USD. Payment details and campaign confirmation are handled directly through our team. 
          ViMore guarantees consistent ad delivery for every day paid.
        </p>
      </div>
    </div>
  );
}
