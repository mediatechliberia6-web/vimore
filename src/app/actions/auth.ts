
'use server';

import { createAdminClient, APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, ID, Query } from '@/lib/appwrite';

/**
 * @fileOverview ViMore Authentication & Identity Engine
 * Optimized for Next.js 15 Native FormData Handshake.
 * Targets self-hosted infrastructure at mediatechliberia.online.
 */

/**
 * Materializes a new identity node in the network using FormData.
 * Returns a plain serializable object to prevent Next.js router crashes.
 */
export async function signupServerAction(formData: FormData) {
  try {
    const { users, databases } = createAdminClient();
    const userId = ID.unique();
    
    // Extract nodes from FormData
    const name = formData.get('name') as string;
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;
    const dob = formData.get('dob') as string;
    const nationality = formData.get('nationality') as string;
    const gender = formData.get('gender') as string;
    const referredBy = formData.get('referredBy') as string;

    // 1. Phone Calibration (No-Zero Protocol)
    let safePhone = phone ? phone.replace(/[^0-9+]/g, '') : '';
    if (safePhone.startsWith('+')) {
      const countryCode = safePhone.slice(0, 4); // Assume 4 digit code like +231
      const numberPart = safePhone.slice(4);
      if (numberPart.startsWith('0')) {
        safePhone = countryCode + numberPart.slice(1);
      }
    }

    const emailNode = email || `${safePhone.replace('+', '')}@vimore.net`;

    // 2. Sovereignty Handshake (SUPER check)
    let role = 'USER';
    try {
      const existingProfiles = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.limit(1)]);
      if (existingProfiles.total === 0) {
        role = 'SUPER';
        console.log("[SOVEREIGNTY] First node detected. Assigning SUPER role.");
      }
    } catch (e) {
      console.warn("Governance node query stalled, defaulting to USER role.");
    }

    // 3. Auth Node Creation (Administrative Users Service)
    try {
      await users.create(
        userId,
        emailNode,
        safePhone || undefined,
        password,
        name
      );
    } catch (authErr: any) {
      console.error("[AUTH ERROR]", authErr.message);
      return { success: false, message: `Auth Rejection: ${String(authErr.message || authErr)}` };
    }

    // 4. Deep Profile Archival
    try {
      const profilePayload = {
        name: String(name || "Unknown Node"),
        username: String(username || `user_${userId.slice(0, 5)}`),
        email: String(emailNode),
        phone: String(safePhone),
        avatar: "https://picsum.photos/seed/guest/400/400",
        cover: "",
        role: String(role),
        isVerified: false,
        goldBalance: 0,
        diamondBalance: 0,
        starBalance: 0,
        referralCount: 0,
        referredBy: referredBy || null,
        bio: "",
        nationality: String(nationality || "Other"),
        gender: String(gender || "Other"),
        dateOfBirth: String(dob || ""),
        joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        isEmailVerified: true // INSTANT ACCESS PROTOCOL
      };

      await databases.createDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, userId, profilePayload);
      
      return { success: true, userId };
    } catch (dbErr: any) {
      console.error("[DATABASE SCHEMA ERROR]", dbErr.message);
      return { 
        success: false, 
        message: `Vault Schema Rejection: ${String(dbErr.message || dbErr)}` 
      };
    }
  } catch (terminalErr: any) {
    console.error("[TERMINAL ACTION ERROR]", terminalErr.message);
    return { success: false, message: "System Core Failure during handshake." };
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
    console.error("[VAULT ERROR] login:", e.message);
    return { success: false, message: String(e.message || e) };
  }
}
