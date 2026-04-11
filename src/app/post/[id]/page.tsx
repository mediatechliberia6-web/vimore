"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/post/post-card";
import { MainNav } from "@/components/layout/main-nav";
import { usePosts, Post } from "@/context/PostContext";
import {
  databases, DATABASE_ID, COL, BUCKET,
  getFileUrl, formatTimeAgo, avatarFallback, Query,
} from "@/lib/appwrite";

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { currentUser } = usePosts();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const doc = await databases.getDocument(DATABASE_ID, COL.POSTS, id);
        let authorDoc: any = null;
        try {
          const authorResult = await databases.listDocuments(DATABASE_ID, COL.USERS, [
            Query.equal('$id', doc.user_id),
            Query.limit(1),
          ]);
          authorDoc = authorResult.documents[0] || null;
        } catch { /* ignore */ }

        const imageIds: string[] = Array.isArray(doc.image_ids)
          ? doc.image_ids
          : doc.image_id ? [doc.image_id] : [];
        const images = imageIds.map((fid: string) => getFileUrl(BUCKET.POST_MEDIA, fid));

        const author = authorDoc
          ? {
              $id: doc.user_id,
              name: authorDoc.name || 'Unknown',
              username: authorDoc.username || 'unknown',
              avatar: authorDoc.avatar_id
                ? getFileUrl(BUCKET.AVATARS, authorDoc.avatar_id)
                : avatarFallback(authorDoc.name || 'U'),
              isVerified: authorDoc.is_verified || false,
            }
          : {
              $id: doc.user_id,
              name: 'Unknown',
              username: 'unknown',
              avatar: avatarFallback('U'),
              isVerified: false,
            };

        let poll: any = undefined;
        if (doc.poll) {
          try { poll = typeof doc.poll === 'string' ? JSON.parse(doc.poll) : doc.poll; } catch { /* ignore */ }
        }

        let sharedPost: any = undefined;
        if (doc.shared_post_data) {
          try { sharedPost = typeof doc.shared_post_data === 'string' ? JSON.parse(doc.shared_post_data) : doc.shared_post_data; } catch { /* ignore */ }
        }

        const mapped: Post = {
          $id: doc.$id,
          $createdAt: doc.$createdAt,
          user: author,
          content: doc.content || '',
          time: formatTimeAgo(doc.$createdAt),
          likes: doc.likes_count || 0,
          unlikes: doc.unlikes_count || 0,
          comments: doc.comments_count || 0,
          shares: doc.shares_count || 0,
          views: doc.views_count || 0,
          image: images[0],
          images: images.length > 0 ? images : undefined,
          videoUrl: doc.video_id ? getFileUrl(BUCKET.POST_MEDIA, doc.video_id) : undefined,
          theme: doc.theme,
          imageFilter: doc.image_filter,
          feeling: doc.feeling,
          location: doc.location,
          commentsDisabled: doc.comments_disabled || false,
          isLocked: doc.is_locked || false,
          unlockPrice: doc.unlock_price,
          isBoosted: doc.is_boosted || false,
          poll,
          hashtags: Array.isArray(doc.hashtags) ? doc.hashtags : [],
          taggedUsers: Array.isArray(doc.tagged_users) ? doc.tagged_users : [],
          sharedPost,
        };
        setPost(mapped);
      } catch (err: any) {
        if (err?.code === 404) {
          setNotFound(true);
        } else {
          setNotFound(true);
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <div className="min-h-[100dvh] bg-background flex justify-center">
      <div className="max-w-[1440px] w-full grid grid-cols-1 md:grid-cols-[280px_1fr] min-h-full">
        <aside className="hidden md:block border-r border-primary/5 bg-white dark:bg-card">
          <div className="sticky top-0 h-screen">
            <MainNav />
          </div>
        </aside>

        <main className="flex flex-col min-h-full bg-white dark:bg-[#050505]">
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl border-b border-primary/5 px-4 py-3 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9 shrink-0"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-black uppercase tracking-tight">Post</h1>
          </div>

          <div className="flex-1 max-w-2xl w-full mx-auto px-0 sm:px-4 py-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground font-medium">Loading post...</p>
              </div>
            ) : notFound || !post ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-6">
                <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight">Post Not Found</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    This post may have been deleted or is no longer available.
                  </p>
                </div>
                <Button onClick={() => router.back()} variant="outline" className="rounded-2xl">
                  Go Back
                </Button>
              </div>
            ) : (
              <PostCard {...post} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
