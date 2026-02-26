"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  Info, 
  MoreVertical,
  Search,
  ChevronDown,
  CheckCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Connection } from "@/context/PostContext";
import { ChatBubble } from "./chat-bubble";
import { ChatInput } from "./chat-input";

interface ChatWindowProps {
  contact: Connection;
  onBack: () => void;
}

interface Message {
  id: string;
  sender: "me" | "them";
  text?: string;
  time: string;
  status: "sent" | "delivered" | "read";
  type: "text" | "photo" | "video" | "link";
  mediaUrl?: string;
  linkData?: {
    title: string;
    description: string;
    image: string;
    url: string;
  };
}

export function ChatWindow({ contact, onBack }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: "1", 
      sender: "them", 
      text: "Yo! Did you check out the new design system I pushed to the hub?", 
      time: "10:40 AM", 
      status: "read", 
      type: "text" 
    },
    { 
      id: "2", 
      sender: "me", 
      text: "I did! The typography choices are absolute fire. That font pairing is very high-velocity. 🔥", 
      time: "10:42 AM", 
      status: "read", 
      type: "text" 
    },
    { 
      id: "3", 
      sender: "them", 
      text: "Check out this visual reference for the landing page hero.", 
      time: "10:43 AM", 
      status: "read", 
      type: "photo",
      mediaUrl: "https://picsum.photos/seed/chat-ref/800/600"
    },
    { 
      id: "4", 
      sender: "them", 
      time: "10:44 AM", 
      status: "read", 
      type: "link",
      text: "Found this great article on motion design: https://vimore.social/motion-trends",
      linkData: {
        title: "The Future of High-Velocity Motion",
        description: "Exploring how sub-second transitions are redefining user engagement in social apps.",
        image: "https://picsum.photos/seed/link-preview/800/400",
        url: "https://vimore.social/motion-trends"
      }
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "me",
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sent",
      type: text.startsWith("http") ? "link" : "text"
    };

    // Simulate simple link detection for Phase 2
    if (text.startsWith("http")) {
      newMessage.linkData = {
        title: "External Vibe",
        description: "Checking out shared resources in the ViMore network...",
        image: "https://picsum.photos/seed/new-link/800/400",
        url: text
      };
    }

    setMessages(prev => [...prev, newMessage]);

    // Simple reply simulation
    setTimeout(() => {
      if (text.toLowerCase().includes("image") || text.toLowerCase().includes("photo")) {
        const reply: Message = {
          id: (Date.now() + 1).toString(),
          sender: "them",
          text: "Here is that asset you requested! ⚡️",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: "delivered",
          type: "photo",
          mediaUrl: "https://picsum.photos/seed/reply-photo/800/800"
        };
        setMessages(prev => [...prev, reply]);
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[#F0F2F5] dark:bg-[#080808]">
      {/* WhatsApp-style Header */}
      <header className="h-[76px] px-4 sm:px-6 flex items-center justify-between bg-white dark:bg-card border-b border-primary/5 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" className="lg:hidden rounded-full h-10 w-10 -ml-2" onClick={onBack}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="relative shrink-0">
            <Avatar className="h-10 w-10 sm:h-11 sm:w-11 border-2 border-primary/10">
              <AvatarImage src={contact.avatar} />
              <AvatarFallback>{contact.name[0]}</AvatarFallback>
            </Avatar>
            {contact.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-card rounded-full" />
            )}
          </div>
          <div className="flex flex-col min-w-0 ml-1">
            <h3 className="font-bold text-sm sm:text-base truncate">{contact.name}</h3>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest",
              contact.isOnline ? "text-green-500" : "text-muted-foreground"
            )}>
              {contact.isOnline ? "Active Now" : "Offline"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary">
            <Phone className="h-5 w-5" />
          </Button>
          <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary">
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 scroll-smooth bg-opacity-50"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(153,64,229,0.03) 1px, transparent 0)', backgroundSize: '24px 24px' }}
      >
        <div className="flex justify-center mb-8 sticky top-0 z-10">
          <span className="bg-white/80 dark:bg-card/80 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground shadow-sm border border-primary/5">
            Today
          </span>
        </div>

        {messages.map((msg) => (
          <ChatBubble 
            key={msg.id}
            isMe={msg.sender === "me"}
            text={msg.text}
            time={msg.time}
            status={msg.status}
            type={msg.type}
            mediaUrl={msg.mediaUrl}
            linkData={msg.linkData}
          />
        ))}
      </div>

      {/* Bottom Input Area */}
      <ChatInput onSend={handleSend} />
    </div>
  );
}
