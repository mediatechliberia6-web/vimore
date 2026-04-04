'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Home, Compass, Bell, User, Menu, Loader2, Zap, Send, MessageSquare, ArrowLeft, Search } from 'lucide-react';
import { account, databases, Query, COL, DATABASE_ID, ID, formatTimeAgo } from '@/lib/appwrite';

type AuthUser = { $id: string; name: string; username?: string } | null;
type Conversation = { userId: string; name: string; initials: string; lastMessage: string; lastTime: string; unread: number };
type Message = { id: string; senderId: string; content: string; time: string; isMine: boolean };

const navItems = [
  { icon: Home, label: 'Home', href: '/free-mode' },
  { icon: Compass, label: 'Explore', href: '/free-mode/explore' },
  { icon: Bell, label: 'Alerts', href: '/free-mode/notifications' },
  { icon: User, label: 'Profile', href: '/free-mode/profile' },
  { icon: Menu, label: 'Menu', href: '/free-mode/menu' },
];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function ConversationThread({ authUser, partnerId, partnerName, onBack }: { authUser: AuthUser; partnerId: string; partnerName: string; onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const clusterId = authUser ? [authUser.$id, partnerId].sort().join('_') : '';

  const load = useCallback(async () => {
    if (!authUser) return;
    try {
      const res = await databases.listDocuments(DATABASE_ID, COL.MESSAGES, [
        Query.equal('cluster_id', clusterId),
        Query.orderAsc('$createdAt'),
        Query.limit(80),
      ]);
      setMessages(res.documents.map((d: any) => ({
        id: d.$id,
        senderId: d.sender_id,
        content: d.content || d.text || '',
        time: formatTimeAgo(d.$createdAt),
        isMine: d.sender_id === authUser.$id,
      })));
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [authUser, partnerId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!authUser || !text.trim()) return;
    const trimmed = text.trim();
    setText('');
    setSending(true);
    const optimistic: Message = { id: 'tmp_' + Date.now(), senderId: authUser.$id, content: trimmed, time: 'Just now', isMine: true };
    setMessages(prev => [...prev, optimistic]);
    try {
      await databases.createDocument(DATABASE_ID, COL.MESSAGES, ID.unique(), {
        cluster_id: clusterId,
        sender_id: authUser.$id,
        sender_name: authUser.name || authUser.username || '',
        text: trimmed,
        type: 'text',
        is_read: false,
      });
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setText(trimmed);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F0F2F5] dark:bg-[#080808]">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-primary/10 px-4 py-2.5 flex items-center gap-3 shadow-sm">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-black flex items-center justify-center border border-primary/20">
          {getInitials(partnerName)}
        </div>
        <div>
          <p className="font-bold text-sm text-foreground">{partnerName}</p>
          <p className="text-[10px] text-muted-foreground uppercase font-bold">Text only · Free Mode</p>
        </div>
      </header>

      <div className="flex items-center justify-center gap-2 bg-orange-500/5 border-b border-orange-500/10 px-4 py-1.5">
        <Zap className="h-3 w-3 text-orange-500 flex-shrink-0" />
        <p className="text-[9px] font-bold text-orange-600 uppercase tracking-widest">Text messages only · No media · Low data</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>
        ) : messages.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto" />
            <p className="text-xs font-bold text-muted-foreground">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map(m => (
            <div key={m.id} className={`flex ${m.isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${m.isMine ? 'bg-primary text-white rounded-br-sm' : 'bg-white dark:bg-card border border-border/60 text-foreground rounded-bl-sm'}`}>
                <p>{m.content}</p>
                <p className={`text-[10px] mt-0.5 ${m.isMine ? 'text-white/60' : 'text-muted-foreground'}`}>{m.time}</p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="bg-white/95 dark:bg-card/95 border-t border-border/60 px-4 py-3 flex gap-2 items-end pb-safe">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Type a message..."
          rows={1}
          maxLength={1000}
          className="flex-1 resize-none text-sm bg-gray-100 dark:bg-muted rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground max-h-24"
        />
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-50 flex-shrink-0"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default function FreeModeMessagesPage() {
  const [authUser, setAuthUser] = useState<AuthUser>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConv, setActiveConv] = useState<{ userId: string; name: string } | null>(null);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<{ $id: string; name: string; username: string }[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    account.get()
      .then(u => setAuthUser({ $id: u.$id, name: u.name }))
      .catch(() => setAuthUser(null))
      .finally(() => setCheckingAuth(false));
  }, []);

  useEffect(() => {
    if (!authUser) { setLoading(false); return; }
    const load = async () => {
      try {
        const [sent, received] = await Promise.all([
          databases.listDocuments(DATABASE_ID, COL.MESSAGES, [Query.equal('sender_id', authUser.$id), Query.orderDesc('$createdAt'), Query.limit(100)]),
          databases.listDocuments(DATABASE_ID, COL.MESSAGES, [Query.equal('receiver_id', authUser.$id), Query.orderDesc('$createdAt'), Query.limit(100)]),
        ]);
        const all = [...sent.documents, ...received.documents];
        const partnerIds = new Set<string>();
        const latestByPartner = new Map<string, any>();
        for (const msg of all) {
          const partnerId = msg.sender_id === authUser.$id ? msg.receiver_id : msg.sender_id;
          if (!partnerIds.has(partnerId)) {
            partnerIds.add(partnerId);
            latestByPartner.set(partnerId, msg);
          }
        }
        if (partnerIds.size === 0) { setLoading(false); return; }
        const usersRes = await databases.listDocuments(DATABASE_ID, COL.USERS, [Query.equal('$id', [...partnerIds] as string[])]);
        const usersMap = Object.fromEntries(usersRes.documents.map((u: any) => [u.$id, u]));
        const convs: Conversation[] = [...partnerIds].map(pid => {
          const user = usersMap[pid];
          const name = user?.name || 'User';
          const msg = latestByPartner.get(pid);
          return { userId: pid, name, initials: getInitials(name), lastMessage: msg?.content || msg?.text || '', lastTime: formatTimeAgo(msg?.$createdAt), unread: 0 };
        });
        setConversations(convs);
      } catch { setConversations([]); }
      finally { setLoading(false); }
    };
    load();
  }, [authUser]);

  const handleSearch = async (q: string) => {
    setSearch(q);
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await databases.listDocuments(DATABASE_ID, COL.USERS, [Query.search('name', q), Query.limit(10)]);
      setSearchResults(res.documents.map((u: any) => ({ $id: u.$id, name: u.name, username: u.username || '' })).filter((u: any) => u.$id !== authUser?.$id));
    } catch { setSearchResults([]); }
    finally { setSearching(false); }
  };

  if (activeConv && authUser) {
    return <ConversationThread authUser={authUser} partnerId={activeConv.userId} partnerName={activeConv.name} onBack={() => setActiveConv(null)} />;
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808]">
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-primary/10 px-4 py-2.5 flex items-center gap-2 shadow-sm">
        <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
            <path d="M3 7L10 19L17 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 15L17 7L21 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="font-headline font-bold text-lg tracking-tight text-primary">Messages</span>
      </header>

      <div className="flex items-center justify-center gap-2 bg-orange-500/5 border-b border-orange-500/10 px-4 py-2">
        <Zap className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
        <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
          Free Mode — Text Only · No calls · No media
        </p>
      </div>

      <div className="max-w-[600px] mx-auto px-4 py-4 pb-24 space-y-3">
        {checkingAuth ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
        ) : !authUser ? (
          <div className="py-16 text-center space-y-3">
            <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <p className="text-sm font-bold text-muted-foreground">Log in to send and receive messages.</p>
            <Link href="/free-mode/signup" className="inline-block px-6 py-2.5 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-colors">Log in</Link>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search people to message..."
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-white dark:bg-card focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />}
            </div>

            {search && searchResults.length > 0 && (
              <div className="bg-white dark:bg-card rounded-2xl border border-border/60 overflow-hidden divide-y divide-border/40">
                {searchResults.map(u => (
                  <button key={u.$id} onClick={() => { setSearch(''); setSearchResults([]); setActiveConv({ userId: u.$id, name: u.name }); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-muted transition-colors text-left">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-black flex items-center justify-center border border-primary/20 flex-shrink-0">{getInitials(u.name)}</div>
                    <div>
                      <p className="font-bold text-sm text-foreground">{u.name}</p>
                      {u.username && <p className="text-[11px] text-muted-foreground">@{u.username}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!search && (
              <>
                {loading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>
                ) : conversations.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-primary/20 rounded-2xl space-y-2">
                    <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                    <p className="text-sm font-bold text-muted-foreground">No conversations yet.</p>
                    <p className="text-[11px] text-muted-foreground/60">Search for someone above to start chatting.</p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-card rounded-2xl border border-border/60 overflow-hidden divide-y divide-border/40">
                    {conversations.map(c => (
                      <button key={c.userId} onClick={() => setActiveConv({ userId: c.userId, name: c.name })} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-muted transition-colors text-left">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary text-sm font-black flex items-center justify-center border border-primary/20 flex-shrink-0">{c.initials}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-sm text-foreground">{c.name}</p>
                            <span className="text-[10px] text-muted-foreground">{c.lastTime}</span>
                          </div>
                          <p className="text-[12px] text-muted-foreground truncate">{c.lastMessage || 'No messages yet'}</p>
                        </div>
                        {c.unread > 0 && <div className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">{c.unread}</div>}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
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
