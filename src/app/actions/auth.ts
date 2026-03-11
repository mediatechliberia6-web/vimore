
'use server';

import { createAdminClient, APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, VERIFICATION_CODES_COLLECTION_ID, ID, Query } from '@/lib/appwrite';

/**
 * @fileOverview ViMore Authentication & Identity Engine
 * Optimized for Appwrite-Native Verification.
 * Targets self-hosted infrastructure at mediatechliberia.online.
 */

/**
 * Materializes a new 6-digit verification code in the vault.
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
      expiresAt: Number(expiresAt)
    });

    console.log(`[IDENTITY HANDSHAKE] Verification code for ${identifier}: ${code}`);

    return { success: true };
  } catch (e: any) {
    console.error("[VAULT ERROR] sendVerificationCode:", e.message);
    return { success: false, message: `Vault Pulse Error: ${String(e.message || e)}` };
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
    console.error("[VAULT ERROR] verifyCode:", e.message);
    return { success: false, message: `Handshake Failed: ${String(e.message || e)}` };
  }
}

/**
 * Materializes a new identity node in the network.
 * Wrapped in a terminal try/catch to prevent Next.js 15 serialization crashes.
 */
export async function signupServerAction(inputData: any) {
  try {
    const { users, databases } = createAdminClient();
    const userId = ID.unique();
    
    // 1. Phone Calibration (No-Zero Protocol)
    let safePhone = inputData.phone ? inputData.phone.replace(/[^0-9+]/g, '') : '';
    if (safePhone.startsWith('+')) {
      const countryCode = safePhone.slice(0, 4); // Assume 4 digit code like +231
      const numberPart = safePhone.slice(4);
      if (numberPart.startsWith('0')) {
        safePhone = countryCode + numberPart.slice(1);
      }
    }

    const emailNode = inputData.email || `${safePhone.replace('+', '')}@vimore.net`;

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
        inputData.password,
        inputData.name
      );
    } catch (authErr: any) {
      console.error("[AUTH ERROR]", authErr.message);
      return { success: false, message: `Auth Rejection: ${String(authErr.message || authErr)}` };
    }

    // 4. Deep Profile Sanitization & Archival
    try {
      const profilePayload = {
        name: String(inputData.name || "Unknown Node"),
        username: String(inputData.username || `user_${userId.slice(0, 5)}`),
        email: String(emailNode),
        phone: String(safePhone),
        avatar: String(inputData.avatar || "https://picsum.photos/seed/guest/400/400"),
        cover: String(inputData.cover || ""),
        role: String(role),
        isVerified: false,
        goldBalance: 0,
        diamondBalance: 0,
        starBalance: 0,
        referralCount: 0,
        referredBy: inputData.referredBy ? String(inputData.referredBy) : null,
        bio: String(inputData.bio || ""),
        nationality: String(inputData.nationality || "Other"),
        gender: String(inputData.gender || "Other"),
        dateOfBirth: String(inputData.dob || ""),
        joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        isEmailVerified: false
      };

      await databases.createDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, userId, profilePayload);
      
      return { success: true, userId, email: emailNode, phone: safePhone };
    } catch (dbErr: any) {
      console.error("[DATABASE SCHEMA ERROR]", dbErr.message);
      return { 
        success: false, 
        message: `Vault Schema Rejection: ${String(dbErr.message || dbErr)}` 
      };
    }
  } catch (terminalErr: any) {
    console.error("[TERMINAL ACTION ERROR]", terminalErr.message);
    return { success: false, message: `System Core Failure: ${String(terminalErr.message || terminalErr)}` };
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
