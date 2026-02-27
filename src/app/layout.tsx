
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { PostProvider } from "@/context/PostContext";
import { MusicProvider } from "@/context/MusicContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { MusicPlayer } from "@/components/music/music-player";
import { AlbumDetail } from "@/components/music/album-detail";
import { PlaylistDetail } from "@/components/music/playlist-detail";
import { CaptureStudio } from "@/components/reels/capture-studio";
import { AdPortal } from "@/components/ad/ad-portal";
import { PostPortal } from "@/components/post/post-portal";
import { SearchPortal } from "@/components/layout/search-portal";
import { FontScaleWrapper } from "@/components/layout/font-scale-wrapper";
import { CommentHub } from "@/components/post/comment-hub";

export const metadata: Metadata = {
  title: 'ViMore',
  description: 'Connect, share, and enhance your voice with ViMore.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ViMore',
  },
};

export const viewport: Viewport = {
  themeColor: '#9940E5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <PostProvider>
          <NotificationProvider>
            <MusicProvider>
              <FontScaleWrapper>
                {children}
                <MusicPlayer />
                <AlbumDetail />
                <PlaylistDetail />
                <CaptureStudio />
                <AdPortal />
                <PostPortal />
                <SearchPortal />
                <CommentHub />
                <Toaster />
              </FontScaleWrapper>
            </MusicProvider>
          </NotificationProvider>
        </PostProvider>
      </body>
    </html>
  );
}
