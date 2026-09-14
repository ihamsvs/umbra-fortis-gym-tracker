import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Current release version tag
export const APP_VERSION = '2.4.0';

export async function GET() {
  return NextResponse.json(
    {
      version: APP_VERSION,
      buildDate: '2026-09-14',
      timestamp: Date.now(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  );
}
