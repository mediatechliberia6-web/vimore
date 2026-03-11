
'use server';

import { createAdminClient, APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, ID, Query } from '@/lib/appwrite';

/**
 * @fileOverview ViMore Unified Identity Pulse (Server-Side)
 * Optimized for Next.js 15 Plain Object Handshake.
 * Materializes identity nodes in the self-hosted MTL Command Core.
 */

export async function signupServerAction(input: {
  email?: string;
  phone?: string;
  password: string;
  name: string;
  username: string;
  dob: string;
  nationality: string;
  gender: string;
  referredBy?: string;
}) {
  try {
    const { users, databases } = createAdminClient();
    const userId = ID.unique();
    
    // 1. Attribute Normalization
    const emailNode = input.email || `${input.phone?.replace('+', '') || userId}@vimore.net`;
    const safePhone = input.phone || undefined;
    const safeReferrer = input.referredBy && input.referredBy.trim() !== "" ? input.referredBy : null;

    // 2. Sovereignty Handshake (SUPER node check)
    let role = 'USER';
    try {
      const existingProfiles = await databases.listDocuments(
        APPWRITE_DATABASE_ID, 
        PROFILES_COLLECTION_ID, 
        [Query.limit(1)]
      );
      if (existingProfiles.total === 0) {
        role = 'SUPER';
        console.log("[SOVEREIGNTY] Inaugural node detected. Assigning SUPER authority.");
      }
    } catch (e) {
      console.warn("Governance query stalled, defaulting to USER node.");
    }

    // 3. Administrative Identity Creation
    try {
      await users.create(
        userId,
        emailNode,
        safePhone,
        input.password,
        input.name
      );
    } catch (authErr: any) {
      console.error("[AUTH ERROR]", authErr.message);
      return { success: false, message: `Vault Rejection: ${String(authErr.message)}` };
    }

    // 4. Deep Profile Archival
    try {
      const profilePayload = {
        name: String(input.name),
        username: String(input.username).toLowerCase().replace(/\s+/g, '_'),
        email: String(emailNode),
        phone: String(input.phone || ""),
        avatar: "https://picsum.photos/seed/guest/400/400",
        cover: "",
        role: String(role),
        isVerified: false,
        goldBalance: 0,
        diamondBalance: 0,
        starBalance: 0,
        referralCount: 0,
        referredBy: safeReferrer,
        bio: "",
        nationality: String(input.nationality || "Other"),
        gender: String(input.gender || "Other"),
        dateOfBirth: String(input.dob || ""),
        joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        isEmailVerified: true // INSTANT ACCESS PROTOCOL
      };

      await databases.createDocument(
        APPWRITE_DATABASE_ID, 
        PROFILES_COLLECTION_ID, 
        userId, 
        profilePayload
      );
      
      return { success: true, userId };
    } catch (dbErr: any) {
      console.error("[DATABASE SCHEMA ERROR]", dbErr.message);
      // Attempt to purge the orphan auth node if archival fails
      try { await users.delete(userId); } catch (e) {}
      return { 
        success: false, 
        message: `Profile Archival Stalled: ${String(dbErr.message)}` 
      };
    }
  } catch (terminalErr: any) {
    console.error("[TERMINAL ACTION ERROR]", terminalErr.message);
    return { success: false, message: "System core failed to stabilize the handshake." };
  }
}

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
    console.error("[VAULT ERROR] login:", e.message);
    return { success: false, message: String(e.message || e) };
  }
}
