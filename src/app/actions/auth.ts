
'use server';

import { createAdminClient, APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, ID, Query } from '@/lib/appwrite';

/**
 * @fileOverview ViMore Authentication & Identity Engine
 * Optimized for Direct-Entry Architecture.
 * Targets self-hosted infrastructure at mediatechliberia.online.
 */

/**
 * Materializes a new identity node in the network.
 * RETURNS: SERIALIZABLE OBJECT ONLY.
 */
export async function signupServerAction(d: any) {
  try {
    const { account, databases } = createAdminClient();
    const userId = ID.unique();
    const safePhone = d.phone ? d.phone.replace(/[^0-9]/g, '') : '';
    const emailNode = d.email || `${safePhone}@vimore.net`;

    // 1. Create Auth Identity
    await account.create(userId, emailNode, d.password, d.name);

    // 1.5 Determine Role (Sovereignty Handshake)
    // Check if any profiles exist in the vault yet.
    const existingProfiles = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.limit(1)]);
    const role = existingProfiles.total === 0 ? 'SUPER' : 'USER';

    // 2. Materialize Profile Node
    // Ensuring fallback for all attributes to prevent required field crash
    await databases.createDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, userId, {
      name: d.name || "Unknown Node",
      username: d.username || `user_${userId.slice(0, 5)}`,
      email: emailNode,
      phone: d.phone || '',
      avatar: "https://picsum.photos/seed/guest/400/400",
      cover: "",
      role: role,
      isVerified: false,
      goldBalance: 0,
      diamondBalance: 0,
      starBalance: 0,
      referralCount: 0,
      referredBy: d.referredBy || '',
      bio: d.bio || "",
      nationality: d.nationality || "Other",
      gender: d.gender || "Other",
      dateOfBirth: d.dob || "",
      joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    });

    return { success: true, userId, email: emailNode };
  } catch (e: any) {
    return { success: false, message: String(e.message || e) };
  }
}

/**
 * Validates login credentials and returns the primary email node.
 */
export async function loginServerAction(identifier: string, p: string) {
  try {
    const { databases } = createAdminClient();
    let emailNode = identifier;

    if (!identifier.includes('@')) {
      const res = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [
        Query.equal('phone', identifier)
      ]);
      if (res.total === 0) return { success: false, message: "Phone node not found in registry." };
      emailNode = res.documents[0].email;
    }

    return { success: true, email: emailNode };
  } catch (e: any) {
    return { success: false, message: String(e.message || e) };
  }
}
