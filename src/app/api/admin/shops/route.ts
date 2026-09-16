import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const token =
    req.cookies.get('admin_token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '');

  const session = verifyToken(token);
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const shops = db.getShops().map((shop) => {
    const claims = db.getClaims(shop.id);
    const merchant = db.getMerchantByShopId(shop.id);
    const sessions = db.getMerchantSessions(shop.id);
    const isOnline = sessions.some((s) => s.isCounterActive);

    return {
      ...shop,
      merchant,
      totalClaims: claims.length,
      acceptedClaims: claims.filter((c) => c.status === 'ACCEPTED').length,
      pendingClaims: claims.filter((c) => c.status === 'PENDING').length,
      isCounterOnline: isOnline,
    };
  });

  return NextResponse.json({ success: true, shops });
}

export async function POST(req: NextRequest) {
  const token =
    req.cookies.get('admin_token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '');

  const session = verifyToken(token);
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  if (!body.name || !body.address || !body.phone || body.latitude === undefined || body.longitude === undefined) {
    return NextResponse.json(
      { success: false, message: 'Name, address, phone, latitude, and longitude are required.' },
      { status: 400 }
    );
  }

  const shop = db.saveShop({
    name: body.name,
    category: body.category || 'Retail Store',
    address: body.address,
    phone: body.phone,
    latitude: parseFloat(body.latitude),
    longitude: parseFloat(body.longitude),
    radiusMeters: parseInt(body.radiusMeters) || 75,
    wifiIp: body.wifiIp || '',
    isActive: body.isActive ?? true,
  });

  return NextResponse.json({ success: true, shop });
}

export async function PUT(req: NextRequest) {
  const token =
    req.cookies.get('admin_token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '');

  const session = verifyToken(token);
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  if (!body.id) {
    return NextResponse.json({ success: false, message: 'Shop ID is required.' }, { status: 400 });
  }

  const shop = db.saveShop({
    ...body,
    latitude: parseFloat(body.latitude),
    longitude: parseFloat(body.longitude),
    radiusMeters: parseInt(body.radiusMeters) || 75,
  });

  return NextResponse.json({ success: true, shop });
}

export async function DELETE(req: NextRequest) {
  const token =
    req.cookies.get('admin_token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '');

  const session = verifyToken(token);
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, message: 'Shop ID required' }, { status: 400 });
  }

  const deleted = db.deleteShop(id);
  return NextResponse.json({ success: deleted });
}
