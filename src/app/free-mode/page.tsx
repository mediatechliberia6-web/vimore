'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, Zap, Home, Compass, Bell, User, Menu, Loader2, Send, X, ChevronDown, ChevronUp } from 'lucide-react';
import { ModeSwitcher } from '@/components/layout/mode-switcher';
import { account, databases, Query, COL, DATABASE_ID, ID, formatTimeAgo } from '@/lib/appwrite';

type FreePost = {
  id: string;
  authorId: string;
  username: string;
  name: string;
  initials: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  isVerified: boolean;
};

type FreeComment = {
  id: string;
  name: string;
  initials: string;
  content: string;
  time: string;
};

type AuthUser = { $id: string; name: string } | null;

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function TextPostCard({
  post,
  authUser,
  onLiked,
}: {
  post: FreePost;
  authUser: AuthUser;
  onLiked: (postId: string, delta: number) => void;
}) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<FreeComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const handleLike = async () => {
    if (!authUser) return;
    const newLiked = !liked;
    setLiked(newLiked);
    const delta = newLiked ? 1 : -1;
    setLikeCount((c) => c + delta);
    onLiked(post.id, delta);
    try {
      if (newLiked) {
        await databases.createDocument(DATABASE_ID, COL.POST_REACTIONS, ID.unique(), {
          post_id: post.id,
          user_id: authUser.$id,
          type: 'like',
        });
        await databases.updateDocument(DATABASE_ID, COL.POSTS, post.id, {
          likes_count: likeCount + 1,
        });
      } else {
        const existing = await databases.listDocuments(DATABASE_ID, COL.POST_REACTIONS, [
          Query.equal('post_id', post.id),
          Query.equal('user_id', authUser.$id),
          Query.equal('type', 'like'),
          Query.limit(1),
        ]);
        if (existing.documents.length > 0) {
          await databases.deleteDocument(DATABASE_ID, COL.POST_REACTIONS, existing.documents[0].$id);
        }
        await databases.updateDocument(DATABASE_ID, COL.POSTS, post.id, {
          likes_count: Math.max(0, likeCount - 1),
        });
      }
    } catch {
      setLiked(!newLiked);
      setLikeCount((c) => c - delta);
    }
  };

  const loadComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const res = await databases.listDocuments(DATABASE_ID, COL.POST_COMMENTS, [
        Query.equal('post_id', post.id),
        Query.orderDesc('$createdAt'),
        Query.limit(20),
      ]);
      const authorIds = [...new Set(res.documents.map((d: any) => d.author_id).filter(Boolean))];
      let authors: Record<string, any> = {};
      if (authorIds.length > 0) {
        const ar = await databases.listDocuments(DATABASE_ID, COL.USERS, [Query.equal('$id', authorIds as string[])]);
        authors = Object.fromEntries(ar.documents.map((u: any) => [u.$id, u]));
      }
      setComments(res.documents.map((d: any) => {
        const a = authors[d.author_id];
        const name = a?.name || 'User';
        return {
          id: d.$id,
          name,
          initials: getInitials(name),
          content: d.content || '',
          time: formatTimeAgo(d.$createdAt),
        };
      }));
    } catch {
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, [post.id]);

  const toggleComments = () => {
    if (!showComments) loadComments();
    setShowComments((v) => !v);
  };

  const handleComment = async () => {
    if (!authUser || !commentText.trim()) return;
    setSubmittingComment(true);
    try {
      await databases.createDocument(DATABASE_ID, COL.POST_COMMENTS, ID.unique(), {
        post_id: post.id,
        user_id: authUser.$id,
        author_id: authUser.$id,
        user_name: authUser.name || authUser.username || '',
        user_avatar: authUser.avatar || '',
        content: commentText.trim(),
      });
      await databases.updateDocument(DATABASE_ID, COL.POSTS, post.id, {
        comments_count: post.comments + 1,
      });
      setCommentText('');
      loadComments();
    } catch {
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: post.content, title: `${post.name} on ViMore` });
      } catch { /* cancelled */ }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(post.content);
    }
  };

  return (
    <article className="bg-white dark:bg-card rounded-2xl border border-border/60 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary text-sm font-black flex items-center justify-center flex-shrink-0 border border-primary/20">
          {post.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-foreground truncate">{post.name}</span>
            {post.isVerified && (
              <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                Verified
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground">@{post.username} · {post.time}</span>
        </div>
      </div>

      <p className="text-sm text-foreground/90 leading-relaxed">{post.content}</p>

      <div className="flex items-center gap-4 pt-1 border-t border-border/40">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'} ${!authUser ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={authUser ? undefined : 'Log in to like posts'}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          <span className="text-xs font-bold">{formatCount(likeCount)}</span>
        </button>
        <button
          onClick={toggleComments}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs font-bold">{formatCount(post.comments)}</span>
          {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors ml-auto"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {showComments && (
        <div className="space-y-3 pt-1">
          {loadingComments ? (
            <div className="flex justify-center py-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">No comments yet.</p>
          ) : (
            <div className="space-y-2">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2 items-start">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center flex-shrink-0">
                    {c.initials}
                  </div>
                  <div className="flex-1 bg-gray-50 dark:bg-muted rounded-xl px-3 py-2">
                    <span className="text-xs font-bold text-foreground">{c.name} </span>
                    <span className="text-[10px] text-muted-foreground">· {c.time}</span>
                    <p className="text-xs text-foreground/80 mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {authUser && (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                onClick={handleComment}
                disabled={submittingComment || !commentText.trim()}
                className="p-2 rounded-xl bg-primary text-white disabled:opacity-50"
              >
                {submittingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function ComposeBox({ authUser, onPosted }: { authUser: AuthUser; onPosted: () => void }) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePost = async () => {
    if (!authUser || !text.trim()) return;
    setSubmitting(true);
    try {
      await databases.createDocument(DATABASE_ID, COL.POSTS, ID.unique(), {
        user_id: authUser.$id,
        author_id: authUser.$id,
        content: text.trim(),
        likes_count: 0,
        comments_count: 0,
        is_free_mode: true,
      });
      await databases.updateDocument(DATABASE_ID, COL.USERS, authUser.$id, {
        posts_count: 1,
      }).catch(() => {});
      setText('');
      onPosted();
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-border/60 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-black flex items-center justify-center flex-shrink-0 border border-primary/20">
          {getInitials(authUser?.name || '')}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind? (text only)"
          rows={3}
          maxLength={500}
          className="flex-1 resize-none text-sm bg-gray-50 dark:bg-muted rounded-xl border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <div className="flex items-center justify-between pl-12">
        <span className="text-[10px] text-muted-foreground">{text.length}/500</span>
        <div className="flex gap-2">
          {text && (
            <button onClick={() => setText('')} className="p-2 rounded-xl text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handlePost}
            disabled={submitting || !text.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FreeModePage() {
  const [posts, setPosts] = useState<FreePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authUser, setAuthUser] = useState<AuthUser>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    account.get()
      .then((u) => setAuthUser({ $id: u.$id, name: u.name }))
      .catch(() => setAuthUser(null))
      .finally(() => setCheckingAuth(false));
  }, []);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await databases.listDocuments(DATABASE_ID, COL.POSTS, [
        Query.orderDesc('$createdAt'),
        Query.limit(40),
      ]);
      const textPosts = res.documents.filter(
        (d: any) => !d.image_ids?.length && !d.video_id && d.content?.trim()
      );
      const authorIds = [...new Set(textPosts.map((d: any) => d.author_id).filter(Boolean))];
      let authorsMap: Record<string, any> = {};
      if (authorIds.length > 0) {
        const ar = await databases.listDocuments(DATABASE_ID, COL.USERS, [Query.equal('$id', authorIds as string[])]);
        authorsMap = Object.fromEntries(ar.documents.map((u: any) => [u.$id, u]));
      }
      setPosts(
        textPosts.map((d: any) => {
          const author = authorsMap[d.author_id];
          const name = author?.name || 'User';
          return {
            id: d.$id,
            authorId: d.author_id,
            username: author?.username || 'user',
            name,
            initials: getInitials(name),
            time: formatTimeAgo(d.$createdAt),
            content: d.content || '',
            likes: d.likes_count || 0,
            comments: d.comments_count || 0,
            isVerified: author?.is_verified || false,
          };
        })
      );
    } catch {
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLiked = (postId: string, delta: number) => {
    setPosts((prev) =>
      prev.map((p) => p.id === postId ? { ...p, likes: Math.max(0, p.likes + delta) } : p)
    );
  };

  const navItems = [
    { icon: Home, label: 'Home', href: '/free-mode' },
    { icon: Compass, label: 'Explore', href: '/free-mode/explore' },
    { icon: Bell, label: 'Alerts', href: '/free-mode/notifications' },
    { icon: User, label: 'Profile', href: '/free-mode/profile' },
    { icon: Menu, label: 'Menu', href: '/free-mode/menu' },
  ];

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
          {!checkingAuth && !authUser && (
            <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-primary border border-primary/30 px-3 py-1.5 rounded-full hover:bg-primary/5 transition-colors">
              Log in
            </Link>
          )}
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
        {!checkingAuth && authUser && (
          <ComposeBox authUser={authUser} onPosted={fetchPosts} />
        )}

        {!checkingAuth && !authUser && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl px-4 py-3 flex items-center justify-between">
            <p className="text-xs font-bold text-primary">Log in to like, comment and post.</p>
            <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-white bg-primary px-3 py-1.5 rounded-full hover:bg-primary/90 transition-colors">
              Log in
            </Link>
          </div>
        )}

        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Latest Posts</h2>
          <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">No images · No video · Low data</span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-primary/20 rounded-2xl">
            <p className="text-sm font-bold text-muted-foreground">No posts yet. Be the first to share something.</p>
          </div>
        ) : (
          posts.map((post) => (
            <TextPostCard key={post.id} post={post} authUser={authUser} onLiked={handleLiked} />
          ))
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-card/95 backdrop-blur-sm border-t border-border/60 flex items-center justify-around px-2 py-2">
        {navItems.map(({ icon: Icon, label, href }) => (
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
