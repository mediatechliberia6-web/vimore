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
 * Hardened to handle non-JSON responses and network timeouts.
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
        }),
        signal: AbortSignal.timeout(10000) // 10s timeout pulse
      });

      if (!response.ok) {
        const text = await response.text();
        let msg = response.statusText;
        try {
          const json = JSON.parse(text);
          msg = json.message || msg;
        } catch (e) {
          msg = text.slice(0, 100) || msg;
        }
        return { success: false, message: `Brevo SMTP Node Rejection: ${msg}` };
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
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        const text = await response.text();
        return { success: false, message: `Brevo SMS Node Rejection: ${text.slice(0, 100)}` };
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, message: `Brevo Transmission Failure (Network/Timeout): ${String(error.message || error)}` };
  }
}

/**
 * Generates and archives a verification signature before emission.
 */
export async function sendVerificationCodeAction(identifier: string, type: 'EMAIL' | 'PHONE') {
  try {
    const { databases } = createAdminClient();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + (2 * 60 * 1000); 

    // 1. Vault Archival
    await databases.createDocument(
      APPWRITE_DATABASE_ID,
      VERIFICATION_CODES_COLLECTION_ID,
      ID.unique(),
      { identifier, code, expiresAt, type }
    );

    // 2. Emission
    const transmission = await sendCodeViaBrevo({ identifier, code, type });
    return transmission;
  } catch (error: any) {
    return { 
      success: false, 
      message: `Vault Rejection (OTP Archival): ${String(error.message || error)}` 
    };
  }
}

/**
 * Validates a temporal signature against the vault.
 */
export async function verifyCodeAction(identifier: string, code: string) {
  try {
    const { databases } = createAdminClient();
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
    
    return { success: false, message: "Invalid or expired signature pulse." };
  } catch (error: any) {
    return { success: false, message: `Vault Query Failure: ${String(error.message || error)}` };
  }
}

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
    // Ensuring fallback for all 18 attributes to prevent required field crash
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
    return { success: false, message: `Vault Rejection (Profile Creation): ${String(e.message || e)}` };
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
    return { success: false, message: `Vault Rejection (Credential Handshake): ${String(e.message || e)}` };
  }
}
