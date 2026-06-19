import { NextResponse } from 'next/server';
import { isFirebaseConfigured } from '@/lib/firebase/admin';

export async function GET() {
  const body: {
    ok: boolean;
    status: string;
    mode: 'firebase' | 'demo';
    firebase: 'connected' | 'not_configured' | 'error';
    firebaseError?: string;
  } = {
    ok: true,
    status: 'running',
    mode: 'demo',
    firebase: 'not_configured',
  };

  if (!isFirebaseConfigured()) {
    return NextResponse.json(body);
  }

  try {
    const { getAdminFirestore } = await import('@/lib/firebase/admin');
    const { ensureAppTables } = await import('@/lib/firebase/collections');
    const { ensureSeedData } = await import('@/lib/firestore/seed');
    const db = getAdminFirestore();
    await ensureAppTables(db);
    await ensureSeedData();
    body.mode = 'firebase';
    body.firebase = 'connected';
  } catch (e) {
    body.firebase = 'error';
    body.firebaseError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(body);
}
