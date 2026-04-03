'use server';

import { RtcTokenBuilder, RtcRole } from 'agora-token';

export async function generateAgoraToken(channelName: string, uid: number): Promise<string> {
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appId || !appCertificate) {
    throw new Error('Agora credentials are not configured.');
  }

  const tokenExpirationInSecond = 3600;
  const privilegeExpirationInSecond = 3600;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    RtcRole.PUBLISHER,
    tokenExpirationInSecond,
    privilegeExpirationInSecond
  );

  return token;
}
