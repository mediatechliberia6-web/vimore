import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { getAdminDatabases, DATABASE_ID } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

const SUBS_COLLECTION = 'push_subscriptions';

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || '';

let vapidConfigured = false;
function ensureVapid() {
  if (vapidConfigured) return;
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
    vapidConfigured = true;
  } catch (err) {
    console.warn('[push/send] VAPID setup failed:', (err as any)?.message || err);
  }
}

interface PushPayload {
  title?: string;
  body?: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
  tag?: string;
  renotify?: boolean;
  requireInteraction?: boolean;
  silent?: boolean;
  badgeCount?: number;
  data?: Record<string, any>;
  actions?: { action: string; title: string; icon?: string }[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userIds, payload } = body as {
      userId?: string;
      userIds?: string[];
      payload: PushPayload;
    };

    const targets = (userIds && userIds.length ? userIds : userId ? [userId] : []).filter(Boolean);
    if (!targets.length || !payload) {
      return NextResponse.json({ error: 'userId(s) and payload required' }, { status: 400 });
    }

    ensureVapid();

    const db = getAdminDatabases();

    // Collect all subs for the targeted users
    const subs: Array<{ $id: string; endpoint: string; p256dh: string; auth: string }> = [];
    for (const uid of targets) {
      try {
        const res = await db.listDocuments(DATABASE_ID, SUBS_COLLECTION, [
          Query.equal('user_id', uid),
          Query.limit(50),
        ]);
        res.documents.forEach((d: any) => subs.push({
          $id: d.$id,
          endpoint: d.endpoint,
          p256dh: d.p256dh,
          auth: d.auth,
        }));
      } catch (err: any) {
        console.warn('[push/send] sub lookup failed for', uid, err?.message || err);
      }
    }

    if (!subs.length) {
      return NextResponse.json({ ok: true, sent: 0, reason: 'no_subscriptions' });
    }

    const json = JSON.stringify({
      title: payload.title || 'ViMore',
      body: payload.body || '',
      icon: payload.icon || '/icons/icon-192.png',
      badge: payload.badge || '/icons/icon-192.png',
      image: payload.image,
      url: payload.url || '/notifications',
      tag: payload.tag,
      renotify: payload.renotify,
      requireInteraction: payload.requireInteraction,
      silent: payload.silent,
      badgeCount: payload.badgeCount,
      data: payload.data || {},
      actions: payload.actions || [],
      timestamp: Date.now(),
    });

    let sent = 0;
    let failed = 0;

    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            json,
          );
          sent++;
        } catch (err: any) {
          failed++;
          const status = err?.statusCode;
          // 404/410 = subscription gone; clean it up so we don't retry forever
          if (status === 404 || status === 410) {
            try { await db.deleteDocument(DATABASE_ID, SUBS_COLLECTION, s.$id); } catch {}
          } else {
            console.warn('[push/send] delivery failed:', status, err?.body || err?.message);
          }
        }
      })
    );

    return NextResponse.json({ ok: true, sent, failed, total: subs.length });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Bad request' }, { status: 400 });
  }
}
