// Backend removed — prototype mode. All data is served from mock-data.ts.
// These constants are kept as stubs so existing component imports do not break.
//
// SHARED AUTH COOKIE CONFIGURATION (for when real Appwrite is connected):
//   When creating an Appwrite session (account.createEmailPasswordSession),
//   set the session cookie domain to ".vimore.cfd" so it is automatically
//   shared between vimore.cfd and free.vimore.cfd.
//   In node-appwrite (server side), configure the Client with:
//     client.setEndpoint(process.env.APPWRITE_ENDPOINT!)
//           .setProject(process.env.APPWRITE_PROJECT_ID!)
//           .setKey(process.env.APPWRITE_API_KEY!);
//   On the client side, the Appwrite Web SDK stores session cookies scoped to
//   the API endpoint domain. To achieve cross-subdomain sharing, proxy all
//   Appwrite requests through /api/appwrite/* on vimore.cfd and set
//   Set-Cookie with Domain=.vimore.cfd from that proxy route.

export const BUCKET_IMAGES = 'images';
export const BUCKET_REEL = 'reels';
export const BUCKET_STORIES = 'stories';
export const BUCKET_PAYMENTS = 'payments';
export const BUCKET_IDENTITY = 'identity';
export const BUCKET_MUSIC = 'music';

export const APPWRITE_DATABASE_ID = '';
export const PROFILES_COLLECTION_ID = '';
export const POSTS_COLLECTION_ID = '';
export const COMMENTS_COLLECTION_ID = '';
export const CONNECTIONS_COLLECTION_ID = '';
export const NOTIFICATIONS_COLLECTION_ID = '';
export const MUSIC_COLLECTION_ID = '';
export const ALBUMS_COLLECTION_ID = '';
export const PLAYLISTS_COLLECTION_ID = '';
export const STORIES_COLLECTION_ID = '';
export const MESSAGES_COLLECTION_ID = '';
export const CAMPAIGNS_COLLECTION_ID = '';
export const AUDIT_LOGS_COLLECTION_ID = '';
export const PAYMENT_REQUESTS_COLLECTION_ID = '';
export const WITHDRAWALS_COLLECTION_ID = '';
export const CALLS_COLLECTION_ID = '';
