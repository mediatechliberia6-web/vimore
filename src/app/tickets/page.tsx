"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { databases, DATABASE_ID, COL, ID, Query } from "@/lib/appwrite";
import { usePosts } from "@/context/PostContext";
import { useNotifications } from "@/context/NotificationContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Ticket, Search, Gem, Calendar, Clock, MapPin, QrCode, ChevronRight, X, User, CheckCircle2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { generateSerialNumber, generateQRCodeDataUrl, formatEventDate, formatEventTime, isEventExpired, getDaysUntilEvent, getMinutesUntilEvent } from "@/lib/ticket-utils";

interface AppwriteEvent {
  $id: string;
  $createdAt: string;
  title: string;
  description: string;
  venue: string;
  event_date: string;
  start_time: string;
  end_time: string;
  flyer_url: string;
  ticket_price: number;
  is_active: boolean;
}

interface AppwriteTicket {
  $id: string;
  $createdAt: string;
  event_id: string;
  user_id: string;
  serial_number: string;
  is_used: boolean;
  event_title: string;
  event_date: string;
  event_venue: string;
  event_start_time: string;
  event_end_time: string;
  price_paid: number;
  owner_name: string;
  owner_avatar: string;
  purchased_by_user_id: string;
  purchased_by_name: string;
}

type Tab = 'browse' | 'my_tickets';

export default function TicketsPage() {
  const { currentUser, triggerHaptic } = usePosts();
  const { addSignal } = useNotifications();
  const { toast } = useToast();

  const [tab, setTab] = useState<Tab>('browse');
  const [events, setEvents] = useState<AppwriteEvent[]>([]);
  const [myTickets, setMyTickets] = useState<AppwriteTicket[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedEvent, setSelectedEvent] = useState<AppwriteEvent | null>(null);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [newTicket, setNewTicket] = useState<AppwriteTicket | null>(null);
  const [newTicketQR, setNewTicketQR] = useState<string>('');
  const [selectedTicketQR, setSelectedTicketQR] = useState<string>('');

  const [buyForOther, setBuyForOther] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [recipientResults, setRecipientResults] = useState<any[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<any | null>(null);
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const recipientSearchTimer = useRef<NodeJS.Timeout | null>(null);

  const [selectedTicket, setSelectedTicket] = useState<AppwriteTicket | null>(null);

  const filteredEvents = events.filter(ev =>
    ev.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (tab === 'my_tickets' && currentUser?.$id) {
      loadMyTickets();
    }
  }, [tab, currentUser?.$id]);

  useEffect(() => {
    if (currentUser?.$id && myTickets.length > 0) {
      checkReminders();
    }
  }, [myTickets]);

  const loadEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const res = await databases.listDocuments(DATABASE_ID, COL.EVENTS, [
        Query.equal('is_active', true),
        Query.orderDesc('ticket_price'),
        Query.limit(100),
      ]);
      const evs = (res.documents as unknown as AppwriteEvent[]).filter(
        ev => !isEventExpired(ev.event_date, ev.end_time)
      );
      setEvents(evs);
    } catch {
      toast({ variant: 'destructive', title: 'Failed to load events' });
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const loadMyTickets = async () => {
    if (!currentUser?.$id) return;
    setIsLoadingTickets(true);
    try {
      const res = await databases.listDocuments(DATABASE_ID, COL.TICKETS, [
        Query.equal('user_id', currentUser.$id),
        Query.orderDesc('$createdAt'),
        Query.limit(100),
      ]);
      const tickets = res.documents as unknown as AppwriteTicket[];
      const expired: string[] = [];
      const valid: AppwriteTicket[] = [];
      for (const t of tickets) {
        if (isEventExpired(t.event_date, t.event_end_time)) {
          expired.push(t.$id);
        } else {
          valid.push(t);
        }
      }
      for (const id of expired) {
        try { await databases.deleteDocument(DATABASE_ID, COL.TICKETS, id); } catch {}
      }
      setMyTickets(valid);
    } catch {
      toast({ variant: 'destructive', title: 'Failed to load tickets' });
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const checkReminders = async () => {
    if (!currentUser?.$id) return;
    for (const ticket of myTickets) {
      const days = getDaysUntilEvent(ticket.event_date, ticket.event_start_time);
      const mins = getMinutesUntilEvent(ticket.event_date, ticket.event_start_time);
      if (days < 0) continue;

      try {
        const ticketDoc: any = await databases.getDocument(DATABASE_ID, COL.TICKETS, ticket.$id);
        const updates: Record<string, boolean> = {};
        const reminderTitle = `📅 Event Reminder: ${ticket.event_title}`;
        const baseInfo = `${formatEventDate(ticket.event_date)} at ${formatEventTime(ticket.event_start_time)}`;

        if (days <= 3 && days > 2 && !ticketDoc.reminder_1_sent) {
          addSignal({ type: 'SYSTEM', title: reminderTitle, content: `Your event is in 3 days! ${baseInfo} at ${ticket.event_venue}.`, recipientId: currentUser.$id });
          updates.reminder_1_sent = true;
        }
        if (days <= 2 && days > 1 && !ticketDoc.reminder_2_sent) {
          addSignal({ type: 'SYSTEM', title: reminderTitle, content: `2 days to go! ${baseInfo} at ${ticket.event_venue}.`, recipientId: currentUser.$id });
          updates.reminder_2_sent = true;
        }
        if (days <= 1 && days > 0 && !ticketDoc.reminder_3_sent) {
          addSignal({ type: 'SYSTEM', title: reminderTitle, content: `Tomorrow is the day! ${baseInfo} at ${ticket.event_venue}.`, recipientId: currentUser.$id });
          updates.reminder_3_sent = true;
        }
        if (mins <= 1440 && mins > 60 && !ticketDoc.reminder_4_sent) {
          addSignal({ type: 'SYSTEM', title: reminderTitle, content: `Today is the day! ${ticket.event_title} starts at ${formatEventTime(ticket.event_start_time)}. Venue: ${ticket.event_venue}.`, recipientId: currentUser.$id });
          updates.reminder_4_sent = true;
        }
        if (mins <= 30 && mins > 0 && !ticketDoc.reminder_5_sent) {
          addSignal({ type: 'SYSTEM', title: `⏰ Starting Soon: ${ticket.event_title}`, content: `Only 30 minutes left! Head to ${ticket.event_venue} now.`, recipientId: currentUser.$id });
          updates.reminder_5_sent = true;
        }
        if (mins <= 0 && mins > -60 && !ticketDoc.reminder_6_sent) {
          addSignal({ type: 'SYSTEM', title: `🎉 Event Started: ${ticket.event_title}`, content: `The event has started! Don't miss out at ${ticket.event_venue}.`, recipientId: currentUser.$id });
          updates.reminder_6_sent = true;
        }
        if (Object.keys(updates).length > 0) {
          await databases.updateDocument(DATABASE_ID, COL.TICKETS, ticket.$id, updates);
        }
      } catch {}
    }
  };

  const searchRecipient = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) { setRecipientResults([]); return; }
    setIsSearchingUser(true);
    try {
      const res = await databases.listDocuments(DATABASE_ID, COL.USERS, [
        Query.contains('username', query.toLowerCase()),
        Query.limit(8),
      ]);
      setRecipientResults(res.documents.filter((u: any) => u.$id !== currentUser?.$id));
    } catch {
      setRecipientResults([]);
    } finally {
      setIsSearchingUser(false);
    }
  }, [currentUser?.$id]);

  const handleRecipientInput = (val: string) => {
    setRecipientSearch(val);
    setSelectedRecipient(null);
    if (recipientSearchTimer.current) clearTimeout(recipientSearchTimer.current);
    recipientSearchTimer.current = setTimeout(() => searchRecipient(val), 200);
  };

  const openBuyDialog = (ev: AppwriteEvent) => {
    setSelectedEvent(ev);
    setBuyForOther(false);
    setSelectedRecipient(null);
    setRecipientSearch('');
    setRecipientResults([]);
    setShowBuyDialog(true);
  };

  const handleProceedToConfirm = () => {
    if (!currentUser || !selectedEvent) return;
    const balance = currentUser.diamond_balance || 0;
    if (balance < selectedEvent.ticket_price) {
      toast({ variant: 'destructive', title: 'Insufficient Diamonds', description: `You need ${selectedEvent.ticket_price} 💎 but only have ${balance} 💎.` });
      return;
    }
    if (buyForOther && !selectedRecipient) {
      toast({ variant: 'destructive', title: 'Select a recipient', description: 'Please search and select who you want to buy for.' });
      return;
    }
    setShowBuyDialog(false);
    setShowConfirmDialog(true);
  };

  const handleConfirmPurchase = async () => {
    if (!currentUser || !selectedEvent) return;
    setIsBuying(true);
    triggerHaptic(50);
    try {
      const serial = generateSerialNumber();

      const owner = buyForOther && selectedRecipient ? selectedRecipient : currentUser;
      const ownerName = owner.display_name || owner.name || owner.username || 'Guest';
      const ownerAvatar = owner.avatar || owner.avatar_url || '';
      const ownerId = owner.$id;

      await databases.updateDocument(DATABASE_ID, COL.USERS, currentUser.$id, {
        diamond_balance: (currentUser.diamond_balance || 0) - selectedEvent.ticket_price,
      });

      const ticketDoc = await databases.createDocument(DATABASE_ID, COL.TICKETS, ID.unique(), {
        event_id: selectedEvent.$id,
        user_id: ownerId,
        serial_number: serial,
        is_used: false,
        event_title: selectedEvent.title,
        event_date: selectedEvent.event_date,
        event_venue: selectedEvent.venue,
        event_start_time: selectedEvent.start_time,
        event_end_time: selectedEvent.end_time,
        price_paid: selectedEvent.ticket_price,
        owner_name: ownerName,
        owner_avatar: ownerAvatar,
        purchased_by_user_id: currentUser.$id,
        purchased_by_name: currentUser.display_name || currentUser.name || currentUser.username || 'Someone',
        reminder_1_sent: false,
        reminder_2_sent: false,
        reminder_3_sent: false,
        reminder_4_sent: false,
        reminder_5_sent: false,
        reminder_6_sent: false,
      });

      if (buyForOther && selectedRecipient) {
        const buyerName = currentUser.display_name || currentUser.name || currentUser.username || 'Someone';
        const eventDay = formatEventDate(selectedEvent.event_date);
        const eventTime = `${formatEventTime(selectedEvent.start_time)} - ${formatEventTime(selectedEvent.end_time)}`;
        await databases.createDocument(DATABASE_ID, COL.NOTIFICATIONS, ID.unique(), {
          user_id: selectedRecipient.$id,
          from_user_id: currentUser.$id,
          from_user_name: buyerName,
          from_user_avatar: currentUser.avatar || '',
          type: 'SYSTEM',
          title: '🎟️ You Got a Ticket!',
          content: `${buyerName} bought you a Ticket for ${selectedEvent.title} that will be on ${eventDay} Time ${eventTime}. Don't Miss it!`,
          is_read: false,
        });
      }

      const qrDataUrl = await generateQRCodeDataUrl(`VIMORE-TICKET:${serial}`);
      setNewTicketQR(qrDataUrl);
      setNewTicket(ticketDoc as unknown as AppwriteTicket);
      setShowConfirmDialog(false);
      setShowSuccessDialog(true);
      triggerHaptic(100);
      if (tab === 'my_tickets') loadMyTickets();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Purchase failed', description: e.message });
    } finally {
      setIsBuying(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  const balance = currentUser.diamond_balance || 0;

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border px-4 pt-4 pb-0">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-black italic uppercase tracking-tighter">ViMore Tickets</h1>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Your Balance: 💎 {balance.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex gap-1 bg-secondary/40 p-1.5 rounded-2xl mb-0">
            <button
              onClick={() => setTab('browse')}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'browse' ? 'bg-background text-primary shadow-md' : 'text-muted-foreground'}`}
            >
              Find Events
            </button>
            <button
              onClick={() => setTab('my_tickets')}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'my_tickets' ? 'bg-background text-primary shadow-md' : 'text-muted-foreground'}`}
            >
              My Tickets {myTickets.length > 0 && `(${myTickets.length})`}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-4">
        {tab === 'browse' && (
          <>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search events by name..."
                className="w-full bg-secondary/40 border-none rounded-2xl h-12 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {isLoadingEvents ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-16">
                <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="font-black italic uppercase tracking-tighter text-lg">
                  {searchQuery ? 'No Events Found' : 'No Events Available'}
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  {searchQuery ? `No events match "${searchQuery}"` : 'Check back later for upcoming events.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map(ev => (
                  <div
                    key={ev.$id}
                    onClick={() => openBuyDialog(ev)}
                    className="bg-card rounded-[2rem] overflow-hidden border border-border hover:border-primary/40 transition-all cursor-pointer group shadow-sm hover:shadow-lg hover:shadow-primary/5 active:scale-[0.99]"
                  >
                    {ev.flyer_url && (
                      <div className="h-44 w-full relative overflow-hidden">
                        <img src={ev.flyer_url} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                          <h3 className="text-white font-black italic uppercase tracking-tighter text-xl leading-tight drop-shadow">{ev.title}</h3>
                          <Badge className="bg-primary border-none shrink-0 shadow-lg">
                            <Gem className="h-3 w-3 mr-1" />{ev.ticket_price}
                          </Badge>
                        </div>
                      </div>
                    )}
                    <div className="p-4 space-y-3">
                      {!ev.flyer_url && (
                        <div className="flex items-start justify-between">
                          <h3 className="font-black italic uppercase tracking-tighter text-lg leading-tight">{ev.title}</h3>
                          <Badge className="bg-primary border-none shrink-0">
                            <Gem className="h-3 w-3 mr-1" />{ev.ticket_price}
                          </Badge>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-3">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          {formatEventDate(ev.event_date)}
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          {formatEventTime(ev.start_time)} – {formatEventTime(ev.end_time)}
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          {ev.venue}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] font-black uppercase text-muted-foreground">Tap to view details</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'my_tickets' && (
          <>
            {isLoadingTickets ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : myTickets.length === 0 ? (
              <div className="text-center py-16">
                <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="font-black italic uppercase tracking-tighter text-lg">No Tickets Yet</p>
                <p className="text-muted-foreground text-sm mt-2">Browse events and buy your first ticket.</p>
                <Button onClick={() => setTab('browse')} className="mt-6 rounded-2xl font-black uppercase text-[10px]">
                  Browse Events
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myTickets.map(ticket => (
                  <div
                    key={ticket.$id}
                    onClick={async () => { setSelectedTicket(ticket); const qr = await generateQRCodeDataUrl(`VIMORE-TICKET:${ticket.serial_number}`); setSelectedTicketQR(qr); }}
                    className="bg-card rounded-[2rem] border border-border hover:border-primary/40 transition-all cursor-pointer group overflow-hidden shadow-sm"
                  >
                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-black italic uppercase tracking-tighter text-base leading-tight truncate">{ticket.event_title}</p>
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            <span className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase">
                              <Calendar className="h-3 w-3" />{formatEventDate(ticket.event_date)}
                            </span>
                            <span className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase">
                              <MapPin className="h-3 w-3" />{ticket.event_venue}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0">
                          {ticket.is_used ? (
                            <Badge variant="outline" className="border-red-500/30 text-red-500 text-[9px] font-black uppercase">Used</Badge>
                          ) : (
                            <Badge variant="outline" className="border-green-500/30 text-green-500 text-[9px] font-black uppercase">Valid</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-secondary/30 rounded-2xl p-3">
                        <div>
                          <p className="text-[9px] font-black uppercase text-muted-foreground">Serial No.</p>
                          <p className="font-mono text-sm font-black tracking-widest">{ticket.serial_number}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black uppercase text-muted-foreground">Price Paid</p>
                          <p className="font-black text-primary">💎 {ticket.price_paid}</p>
                        </div>
                      </div>
                      {ticket.purchased_by_user_id !== currentUser.$id && (
                        <p className="text-[9px] font-bold text-muted-foreground">
                          🎁 Gift from {ticket.purchased_by_name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Event Details + Buy Dialog */}
      <Dialog open={showBuyDialog} onOpenChange={o => { if (!o) setShowBuyDialog(false); }}>
        <DialogContent className="bg-card border-border rounded-[2.5rem] max-w-md max-h-[92vh] overflow-y-auto p-0">
          {selectedEvent && (
            <>
              {selectedEvent.flyer_url && (
                <div className="h-52 w-full relative overflow-hidden rounded-t-[2.5rem]">
                  <img src={selectedEvent.flyer_url} alt={selectedEvent.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                </div>
              )}
              <div className="p-6 space-y-5">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">{selectedEvent.title}</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary/30 rounded-2xl p-3">
                    <p className="text-[9px] font-black uppercase text-muted-foreground">Date</p>
                    <p className="font-bold text-sm mt-1">{formatEventDate(selectedEvent.event_date)}</p>
                  </div>
                  <div className="bg-secondary/30 rounded-2xl p-3">
                    <p className="text-[9px] font-black uppercase text-muted-foreground">Time</p>
                    <p className="font-bold text-sm mt-1">{formatEventTime(selectedEvent.start_time)} – {formatEventTime(selectedEvent.end_time)}</p>
                  </div>
                  <div className="bg-secondary/30 rounded-2xl p-3 col-span-2">
                    <p className="text-[9px] font-black uppercase text-muted-foreground">Venue</p>
                    <p className="font-bold text-sm mt-1">{selectedEvent.venue}</p>
                  </div>
                </div>

                <div className="bg-secondary/20 rounded-2xl p-4">
                  <p className="text-[9px] font-black uppercase text-muted-foreground mb-2">About this Event</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{selectedEvent.description}</p>
                </div>

                <div className="flex items-center justify-between bg-primary/10 rounded-2xl p-4">
                  <div>
                    <p className="text-[9px] font-black uppercase text-muted-foreground">Ticket Price</p>
                    <p className="text-2xl font-black text-primary">💎 {selectedEvent.ticket_price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase text-muted-foreground">Your Balance</p>
                    <p className={`text-xl font-black ${balance >= selectedEvent.ticket_price ? 'text-green-400' : 'text-red-400'}`}>
                      💎 {balance.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setBuyForOther(false); setSelectedRecipient(null); setRecipientSearch(''); }}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${!buyForOther ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground'}`}
                    >
                      Buy for Myself
                    </button>
                    <button
                      onClick={() => setBuyForOther(true)}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${buyForOther ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground'}`}
                    >
                      Buy for Someone
                    </button>
                  </div>

                  {buyForOther && (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          value={recipientSearch}
                          onChange={e => handleRecipientInput(e.target.value)}
                          placeholder="Search by username..."
                          className="w-full bg-secondary/30 border-none rounded-2xl h-11 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        {isSearchingUser && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />}
                      </div>
                      {recipientResults.length > 0 && !selectedRecipient && (
                        <div className="bg-secondary/30 rounded-2xl overflow-hidden divide-y divide-border/50">
                          {recipientResults.map(u => (
                            <button
                              key={u.$id}
                              onClick={() => { setSelectedRecipient(u); setRecipientSearch(u.username || u.display_name); setRecipientResults([]); }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-colors text-left"
                            >
                              <Avatar className="h-8 w-8 border border-border shrink-0">
                                <AvatarImage src={u.avatar} />
                                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-bold text-sm">{u.display_name || u.name}</p>
                                <p className="text-[10px] text-muted-foreground">@{u.username}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {selectedRecipient && (
                        <div className="flex items-center gap-3 bg-primary/10 rounded-2xl px-4 py-3 border border-primary/20">
                          <Avatar className="h-9 w-9 border border-border shrink-0">
                            <AvatarImage src={selectedRecipient.avatar} />
                            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-bold text-sm">{selectedRecipient.display_name || selectedRecipient.name}</p>
                            <p className="text-[10px] text-muted-foreground">@{selectedRecipient.username}</p>
                          </div>
                          <button onClick={() => { setSelectedRecipient(null); setRecipientSearch(''); }} className="h-7 w-7 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleProceedToConfirm}
                  disabled={balance < selectedEvent.ticket_price}
                  className="w-full h-14 rounded-2xl font-black italic uppercase tracking-tighter text-base bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {balance < selectedEvent.ticket_price ? (
                    <>Insufficient Diamonds</>
                  ) : (
                    <><Ticket className="h-5 w-5 mr-2" /> Get Ticket — 💎 {selectedEvent.ticket_price}</>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={o => { if (!o && !isBuying) setShowConfirmDialog(false); }}>
        <DialogContent className="bg-card border-border rounded-[2.5rem] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic uppercase tracking-tighter">Confirm Purchase</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4 py-2">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-[10px] font-black uppercase text-muted-foreground">Event</span>
                  <span className="font-bold text-sm text-right max-w-[180px]">{selectedEvent.title}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-[10px] font-black uppercase text-muted-foreground">Date</span>
                  <span className="font-bold text-sm">{formatEventDate(selectedEvent.event_date)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-[10px] font-black uppercase text-muted-foreground">Time</span>
                  <span className="font-bold text-sm">{formatEventTime(selectedEvent.start_time)} – {formatEventTime(selectedEvent.end_time)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-[10px] font-black uppercase text-muted-foreground">Venue</span>
                  <span className="font-bold text-sm">{selectedEvent.venue}</span>
                </div>
                {buyForOther && selectedRecipient && (
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-[10px] font-black uppercase text-muted-foreground">Ticket For</span>
                    <span className="font-bold text-sm">@{selectedRecipient.username}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-[10px] font-black uppercase text-muted-foreground">Price</span>
                  <span className="font-black text-xl text-primary">💎 {selectedEvent.ticket_price}</span>
                </div>
              </div>
              <div className="bg-secondary/20 rounded-2xl p-3 text-center">
                <p className="text-[10px] font-black uppercase text-muted-foreground">After Purchase</p>
                <p className="font-black text-lg">💎 {(balance - selectedEvent.ticket_price).toLocaleString()}</p>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowConfirmDialog(false)} disabled={isBuying} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px]">Cancel</Button>
            <Button onClick={handleConfirmPurchase} disabled={isBuying} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] bg-primary">
              {isBuying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={o => { if (!o) { setShowSuccessDialog(false); setNewTicket(null); } }}>
        <DialogContent className="bg-card border-border rounded-[2.5rem] max-w-sm">
          <div className="text-center space-y-4 py-4">
            <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-9 w-9 text-green-500" />
            </div>
            <div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Ticket Purchased!</h3>
              <p className="text-muted-foreground text-sm mt-2">
                {buyForOther && selectedRecipient
                  ? `Ticket sent to @${selectedRecipient?.username}!`
                  : 'Your ticket is saved in My Tickets.'}
              </p>
            </div>
            {newTicket && (
              <div className="space-y-4">
                {newTicketQR && (
                  <div className="bg-white rounded-2xl p-4 inline-block shadow-lg">
                    <img src={newTicketQR} alt="Ticket QR Code" className="w-44 h-44 mx-auto" />
                  </div>
                )}
                <div className="bg-secondary/30 rounded-2xl p-3">
                  <p className="text-[9px] font-black uppercase text-muted-foreground">Serial Number</p>
                  <p className="font-mono font-black text-lg tracking-widest mt-1">{newTicket.serial_number}</p>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <Button
                onClick={() => { setShowSuccessDialog(false); setNewTicket(null); setTab('my_tickets'); loadMyTickets(); }}
                className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] bg-primary"
              >
                View My Tickets
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setShowSuccessDialog(false); setNewTicket(null); }}
                className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px]"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={o => { if (!o) { setSelectedTicket(null); setSelectedTicketQR(''); } }}>
        <DialogContent className="bg-card border-border rounded-[2.5rem] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic uppercase tracking-tighter">{selectedTicket?.event_title}</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              {selectedTicketQR && (
                <div className="bg-white rounded-2xl p-4 flex items-center justify-center shadow-lg">
                  <img src={selectedTicketQR} alt="QR Code" className="w-44 h-44" />
                </div>
              )}
              {!selectedTicketQR && (
                <div className="bg-white rounded-2xl p-4 flex items-center justify-center shadow-lg h-52">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/30 rounded-2xl p-3 col-span-2">
                  <p className="text-[9px] font-black uppercase text-muted-foreground">Serial Number</p>
                  <p className="font-mono font-black tracking-widest mt-1">{selectedTicket.serial_number}</p>
                </div>
                <div className="bg-secondary/30 rounded-2xl p-3">
                  <p className="text-[9px] font-black uppercase text-muted-foreground">Date</p>
                  <p className="font-bold text-xs mt-1">{formatEventDate(selectedTicket.event_date)}</p>
                </div>
                <div className="bg-secondary/30 rounded-2xl p-3">
                  <p className="text-[9px] font-black uppercase text-muted-foreground">Time</p>
                  <p className="font-bold text-xs mt-1">{formatEventTime(selectedTicket.event_start_time)} – {formatEventTime(selectedTicket.event_end_time)}</p>
                </div>
                <div className="bg-secondary/30 rounded-2xl p-3 col-span-2">
                  <p className="text-[9px] font-black uppercase text-muted-foreground">Venue</p>
                  <p className="font-bold text-sm mt-1">{selectedTicket.event_venue}</p>
                </div>
                <div className="bg-secondary/30 rounded-2xl p-3">
                  <p className="text-[9px] font-black uppercase text-muted-foreground">Price Paid</p>
                  <p className="font-black text-primary mt-1">💎 {selectedTicket.price_paid}</p>
                </div>
                <div className="bg-secondary/30 rounded-2xl p-3">
                  <p className="text-[9px] font-black uppercase text-muted-foreground">Status</p>
                  <p className={`font-black text-sm mt-1 ${selectedTicket.is_used ? 'text-red-400' : 'text-green-400'}`}>
                    {selectedTicket.is_used ? 'Used' : 'Valid'}
                  </p>
                </div>
              </div>
              {selectedTicket.purchased_by_user_id !== currentUser.$id && (
                <div className="bg-primary/10 rounded-2xl p-3 text-center">
                  <p className="text-[10px] font-bold text-muted-foreground">🎁 Gift from <span className="text-primary font-black">{selectedTicket.purchased_by_name}</span></p>
                </div>
              )}
              <p className="text-[9px] font-black uppercase text-muted-foreground text-center">Present this QR code at the event entrance</p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedTicket(null)} className="w-full rounded-2xl font-black uppercase text-[10px]">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
