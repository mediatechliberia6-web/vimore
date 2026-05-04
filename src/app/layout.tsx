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
import { AppLoadingGate } from "@/components/layout/app-loading-gate";
import { SuspensionGate } from "@/components/layout/suspension-gate";
import { DiagnosticErrorBoundary } from "@/components/layout/diagnostic-error-boundary";
import { ThemeLogic } from "@/components/layout/theme-logic";
import { ServiceWorkerRegister } from "@/components/layout/service-worker-register";
import { PwaInstallPrompt } from "@/components/layout/pwa-install-prompt";
import { AppBadgeSync } from "@/components/layout/app-badge-sync";
import { PushAutoSubscribe } from "@/components/layout/push-auto-subscribe";
import { NotificationScheduler } from "@/components/layout/notification-scheduler";
import { GlobalRealtimeListener } from "@/components/layout/global-realtime";
import { AdminAlertsProvider } from "@/context/AdminAlertsContext";
import { FeedSignalProvider } from "@/context/FeedSignalContext";
import { NetworkProvider } from "@/context/NetworkContext";
import { CallProvider } from "@/context/CallContext";
import { IncomingCallOverlay } from "@/components/layout/incoming-call-overlay";
import { OutgoingCallScreen } from "@/components/layout/outgoing-call-screen";
import { ActiveCallScreen } from "@/components/layout/active-call-screen";
import NextTopLoader from 'nextjs-toploader';

export const metadata: Metadata = {
  title: 'ViMore',
  description: 'ViMore — Connect, share, and enhance your voice. Social feeds, music, reels, messaging, and creator earnings all in one place.',
  applicationName: 'ViMore',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/icons/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ViMore',
    startupImage: ['/icons/icon-512.png'],
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "6a97888e-site-verification": "078f262e3dacd42dc814159e1a856c2d",
    "mobile-web-app-capable": "yes",
    "application-name": "ViMore",
    "msapplication-TileColor": "#6200ea",
    "msapplication-TileImage": "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: '#6200ea',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
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
        <PwaInstallPrompt />
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
        <NetworkProvider>
        <FeedSignalProvider>
        <AdminAlertsProvider>
        <PostProvider>
          <CallProvider>
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
                        <NotificationScheduler />
                        <AppBadgeSync />
                        <PushAutoSubscribe />
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
                        <OutgoingCallScreen />
                        <ActiveCallScreen />
                        <Toaster />
                        </SuspensionGate>
                      </AppLoadingGate>
                    )}
                  </DiagnosticErrorBoundary>
                </FontScaleWrapper>
              </MusicProvider>
            </NotificationProvider>
          </LanguageProvider>
          </CallProvider>
        </PostProvider>
        </AdminAlertsProvider>
        </FeedSignalProvider>
        </NetworkProvider>
      </body>
    </html>
  );
}
