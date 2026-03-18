'use server';

import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { AGORA_APP_ID } from '@/lib/agora';

/**
 * @fileOverview ViMore Agora Token Forge
 * Generates secure RTC tokens for spatial node synchronization.
 */

const APP_CERTIFICATE = '4afa1dbbd2ee4695ad1d29eaa0310ca3';

export async function generateAgoraToken(channelName: string, uid: string | number) {
  if (!AGORA_APP_ID || !APP_CERTIFICATE) {
    throw new Error("AGORA_CREDENTIALS_MISSING: Cannot forge security token.");
  }

  // Use a fixed role for the prototype handshake
  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600; // 1 hour temporal validity
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  // Forge the token using numeric UIDs (Agora standard)
  // If UID is 0, Agora assigns it automatically
  const token = RtcTokenBuilder.buildTokenWithUid(
    AGORA_APP_ID,
    APP_CERTIFICATE,
    channelName,
    0, // Use 0 for auto-assigning UID in this pulse
    role,
    privilegeExpiredTs,
    privilegeExpiredTs
  );

  return token;
}
