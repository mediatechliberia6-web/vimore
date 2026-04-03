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

## Developer Notes
- `src/lib/mock-data.ts` is intentionally empty — all data comes from Appwrite
- `src/lib/appwrite.ts` exports named bucket constants (`BUCKET_IMAGES`, `BUCKET_STORIES`, `BUCKET_REEL`, `BUCKET_MUSIC`) for component compatibility
- `BUCKET_IMAGES` maps to `post_media` bucket; `BUCKET_MUSIC` maps to `music_tracks`
- `users` collection has both `is_verfied` (typo, original) and `is_verified` (correct, added programmatically) — code uses the correct spelling

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
