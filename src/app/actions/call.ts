'use server';

import { RtcTokenBuilder, RtcRole } from 'agora-token';

export async function generateAgoraToken(channelName: string, uid: number): Promise<string> {
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appId || !appCertificate) {
    throw new Error('Agora credentials not configured');
  }

  const tokenExpirySeconds = 3600;
  const privilegeExpireTime = Math.floor(Date.now() / 1000) + tokenExpirySeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    RtcRole.PUBLISHER,
    privilegeExpireTime,
    privilegeExpireTime
  );

  return token;
}
