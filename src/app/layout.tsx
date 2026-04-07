import type { Metadata, Viewport } from 'next';
import './globals.css';
import { headers } from 'next/headers';
import { Toaster } from "@/components/ui/toaster";
import { PostProvider } from "@/context/PostContext";
import { MusicProvider } from "@/context/MusicContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { MusicPlayer } from "@/components/music/music-player";
import { AlbumDetail } from "@/components/music/album-detail";
import { PlaylistDetail } from "@/components/music/playlist-detail";
import { AdPortal } from "@/components/ad/ad-portal";
import { MusicAdPortal } from "@/components/music/interstitial-portal";
import { PostPortal } from "@/components/post/post-portal";
import { ImageViewerPortal } from "@/components/layout/image-viewer-portal";
import { VideoViewerPortal } from "@/components/layout/video-viewer-portal";
import { SearchPortal } from "@/components/layout/search-portal";
import { FontScaleWrapper } from "@/components/layout/font-scale-wrapper";
import { CommentHub } from "@/components/post/comment-hub";
import { GiftHub } from "@/components/post/gift-hub";
import { IncomingCallOverlay } from "@/components/layout/incoming-call-overlay";
import { AppLoadingGate } from "@/components/layout/app-loading-gate";
import { SuspensionGate } from "@/components/layout/suspension-gate";
import { DiagnosticErrorBoundary } from "@/components/layout/diagnostic-error-boundary";
import { ThemeLogic } from "@/components/layout/theme-logic";
import { ServiceWorkerRegister } from "@/components/layout/service-worker-register";
import { GlobalRealtimeListener } from "@/components/layout/global-realtime";
import { AdminAlertsProvider } from "@/context/AdminAlertsContext";
import { FeedSignalProvider } from "@/context/FeedSignalContext";
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
  other: {
    "6a97888e-site-verification": "078f262e3dacd42dc814159e1a856c2d",
  },
};

export const viewport: Viewport = {
  themeColor: '#9940E5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const nextUrl = headersList.get('x-invoke-path') || headersList.get('x-pathname') || '';
  const isFreeModeRoute = nextUrl.startsWith('/free-mode');

  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Content-Security-Policy" content="img-src 'self' * data: blob:; media-src 'self' * data: blob:; connect-src 'self' https://mediatechliberia.online wss: ws: https:;" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
        {/* Legacy Safari / iOS 12 polyfills for Promise, fetch, and URL.createObjectURL */}
        <script dangerouslySetInnerHTML={{ __html: `
(function(){
  if(typeof Promise==='undefined'){var p=document.createElement('script');p.src='https://cdn.jsdelivr.net/npm/promise-polyfill@8/dist/polyfill.min.js';document.head.appendChild(p);}
  if(typeof fetch==='undefined'){var f=document.createElement('script');f.src='https://cdn.jsdelivr.net/npm/whatwg-fetch@3.6.20/fetch.min.js';document.head.appendChild(f);}
  if(typeof URL==='undefined'||typeof URL.createObjectURL==='undefined'){var u=document.createElement('script');u.src='https://cdn.jsdelivr.net/npm/url-polyfill@1.1.12/url.min.js';document.head.appendChild(u);}
})();
        `}} />
      </head>
      <body className="font-body antialiased bg-background text-foreground" suppressHydrationWarning>
        <ServiceWorkerRegister />
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
        <FeedSignalProvider>
        <AdminAlertsProvider>
        <PostProvider>
          <LanguageProvider>
            <NotificationProvider>
              <MusicProvider>
                <ThemeLogic />
                <FontScaleWrapper>
                  <DiagnosticErrorBoundary title="System Core">
                    {isFreeModeRoute ? (
                      <>
                        {children}
                        <Toaster />
                      </>
                    ) : (
                      <AppLoadingGate>
                        <SuspensionGate>
                        <GlobalRealtimeListener />
                        {children}
                        <MusicPlayer />
                        <AlbumDetail />
                        <PlaylistDetail />
                        <AdPortal />
                        <MusicAdPortal />
                        <PostPortal />
                        <ImageViewerPortal />
                        <VideoViewerPortal />
                        <SearchPortal />
                        <CommentHub />
                        <GiftHub />
                        <IncomingCallOverlay />
                        <Toaster />
                        </SuspensionGate>
                      </AppLoadingGate>
                    )}
                  </DiagnosticErrorBoundary>
                </FontScaleWrapper>
              </MusicProvider>
            </NotificationProvider>
          </LanguageProvider>
        </PostProvider>
        </AdminAlertsProvider>
        </FeedSignalProvider>
      </body>
    </html>
  );
}
