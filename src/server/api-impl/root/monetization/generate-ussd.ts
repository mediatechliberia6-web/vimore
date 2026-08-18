import { NextResponse } from 'next/server';
import { generateUSSD, isValidOrangeMoneyNumber } from '@/lib/ld-monetization';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orangeMoneyNumber = String(body?.orangeMoneyNumber || '');
    const amountLD = Number(body?.amountLD || 0);

    if (!isValidOrangeMoneyNumber(orangeMoneyNumber)) {
      return NextResponse.json({ error: 'Invalid Orange Money number format.' }, { status: 400 });
    }

    const code = generateUSSD(orangeMoneyNumber, amountLD);
    return NextResponse.json({ ussd: code, orangeMoneyNumber, amountLD });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Could not generate USSD code.' }, { status: 400 });
  }
}
