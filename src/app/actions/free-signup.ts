'use server';

import { ID } from 'node-appwrite';
import {
  getAdminUsers,
} from '@/lib/appwrite-server';

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
    return { success: false, message: `Account created but could not mark as verified: ${msg}` };
  }

  return { success: true, message: 'Account created! You can now log in.' };
}
