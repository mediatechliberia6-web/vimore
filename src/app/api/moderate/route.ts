import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';

const MODERATION_SYSTEM = `You are a content moderation AI for ViMore, a social platform. Analyze the provided text against ViMore's Terms of Service.

VIOLATIONS TO FLAG:
- Scams, fraud, phishing, or financial deception
- Hate speech, racism, tribalism, or discrimination
- Harassment, threats, or targeted abuse
- Explicit sexual content or solicitation
- Spam or coordinated inauthentic behavior
- Impersonation of real people or organizations
- Promotion of illegal activities

RESPONSE FORMAT (JSON only, no other text):
{"flagged": true/false, "reason": "brief explanation", "severity": "low"|"medium"|"high"}

If content is clean, respond: {"flagged": false, "reason": "", "severity": "low"}`;

export async function POST(req: NextRequest) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

  let body: { docId: string; collection: string; text: string; userId: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { docId, collection, text, userId } = body;
  if (!text?.trim()) return NextResponse.json({ flagged: false });

  try {
    const res = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: MODERATION_SYSTEM },
          { role: 'user', content: `Analyze this content: "${text.slice(0, 1000)}"` },
        ],
        max_tokens: 120,
        temperature: 0.1,
        stream: false,
      }),
    });

    if (!res.ok) return NextResponse.json({ flagged: false });

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content?.trim() || '{}';

    let result: { flagged: boolean; reason: string; severity: string };
    try {
      result = JSON.parse(raw);
    } catch {
      return NextResponse.json({ flagged: false });
    }

    if (!result.flagged) return NextResponse.json({ flagged: false });

    const APPWRITE_ENDPOINT = (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://mediatechliberia.online/v1').replace(/\/$/, '');
    const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'vimore123';
    const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'vimoreprod';
    const API_KEY = process.env.APPWRITE_API_KEY;

    if (!API_KEY) return NextResponse.json({ flagged: true, reason: result.reason, severity: result.severity });

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
            reason: result.reason,
            severity: result.severity,
            reported_at: new Date().toISOString(),
            status: 'open',
            user_id: userId,
            content_preview: text.slice(0, 300),
          },
        }),
      }),
    ]);

    return NextResponse.json({ flagged: true, reason: result.reason, severity: result.severity });
  } catch {
    return NextResponse.json({ flagged: false });
  }
}
