import { NextResponse } from 'next/server';

// Ported verbatim from server.ts's `app.get('/api/health', ...)`.
export async function GET() {
  return NextResponse.json({
    status: 'online',
    platform: 'Xean Digital Hub',
    developer: 'Syamil Alkhattab (Ahli Informatika)',
    version: '2.5.0',
    timestamp: new Date().toISOString()
  });
}
