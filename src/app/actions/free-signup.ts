'use server';

import { ID, Query } from 'node-appwrite';
import { getAdminDatabases, getAdminUsers, DATABASE_ID } from '@/lib/appwrite-server';
import { COL } from '@/lib/appwrite';

export async function freeModeSignupAction(input: {
  name: string;
  email: string;
  password: string;
  username: string;
  dob: string;
  nationality: string;
  gender: string;
  referredBy?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const users = getAdminUsers();
    const db = getAdminDatabases();

    const authUser = await users.create(
      ID.unique(),
      input.email.toLowerCase().trim(),
      undefined,
      input.password,
      input.name.trim(),
    );

    const existing = await db.listDocuments(DATABASE_ID, COL.USERS, [Query.limit(1)]);
    const assignedRole = existing.total === 0 ? 'SUPER' : 'USER';

    const cleanUsername = input.username.toLowerCase().replace(/[^a-z0-9._]/g, '');
    const referralCode = `VM${cleanUsername.toUpperCase().slice(0, 6)}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

    await db.createDocument(DATABASE_ID, COL.USERS, authUser.$id, {
      name: input.name.trim(),
      username: cleanUsername,
      email: input.email.toLowerCase().trim(),
      bio: '',
      category: '',
      is_verified: false,
      has_ever_been_verified: false,
      followers_count: 0,
      following_count: 0,
      friends_count: 0,
      posts_count: 0,
      gold_balance: 0,
      diamond_balance: 0,
      star_balance: 0,
      role: assignedRole,
      join_date: new Date().toISOString(),
      nationality: input.nationality || '',
      date_of_birth: input.dob || '',
      gender: input.gender || '',
      referral_code: referralCode,
      referral_count: 0,
      language: 'en',
      security_question: '',
      security_answer: '',
    });

    // ── Credit referrer if a referral code was passed ──────────────────────
    if (input.referredBy) {
      try {
        const referrerRes = await db.listDocuments(DATABASE_ID, COL.USERS, [
          Query.equal('username', input.referredBy.toLowerCase().trim()),
          Query.limit(1),
        ]);
        const referrerDoc = referrerRes.documents[0];
        if (referrerDoc && referrerDoc.$id !== authUser.$id) {
          const referralBonus = 5000;
          await Promise.allSettled([
            db.updateDocument(DATABASE_ID, COL.USERS, referrerDoc.$id, {
              star_balance: (referrerDoc.star_balance || 0) + referralBonus,
              referral_count: (referrerDoc.referral_count || 0) + 1,
            }),
            db.createDocument(DATABASE_ID, COL.NOTIFICATIONS, ID.unique(), {
              user_id: referrerDoc.$id,
              type: 'SYSTEM',
              title: 'Referral Bonus!',
              content: `${input.name.trim()} joined via your referral link. You earned ${referralBonus.toLocaleString()} stars!`,
              message: `${input.name.trim()} joined via your referral link. You earned ${referralBonus.toLocaleString()} stars!`,
              is_read: false,
            }),
          ]);
        }
      } catch { /* non-blocking — referral credit failure must not break signup */ }
    }

    return { success: true, message: 'Account created! You can now log in.' };
  } catch (err: any) {
    if (err?.code === 409 || err?.type === 'user_already_exists') {
      return { success: false, message: 'An account with this email already exists.' };
    }
    return { success: false, message: err?.message || 'Signup failed. Please try again.' };
  }
}
