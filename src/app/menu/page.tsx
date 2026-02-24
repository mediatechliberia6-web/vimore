"use client";

import { 
  ArrowLeft, 
  Search, 
  ArrowRightLeft, 
  History, 
  Calendar, 
  GalleryVerticalEnd, 
  Users, 
  CheckCircle, 
  Settings, 
  LifeBuoy, 
  UserPlus, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  Smartphone,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import Link from "next/link";
import { cn } from "@/lib/utils";

const menuGrid = [
  { label: "Memories", icon: History, color: "text-blue-500", bg: "bg-blue-50" },
  { label: "Events", icon: Calendar, color: "text-red-500", bg: "bg-red-50" },
  { label: "Series", icon: GalleryVerticalEnd, color: "text-purple-500", bg: "bg-purple-50" },
  { label: "Hubs", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Verified", icon: CheckCircle, color: "text-primary", bg: "bg-primary/5" },
  { label: "Nearby", icon: Search, color: "text-orange-500", bg: "bg-orange-50" },
];

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-card border-b border-border h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold font-headline">Menu</h1>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50">
            <ArrowRightLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Profile Card */}
        <Link href="/profile" className="block">
          <div className="bg-white dark:bg-card rounded-2xl p-4 shadow-sm border border-border flex items-center justify-between group transition-all hover:bg-secondary/20 active:scale-[0.98]">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-primary/10">
                <AvatarImage src="https://picsum.photos/seed/me/200/200" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-bold text-lg">John Doe</span>
                <span className="text-sm text-muted-foreground">See your profile</span>
              </div>
            </div>
            <div className="bg-secondary/50 p-2 rounded-full group-hover:bg-primary/10 transition-colors">
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
            </div>
          </div>
        </Link>

        {/* Shortcuts Grid */}
        <div className="grid grid-cols-2 gap-3">
          {menuGrid.map((item) => (
            <button 
              key={item.label}
              className="bg-white dark:bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col items-start gap-3 transition-all hover:shadow-md active:scale-95 text-left group"
            >
              <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110", item.bg)}>
                <item.icon className={cn("h-6 w-6", item.color)} />
              </div>
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Accordion Settings */}
        <div className="bg-white dark:bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="settings" className="border-b-0">
              <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-secondary/10 group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="font-bold text-base">Settings & Privacy</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-1">
                {[
                  { label: "Privacy Checkup", icon: ShieldCheck },
                  { label: "Account Center", icon: Smartphone },
                  { label: "Language", icon: Info }
                ].map((sub) => (
                  <button key={sub.label} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors font-medium">
                    <sub.icon className="h-4 w-4 text-muted-foreground" />
                    {sub.label}
                  </button>
                ))}
              </AccordionContent>
            </AccordionItem>

            <div className="h-px bg-border mx-4" />

            <AccordionItem value="support" className="border-b-0">
              <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-secondary/10 group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <LifeBuoy className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="font-bold text-base">Help & Support</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-1">
                {[
                  { label: "Help Center", icon: HelpCircle },
                  { label: "Report a Problem", icon: Info }
                ].map((sub) => (
                  <button key={sub.label} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors font-medium">
                    <sub.icon className="h-4 w-4 text-muted-foreground" />
                    {sub.label}
                  </button>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Action List */}
        <div className="space-y-2 pb-10">
          <button className="w-full bg-white dark:bg-card p-4 rounded-2xl border border-border shadow-sm flex items-center gap-3 transition-all hover:bg-secondary/20 group">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:scale-110 transition-transform">
              <UserPlus className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <span className="font-bold text-base">Add Account</span>
          </button>
          <button className="w-full bg-white dark:bg-card p-4 rounded-2xl border border-border shadow-sm flex items-center gap-3 transition-all hover:bg-destructive/10 group">
            <div className="p-2 bg-destructive/10 rounded-lg group-hover:scale-110 transition-transform">
              <LogOut className="h-5 w-5 text-destructive" />
            </div>
            <span className="font-bold text-base text-destructive">Log Out</span>
          </button>
        </div>
      </main>
    </div>
  );
}
