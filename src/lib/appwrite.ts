
/**
 * @fileOverview ViMore Prototype Vault Stubs
 * Backend services decommissioned. Local Hardware Pulse active.
 */

export const endpoint = 'prototype';
export const project = 'vimore';
export const apiKey = 'prototype_key';

export const ID = {
  unique: () => Math.random().toString(36).substring(2, 12).toUpperCase()
};

export const Query = {
  equal: (a: any, b: any) => ({ a, b }),
  orderDesc: (a: any) => ({ a }),
  limit: (a: any) => ({ a }),
  greaterThan: (a: any, b: any) => ({ a, b })
};

export const BUCKET_VOICENOTE = 'voicenote';
export const BUCKET_MUSIC = 'music';
export const BUCKET_STORIES = 'stories';
export const BUCKET_PAYMENTS = 'payments';
export const BUCKET_REEL = 'reel';
export const BUCKET_IMAGES = 'images';

export const APPWRITE_DATABASE_ID = 'local_vault';
export const PROFILES_COLLECTION_ID = 'profiles';
export const POSTS_COLLECTION_ID = 'posts';
export const COMMENTS_COLLECTION_ID = 'comments';
export const MESSAGES_COLLECTION_ID = 'messages';
export const CLUSTERS_COLLECTION_ID = 'clusters';
export const NOTIFICATIONS_COLLECTION_ID = 'notifications';

export default {};
