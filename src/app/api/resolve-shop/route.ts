import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ResolveShopRequest } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body: ResolveShopRequest = await req.json();

    // Extract client IP if available from headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = body.clientIp || forwardedFor?.split(',')[0].trim() || realIp || undefined;

    const result = db.resolveShop({
      latitude: body.latitude,
      longitude: body.longitude,
      accuracy: body.accuracy,
      clientIp,
      simulatedShopId: body.simulatedShopId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error resolving shop:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to resolve shop location.' },
      { status: 500 }
    );
  }
}
