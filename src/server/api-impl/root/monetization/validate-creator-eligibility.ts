import { NextResponse } from 'next/server';
import { validateCreatorEligibility } from '@/lib/ld-monetization';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const followerCount = Number(body?.followerCount ?? 0);
    const minimumFollowers = Number(body?.minimumFollowers ?? 1000);

    return NextResponse.json({
      eligible: validateCreatorEligibility(followerCount, minimumFollowers),
      followerCount,
      minimumFollowers,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Invalid eligibility payload.' }, { status: 400 });
  }
}
