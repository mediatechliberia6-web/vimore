'use server';

import { ID, Query } from 'node-appwrite';
import crypto from 'crypto';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import {
  getAdminDatabases,
  getAdminUsers,
  DATABASE_ID,
  VERIFICATIONS_COLLECTION_ID,
} from '@/lib/appwrite-server';

const SENDER_EMAIL = 'MS_I70NGh@vimore.cfd';
const SENDER_NAME = 'ViMore';
const FREE_DOMAIN = 'https://free.vimore.cfd';
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function getMailerSend(): MailerSend {
  const apiKey = process.env.MAILERSEND_API_KEY;
  if (!apiKey) throw new Error('MAILERSEND_API_KEY is not set');
  return new MailerSend({ apiKey });
}

export async function freeModeSignupAction(input: {
  name: string;
  email: string;
  password: string;
  username: string;
  dob: string;
  nationality: string;
  gender: string;
}): Promise<{ success: boolean; message: string }> {
  const databases = getAdminDatabases();
  const usersClient = getAdminUsers();

  let userId: string;

  try {
    const user = await usersClient.create(
      ID.unique(),
      input.email,
      undefined,
      input.password,
      input.name
    );
    userId = user.$id;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes('already exists') || msg.includes('409')) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    return { success: false, message: 'Failed to create account. Please try again.' };
  }

  const token = generateToken();
  const expiresAt = Date.now() + TOKEN_TTL_MS;

  try {
    await databases.createDocument(
      DATABASE_ID,
      VERIFICATIONS_COLLECTION_ID,
      ID.unique(),
      { userId, token, expiresAt }
    );
  } catch {
    await usersClient.delete(userId).catch(() => {});
    return { success: false, message: 'Failed to create verification record. Please try again.' };
  }

  const verifyLink = `${FREE_DOMAIN}/verify?token=${token}`;

  try {
    const mailerSend = getMailerSend();
    const emailParams = new EmailParams()
      .setFrom(new Sender(SENDER_EMAIL, SENDER_NAME))
      .setTo([new Recipient(input.email, input.name)])
      .setSubject('Verify your ViMore account')
      .setHtml(buildEmailHtml(input.name, verifyLink))
      .setText(`Hi ${input.name},\n\nVerify your ViMore account by visiting:\n${verifyLink}\n\nThis link expires in 24 hours.`);

    await mailerSend.email.send(emailParams);
  } catch {
    return { success: false, message: 'Account created but we could not send the verification email. Please contact support.' };
  }

  return { success: true, message: 'Account created! Please check your email to verify your account.' };
}

export async function verifyEmailTokenAction(
  token: string
): Promise<{ success: boolean; message: string }> {
  if (!token || token.length < 10) {
    return { success: false, message: 'Invalid verification link.' };
  }

  const databases = getAdminDatabases();
  const usersClient = getAdminUsers();

  let docId: string;
  let userId: string;
  let expiresAt: number;

  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      VERIFICATIONS_COLLECTION_ID,
      [Query.equal('token', token)]
    );

    if (result.documents.length === 0) {
      return { success: false, message: 'Verification link is invalid or has already been used.' };
    }

    const doc = result.documents[0];
    docId = doc.$id;
    userId = doc.userId as string;
    expiresAt = doc.expiresAt as number;
  } catch {
    return { success: false, message: 'Could not look up your verification token. Please try again.' };
  }

  if (Date.now() > expiresAt) {
    await databases.deleteDocument(DATABASE_ID, VERIFICATIONS_COLLECTION_ID, docId).catch(() => {});
    return { success: false, message: 'This verification link has expired. Please sign up again.' };
  }

  try {
    await usersClient.updateEmailVerification(userId, true);
  } catch {
    return { success: false, message: 'Failed to verify your account. Please contact support.' };
  }

  await databases.deleteDocument(DATABASE_ID, VERIFICATIONS_COLLECTION_ID, docId).catch(() => {});

  return { success: true, message: 'Your email has been verified! You can now log in.' };
}

function buildEmailHtml(name: string, link: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify your ViMore account</title>
</head>
<body style="margin:0;padding:0;background:#F0F2F5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F2F5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#7c3aed;padding:32px;text-align:center;">
              <span style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-1px;">ViMore</span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 48px;">
              <p style="font-size:18px;font-weight:700;color:#111827;margin:0 0 12px;">Hi ${name},</p>
              <p style="font-size:15px;color:#6b7280;line-height:1.6;margin:0 0 32px;">
                Thanks for joining ViMore Free Mode. Click the button below to verify your email address and activate your account. This link expires in <strong>24 hours</strong>.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="background:#7c3aed;border-radius:10px;">
                    <a href="${link}" style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">Verify My Account</a>
                  </td>
                </tr>
              </table>
              <p style="font-size:12px;color:#9ca3af;line-height:1.6;margin:0;">
                If the button doesn't work, copy and paste this link into your browser:<br/>
                <a href="${link}" style="color:#7c3aed;word-break:break-all;">${link}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:20px 48px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="font-size:11px;color:#9ca3af;margin:0;">© ${new Date().getFullYear()} ViMore — Media Tech Liberia. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
