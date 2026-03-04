
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { PostProvider } from "@/context/PostContext";
import { MusicProvider } from "@/context/MusicContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { MusicPlayer } from "@/components/music/music-player";
import { AlbumDetail } from "@/components/music/album-detail";
import { PlaylistDetail } from "@/components/music/playlist-detail";
import { CaptureStudio } from "@/components/reels/capture-studio";
import { AdPortal } from "@/components/ad/ad-portal";
import { PostPortal } from "@/components/post/post-portal";
import { ImageViewerPortal } from "@/components/layout/image-viewer-portal";
import { SearchPortal } from "@/components/layout/search-portal";
import { FontScaleWrapper } from "@/components/layout/font-scale-wrapper";
import { CommentHub } from "@/components/post/comment-hub";
import { GiftHub } from "@/components/post/gift-hub";
import { IncomingCallOverlay } from "@/components/layout/incoming-call-overlay";
import { AuthModal } from "@/components/auth/auth-modal";
import { AppLoadingGate } from "@/components/layout/app-loading-gate";
import { DiagnosticErrorBoundary } from "@/components/layout/diagnostic-error-boundary";
import NextTopLoader from 'nextjs-toploader';

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
        <NextTopLoader 
          color="#9940E5" 
          initialPosition={0.08} 
          crawlSpeed={200} 
          height={3} 
          crawl={true} 
          showSpinner={false} 
          easing="ease" 
          speed={200} 
          shadow="0 0 10px #9940E5,0 0 5px #9940E5"
        />
        <PostProvider>
          <LanguageProvider>
            <NotificationProvider>
              <MusicProvider>
                <FontScaleWrapper>
                  <DiagnosticErrorBoundary title="System Core">
                    <AppLoadingGate>
                      {children}
                      <MusicPlayer />
                      <AlbumDetail />
                      <PlaylistDetail />
                      <CaptureStudio />
                      <AdPortal />
                      <PostPortal />
                      <ImageViewerPortal />
                      <SearchPortal />
                      <CommentHub />
                      <GiftHub />
                      <IncomingCallOverlay />
                      <AuthModal />
                      <Toaster />
                    </AppLoadingGate>
                  </DiagnosticErrorBoundary>
                </FontScaleWrapper>
              </MusicProvider>
            </NotificationProvider>
          </LanguageProvider>
        </PostProvider>
      </body>
    </html>
  );
}
