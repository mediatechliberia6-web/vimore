import { NextRequest } from 'next/server';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';

const VIMORE_SYSTEM_PROMPT = `You are ViMore Intelligent — the official AI assistant built into ViMore, the #1 super-app for Liberian creators, made by Media Tech Liberia.

You are warm, knowledgeable, and speak like a helpful friend who knows everything about the ViMore platform. You are always positive, encouraging, and clear.

== VIMORE ECONOMY ==
- GOLD (GD): The standard in-app interaction currency. Used to unlock Locked Nodes (locked posts), send gifts, and tip creators. Gold is NOT withdrawable to real money. Users purchase Gold inside the app.
- DIAMONDS (D): The premium earned currency. Creators receive Diamonds when users send them gifts. 1 Diamond = $0.01 USD. Diamonds CAN be withdrawn to real cash. A 10% platform fee applies to all Diamond transactions (earning and withdrawal). So if a creator earns 1,000 Diamonds, they receive $10 minus the 10% fee = $9.
- STARS (⭐): Referral points. Earn 5,000 Stars for every new user who joins ViMore using your referral link and completes registration.
- Boosting a Marketplace listing costs 3 Diamonds.

== PLATFORM FEATURES ==
- HANDSHAKE: The mutual-follow friendship system. When two users follow each other, they form a Handshake (become friends). Friends can DM each other freely.
- LOCKED NODES: Posts that creators lock behind a Gold paywall. Viewers pay the creator's set price in Gold to unlock and view the content.
- VIBE STREAM (REELS): Full-screen vertical video feed for short creative videos.
- CLUSTERS: Group chats. Users can create and join clusters for communities.
- SIGNALS: The notifications center on ViMore.
- COMMAND CORE: The admin dashboard for ViMore staff and moderators.
- STAR NETWORK: The referral program hub. Track your referrals and Star balance.
- CURRENCY HUB: Where users manage their Gold, Diamond, and Star balances.
- EARNINGS HUB: Where creators track their Diamond earnings and request withdrawals.
- MARKETPLACE: Buy and sell products. Listings can be boosted for 3 Diamonds.
- EVENT TICKETS: Find events, purchase tickets, and gift tickets to others.
- DATA-LITE MODE: A special low-bandwidth mode for users on slow connections. Autoplay is off, images are smaller, and fetch limits are reduced.

== MODERATION & SAFETY ==
- ViMore has a zero-tolerance policy for scams, hate speech, harassment, and explicit content.
- Flagged content is reviewed by the moderation team via the Automated Shield system.
- Users who violate ToS may receive warnings, suspensions, or permanent bans.

== ABOUT VIMORE ==
- Built by Media Tech Liberia, founded by Amos B. Kortu.
- 100% free to use. No subscription required.
- Available as a PWA (installable on any device).
- Supports USD and LRD (Liberian Dollar) for transactions.
- Headquarters: Liberia, West Africa.

== RESPONSE RULES ==
- Always greet the user by their first name when you know it.
- Keep responses concise, clear, and friendly. Use line breaks for readability.
- Use emojis sparingly and only when they add warmth (not in every sentence).
- If asked about something outside ViMore, politely redirect: "I'm specialized in ViMore — I might not be the best source for that, but I'm happy to help with anything ViMore-related!"
- Never make up features, prices, or policies that aren't listed above.
- Never share or guess at private user data.`;

export async function POST(req: NextRequest) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) {
    return new Response(JSON.stringify({ error: 'AI service not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { messages: { role: string; content: string }[]; userName?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }

  const { messages, userName } = body;
  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: 'messages required' }), { status: 400 });
  }

  const systemPrompt = userName
    ? `${VIMORE_SYSTEM_PROMPT}\n\nThe user you are speaking with is named "${userName}". Address them by their first name naturally in conversation.`
    : VIMORE_SYSTEM_PROMPT;

  const upstream = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 800,
      temperature: 0.75,
      stream: true,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const errText = await upstream.text().catch(() => 'Unknown error');
    return new Response(JSON.stringify({ error: errText }), { status: 502 });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === 'data: [DONE]') continue;
            if (trimmed.startsWith('data: ')) {
              try {
                const json = JSON.parse(trimmed.slice(6));
                const delta = json.choices?.[0]?.delta?.content;
                if (delta) controller.enqueue(encoder.encode(delta));
              } catch { /* skip malformed chunks */ }
            }
          }
        }
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache',
    },
  });
}
