'use server';

/**
 * @fileOverview ViMore Token Engine
 * Materializes secure temporal access keys for Agora RTC channels.
 * Reverted to hardcoded certificate for immediate handshake.
 */

import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { AGORA_APP_ID } from '@/lib/agora';

const APP_CERTIFICATE = 'ef792758166f413c962ede45ddd8fe89';

export async function generateAgoraToken(channelName: string, uid: string | number) {
  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600; // 1 hour validity
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  try {
    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      APP_CERTIFICATE,
      channelName,
      typeof uid === 'string' ? parseInt(uid) : uid,
      role,
      privilegeExpiredTs,
      privilegeExpiredTs
    );

    return token;
  } catch (error) {
    console.error("Token materialization failed:", error);
    throw new Error("Could not generate spatial access key.");
  }
}
