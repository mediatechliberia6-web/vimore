'use server';

import { ID, Query } from 'node-appwrite';
import {
  getAdminUsers,
  getAdminDatabases,
  DATABASE_ID,
} from '@/lib/appwrite-server';

const USERS_COLLECTION_ID = 'users';

export async function freeModeSignupAction(input: {
  name: string;
  email: string;
  password: string;
  username: string;
  dob: string;
  nationality: string;
  gender: string;
}): Promise<{ success: boolean; message: string }> {
  const usersClient = getAdminUsers();
  const databases = getAdminDatabases();

  let userId: string;

  try {
    const user = await usersClient.create(
      ID.unique(),
      input.email,
      undefined,
      input.password,
      input.name
    );
    userId = user.$id;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes('already exists') || msg.includes('409')) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    return { success: false, message: `Failed to create account: ${msg}` };
  }

  try {
    await usersClient.updateEmailVerification(userId, true);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    await usersClient.delete(userId).catch(() => {});
    return { success: false, message: `Could not activate account: ${msg}` };
  }

  try {
    const existing = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
      Query.limit(1),
    ]);
    const assignedRole = existing.total === 0 ? 'SUPER' : 'USER';

    const referralCode = `VM${input.username.toUpperCase().slice(0, 6)}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

    await databases.createDocument(DATABASE_ID, USERS_COLLECTION_ID, userId, {
      name: input.name,
      username: input.username,
      email: input.email,
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
      nationality: input.nationality,
      date_of_birth: input.dob,
      referral_code: referralCode,
      referral_count: 0,
      language: 'en',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    await usersClient.delete(userId).catch(() => {});
    return { success: false, message: `Failed to create user profile: ${msg}` };
  }

  return { success: true, message: 'Account created! You can now log in.' };
}
