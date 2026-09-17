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

  const allShops = await db.getShops();
  const allClaims = await db.getClaims();
  const allMerchants = await db.getMerchants();
  const allSessions = await db.getMerchantSessions();

  const shops = allShops.map((shop) => {
    const claims = allClaims.filter((c) => c.shopId === shop.id);
    const merchant = allMerchants.find((m) => m.shopId === shop.id);
    const sessions = allSessions.filter((s) => s.shopId === shop.id);
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

  const shop = await db.saveShop({
    id: body.id,
    name: body.name,
    category: body.category || 'Retail Store',
    address: body.address,
    phone: body.phone,
    latitude: parseFloat(body.latitude),
    longitude: parseFloat(body.longitude),
    radiusMeters: parseInt(body.radiusMeters) || 75,
    wifiIp: body.wifiIp || '',
    isActive: body.isActive ?? true,
    slug: body.slug,
  });

  let merchant = await db.getMerchantByShopId(shop.id);
  if (!merchant) {
    const slug = shop.slug || shop.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    merchant = await db.saveMerchant({
      id: `merchant-${shop.id}`,
      shopId: shop.id,
      email: `manager@${slug}.com`,
      name: `${shop.name} Manager`,
      passwordHash: 'shop123',
      phone: shop.phone,
      isActive: true,
    });
  }

  const shopWithMerchant = {
    ...shop,
    merchant,
    totalClaims: 0,
    acceptedClaims: 0,
    pendingClaims: 0,
    isCounterOnline: false,
  };

  return NextResponse.json({ success: true, shop: shopWithMerchant, merchant });
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

  const shop = await db.saveShop({
    ...body,
    latitude: parseFloat(body.latitude),
    longitude: parseFloat(body.longitude),
    radiusMeters: parseInt(body.radiusMeters) || 75,
  });

  let merchant = await db.getMerchantByShopId(shop.id);
  if (!merchant) {
    const slug = shop.slug || shop.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    merchant = await db.saveMerchant({
      id: `merchant-${shop.id}`,
      shopId: shop.id,
      email: `manager@${slug}.com`,
      name: `${shop.name} Manager`,
      passwordHash: 'shop123',
      phone: shop.phone,
      isActive: true,
    });
  }

  const shopWithMerchant = {
    ...shop,
    merchant,
  };

  return NextResponse.json({ success: true, shop: shopWithMerchant, merchant });
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

  const deleted = await db.deleteShop(id);
  return NextResponse.json({ success: deleted });
}
