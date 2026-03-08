
'use server';

/**
 * @fileOverview ViMore Brevo Handshake Engine
 * Handles the transmission of 6-digit temporal codes via Email or SMS.
 * Hardened for Phase 10 with live API credentials.
 */

const BREVO_API_KEY = process.env.BREVO_API_KEY;

export async function sendCodeViaBrevo(input: { identifier: string, code: string, type: 'EMAIL' | 'PHONE' }) {
  if (!BREVO_API_KEY) {
    throw new Error("AI PROTOCOL ERROR: BREVO_API_KEY node is missing.");
  }

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
            <div style="font-family: sans-serif; padding: 40px; background: #F2ECF7; border-radius: 20px;">
              <h1 style="color: #9940E5; text-transform: uppercase; font-style: italic;">ViMore Sync</h1>
              <p style="font-size: 16px; color: #333;">Your spatial verification code is:</p>
              <div style="font-size: 48px; font-weight: 900; letter-spacing: 10px; color: #9940E5; padding: 20px 0;">${code}</div>
              <p style="font-size: 12px; color: #666; text-transform: uppercase;">Valid for 2 minutes only. Do not share this signature.</p>
            </div>
          `
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Email pulse failed.");
      }
    } else {
      // SMS Pulse logic using Brevo Transactional SMS
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
          content: `${code} is your ViMore sync code. Valid for 2 mins.`
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
