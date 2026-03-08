'use server';

/**
 * @fileOverview ViMore Brevo Handshake Engine
 * Handles the transmission of 6-digit temporal codes via Email or SMS.
 * Reverted to hardcoded credentials for immediate sync.
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
          recipient: identifier, // E.164 format expected
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
