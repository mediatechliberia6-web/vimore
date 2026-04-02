/**
 * MOCK DATA SERVICE — Prototype Mode
 * All Appwrite SDK calls replaced with in-memory mock data.
 * No Appwrite connection required.
 */

export type { Models } from 'appwrite';

export const DATABASE_ID = 'vimoreprod';

export const COL = {
  USERS: 'users',
  POSTS: 'posts',
  POST_COMMENTS: 'post_comments',
  POST_REACTIONS: 'post_reactions',
  POST_UNLOCKS: 'post_unlocks',
  BOOKMARKS: 'bookmarks',
  STORIES: 'stories',
  STORY_SEGMENTS: 'story_segments',
  STORY_VIEWS: 'story_views',
  FOLLOWS: 'follows',
  FRIEND_REQUESTS: 'friend_requests',
  BLOCKED_USERS: 'blocked_users',
  MESSAGES: 'messages',
  CLUSTERS: 'clusters',
  CLUSTER_MEMBERS: 'cluster_members',
  TRACKS: 'tracks',
  TRACK_LIKES: 'track_likes',
  ALBUMS: 'albums',
  PLAYLISTS: 'playlists',
  PLAYLIST_TRACKS: 'playlist_tracks',
  NOTIFICATIONS: 'notifications',
  TRANSACTIONS: 'transactions',
  WITHDRAWAL_REQUESTS: 'withdrawal_requests',
  PAYMENT_REQUESTS: 'payment_requests',
  SUBSCRIPTIONS: 'subscriptions',
  VERIFICATION_RECORDS: 'verification_records',
  REFERRALS: 'referrals',
  REPORTS: 'reports',
  SUPPORT_TICKETS: 'support_tickets',
  AD_CAMPAIGNS: 'ad_campaigns',
  AUDIT_LOGS: 'audit_logs',
  CALL_LOGS: 'call_logs',
} as const;

export const BUCKET = {
  AVATARS: 'avatars',
  COVERS: 'covers',
  POST_MEDIA: 'post_media',
  STORY_MEDIA: 'story_media',
  REEL_MEDIA: 'reel_media',
  MUSIC_TRACKS: 'music_tracks',
  ALBUM_COVERS: 'album_covers',
  VOICE_MESSAGES: 'voice_messages',
  PAYMENT_SCREENSHOTS: 'payment_screenshots',
  MESSAGE_MEDIA: 'message_media',
} as const;

export const BUCKET_IMAGES = BUCKET.POST_MEDIA;
export const BUCKET_STORIES = BUCKET.STORY_MEDIA;
export const BUCKET_REEL = BUCKET.REEL_MEDIA;
export const BUCKET_MUSIC = BUCKET.MUSIC_TRACKS;

const now = new Date().toISOString();
const d = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 3600000).toISOString();
const futureDate = (hoursFromNow: number) => new Date(Date.now() + hoursFromNow * 3600000).toISOString();

const _uploadedFiles: Record<string, string> = {};

const _collections: Record<string, Record<string, any>> = {
  users: {
    user_001: {
      $id: 'user_001', $createdAt: d(2160), $updatedAt: d(2),
      name: 'Alex Johnson', username: 'alexjohnson', email: 'alex@vimore.com',
      bio: 'Building the future, one post at a time. Digital creator & music lover 🎵✨',
      category: 'Creator', gender: 'Male', nationality: 'Liberian',
      date_of_birth: '1998-04-12',
      avatar_id: 'av_user001', cover_id: 'cv_user001',
      is_verified: true, has_ever_been_verified: true,
      followers_count: 1247, following_count: 384, friends_count: 12, posts_count: 47,
      gold_balance: 500, diamond_balance: 25, star_balance: 10,
      referral_code: 'VMALEXJO4X9', referral_count: 3,
      role: 'SUPER', join_date: d(2160), language: 'en',
    },
    user_002: {
      $id: 'user_002', $createdAt: d(1800), $updatedAt: d(5),
      name: 'Sarah Lee', username: 'sarahlee', email: 'sarah@vimore.com',
      bio: 'Singer-songwriter 🎤 | Born to create | Stream my music below 🎶',
      category: 'Music', gender: 'Female', nationality: 'Liberian',
      date_of_birth: '1999-08-22',
      avatar_id: 'av_user002', cover_id: 'cv_user002',
      is_verified: true, has_ever_been_verified: true,
      followers_count: 5820, following_count: 210, friends_count: 8, posts_count: 112,
      gold_balance: 1200, diamond_balance: 80, star_balance: 35,
      referral_code: 'VMSARAHLX3K', referral_count: 11,
      role: 'USER', join_date: d(1800), language: 'en',
    },
    user_003: {
      $id: 'user_003', $createdAt: d(1440), $updatedAt: d(12),
      name: 'Marcus Brown', username: 'marcusbrown', email: 'marcus@vimore.com',
      bio: 'Photographer | Traveler | Telling stories through lenses 📸🌍',
      category: 'Photography', gender: 'Male', nationality: 'Ghanaian',
      date_of_birth: '1995-11-30',
      avatar_id: 'av_user003', cover_id: 'cv_user003',
      is_verified: false, has_ever_been_verified: false,
      followers_count: 2340, following_count: 567, friends_count: 5, posts_count: 78,
      gold_balance: 230, diamond_balance: 5, star_balance: 2,
      referral_code: 'VMMARCU9P1Z', referral_count: 2,
      role: 'USER', join_date: d(1440), language: 'en',
    },
    user_004: {
      $id: 'user_004', $createdAt: d(720), $updatedAt: d(1),
      name: 'Emma Chen', username: 'emmachen', email: 'emma@vimore.com',
      bio: 'Tech & lifestyle blogger 💻 | Coding enthusiast | She/Her',
      category: 'Technology', gender: 'Female', nationality: 'Singaporean',
      date_of_birth: '2000-03-07',
      avatar_id: 'av_user004', cover_id: 'cv_user004',
      is_verified: true, has_ever_been_verified: true,
      followers_count: 3450, following_count: 290, friends_count: 7, posts_count: 63,
      gold_balance: 750, diamond_balance: 40, star_balance: 18,
      referral_code: 'VMEMMACHY2M', referral_count: 6,
      role: 'USER', join_date: d(720), language: 'en',
    },
    user_admin: {
      $id: 'user_admin', $createdAt: d(4320), $updatedAt: d(0),
      name: 'ViMore Admin', username: 'admin', email: 'admin@vimore.com',
      bio: 'Platform Administrator',
      category: 'System', gender: 'Male', nationality: 'Liberian',
      date_of_birth: '1990-01-01',
      avatar_id: 'av_admin', cover_id: 'cv_admin',
      is_verified: true, has_ever_been_verified: true,
      followers_count: 0, following_count: 0, friends_count: 0, posts_count: 0,
      gold_balance: 99999, diamond_balance: 9999, star_balance: 9999,
      referral_code: 'VMADMIN00000', referral_count: 0,
      role: 'SUPER', join_date: d(4320), language: 'en',
    },
  },

  posts: {
    post_001: {
      $id: 'post_001', $createdAt: d(1), $updatedAt: d(1),
      author_id: 'user_002',
      content: 'Just dropped my new single "Digital Dreams" 🎵 Stream it now on ViMore Sonic! This one took 3 months to make and every second was worth it. Thank you to everyone who supported me on this journey 🙏❤️',
      media_ids: [], video_id: null,
      likes_count: 234, unlikes_count: 5, comments_count: 47, shares_count: 12, views_count: 1890,
      is_locked: false, unlock_price: 0, is_boosted: true, boost_target_views: 5000, boost_current_views: 1890,
      comments_disabled: false, theme: null, image_filter: null, feeling: 'excited', location: 'Monrovia, Liberia',
      poll: null, visibility: 'public',
    },
    post_002: {
      $id: 'post_002', $createdAt: d(3), $updatedAt: d(3),
      author_id: 'user_003',
      content: 'The mountains are calling and I must go 🏔️ Captured this at sunrise — no filter, no edit. Nature is the greatest artist there is.',
      media_ids: ['post_img_001'], video_id: null,
      likes_count: 189, unlikes_count: 2, comments_count: 34, shares_count: 8, views_count: 1420,
      is_locked: false, unlock_price: 0, is_boosted: false, boost_target_views: 0, boost_current_views: 0,
      comments_disabled: false, theme: null, image_filter: 'vivid', feeling: 'peaceful', location: 'Mountains',
      poll: null, visibility: 'public',
    },
    post_003: {
      $id: 'post_003', $createdAt: d(6), $updatedAt: d(6),
      author_id: 'user_004',
      content: '🔥 Hot take: The best programming language is the one that ships your product. Spent 6 hours debugging CSS today and I have no regrets. Here\'s what I learned... \n\n1. Never trust your gut with margins\n2. Flex + Grid together is magic\n3. Always check mobile first!',
      media_ids: [], video_id: null,
      likes_count: 445, unlikes_count: 11, comments_count: 92, shares_count: 31, views_count: 3200,
      is_locked: false, unlock_price: 0, is_boosted: false, boost_target_views: 0, boost_current_views: 0,
      comments_disabled: false, theme: 'dark', image_filter: null, feeling: null, location: null,
      poll: null, visibility: 'public',
    },
    post_004: {
      $id: 'post_004', $createdAt: d(10), $updatedAt: d(10),
      author_id: 'user_001',
      content: 'Good morning ViMore fam! What are your goals this week? Mine:\n\n✅ Post 3 new pieces of content\n📚 Finish reading "The Lean Startup"\n🏃 Run 15km total\n🎵 Explore new music\n\nLet\'s build together 💪🔥',
      media_ids: [], video_id: null,
      likes_count: 78, unlikes_count: 1, comments_count: 23, shares_count: 5, views_count: 890,
      is_locked: false, unlock_price: 0, is_boosted: false, boost_target_views: 0, boost_current_views: 0,
      comments_disabled: false, theme: null, image_filter: null, feeling: 'motivated', location: null,
      poll: JSON.stringify({ question: 'What\'s your #1 goal this week?', options: [{ text: 'Career growth', votes: 34 }, { text: 'Health & fitness', votes: 28 }, { text: 'Creative projects', votes: 41 }, { text: 'Financial goals', votes: 19 }], totalVotes: 122, userVote: null }),
      visibility: 'public',
    },
    post_005: {
      $id: 'post_005', $createdAt: d(18), $updatedAt: d(18),
      author_id: 'user_002',
      content: '🔒 Exclusive behind-the-scenes from my studio session. Unlock to see how I create my music from scratch — raw recordings, my process, and the mistakes that made the magic.',
      media_ids: ['post_img_002'], video_id: null,
      likes_count: 567, unlikes_count: 8, comments_count: 103, shares_count: 24, views_count: 4100,
      is_locked: true, unlock_price: 50, is_boosted: false, boost_target_views: 0, boost_current_views: 0,
      comments_disabled: false, theme: null, image_filter: null, feeling: null, location: 'Studio',
      poll: null, visibility: 'public',
    },
    post_006: {
      $id: 'post_006', $createdAt: d(24), $updatedAt: d(24),
      author_id: 'user_003',
      content: 'Street photography challenge day 30 📸 One month of shooting every single day. The discipline of showing up even when you don\'t feel like it — that\'s what separates good from great.',
      media_ids: ['post_img_003', 'post_img_004', 'post_img_005'], video_id: null,
      likes_count: 312, unlikes_count: 4, comments_count: 56, shares_count: 15, views_count: 2780,
      is_locked: false, unlock_price: 0, is_boosted: false, boost_target_views: 0, boost_current_views: 0,
      comments_disabled: false, theme: null, image_filter: 'bw', feeling: 'proud', location: 'Accra, Ghana',
      poll: null, visibility: 'public',
    },
    post_007: {
      $id: 'post_007', $createdAt: d(36), $updatedAt: d(36),
      author_id: 'user_004',
      content: 'AI is not replacing developers. AI is replacing developers who don\'t use AI.\n\nUse every tool available to you. Adapt. Ship faster. Build smarter. 🤖💻',
      media_ids: [], video_id: null,
      likes_count: 891, unlikes_count: 67, comments_count: 178, shares_count: 89, views_count: 7200,
      is_locked: false, unlock_price: 0, is_boosted: true, boost_target_views: 10000, boost_current_views: 7200,
      comments_disabled: false, theme: 'gradient', image_filter: null, feeling: null, location: null,
      poll: null, visibility: 'public',
    },
    post_008: {
      $id: 'post_008', $createdAt: d(48), $updatedAt: d(48),
      author_id: 'user_001',
      content: 'Went to a live music event last night and remembered why I love this platform — it\'s not just about posting, it\'s about connection. Real human connection in the digital age. ViMore is building that bridge 🌉❤️',
      media_ids: ['post_img_006'], video_id: null,
      likes_count: 143, unlikes_count: 2, comments_count: 28, shares_count: 9, views_count: 1100,
      is_locked: false, unlock_price: 0, is_boosted: false, boost_target_views: 0, boost_current_views: 0,
      comments_disabled: false, theme: null, image_filter: null, feeling: 'grateful', location: 'Monrovia, Liberia',
      poll: null, visibility: 'public',
    },
  },

  post_comments: {
    comment_001: {
      $id: 'comment_001', $createdAt: d(0.5), $updatedAt: d(0.5),
      post_id: 'post_001', user_id: 'user_001',
      user_name: 'Alex Johnson', user_avatar: 'av_user001',
      content: 'This is 🔥🔥🔥 Sarah! Stream count going up already!', parent_id: null,
    },
    comment_002: {
      $id: 'comment_002', $createdAt: d(0.8), $updatedAt: d(0.8),
      post_id: 'post_001', user_id: 'user_004',
      user_name: 'Emma Chen', user_avatar: 'av_user004',
      content: 'Congratulations Sarah!! Can\'t wait to add this to my playlist 🎧', parent_id: null,
    },
    comment_003: {
      $id: 'comment_003', $createdAt: d(2), $updatedAt: d(2),
      post_id: 'post_003', user_id: 'user_002',
      user_name: 'Sarah Lee', user_avatar: 'av_user002',
      content: 'The CSS margin struggle is REAL 😂 Flex + Grid saved my life', parent_id: null,
    },
  },

  post_reactions: {
    reaction_001: {
      $id: 'reaction_001', $createdAt: d(0.5), $updatedAt: d(0.5),
      post_id: 'post_001', user_id: 'user_001', reaction_type: 'LIKE',
    },
    reaction_002: {
      $id: 'reaction_002', $createdAt: d(2), $updatedAt: d(2),
      post_id: 'post_003', user_id: 'user_001', reaction_type: 'LIKE',
    },
    reaction_003: {
      $id: 'reaction_003', $createdAt: d(3), $updatedAt: d(3),
      post_id: 'post_007', user_id: 'user_001', reaction_type: 'LIKE',
    },
  },

  post_unlocks: {},
  bookmarks: {},

  stories: {
    story_001: {
      $id: 'story_001', $createdAt: d(4), $updatedAt: d(4),
      author_id: 'user_002',
      expiry: futureDate(20),
      view_count: 45,
    },
    story_002: {
      $id: 'story_002', $createdAt: d(2), $updatedAt: d(2),
      author_id: 'user_004',
      expiry: futureDate(22),
      view_count: 31,
    },
    story_003: {
      $id: 'story_003', $createdAt: d(1), $updatedAt: d(1),
      author_id: 'user_003',
      expiry: futureDate(23),
      view_count: 18,
    },
  },

  story_segments: {
    seg_001: {
      $id: 'seg_001', $createdAt: d(4), $updatedAt: d(4),
      story_id: 'story_001', author_id: 'user_002',
      type: 'image', media_id: 'story_img_001',
      text: 'Studio vibes 🎵', duration: 5, order_index: 0, order: 0,
    },
    seg_002: {
      $id: 'seg_002', $createdAt: d(2), $updatedAt: d(2),
      story_id: 'story_002', author_id: 'user_004',
      type: 'image', media_id: 'story_img_002',
      text: 'Late night coding session 💻', duration: 5, order_index: 0, order: 0,
    },
    seg_003: {
      $id: 'seg_003', $createdAt: d(1), $updatedAt: d(1),
      story_id: 'story_003', author_id: 'user_003',
      type: 'image', media_id: 'story_img_003',
      text: 'Golden hour 📸', duration: 5, order_index: 0, order: 0,
    },
  },

  story_views: {},

  follows: {
    follow_001: {
      $id: 'follow_001', $createdAt: d(200), $updatedAt: d(200),
      follower_id: 'user_001', following_id: 'user_002',
      follower_username: 'alexjohnson', following_username: 'sarahlee',
    },
    follow_002: {
      $id: 'follow_002', $createdAt: d(180), $updatedAt: d(180),
      follower_id: 'user_001', following_id: 'user_003',
      follower_username: 'alexjohnson', following_username: 'marcusbrown',
    },
    follow_003: {
      $id: 'follow_003', $createdAt: d(150), $updatedAt: d(150),
      follower_id: 'user_001', following_id: 'user_004',
      follower_username: 'alexjohnson', following_username: 'emmachen',
    },
    follow_004: {
      $id: 'follow_004', $createdAt: d(190), $updatedAt: d(190),
      follower_id: 'user_002', following_id: 'user_001',
      follower_username: 'sarahlee', following_username: 'alexjohnson',
    },
    follow_005: {
      $id: 'follow_005', $createdAt: d(160), $updatedAt: d(160),
      follower_id: 'user_003', following_id: 'user_001',
      follower_username: 'marcusbrown', following_username: 'alexjohnson',
    },
    follow_006: {
      $id: 'follow_006', $createdAt: d(100), $updatedAt: d(100),
      follower_id: 'user_004', following_id: 'user_001',
      follower_username: 'emmachen', following_username: 'alexjohnson',
    },
  },

  friend_requests: {
    fr_001: {
      $id: 'fr_001', $createdAt: d(170), $updatedAt: d(168),
      sender_id: 'user_001', receiver_id: 'user_002',
      sender_username: 'alexjohnson', receiver_username: 'sarahlee',
      status: 'ACCEPTED',
    },
    fr_002: {
      $id: 'fr_002', $createdAt: d(50), $updatedAt: d(50),
      sender_id: 'user_003', receiver_id: 'user_001',
      sender_username: 'marcusbrown', receiver_username: 'alexjohnson',
      status: 'PENDING',
    },
  },

  blocked_users: {},

  messages: {
    msg_001: {
      $id: 'msg_001', $createdAt: d(2), $updatedAt: d(2),
      sender_id: 'user_002', receiver_id: 'user_001',
      content: 'Hey Alex! How are you doing? Did you get to listen to my new track? 🎵',
      type: 'text', media_id: null, is_read: true, is_view_once: false, is_viewed: false,
    },
    msg_002: {
      $id: 'msg_002', $createdAt: d(1.8), $updatedAt: d(1.8),
      sender_id: 'user_001', receiver_id: 'user_002',
      content: 'Sarah! Yes!! It\'s incredible 🔥 Already on repeat. How long did the production take?',
      type: 'text', media_id: null, is_read: true, is_view_once: false, is_viewed: false,
    },
    msg_003: {
      $id: 'msg_003', $createdAt: d(1.5), $updatedAt: d(1.5),
      sender_id: 'user_002', receiver_id: 'user_001',
      content: 'About 3 months in total! Studio time + mixing + mastering. Worth every penny though. You should come to the listening party next week 🎉',
      type: 'text', media_id: null, is_read: true, is_view_once: false, is_viewed: false,
    },
    msg_004: {
      $id: 'msg_004', $createdAt: d(1), $updatedAt: d(1),
      sender_id: 'user_001', receiver_id: 'user_002',
      content: 'Count me in! 💯',
      type: 'text', media_id: null, is_read: false, is_view_once: false, is_viewed: false,
    },
  },

  clusters: {},
  cluster_members: {},

  tracks: {
    track_001: {
      $id: 'track_001', $createdAt: d(48), $updatedAt: d(2),
      title: 'Digital Dreams', artist_id: 'user_002',
      artist_name: 'Sarah Lee', artist_username: 'sarahlee',
      audio_id: null, cover_id: 'track_cover_001',
      duration: 212, streams_count: 45230, likes_count: 1240,
      is_published: true, is_boosted: true,
      album_id: 'album_001', track_number: 1,
      genre: 'Electronic', tags: ['electronic', 'pop', 'vibes'],
    },
    track_002: {
      $id: 'track_002', $createdAt: d(72), $updatedAt: d(10),
      title: 'Borderless', artist_id: 'user_003',
      artist_name: 'Marcus Brown', artist_username: 'marcusbrown',
      audio_id: null, cover_id: 'track_cover_002',
      duration: 185, streams_count: 22890, likes_count: 567,
      is_published: true, is_boosted: false,
      album_id: null, track_number: null,
      genre: 'Afrobeats', tags: ['afrobeats', 'africa', 'culture'],
    },
    track_003: {
      $id: 'track_003', $createdAt: d(96), $updatedAt: d(5),
      title: 'Neon Nights', artist_id: 'user_004',
      artist_name: 'Emma Chen', artist_username: 'emmachen',
      audio_id: null, cover_id: 'track_cover_003',
      duration: 243, streams_count: 31000, likes_count: 890,
      is_published: true, is_boosted: false,
      album_id: null, track_number: null,
      genre: 'Synthwave', tags: ['synthwave', 'retro', 'night'],
    },
    track_004: {
      $id: 'track_004', $createdAt: d(120), $updatedAt: d(8),
      title: 'Pulse Wave', artist_id: 'user_002',
      artist_name: 'Sarah Lee', artist_username: 'sarahlee',
      audio_id: null, cover_id: 'track_cover_004',
      duration: 198, streams_count: 18500, likes_count: 445,
      is_published: true, is_boosted: false,
      album_id: 'album_001', track_number: 2,
      genre: 'Electronic', tags: ['electronic', 'dance'],
    },
    track_005: {
      $id: 'track_005', $createdAt: d(144), $updatedAt: d(20),
      title: 'Sovereign Sound', artist_id: 'user_003',
      artist_name: 'Marcus Brown', artist_username: 'marcusbrown',
      audio_id: null, cover_id: 'track_cover_005',
      duration: 267, streams_count: 9800, likes_count: 234,
      is_published: true, is_boosted: false,
      album_id: null, track_number: null,
      genre: 'Afrobeats', tags: ['afrobeats', 'chill'],
    },
  },

  track_likes: {
    tl_001: {
      $id: 'tl_001', $createdAt: d(10), $updatedAt: d(10),
      user_id: 'user_001', track_id: 'track_001',
    },
    tl_002: {
      $id: 'tl_002', $createdAt: d(15), $updatedAt: d(15),
      user_id: 'user_001', track_id: 'track_003',
    },
  },

  albums: {
    album_001: {
      $id: 'album_001', $createdAt: d(120), $updatedAt: d(48),
      title: 'Digital Era', artist_id: 'user_002',
      artist_name: 'Sarah Lee', artist_username: 'sarahlee',
      cover_id: 'album_cover_001',
      tracks_count: 2, is_published: true,
      genre: 'Electronic', description: 'My debut album — two tracks that define the digital generation.',
      release_date: d(120),
    },
  },

  playlists: {
    playlist_001: {
      $id: 'playlist_001', $createdAt: d(168), $updatedAt: d(2),
      title: 'ViMore Trending', creator_id: 'user_admin',
      creator_username: 'admin', cover_id: 'playlist_cover_001',
      tracks_count: 5, is_private: false,
      description: 'The hottest tracks on ViMore right now 🔥',
    },
    playlist_002: {
      $id: 'playlist_002', $createdAt: d(72), $updatedAt: d(24),
      title: 'Chill & Focus', creator_id: 'user_001',
      creator_username: 'alexjohnson', cover_id: 'playlist_cover_002',
      tracks_count: 3, is_private: false,
      description: 'Perfect for late night work sessions',
    },
  },

  playlist_tracks: {
    pt_001: { $id: 'pt_001', $createdAt: d(168), playlist_id: 'playlist_001', track_id: 'track_001', order_index: 0 },
    pt_002: { $id: 'pt_002', $createdAt: d(168), playlist_id: 'playlist_001', track_id: 'track_002', order_index: 1 },
    pt_003: { $id: 'pt_003', $createdAt: d(168), playlist_id: 'playlist_001', track_id: 'track_003', order_index: 2 },
    pt_004: { $id: 'pt_004', $createdAt: d(168), playlist_id: 'playlist_001', track_id: 'track_004', order_index: 3 },
    pt_005: { $id: 'pt_005', $createdAt: d(168), playlist_id: 'playlist_001', track_id: 'track_005', order_index: 4 },
    pt_006: { $id: 'pt_006', $createdAt: d(72), playlist_id: 'playlist_002', track_id: 'track_001', order_index: 0 },
    pt_007: { $id: 'pt_007', $createdAt: d(72), playlist_id: 'playlist_002', track_id: 'track_003', order_index: 1 },
    pt_008: { $id: 'pt_008', $createdAt: d(72), playlist_id: 'playlist_002', track_id: 'track_005', order_index: 2 },
  },

  notifications: {},
  transactions: {},
  withdrawal_requests: {},
  payment_requests: {},
  subscriptions: {},
  verification_records: {},
  referrals: {},
  reports: {},
  support_tickets: {},
  ad_campaigns: {},

  audit_logs: {
    log_001: {
      $id: 'log_001', $createdAt: d(0),
      action: 'SYSTEM_INIT', details: 'ViMore prototype initialized in mock data mode.',
      performed_by: 'system', performed_by_avatar: '',
    },
  },

  call_logs: {},
};

let _sessionUserId: string | null = 'user_001';

export const ID = {
  unique: (): string => 'mock_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
};

type MockQuery =
  | { type: 'equal'; key: string; value: any }
  | { type: 'notEqual'; key: string; value: any }
  | { type: 'greaterThan'; key: string; value: any }
  | { type: 'lessThan'; key: string; value: any }
  | { type: 'orderDesc'; key: string }
  | { type: 'orderAsc'; key: string }
  | { type: 'limit'; value: number }
  | { type: 'offset'; value: number };

export const Query = {
  equal: (key: string, value: any): MockQuery => ({ type: 'equal', key, value }),
  notEqual: (key: string, value: any): MockQuery => ({ type: 'notEqual', key, value }),
  greaterThan: (key: string, value: any): MockQuery => ({ type: 'greaterThan', key, value }),
  lessThan: (key: string, value: any): MockQuery => ({ type: 'lessThan', key, value }),
  orderDesc: (key: string): MockQuery => ({ type: 'orderDesc', key }),
  orderAsc: (key: string): MockQuery => ({ type: 'orderAsc', key }),
  limit: (n: number): MockQuery => ({ type: 'limit', value: n }),
  offset: (n: number): MockQuery => ({ type: 'offset', value: n }),
  isNull: (key: string): MockQuery => ({ type: 'equal', key, value: null }),
  isNotNull: (key: string): MockQuery => ({ type: 'notEqual', key, value: null }),
  contains: (key: string, value: any): MockQuery => ({ type: 'equal', key, value }),
};

function applyQueries(docs: any[], queries: any[]): { documents: any[]; total: number } {
  let result = [...docs];
  let limitVal = 1000;
  let orderField: string | null = null;
  let orderDir: 'asc' | 'desc' = 'desc';

  for (const q of queries) {
    if (!q || typeof q !== 'object') continue;
    if (q.type === 'equal') {
      if (Array.isArray(q.value)) {
        result = result.filter(doc => q.value.includes(doc[q.key]));
      } else {
        result = result.filter(doc => doc[q.key] === q.value);
      }
    } else if (q.type === 'notEqual') {
      result = result.filter(doc => doc[q.key] !== q.value);
    } else if (q.type === 'greaterThan') {
      result = result.filter(doc => (doc[q.key] || '') > q.value);
    } else if (q.type === 'lessThan') {
      result = result.filter(doc => (doc[q.key] || '') < q.value);
    } else if (q.type === 'orderDesc') {
      orderField = q.key;
      orderDir = 'desc';
    } else if (q.type === 'orderAsc') {
      orderField = q.key;
      orderDir = 'asc';
    } else if (q.type === 'limit') {
      limitVal = q.value;
    }
  }

  if (orderField) {
    const field = orderField;
    const dir = orderDir;
    result.sort((a, b) => {
      const aVal = a[field] ?? '';
      const bVal = b[field] ?? '';
      if (dir === 'desc') return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    });
  }

  const total = result.length;
  result = result.slice(0, limitVal);
  return { documents: result, total };
}

function getCol(col: string): Record<string, any> {
  if (!_collections[col]) _collections[col] = {};
  return _collections[col];
}

export const account = {
  async get(): Promise<any> {
    if (!_sessionUserId) throw new Error('[Mock] No active session');
    const userDoc = _collections.users[_sessionUserId];
    if (!userDoc) throw new Error('[Mock] User not found');
    return {
      $id: _sessionUserId,
      name: userDoc.name,
      email: userDoc.email,
      emailVerification: true,
      $createdAt: userDoc.join_date || now,
      $updatedAt: userDoc.$updatedAt || now,
    };
  },

  async create(_id: string, email: string, _password: string, name: string): Promise<any> {
    const newId = ID.unique();
    const username = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) + Math.floor(100 + Math.random() * 900);
    const newUser = {
      $id: newId, $createdAt: now, $updatedAt: now,
      name, username, email, bio: '', category: '', gender: '',
      nationality: '', date_of_birth: '', avatar_id: null, cover_id: null,
      is_verified: false, has_ever_been_verified: false,
      followers_count: 0, following_count: 0, friends_count: 0, posts_count: 0,
      gold_balance: 100, diamond_balance: 5, star_balance: 2,
      referral_code: 'VM' + username.toUpperCase().slice(0, 6) + Math.random().toString(36).slice(2, 5).toUpperCase(),
      referral_count: 0, role: 'USER', join_date: now, language: 'en',
    };
    _collections.users[newId] = newUser;
    _sessionUserId = newId;
    return { $id: newId, name, email, emailVerification: false, $createdAt: now };
  },

  async createEmailPasswordSession(email: string, _password: string): Promise<void> {
    const entry = Object.entries(_collections.users).find(([_, u]) => u.email === email);
    if (!entry) throw new Error('[Mock] No account found with that email. Try: alex@vimore.com');
    _sessionUserId = entry[0];
  },

  async deleteSession(_type: string): Promise<void> {
    _sessionUserId = null;
  },
};

export const databases = {
  async getDocument(_db: string, col: string, id: string): Promise<any> {
    const doc = getCol(col)[id];
    if (!doc) throw new Error(`[Mock] Document '${id}' not found in '${col}'`);
    return { ...doc };
  },

  async listDocuments(_db: string, col: string, queries: any[] = []): Promise<any> {
    const docs = Object.values(getCol(col));
    return applyQueries(docs, queries);
  },

  async createDocument(_db: string, col: string, id: string, data: any): Promise<any> {
    const docId = (id === 'unique()' || !id) ? ID.unique() : id;
    const doc = {
      ...data,
      $id: docId,
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
    };
    getCol(col)[docId] = doc;
    return { ...doc };
  },

  async updateDocument(_db: string, col: string, id: string, data: any): Promise<any> {
    const existing = getCol(col)[id];
    if (!existing) throw new Error(`[Mock] Document '${id}' not found in '${col}'`);
    const updated = { ...existing, ...data, $updatedAt: new Date().toISOString() };
    getCol(col)[id] = updated;
    return { ...updated };
  },

  async deleteDocument(_db: string, col: string, id: string): Promise<void> {
    delete getCol(col)[id];
  },
};

export const storage = {
  async createFile(_bucket: string, _id: string, file: File): Promise<any> {
    const mockId = 'file_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    try {
      const url = URL.createObjectURL(file);
      _uploadedFiles[mockId] = url;
    } catch { /* ignore in SSR */ }
    return { $id: mockId };
  },
};

export function getFileUrl(_bucketId: string, fileId: string): string {
  if (!fileId) return '';
  if (_uploadedFiles[fileId]) return _uploadedFiles[fileId];
  return '';
}

export function extractFileId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/\/files\/([^\/\?]+)/);
  if (match) return match[1];
  const seedMatch = url.match(/seed\/([^\/\?]+)/);
  if (seedMatch) return seedMatch[1];
  if (url.startsWith('blob:') || url.startsWith('http')) {
    const existing = Object.entries(_uploadedFiles).find(([_, v]) => v === url);
    if (existing) return existing[0];
  }
  return null;
}

export function formatTimeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}

export function avatarFallback(_name?: string): string {
  return '';
}
