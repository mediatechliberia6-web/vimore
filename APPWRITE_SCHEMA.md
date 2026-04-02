# ViMore — Appwrite Database Schema

**Database ID:** `vimoreprod`

This schema documents the **exact** field names used in the application code.
Every attribute name here matches 1-to-1 with what the code reads and writes.

---

## Collections

### `users`
| Attribute | Type | Notes |
|---|---|---|
| `name` | String | Display name |
| `username` | String | Unique handle (no @) |
| `email` | String | Login email |
| `phone` | String | Optional phone number |
| `avatar_id` | String | File ID in `avatars` bucket |
| `cover_id` | String | File ID in `covers` bucket |
| `bio` | String | Profile bio |
| `category` | String | Creator category |
| `gender` | String | `Male` or `Female` |
| `nationality` | String | Country of origin |
| `date_of_birth` | String | ISO date string |
| `gold_balance` | Integer | Gold coin balance |
| `diamond_balance` | Integer | Diamond balance |
| `star_balance` | Integer | Star balance |
| `referral_code` | String | Unique referral code |
| `referral_count` | Integer | Number of referrals made |
| `role` | String | `SUPER`, `FINANCIAL`, `MODERATOR`, `USER` |
| `join_date` | String | ISO datetime of account creation |
| `is_verified` | Boolean | Verification badge status |
| `has_ever_been_verified` | Boolean | Was ever verified (history) |
| `followers_count` | Integer | Follower count |
| `following_count` | Integer | Following count |
| `friends_count` | Integer | Friend count |
| `posts_count` | Integer | Number of posts |
| `language` | String | Preferred language code (e.g. `en`) |

---

### `posts`
| Attribute | Type | Notes |
|---|---|---|
| `author_id` | String | References `users.$id` |
| `content` | String | Post text content |
| `media_ids` | String[] | Array of file IDs in `post_media` bucket |
| `video_id` | String | File ID in `post_media` bucket |
| `likes_count` | Integer | Like count |
| `unlikes_count` | Integer | Unlike count |
| `comments_count` | Integer | Comment count |
| `shares_count` | Integer | Share count |
| `views_count` | Integer | View count |
| `is_locked` | Boolean | Whether post requires unlock |
| `unlock_price` | Integer | Gold cost to unlock |
| `is_boosted` | Boolean | Whether post is boosted |
| `boost_target_views` | Integer | Target views for boost |
| `boost_current_views` | Integer | Current boost view count |
| `comments_disabled` | Boolean | Whether comments are off |
| `theme` | String | Post theme style |
| `image_filter` | String | Image filter applied |
| `feeling` | String | Feeling tag |
| `location` | String | Location tag |
| `poll` | String | JSON-stringified poll object |
| `visibility` | String | `public`, `friends`, `private` |

---

### `post_comments`
| Attribute | Type | Notes |
|---|---|---|
| `post_id` | String | References `posts.$id` |
| `user_id` | String | References `users.$id` |
| `user_name` | String | Commenter display name |
| `user_avatar` | String | Commenter avatar file ID or URL |
| `content` | String | Comment text |
| `parent_id` | String | References parent comment `$id` (for replies) |

---

### `post_reactions`
| Attribute | Type | Notes |
|---|---|---|
| `post_id` | String | References `posts.$id` |
| `user_id` | String | References `users.$id` |
| `reaction_type` | String | `LIKE` or `UNLIKE` |

---

### `post_unlocks`
| Attribute | Type | Notes |
|---|---|---|
| `post_id` | String | References `posts.$id` |
| `user_id` | String | References `users.$id` |
| `gold_spent` | Integer | Gold spent to unlock |

---

### `bookmarks`
| Attribute | Type | Notes |
|---|---|---|
| `post_id` | String | References `posts.$id` |
| `user_id` | String | References `users.$id` |

---

### `stories`
| Attribute | Type | Notes |
|---|---|---|
| `author_id` | String | References `users.$id` |
| `expiry` | String | ISO datetime when story expires |
| `view_count` | Integer | Number of views |

---

### `story_segments`
| Attribute | Type | Notes |
|---|---|---|
| `story_id` | String | References `stories.$id` |
| `author_id` | String | References `users.$id` |
| `type` | String | `image`, `video`, or `text` |
| `media_id` | String | File ID in `story_media` bucket |
| `text` | String | Overlay text |
| `duration` | Integer | Segment duration in seconds |
| `order_index` | Integer | Display order (0-based) |

---

### `story_views`
| Attribute | Type | Notes |
|---|---|---|
| `story_id` | String | References `stories.$id` |
| `viewer_id` | String | References `users.$id` |

---

### `follows`
| Attribute | Type | Notes |
|---|---|---|
| `follower_id` | String | References `users.$id` of the follower |
| `following_id` | String | References `users.$id` of the user being followed |
| `follower_username` | String | Username of the follower |
| `following_username` | String | Username of the user being followed |

---

### `friend_requests`
| Attribute | Type | Notes |
|---|---|---|
| `sender_id` | String | References `users.$id` |
| `receiver_id` | String | References `users.$id` |
| `sender_username` | String | Username of sender |
| `receiver_username` | String | Username of receiver |
| `status` | String | `PENDING` or `ACCEPTED` |

---

### `blocked_users`
| Attribute | Type | Notes |
|---|---|---|
| `blocker_id` | String | References `users.$id` of blocker |
| `blocked_username` | String | Username of the blocked user |

---

### `messages`
| Attribute | Type | Notes |
|---|---|---|
| `sender_id` | String | References `users.$id` |
| `receiver_id` | String | References `users.$id` |
| `content` | String | Message text |
| `type` | String | `text`, `photo`, `video`, `voice`, `link`, `tag`, `workspace`, `call` |
| `media_id` | String | File ID in `message_media` bucket |
| `is_read` | Boolean | Whether message was read |
| `is_view_once` | Boolean | Whether message disappears after viewing |
| `is_viewed` | Boolean | Whether view-once message was viewed |
| `voice_duration` | String | Duration string for voice messages |

---

### `clusters`
| Attribute | Type | Notes |
|---|---|---|
| `name` | String | Cluster (group) name |
| `admin_id` | String | References `users.$id` of admin |
| `admin_username` | String | Username of admin |
| `avatar_id` | String | File ID in `avatars` bucket |
| `cover_id` | String | File ID in `covers` bucket |
| `is_add_locked` | Boolean | Whether only admin can add members |

---

### `cluster_members`
| Attribute | Type | Notes |
|---|---|---|
| `cluster_id` | String | References `clusters.$id` |
| `user_id` | String | References `users.$id` |
| `username` | String | Member username |

---

### `tracks`
| Attribute | Type | Notes |
|---|---|---|
| `title` | String | Track title |
| `artist_id` | String | References `users.$id` |
| `artist_name` | String | Artist display name |
| `artist_username` | String | Artist username |
| `audio_id` | String | File ID in `music_tracks` bucket |
| `cover_id` | String | File ID in `album_covers` bucket |
| `duration` | Integer | Duration in seconds |
| `streams_count` | Integer | Total stream count |
| `likes_count` | Integer | Like count |
| `is_published` | Boolean | Whether track is public |
| `is_boosted` | Boolean | Whether track is boosted |
| `album_id` | String | References `albums.$id` (optional) |
| `track_number` | Integer | Position in album (optional) |
| `genre` | String | Music genre |
| `tags` | String[] | Genre/style tags |

---

### `track_likes`
| Attribute | Type | Notes |
|---|---|---|
| `track_id` | String | References `tracks.$id` |
| `user_id` | String | References `users.$id` |

---

### `albums`
| Attribute | Type | Notes |
|---|---|---|
| `title` | String | Album title |
| `artist_id` | String | References `users.$id` |
| `artist_name` | String | Artist display name |
| `artist_username` | String | Artist username |
| `cover_id` | String | File ID in `album_covers` bucket |
| `tracks_count` | Integer | Number of tracks |
| `is_published` | Boolean | Whether album is public |
| `genre` | String | Music genre |
| `description` | String | Album description |
| `release_date` | String | ISO date string |

---

### `playlists`
| Attribute | Type | Notes |
|---|---|---|
| `title` | String | Playlist title |
| `creator_id` | String | References `users.$id` |
| `creator_username` | String | Creator username |
| `cover_id` | String | File ID in `album_covers` bucket |
| `tracks_count` | Integer | Number of tracks |
| `is_private` | Boolean | Whether playlist is private |
| `description` | String | Playlist description |

---

### `playlist_tracks`
| Attribute | Type | Notes |
|---|---|---|
| `playlist_id` | String | References `playlists.$id` |
| `track_id` | String | References `tracks.$id` |
| `order_index` | Integer | Track position in playlist (0-based) |

---

### `notifications`
| Attribute | Type | Notes |
|---|---|---|
| `recipient_id` | String | References `users.$id` |
| `sender_id` | String | References `users.$id` |
| `type` | String | `SOCIAL`, `SONIC`, `POST`, `SYSTEM` |
| `title` | String | Notification title |
| `content` | String | Notification body |
| `is_read` | Boolean | Whether notification was read |
| `post_id` | String | References `posts.$id` (optional) |
| `track_id` | String | References `tracks.$id` (optional) |
| `target_username` | String | Related username (optional) |

---

### `transactions`
| Attribute | Type | Notes |
|---|---|---|
| `user_id` | String | References `users.$id` |
| `amount` | Integer | Transaction amount |
| `currency` | String | `GOLD`, `DIAMOND`, `STAR`, `USD` |
| `type` | String | `POST_UNLOCK`, `GIFT`, `BOOST`, `SUBSCRIPTION`, etc. |
| `reference_id` | String | Related document ID |
| `status` | String | `COMPLETED`, `PENDING`, `FAILED` |

---

### `withdrawal_requests`
| Attribute | Type | Notes |
|---|---|---|
| `user_id` | String | References `users.$id` |
| `username` | String | Requester username |
| `amount_usd` | Float | Amount in USD |
| `currency_type` | String | `GOLD` or `DIAMOND` |
| `phone_number` | String | Mobile money number |
| `payment_method` | String | `ORANGE`, `MTN`, `MOBILE_MONEY` |
| `status` | String | `PENDING`, `APPROVED`, `REJECTED` |

---

### `payment_requests`
| Attribute | Type | Notes |
|---|---|---|
| `user_id` | String | References `users.$id` |
| `username` | String | Requester username |
| `package_name` | String | Package being purchased |
| `amount` | String | Payment amount |
| `currency` | String | `USD`, `LRD` |
| `code` | String | Payment reference code |
| `screenshot_id` | String | File ID in `payment_screenshots` bucket |
| `status` | String | `PENDING`, `APPROVED`, `REJECTED` |

---

### `subscriptions`
| Attribute | Type | Notes |
|---|---|---|
| `subscriber_id` | String | References `users.$id` |
| `creator_username` | String | Creator being subscribed to |
| `diamond_spent` | Integer | Diamonds paid |
| `is_active` | Boolean | Whether subscription is active |

---

### `verification_records`
| Attribute | Type | Notes |
|---|---|---|
| `user_id` | String | References `users.$id` |
| `currency` | String | `DIAMOND` or `STAR` |
| `cost` | Integer | Amount paid |
| `status` | String | `APPROVED`, `PENDING`, `REJECTED` |

---

### `reports`
| Attribute | Type | Notes |
|---|---|---|
| `reporter_id` | String | References `users.$id` |
| `reported_username` | String | Username of reported user |
| `reason` | String | Report reason |
| `details` | String | Additional details |
| `status` | String | Review status |

---

### `support_tickets`
| Attribute | Type | Notes |
|---|---|---|
| `user_id` | String | References `users.$id` |
| `username` | String | Submitter username |
| `subject` | String | Ticket subject |
| `message` | String | Ticket body |
| `category` | String | Issue category |
| `status` | String | `OPEN`, `IN_PROGRESS`, `CLOSED` |
| `priority` | String | `LOW`, `MEDIUM`, `HIGH` |

---

### `ad_campaigns`
| Attribute | Type | Notes |
|---|---|---|
| `user_id` | String | References `users.$id` |
| `is_active` | Boolean | Whether campaign is running |
| `impressions` | Integer | Total impressions |
| `clicks` | Integer | Total clicks |

---

### `audit_logs`
| Attribute | Type | Notes |
|---|---|---|
| `action` | String | Action performed |
| `details` | String | Action details |
| `performed_by` | String | Username of performer |
| `performed_by_avatar` | String | Avatar URL of performer |

---

### `call_logs`
| Attribute | Type | Notes |
|---|---|---|
| `caller_id` | String | References `users.$id` |
| `callee_id` | String | References `users.$id` or username |
| `type` | String | `audio` or `video` |
| `duration` | String | Duration string (e.g. `1:23`) |
| `status` | String | `COMPLETED`, `MISSED` |

---

## Storage Buckets

| Bucket ID | Purpose |
|---|---|
| `avatars` | User profile pictures |
| `covers` | User cover/banner images |
| `post_media` | Post images and videos |
| `story_media` | Story segment images and videos |
| `reel_media` | Reel videos |
| `music_tracks` | Audio files for music tracks |
| `album_covers` | Cover art for tracks, albums, and playlists |
| `voice_messages` | Voice message audio |
| `payment_screenshots` | Payment proof screenshots |
| `message_media` | Media shared in chat messages |
