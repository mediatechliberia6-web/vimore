
"use client";

import { ArrowLeft, ShieldCheck, Eye, Lock, Zap, Globe, FileText, Smartphone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F2ECF7] dark:bg-[#050505] transition-colors duration-500 flex flex-col relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <header className="h-20 px-6 flex items-center justify-between bg-white/40 dark:bg-card/40 backdrop-blur-xl border-b border-border sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-lg font-black italic uppercase tracking-widest leading-tight">Privacy Policy</h1>
            <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Identity Sovereignty Node</span>
          </div>
        </div>
        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
          <ShieldCheck className="h-6 w-6" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 sm:p-12 relative z-10">
        <div className="max-w-3xl mx-auto space-y-12 pb-32">
          
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Eye className="h-6 w-6" />
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">Our Data Manifesto</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              At ViMore, under the architectural leadership of <strong>Amos B. Kortu</strong> and <strong>Media Tech Liberia (MTL)</strong>, we believe your digital signature is your property. This policy materializes our commitment to protecting your identity while synchronizing high-velocity vibes across our global clusters.
            </p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic">Effective Date: April 14, 2026 | Revision v1.5</p>
            <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest italic">Media Tech Liberia · Founded December 19, 2025</p>
          </section>

          <section className="space-y-6">
            <h3 className="text-lg font-black italic uppercase tracking-widest border-b border-primary/10 pb-2">1. Information Materialization</h3>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <div className="p-6 bg-white/40 dark:bg-white/5 rounded-2xl border border-white/20">
                <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-primary" /> Direct Handshakes
                </h4>
                <p>We collect information you provide directly: your name, username, email, phone number, and arrival date (DOB). This is stored in our private high-fidelity clusters to maintain your identity node.</p>
              </div>
              <div className="p-6 bg-white/40 dark:bg-white/5 rounded-2xl border border-white/20">
                <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" /> Interaction Heuristics
                </h4>
                <p>We track your vibrations: likes, comments, shares, and vibes. Our Groq AI Engine analyzes these pulses to calibrate your Discovery Stream and Reels without leaking your data to external advertisers.</p>
              </div>
              <div className="p-6 bg-white/40 dark:bg-white/5 rounded-2xl border border-white/20">
                <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" /> Hardware & Metadata
                </h4>
                <p>To ensure network integrity, we log device signatures, IP nodes, and spatial origin (nationality). This prevents fraudulent handshakes and protects the MTL Command Core.</p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-lg font-black italic uppercase tracking-widest border-b border-primary/10 pb-2">2. The Economic Audit</h3>
            <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-4">
              <Lock className="h-6 w-6 text-amber-500 shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-bold text-foreground uppercase tracking-tight">Financial Archival</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  All Gold and Diamond transactions are logged for peer-to-peer security. Withdrawal nodes involving Orange/MTN MoMo require legal names and account signatures to comply with the financial protocols of Liberia and international anti-fraud standards.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-lg font-black italic uppercase tracking-widest border-b border-primary/10 pb-2">3. User Sovereignty</h3>
            <p className="text-muted-foreground leading-relaxed">
              You own your data. You have the terminal right to:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Access your full data archive node.",
                "Rectify any identity calibration errors.",
                "Purge your vibe cache anytime.",
                "Deactivate and delete your node permanently."
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-tight">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="p-8 bg-primary/10 rounded-[2.5rem] border border-primary/20 text-center space-y-4">
            <h3 className="text-xl font-black italic uppercase tracking-widest">MTL Sentry Protocol</h3>
            <p className="text-sm text-muted-foreground leading-relaxed uppercase tracking-tighter">
              Our servers are encrypted at every node. In the event of a cluster breach, we will notify all affected identity signatures within 72 temporal hours.
            </p>
            <div className="pt-4 flex flex-col items-center gap-2">
              <p className="text-[9px] font-black uppercase text-primary tracking-[0.4em]">Governance by</p>
              <p className="text-sm font-black italic uppercase tracking-widest">Media Tech Liberia</p>
            </div>
          </section>

        </div>
      </main>

      <footer className="h-16 flex items-center justify-center bg-white/20 dark:bg-black/20 shrink-0">
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em]">ViMore v1.5.0 • Privacy Hub Active</p>
      </footer>
    </div>
  );
}
