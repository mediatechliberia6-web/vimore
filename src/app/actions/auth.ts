'use server';

import { createAdminClient, APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, VERIFICATION_CODES_COLLECTION_ID, ID, Query } from '@/lib/appwrite';
import { cookies } from 'next/headers';

/**
 * @fileOverview ViMore Authentication & Identity Engine
 * Handles secure identity pulses and Brevo transmissions.
 */

const BREVO_API_KEY = 'xsmtpsib-e312d724da435dfd9439e137787bcabd6e79177df29486e94988a942f1dca779-u4blpxru9peb8UCN';

export async function sendCodeViaBrevo(input: { identifier: string, code: string, type: 'EMAIL' | 'PHONE' }) {
  const { identifier, code, type } = input;

  try {
    if (type === 'EMAIL') {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': BREVO_API_KEY,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'ViMore Network', email: 'no-reply@vimore.network' },
          to: [{ email: identifier }],
          subject: `${code} is your ViMore Verification Code`,
          htmlContent: `
            <div style="font-family: sans-serif; padding: 40px; background: #F2ECF7; border-radius: 20px; border: 2px solid #9940E5;">
              <h1 style="color: #9940E5; text-transform: uppercase; font-style: italic; letter-spacing: -1px;">ViMore Sync</h1>
              <p style="font-size: 16px; color: #333; font-weight: bold;">Your spatial verification code is:</p>
              <div style="font-size: 48px; font-weight: 900; letter-spacing: 10px; color: #9940E5; padding: 20px 0; font-family: monospace;">${code}</div>
              <p style="font-size: 12px; color: #666; text-transform: uppercase;">Valid for 2 minutes only. Do not share this signature.</p>
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 10px; color: #999;">
                SENT BY MEDIA TECH LIBERIA COMMAND CORE
              </div>
            </div>
          `
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Email pulse failed.");
      }
    } else {
      const response = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': BREVO_API_KEY,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          type: 'transactional',
          sender: 'ViMore',
          recipient: identifier,
          content: `${code} is your ViMore sync code. Valid for 2 mins. MTL Core.`
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "SMS pulse failed.");
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("BREVO_PROTOCOL_ERROR:", error.message);
    throw new Error(error.message);
  }
}

/**
 * Server-Side Handshake: OTP Generation
 * Materializes code in vault and transmits via Brevo.
 */
export async function sendVerificationCodeAction(identifier: string, type: 'EMAIL' | 'PHONE') {
  const { databases } = createAdminClient();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + (2 * 60 * 1000); // 2 minute temporal pulse

  try {
    // 1. Archive in vault
    await databases.createDocument(
      APPWRITE_DATABASE_ID,
      VERIFICATION_CODES_COLLECTION_ID,
      ID.unique(),
      { identifier, code, expiresAt, type }
    );

    // 2. Transmit via Brevo
    await sendCodeViaBrevo({ identifier, code, type });
    
    return { success: true };
  } catch (error: any) {
    console.error("OTP_PULSE_ERROR:", error.message);
    // If 404, the collection verification_codes might be missing in Appwrite console
    throw new Error(error.message || "Failed to emit OTP pulse.");
  }
}

/**
 * Server-Side Handshake: OTP Verification
 */
export async function verifyCodeAction(identifier: string, code: string) {
  const { databases } = createAdminClient();

  try {
    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      VERIFICATION_CODES_COLLECTION_ID,
      [
        Query.equal('identifier', identifier),
        Query.equal('code', code),
        Query.greaterThan('expiresAt', Date.now())
      ]
    );

    if (res.total > 0) {
      // Burn the code node after successful handshake
      await databases.deleteDocument(
        APPWRITE_DATABASE_ID,
        VERIFICATION_CODES_COLLECTION_ID,
        res.documents[0].$id
      );
      return { success: true };
    }
    
    return { success: false, message: "Invalid or expired signature." };
  } catch (error: any) {
    console.error("VERIFY_PULSE_ERROR:", error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Server-Side Handshake: Signup
 * Creates the auth node and identity profile in one atomic pulse.
 */
export async function signupServerAction(d: any) {
  const { account, databases } = createAdminClient();
  const userId = ID.unique();
  const safePhone = d.phone ? d.phone.replace(/[^0-9]/g, '') : '';
  const emailNode = d.email || `${safePhone}@vimore.net`;

  try {
    // 1. Create Auth Node
    await account.create(userId, emailNode, d.password, d.name);

    // 2. Materialize Identity Profile
    await databases.createDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, userId, {
      name: d.name,
      username: d.username,
      avatar: "https://picsum.photos/seed/guest/400/400",
      dateOfBirth: d.dob,
      nationality: d.nationality,
      gender: d.gender,
      role: 'USER',
      goldBalance: 0,
      diamondBalance: 0,
      starBalance: 0,
      referralCount: 0,
      isVerified: false,
      referredBy: d.referredBy,
      email: d.email,
      phone: d.phone
    });

    return { success: true, userId };
  } catch (e: any) {
    // Cleanup if partially created
    try { await account.delete(userId); } catch (err) {}
    throw new Error(e.message || "Signup handshake failed.");
  }
}

/**
 * Server-Side Handshake: Login
 */
export async function loginServerAction(identifier: string, p: string) {
  const { account, databases } = createAdminClient();
  let emailNode = identifier;

  try {
    if (!identifier.includes('@')) {
      // Find associated email for phone node
      const res = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [
        Query.equal('phone', identifier)
      ]);
      if (res.total === 0) throw new Error("Phone node not found.");
      emailNode = res.documents[0].email;
    }

    return { success: true, email: emailNode };
  } catch (e: any) {
    throw new Error(e.message || "Login handshake failed.");
  }
}
