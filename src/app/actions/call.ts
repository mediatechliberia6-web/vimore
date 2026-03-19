
'use server';

import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { AGORA_APP_ID } from '@/lib/agora';

/**
 * @fileOverview ViMore Agora Token Forge
 * Generates secure RTC tokens for spatial node synchronization.
 */

const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || '4afa1dbbd2ee4695ad1d29eaa0310ca3';

export async function generateAgoraToken(channelName: string, uid: string | number) {
  if (!AGORA_APP_ID || !APP_CERTIFICATE) {
    throw new Error("AGORA_CREDENTIALS_MISSING: Cannot forge security token.");
  }

  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600; 
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  // Use 0 for auto-assigning UID in this pulse
  const token = RtcTokenBuilder.buildTokenWithUid(
    AGORA_APP_ID,
    APP_CERTIFICATE,
    channelName,
    0, 
    role,
    privilegeExpiredTs,
    privilegeExpiredTs
  );

  return token;
}
