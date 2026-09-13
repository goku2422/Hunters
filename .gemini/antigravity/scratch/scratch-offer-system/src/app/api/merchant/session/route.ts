import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  const token =
    req.cookies.get('merchant_token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '');

  const session = verifyToken(token);
  if (!session || session.type !== 'merchant') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { isCounterActive } = await req.json();
  db.setCounterMode(session.id, Boolean(isCounterActive));

  return NextResponse.json({
    success: true,
    isCounterActive: Boolean(isCounterActive),
  });
}

export async function POST(req: NextRequest) {
  const token =
    req.cookies.get('merchant_token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '');

  const session = verifyToken(token);
  if (!session || session.type !== 'merchant') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  // If merchant is updating shop GPS location
  if (body.latitude !== undefined && body.longitude !== undefined && session.shopId) {
    const shop = db.getShopById(session.shopId);
    if (shop) {
      db.saveShop({
        ...shop,
        latitude: body.latitude,
        longitude: body.longitude,
        radiusMeters: body.radiusMeters || shop.radiusMeters,
      });
    }
  }

  // Heartbeat session
  if (session.shopId) {
    db.registerOrUpdateSession(session.id, session.shopId, body.isCounterActive ?? true);
  }

  return NextResponse.json({ success: true, message: 'Heartbeat registered' });
}
