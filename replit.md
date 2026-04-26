# ViMore — Creator Platform

## Overview
ViMore is a Next.js 15 social networking and creator platform with a violet (#9940E5) brand theme. It features social feeds, music, reels, messaging, earnings/currency systems, and a full admin dashboard ("Command Core").

## Architecture
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State**: React Context API (`PostContext`, `MusicContext`, `NotificationContext`, `LanguageContext`)
- **Backend**: Appwrite (Database, Storage, Auth) — Project ID: `vimore123`, Database: `vimoreprod`
- **API Endpoint**: `https://mediatechliberia.online/v1`
- **Auth**: Appwrite account sessions — `PostContext.checkSession()` calls `account.get()` on mount

## Environment Variables
| Variable | Scope | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | shared | Appwrite API URL |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | shared | Appwrite project ID |
| `NEXT_PUBLIC_APPWRITE_DATABASE_ID` | shared | Appwrite database ID |
| `APPWRITE_DATABASE_ID` | shared | Appwrite database ID (server) |
| `APPWRITE_API_KEY` | shared | Appwrite server-side API key |
| `GROQ_API_KEY` | shared | Groq AI API key (translations) |
| `NEXT_PUBLIC_AGORA_APP_ID` | shared | Agora App ID (client-side RTC) |
| `AGORA_APP_CERTIFICATE` | shared | Agora certificate (server-side token generation) |

## Key Routes
| Path | Description |
|------|-------------|
| `/login` | Login page |
| `/signup` | Signup page (email verification sent on completion) |
| `/hashtag/[tag]` | Hashtag results page — queries Appwrite for posts with that hashtag |
| `/api/link-preview` | Server-side Open Graph preview endpoint (uses link-preview-js) |
| `/auth/verify` | Email verification redirect handler |
| `/auth/recovery` | Password recovery |
| `/` | Main social feed |
| `/dashboard` | Creator analytics hub |
| `/admin` | Admin "Command Core" dashboard (SUPER role only) |
| `/currency` | Currency hub (Gold, Diamonds, Stars) |
| `/earnings` | Creator earnings portal |
| `/reels` | Short video reels feed |
| `/music` | Music streaming |
| `/messages` | Direct messaging |
| `/profile` | Current user profile |
| `/settings` | App settings |
| `/tickets` | ViMore Ticket System — browse events & manage user tickets |

## ViMore Ticket System
**User page** (`/tickets`): Two tabs — Find Events (sorted by highest price, instant search) and My Tickets. Users can buy tickets for themselves or gift them to another user. Uses diamond currency. Tickets have 15-character unique serial numbers and display QR codes generated on-the-fly. Expired tickets are auto-deleted. 6-stage reminder notifications sent for upcoming events.

**Admin dashboard** (`/admin` → Tickets tab): Create events (title, date/time, venue, flyer, description, price in diamonds). View stats (tickets sold + diamonds earned per event). Toggle event active/paused.

**Admin dashboard** (`/admin` → Check Ticket tab): Camera-based QR scanner + manual serial entry. Scans and marks tickets as used. Shows personalized welcome/error messages.

**Gift tickets**: Buyers can search any user and purchase a ticket that appears in the recipient's My Tickets tab. Recipient receives an in-app notification.

**Reminders**: Automated in-app notifications at 3 days, 2 days, 1 day, day-of, 30 min before, and when event starts.

## Auth Flow (Appwrite-based)
1. App mounts → `PostContext.checkSession()` calls `account.get()` via Appwrite SDK
2. If session exists → fetches user profile doc from `users` collection → sets `currentUser`
3. If no session → `AppLoadingGate` redirects to `/login`
4. Signup → `account.create()` + `databases.createDocument()` in `users` + `account.createVerification()`
5. Login → `account.createEmailPasswordSession()` + profile doc fetch
6. Logout → `account.deleteSession('current')` → redirect to `/login`

## Data Layer (All live Appwrite)
- **PostContext**: Feeds, posts, stories, follows, friends, clusters (groups), messages, admin data
- **MusicContext**: Tracks, albums, playlists from `tracks`/`albums`/`playlists` collections; likes from `track_likes`
- **NotificationContext**: Loads from `notifications` collection, writes back on mark-read/delete

## Appwrite Collections (32 total)
users, posts, post_comments, post_reactions, post_unlocks, bookmarks, stories, story_segments, story_views, follows, friend_requests, blocked_users, messages, clusters, cluster_members, tracks, track_likes, albums, playlists, playlist_tracks, notifications, transactions, withdrawal_requests, payment_requests, subscriptions, verification_records, referrals, reports, support_tickets, ad_campaigns, audit_logs, call_logs

## Appwrite Storage Buckets (10 total)
avatars, covers, post_media, story_media, reel_media, music_tracks, album_covers, voice_messages, payment_screenshots, message_media

## Username Auto-Generation (Signup)
- Takes user's full name → lowercase, remove special chars, append 3-digit random number
- Ensured unique against existing usernames

## Admin Dashboard (Command Core)
- Tabs: Analytics, Users, Content, Economy (Inbound/Outbound), Logs, Staff
- All data loaded live from Appwrite via `refreshAdminData()`
- Staff tab: SUPER role only — assign Moderator/Financial roles, remove staff

## Design System
- Primary: `#9940E5` (violet)
- Font style: `font-black italic uppercase tracking-tighter` headings
- Cards: `rounded-[2.5rem]` with backdrop blur
- Light-mode pages (login/signup): forced white bg, no dark: variants
- Dark-mode app: `bg-[#020202]` / `bg-[#050505]`

## PWA / APK Packaging
- `public/manifest.json` — full PWABuilder-compliant manifest (name, short_name, id, scope, start_url, display, display_override, orientation, theme_color `#6200ea`, background_color `#ffffff`, icons 192/512 any+maskable, apple-touch-icon 180, screenshots narrow+wide, shortcuts, share_target, launch_handler, edge_side_panel, protocol_handlers, categories, lang, dir).
- `public/sw.js` — service worker v3: precaches app shell, cache-first media + static assets, network-first navigations with offline fallback.
- `public/offline.html` — offline fallback page.
- `public/icons/` — icon-192, icon-512, maskable variants, apple-touch-icon, generated from the ViMore launcher logo.
- Registered via `src/components/layout/service-worker-register.tsx` mounted in `src/app/layout.tsx`.
- `next.config.ts` sets `Service-Worker-Allowed: /`, `application/manifest+json` MIME type, and no-cache on `/sw.js`.
- To rebuild icons after a logo update, re-run: `magick <logo.png> -resize NxN public/icons/icon-N.png`.
- Install UI: `src/components/layout/pwa-install-prompt.tsx` captures `beforeinstallprompt` and shows a ViMore-branded install card (dismissed state remembered for 7 days).
- Push notifications: `public/sw.js` handles `push`, `notificationclick`, `pushsubscriptionchange`. Client helpers in `src/lib/push-notifications.ts` (`subscribeToPush`, `unsubscribeFromPush`). `PushAutoSubscribe` attempts a silent subscribe after first user interaction when `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is set.
- API routes `/api/push/subscribe` + `/api/push/unsubscribe` persist subscriptions in the Appwrite `push_subscriptions` collection (fields: `endpoint`, `p256dh`, `auth`, `expiration_time`, `user_id`, `created_at`, `updated_at`). Routes no-op gracefully if the collection is missing.
- App icon badging: `src/components/layout/app-badge-sync.tsx` calls `navigator.setAppBadge(unreadCount + unreadMessageCount)` whenever totals change, and forwards to the SW so the badge is refreshed while the tab is closed. Works on Android Chrome/Edge and installed PWAs that support the Badging API.
- To actually send pushes to devices, run a backend worker that reads from `push_subscriptions` and POSTs to each endpoint using `web-push` with your VAPID private key. The SW payload schema it expects: `{ title, body, icon?, badge?, image?, url?, tag?, renotify?, requireInteraction?, badgeCount?, data? }`.

## Developer Notes
- `src/lib/mock-data.ts` is intentionally empty — all data comes from Appwrite
- `src/lib/appwrite.ts` exports named bucket constants (`BUCKET_IMAGES`, `BUCKET_STORIES`, `BUCKET_REEL`, `BUCKET_MUSIC`) for component compatibility
- `BUCKET_IMAGES` maps to `post_media` bucket; `BUCKET_MUSIC` maps to `music_tracks`
- `users` collection has both `is_verfied` (typo, original) and `is_verified` (correct, added programmatically) — code uses the correct spelling
- Post shares support image and video previews in feed cards, stories, and message conversations; chat conversation previews use `📌 Shared Post` for shared post messages.

## AI System
- **Only feature**: Translation powered by Groq (`llama-3.3-70b-versatile`), API key stored as `GROQ_API_KEY` env var.
- **Server action**: `src/app/actions/ai.ts` — only exports `aiTranslatePostAction`.
- **Language detection**: `isTextForeignToUser(text, browserLang)` in `src/lib/utils.ts` — detects Arabic, Chinese, Japanese, Korean, Cyrillic, Hindi, Thai, Greek scripts.
- **Where translate appears**:
  - **Post feed** (`post-card.tsx`): "Translate" button auto-appears under any post in a foreign script. Tap again to "Show original".
  - **Profile bio** (`profile/[username]/page.tsx`): Hover to reveal translate button when bio is in a foreign script.
  - **Messages** (`chat-bubble.tsx`): "Translate" button appears under incoming text messages in a foreign script.
- **Removed AI features**: Comment summarizer, network sentiment analysis, hashtag suggester, post summarizer, music mix generator, verification code AI, boost/gift/monetization audit AI, signature verifier.
- **All 10 unused AI flow files deleted** from `src/ai/flows/`.

## Full 34-Collection `user_id` Audit (completed)
All `createDocument` calls across every collection were audited and fixed to include `user_id` as required. Summary of what was added where:

| Collection | File | Fix |
|---|---|---|
| `posts` | PostContext + free-mode | Added `user_id` alongside `author_id` |
| `stories` | PostContext | Added `user_id` alongside `author_id` |
| `story_segments` | PostContext | Added `user_id` alongside `author_id` |
| `story_views` | PostContext | Added `user_id` alongside `viewer_id` |
| `tracks` | MusicContext | Added `user_id` alongside `artist_id` |
| `album_songs` | MusicContext | Added `user_id` alongside `artist_id` |
| `albums` | MusicContext | Added `user_id` alongside `artist_id` |
| `playlists` | MusicContext | Added `user_id` alongside `creator_id` |
| `messages` | PostContext | Added `user_id` alongside `sender_id` |
| `follows` | PostContext | Added `user_id` alongside `follower_id` |
| `friend_requests` | PostContext | Added `user_id` alongside `sender_id` |
| `blocked_users` | PostContext | Added `user_id` alongside `blocker_id` |
| `subscriptions` | PostContext | Added `user_id` alongside `subscriber_id` |
| `reports` | PostContext | Added `user_id` alongside `reporter_id` |
| `audit_logs` | PostContext | Added `user_id` |
| `call_logs` | PostContext | Added `user_id` alongside `caller_id` |
| `post_comments` (free-mode) | free-mode/page.tsx | Changed `author_id` → `user_id` + added `user_name`, `user_avatar` |
| `ad_campaigns` | PostContext + admin | Added `user_id` + `budget` field |
| `support_tickets` | PostContext | Already had `user_id` ✅ |
| `post_reactions` | PostContext + free-mode | Already had `user_id` ✅ |
| `bookmarks` | PostContext | Already had `user_id` ✅ |
| `post_unlocks` | PostContext | Already had `user_id` ✅ |
| `transactions` | PostContext | Already had `user_id` ✅ |
| `payment_requests` | PostContext | Already had `user_id` ✅ |
| `withdrawal_requests` | PostContext | Already had `user_id` ✅ |
| `verification_records` | PostContext | Already had `user_id` ✅ |
| `user_bans` | PostContext | Already had `user_id` ✅ |
| `cluster_members` | PostContext | Already had `user_id` ✅ |
| `track_likes` | MusicContext | Already had `user_id` ✅ |
| `clusters` | PostContext | Has `admin_id` (no `user_id` needed — admin is the owner) |
| `notifications` | PostContext/Notification | Has `recipient_id`+`sender_id` (no single `user_id` applies) |
| `admin_notifications` | PostContext | System broadcast — no `user_id` applicable |
| `playlist_tracks` | MusicContext | Junction table — no `user_id` needed |
| `users` | free-signup.ts | Created with auth ID as doc ID ✅ |

## Schema Reconciliation (applied programmatically via API)
All mismatches between code and Appwrite schema were resolved. Attributes added:
- **users**: `is_verified` (boolean)
- **messages**: `is_viewed`, `is_read` (boolean), `call_status` (string)
- **follows**: `follower_username`, `following_username` (string)
- **friend_requests**: `sender_username`, `receiver_username` (string)
- **subscriptions**: `is_active` (boolean), `creator_username`, `diamond_spent` (string)
- **post_comments**: `user_id`, `user_name`, `user_avatar`, `content` (string)
- **posts**: `theme`, `image_filter`, `feeling`, `poll` (string), `comments_disabled` (boolean)
- **clusters**: `admin_username`, `cover_id` (string)
- **stories**: `expiry`, `view_count` (int)
- **cluster_members**: `username` (string)
- **story_segments**: `text` (string)
- **withdrawal_requests**: `username` (string)
- **payment_requests**: `username`, `code`, `amount`, `currency` (string)
- **audit_logs**: `details`, `performed_by`, `performed_by_avatar` (string)
- **ad_campaigns**: `cta_link` (string)

Code fixes applied in `PostContext.tsx`:
- `post_reactions`: `type` field renamed → `reaction_type` (all queries + creates)
- `story_views`: `user_id` → `viewer_id`
- `story_segments`: `order` → `order_index`
- `withdrawal_requests`: `amount`→`amount_usd`, `currency`→`currency_type`, `method`→`payment_method`
- `stories`: `view_count` → `views_count` (create + update in recordStoryView)
- `posts`: `media_ids` (array, not in schema) → `image_id` (single string); `mapDocToPost` updated to read `image_id`
- `ad_campaigns`: added `status: 'ACTIVE'` to create call
- `support_tickets`: removed `category` field from create call (not in schema)
- `searchAllUsers`: `Query.search()` → `Query.startsWith()` (fulltext index not required)
- `tracks` (MusicContext): `audio_id` → `file_id` for write + read (both publishTrack and album songs loop); `mapDocToTrack` reads `file_id` with `audio_id` fallback
- Friends page `/friends`: "Add" tab now fetches all users from database via `fetchAllUsersForDiscovery()` and sorts by: followers-of-current-user first, then by follower count (mutual friend approximation)
- Search portal (`search-portal.tsx`): already uses `searchAllUsers` — benefits from `startsWith` fix

**Comprehensive audit (second pass) — fixes applied:**
- `stories` create: `expires_at` → `expiry` (schema attribute name); query filter also fixed; mapper updated to read `doc.expiry` first with `doc.expires_at` fallback; `viewCount` mapper updated to read `doc.views_count` first with `doc.view_count` fallback
- `cluster_members` create: added `username: m.username` (schema attribute added per reconciliation; applies to both `createCluster` loop and `addMemberToCluster`)
- `withdrawal_requests` create: added `username: currentUser.username` (schema attribute added per reconciliation)
- `payment_requests` create: added `username: currentUser.username` (schema attribute added per reconciliation)
- `free-mode/page.tsx` post_reactions: `type: 'like'` → `reaction_type: 'LIKE'`; delete query also fixed
- `free-mode/page.tsx` post create: removed `is_free_mode: true` (field not in posts schema)
- `free-mode/messages/page.tsx` message create: added `user_id` and `type: 'text'` fields

Indexes created: `friend_requests` (sender/receiver_username), `follows` (follower/following_username), `post_reactions` (compound), `subscriptions` (active check), `stories` (expiry)

**8-bug fix pass (April 2026):**
1. `toggleLikePost` / `toggleUnlikePost`: removed silent `catch { /* ignore */ }` — now reverts optimistic UI state and shows a destructive toast with the actual Appwrite error message.
2. `voteOnPostPoll`: added `databases.updateDocument(COL.POSTS, postId, { poll: JSON.stringify(updatedPoll) })` after local state update so votes are persisted to Appwrite.
3. `addStory` + `create-story-modal`: story modal now calls `storage.createFile()` directly and passes the raw `fileId` to `addStory`, bypassing `extractFileId(URL)` which could fail. `addStory` prefers `segment.fileId` over URL extraction.
4. `profile/page.tsx` — `handleApplyRefinement`: now also uploads the image to `BUCKET_IMAGES` (post_media bucket) and passes `image: postImageUrl` to `addPost`, so profile-update posts show the avatar/cover photo.
5. `sendAdminBroadcast`: notifications now include `title` and `content` fields (matching schema). Throws an explicit error if `allUsers` is empty instead of silently returning 0 deliveries.
6. `warnUser`, `sendFriendRequest`, `confirmFriendRequest`, `approvePaymentRequest`: all notification `createDocument` calls now include both `title`/`content` (new schema fields) and `message` (backward-compat) fields.
7. `friends/page.tsx`: "Confirm" and "Friends" tabs now use `allAvailableUsers` (union of `connections` + `allNetworkUsers`) instead of just `connections`, so users who sent friend requests but aren't followed appear correctly. Discovery fetch is now triggered on mount for all tabs.
8. `signup`: added referral processing — looks up referrer by username, credits them with 5000 stars, increments their `referral_count`, auto-follows the referrer, and sends them a notification. Clears `vimore_referrer` from localStorage after processing.

## Real-Time Feature Pass (April 2026)

**1. Real-time conversation list updates**
- `addIncomingMessage` in the PostContext value now derives the correct storage key for DMs: finds the matching `Connection` by checking `c.username === clusterId || clusterId.includes(c.username)`, and uses `c.username` as the key (matching `loadChatMessages` behavior). Falls back to `clusterId` for group chats.
- Also updates `connectionsState` and `clustersState` with `lastMessage`/`lastTime` preview on every incoming message, so `ChatList` reflects the latest message instantly without a reload.

**2. DB-backed `is_read` message status and unread notification badge**
- `sendChatMessage` now writes `receiver_id: otherUser.$id` on every DM document.
- `markChatMessagesRead(chatId)` in PostContext updates local `chatMessages` state (`status: 'read'`) and batch-calls `databases.updateDocument(... { is_read: true })` for all unread incoming messages.
- A `useEffect` in PostContext fires when `selectedChatId` changes, calls `markChatMessagesRead` automatically.
- `NotificationContext` adds `unreadMessageCount` state (separate from `categoryPulses`), `incrementUnreadMessageCount`, `decrementUnreadMessageCount`, `setPulseCount` callbacks.
- On login, a `useEffect` (placed after `setPulseCount` declaration to avoid TDZ error) queries Appwrite for `receiver_id == currentUser AND is_read == false` and seeds both `unreadMessageCount` and the MESSAGES pulse. Requires a `receiver_id` attribute index in Appwrite — silently no-ops if not yet indexed.
- `main-nav.tsx` Messages badge reads `unreadMessageCount` from NotificationContext with priority over `categoryPulses.MESSAGES`.
- `clearPulse('MESSAGES')` resets `unreadMessageCount` to 0 (triggered when user opens Messages).

**3. Live post edit propagation**
- `GlobalRealtimeListener` POSTS subscription now checks for `content` field changes on `update` events and calls `applyRemotePostEdit(postId, content)` on the PostContext.
- `applyRemotePostEdit` is added to PostContext type and value: maps over `posts` state and updates the matching post's `content` in place, so all users see edited posts instantly without refreshing.

**Appwrite index needed**: `messages` collection requires a `receiver_id` attribute index for the unread count query. Until created, the query fails silently (caught and ignored).

## Replit Migration Status (April 2026)
- Migrated the imported Next.js project to run on Replit without rewriting the app.
- Installed existing npm dependencies from `package.json`.
- Replit workflow `Start application` runs `npm run dev` on port 5000.
- Verified `/login` renders successfully in the Replit preview; unauthenticated Appwrite 401 responses during session checks are expected before login.

## Data-Saving Pass (April 2026) — Lite-Mode Hardening
Implemented all 9 strategies to extend a 100MB monthly bundle:
1. **Reels autoplay off on Lite** — `IntersectionObserver` skips `video.play()` when `tier==='lite'`; ReelCard `isPlaying` defaults to `false` on Lite so the play overlay is shown (tap-to-stream).
2. **Lazy-loaded images** — wired in earlier rounds via `getAdaptivePreview` in chat-list, friends, comment-hub, suggested-follows, search-portal, chat-bubble.
3. **Real-time pause on Lite** — `global-realtime.tsx` already gates ambient post-counts + comment streams behind `ambientRealtimeEnabled = tier !== 'lite'`. Admin channels intentionally remain live.
4. **Smaller fetch limits on Lite** — `friends/page.tsx` uses `adaptiveFeedPageSize(tier)` × multiplier (Lite=20, Standard=60, Rich=150).
5. **Disabled Link prefetch on Lite** — new `LiteLink` wrapper (`src/components/ui/lite-link.tsx`) swapped into `header`, `sub-header`, `main-nav`, `right-sidebar`, `menu` so route bundles are NOT background-fetched on Lite.
6. **Tap-to-translate** — already manual button (chat-bubble:149, post-card:377). Verified, no auto-firing.
7. **Smarter Service Worker (v6→v7)** — navigation switched from network-first to **stale-while-revalidate**: cached pages serve instantly while a background fetch refreshes them. Saves repeat-page bytes.
8. **Code splitting** — `ShareHub` and `BoostPortal` in `post-card.tsx` switched to `next/dynamic({ ssr: false })` so the heavy share/boost dialogs are only fetched on demand.
9. **Visible Data Budget badge** — new `src/lib/data-budget.ts` (PerformanceObserver + localStorage). Tracker mounted in `global-realtime.tsx`. Settings → Lite Mode card now shows Today / This-month bytes, a configurable monthly cap (MB) with a colored progress bar (Healthy / Approaching / Almost-full).

Also normalized: `preload="metadata"` → `preload="none"` on every shared-post `<video>` (post-card, chat-bubble, share-hub) so feed scrolls download zero video bytes until tap. Stories thumbnails on Lite render a static placeholder instead of a `<video>` element.

Files added: `src/lib/data-budget.ts`, `src/components/ui/lite-link.tsx`.
