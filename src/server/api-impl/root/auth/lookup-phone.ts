import 'server-only';
import { NextResponse } from 'next/server';
import { Query } from 'node-appwrite';
import { getAdminDatabases, DATABASE_ID } from '@/lib/appwrite-server';

const COL_USERS = 'users';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'phone is required' }, { status: 400 });
    }

    // Normalize by removing common separators but keep '+' if present for now
    const raw = phone.trim();
    const normalized = raw.replace(/[\s\-().]/g, '');

    // Build a set of candidate normalized forms to try (handles +, no +, leading zeros)
    const candidates = new Set<string>();
    candidates.add(normalized);

    if (normalized.startsWith('+')) {
      candidates.add(normalized.slice(1)); // without +
    } else {
      candidates.add('+' + normalized); // with +
    }

    // If phone starts with a leading 0 (local format), try without the leading zeros and with plus
    if (/^0+/.test(normalized)) {
      const withoutLeadingZeros = normalized.replace(/^0+/, '');
      if (withoutLeadingZeros) {
        candidates.add(withoutLeadingZeros);
        candidates.add('+' + withoutLeadingZeros);
      }
    }

    // Convert to array and attempt a single query that matches any of these candidates.
    const attempts = Array.from(candidates);

    const db = getAdminDatabases();
    const result = await db.listDocuments(DATABASE_ID, COL_USERS, [
      Query.equal('phone', attempts),
      Query.limit(1),
    ]);

    if (!result.documents.length) {
      // Log the attempted candidates for easier debugging in server logs
      console.warn('[lookup-phone] no match for', attempts);
      return NextResponse.json({ error: 'No account found with that phone number.' }, { status: 404 });
    }

    // Return only the email (used as vimoreId internally) — no sensitive data
    return NextResponse.json({ email: result.documents[0].email });
  } catch (err: any) {
    console.error('[lookup-phone]', err);
    return NextResponse.json({ error: 'Phone lookup failed.' }, { status: 500 });
  }
}
