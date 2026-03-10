'use server';

import { createAdminClient, APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, VERIFICATION_CODES_COLLECTION_ID, ID, Query } from '@/lib/appwrite';

/**
 * @fileOverview ViMore Authentication & Identity Engine
 * Synchronized with Brevo for high-velocity identity verification.
 * Targets self-hosted infrastructure at mediatechliberia.online.
 */

const BREVO_API_KEY = 'xsmtpsib-e312d724da435dfd9439e137787bcabd6e79177df29486e94988a942f1dca779-u4blpxru9peb8UCN';

/**
 * Materializes a transmission pulse to the user via Brevo.
 */
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
              <h1 style="color: #9940E5; text-transform: uppercase; font-style: italic; letter-spacing: -1px; margin: 0;">ViMore</h1>
              <p style="font-size: 16px; color: #333; font-weight: bold; margin-top: 20px;">Your spatial verification code is:</p>
              <div style="font-size: 48px; font-weight: 900; letter-spacing: 10px; color: #9940E5; padding: 30px 0; font-family: monospace;">${code}</div>
              <p style="font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 30px;">Valid for 2 minutes only. Do not share this signature.</p>
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 10px; color: #999; letter-spacing: 1px;">
                SENT BY MEDIA TECH LIBERIA COMMAND CORE
              </div>
            </div>
          `
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, message: error.message || "Email pulse failed." };
      }
    } else {
      // Brevo Transactional SMS Protocol
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
        return { success: false, message: error.message || "SMS pulse failed." };
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Generates and archives a verification signature before emission.
 */
export async function sendVerificationCodeAction(identifier: string, type: 'EMAIL' | 'PHONE') {
  const { databases } = createAdminClient();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + (2 * 60 * 1000); // 2 minute temporal pulse

  try {
    // 1. Archive the signature in the self-hosted vault
    await databases.createDocument(
      APPWRITE_DATABASE_ID,
      VERIFICATION_CODES_COLLECTION_ID,
      ID.unique(),
      { identifier, code, expiresAt, type }
    );

    // 2. Emit the pulse via Brevo Dispatcher
    const transmission = await sendCodeViaBrevo({ identifier, code, type });
    return transmission;
  } catch (error: any) {
    console.error("OTP HANDSHAKE ERROR:", error.message);
    return { success: false, message: error.message || "Failed to emit OTP pulse." };
  }
}

/**
 * Validates a temporal signature against the vault.
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
      return { success: true };
    }
    
    return { success: false, message: "Invalid or expired signature." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Materializes a new identity node in the network.
 */
export async function signupServerAction(d: any) {
  const { account, databases } = createAdminClient();
  const userId = ID.unique();
  const safePhone = d.phone ? d.phone.replace(/[^0-9]/g, '') : '';
  const emailNode = d.email || `${safePhone}@vimore.net`;

  try {
    // 1. Create Auth Account
    await account.create(userId, emailNode, d.password, d.name);

    // 2. Create Identity Profile in profiles collection
    await databases.createDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, userId, {
      name: d.name,
      username: d.username,
      email: emailNode,
      phone: d.phone || '',
      avatar: "https://picsum.photos/seed/guest/400/400",
      cover: "",
      role: 'USER',
      isVerified: false,
      goldBalance: 0,
      diamondBalance: 0,
      starBalance: 0,
      referralCount: 0,
      referredBy: d.referredBy || '',
      bio: "",
      nationality: d.nationality || "Other",
      gender: d.gender || "Other",
      dateOfBirth: d.dob || "",
      joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    });

    return { success: true, userId };
  } catch (e: any) {
    console.error("SIGNUP HANDSHAKE FAILURE:", e.message);
    return { success: false, message: e.message || "Signup handshake failed." };
  }
}

/**
 * Validates login credentials and returns the primary email node.
 */
export async function loginServerAction(identifier: string, p: string) {
  const { databases } = createAdminClient();
  let emailNode = identifier;

  try {
    // Phone-to-Email resolution handshake
    if (!identifier.includes('@')) {
      const res = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [
        Query.equal('phone', identifier)
      ]);
      if (res.total === 0) return { success: false, message: "Phone node not found in registry." };
      emailNode = res.documents[0].email;
    }

    return { success: true, email: emailNode };
  } catch (e: any) {
    console.error("LOGIN HANDSHAKE FAILURE:", e.message);
    return { success: false, message: e.message || "Login handshake failed." };
  }
}
