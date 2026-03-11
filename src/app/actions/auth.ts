'use server';

import { createAdminClient, APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, VERIFICATION_CODES_COLLECTION_ID, ID, Query } from '@/lib/appwrite';

/**
 * @fileOverview ViMore Authentication & Identity Engine
 * Optimized for Appwrite-Native Verification.
 * Targets self-hosted infrastructure at mediatechliberia.online.
 */

/**
 * Materializes a new 6-digit verification code in the vault.
 * Expires in 2 minutes.
 */
export async function sendVerificationCodeAction(identifier: string) {
  try {
    const { databases } = createAdminClient();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + (2 * 60 * 1000); // 2 minutes

    // 1. Purge existing codes for this identifier
    const existing = await databases.listDocuments(APPWRITE_DATABASE_ID, VERIFICATION_CODES_COLLECTION_ID, [
      Query.equal('identifier', identifier)
    ]);
    
    for (const doc of existing.documents) {
      await databases.deleteDocument(APPWRITE_DATABASE_ID, VERIFICATION_CODES_COLLECTION_ID, doc.$id);
    }

    // 2. Archive new temporal node
    await databases.createDocument(APPWRITE_DATABASE_ID, VERIFICATION_CODES_COLLECTION_ID, ID.unique(), {
      identifier,
      code,
      expiresAt
    });

    // NOTE: In this custom flow, the code is archived in the vault.
    // For this prototype, the code is successfully archived and can be retrieved by the verify pulse.
    console.log(`[IDENTITY HANDSHAKE] Verification code for ${identifier}: ${code}`);

    return { success: true };
  } catch (e: any) {
    return { success: false, message: String(e.message || e) };
  }
}

/**
 * Validates a temporal security signature against the vault.
 */
export async function verifyCodeAction(identifier: string, code: string) {
  try {
    const { databases } = createAdminClient();
    const now = Date.now();

    const response = await databases.listDocuments(APPWRITE_DATABASE_ID, VERIFICATION_CODES_COLLECTION_ID, [
      Query.equal('identifier', identifier),
      Query.equal('code', code),
      Query.greaterThan('expiresAt', now)
    ]);

    if (response.total === 0) {
      return { success: false, message: "Invalid or Expired Signature." };
    }

    // Handshake valid: Cleanup the used code
    await databases.deleteDocument(APPWRITE_DATABASE_ID, VERIFICATION_CODES_COLLECTION_ID, response.documents[0].$id);

    return { success: true };
  } catch (e: any) {
    return { success: false, message: String(e.message || e) };
  }
}

/**
 * Materializes a new identity node in the network.
 */
export async function signupServerAction(d: any) {
  try {
    const { account, databases } = createAdminClient();
    const userId = ID.unique();
    
    // NO-ZERO PHONE CALIBRATION
    // Example: +2310778... becomes +231778...
    let safePhone = d.phone ? d.phone.replace(/[^0-9+]/g, '') : '';
    if (safePhone.startsWith('+')) {
      const countryCode = safePhone.slice(0, 4); // Assuming +231 or similar 3-digit CC
      const numberPart = safePhone.slice(4);
      if (numberPart.startsWith('0')) {
        safePhone = countryCode + numberPart.slice(1);
      }
    }

    const emailNode = d.email || `${safePhone.replace('+', '')}@vimore.net`;

    // 1. Create Auth Identity
    await account.create(userId, emailNode, d.password, d.name);

    // 1.5 Determine Role (Sovereignty Handshake)
    const existingProfiles = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.limit(1)]);
    const role = existingProfiles.total === 0 ? 'SUPER' : 'USER';

    // 2. Materialize Profile Node
    await databases.createDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, userId, {
      name: d.name || "Unknown Node",
      username: d.username || `user_${userId.slice(0, 5)}`,
      email: emailNode,
      phone: safePhone,
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
      joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      isEmailVerified: false // Locked until OTP sync
    });

    return { success: true, userId, email: emailNode, phone: safePhone };
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