import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const APP_ID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || '0', 10);
const SERVER_SECRET = process.env.ZEGO_SERVER_SECRET || '';

function generateToken04(
  appID: number,
  userID: string,
  serverSecret: string,
  effectiveTimeInSeconds: number,
): string {
  const ctime = Math.floor(Date.now() / 1000);
  const expire = ctime + effectiveTimeInSeconds;
  const nonce = Math.floor(Math.random() * 2_147_483_647);

  const payload = JSON.stringify({
    app_id: appID,
    user_id: userID,
    nonce,
    ctime,
    expire,
    payload: '',
  });

  const key = /^[0-9a-fA-F]{32}$/.test(serverSecret)
    ? Buffer.from(serverSecret, 'hex')
    : Buffer.alloc(16, serverSecret);

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);

  const ivLenBuf = Buffer.alloc(2);
  ivLenBuf.writeUInt16LE(iv.length, 0);
  const encLenBuf = Buffer.alloc(4);
  encLenBuf.writeUInt32LE(encrypted.length, 0);

  return '04' + Buffer.concat([ivLenBuf, iv, encLenBuf, encrypted]).toString('base64');
}

export async function POST(req: NextRequest) {
  try {
    const { userId, roomId } = await req.json();
    if (!userId || !roomId) {
      return NextResponse.json({ error: 'userId and roomId are required' }, { status: 400 });
    }
    if (!APP_ID || !SERVER_SECRET) {
      return NextResponse.json({ error: 'Zegocloud not configured' }, { status: 500 });
    }
    const token = generateToken04(APP_ID, userId, SERVER_SECRET, 3600);
    return NextResponse.json({ token, appID: APP_ID });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Token generation failed' }, { status: 500 });
  }
}
