import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { channelName, uid } = await request.json();

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || '4afa1dbbd2ee4695ad1d29eaa0310ca3';
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      return NextResponse.json({ token: '' });
    }

    const { RtcTokenBuilder, RtcRole } = await import('agora-token');

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

    return NextResponse.json({ token });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Token generation failed' }, { status: 500 });
  }
}
