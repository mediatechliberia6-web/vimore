import { NextRequest, NextResponse } from 'next/server';

const GEMINI_MODEL = 'gemini-2.0-flash';

const MODERATION_SYSTEM = `You are the ViMore Content Safety AI — a strict, accurate, and fair content moderator for ViMore, a social platform built for African creators.

Analyze the provided content (text and/or image) against ViMore's Terms of Service.

VIOLATIONS TO FLAG:
- Scams, fraud, phishing, or financial deception (fake giveaways, pyramid schemes, advance-fee fraud)
- Hate speech, racism, tribalism, ethnic targeting, or discrimination of any kind
- Harassment, threats, targeted abuse, or doxxing
- Explicit sexual content, nudity, or sexual solicitation
- Graphic violence or gore
- Spam or coordinated inauthentic behavior
- Impersonation of real people, public figures, or organizations
- Promotion of illegal activities (drug sales, weapons trafficking, etc.)
- Misleading or dangerous health misinformation

RESPONSE FORMAT (strict JSON only, no other text, no markdown fences):
{"flagged": true, "reason": "concise human-readable explanation for admin review", "severity": "low"|"medium"|"high"}

If content is clean and safe, respond exactly: {"flagged": false, "reason": "", "severity": "low"}

Be accurate and avoid false positives. Cultural expressions, slang, and debate are NOT violations. Only flag clear, definitive policy violations.`;

async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const mimeType = contentType.split(';')[0].trim();
    if (!mimeType.startsWith('image/') && !mimeType.startsWith('video/')) return null;
    const buffer = await res.arrayBuffer();
    const data = Buffer.from(buffer).toString('base64');
    return { data, mimeType };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const key = process.env.GOOGLE_GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

  let body: { docId: string; collection: string; text: string; userId: string; mediaUrl?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { docId, collection, text, userId, mediaUrl } = body;
  if (!text?.trim() && !mediaUrl) return NextResponse.json({ flagged: false });

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: MODERATION_SYSTEM,
    });

    const textPart = { text: `Analyze this content for policy violations:\n\nText: "${(text || '').slice(0, 1500)}"` };
    const parts: any[] = [textPart];

    if (mediaUrl) {
      const imageData = await fetchImageAsBase64(mediaUrl);
      if (imageData) {
        parts.push({ inlineData: { data: imageData.data, mimeType: imageData.mimeType } });
      }
    }

    const result = await model.generateContent({
      contents: [{ role: 'user', parts }],
      generationConfig: { maxOutputTokens: 150, temperature: 0.1 },
    });

    const raw = result.response.text().trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ flagged: false });

    let modResult: { flagged: boolean; reason: string; severity: string };
    try {
      modResult = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json({ flagged: false });
    }

    if (!modResult.flagged) return NextResponse.json({ flagged: false });

    const APPWRITE_ENDPOINT = (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://mediatechliberia.online/v1').replace(/\/$/, '');
    const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'vimore123';
    const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'vimoreprod';
    const API_KEY = process.env.APPWRITE_API_KEY;

    if (!API_KEY) return NextResponse.json({ flagged: true, reason: modResult.reason, severity: modResult.severity });

    const headers = {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': PROJECT_ID,
      'X-Appwrite-Key': API_KEY,
    };

    const reportId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await Promise.allSettled([
      fetch(`${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${collection}/documents/${docId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ data: { status: 'pending_review' } }),
      }),
      fetch(`${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/admin_reports/documents`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          documentId: reportId,
          data: {
            doc_id: docId,
            collection_name: collection,
            reason: modResult.reason,
            severity: modResult.severity,
            reported_at: new Date().toISOString(),
            status: 'open',
            user_id: userId,
            content_preview: (text || '').slice(0, 300),
            has_media: !!mediaUrl,
          },
        }),
      }),
    ]);

    return NextResponse.json({ flagged: true, reason: modResult.reason, severity: modResult.severity });
  } catch (err) {
    console.error('[Gemini moderate error]', err);
    return NextResponse.json({ flagged: false });
  }
}
