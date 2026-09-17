import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createToken, verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cleanEmail = body.email ? body.email.trim().toLowerCase() : '';
    const cleanPassword = body.password ? body.password.trim() : '';

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const merchant = await db.getMerchantByEmail(cleanEmail);
    if (!merchant || merchant.passwordHash !== cleanPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid merchant email or password.' },
        { status: 401 }
      );
    }

    if (!merchant.isActive) {
      return NextResponse.json(
        { success: false, message: 'This merchant account has been deactivated.' },
        { status: 403 }
      );
    }

    let shop = await db.getShopById(merchant.shopId);
    if (!shop) {
      const allShops = await db.getShops();
      shop = allShops.find((s) => s.isActive) || allShops[0];
    }
    if (!shop) {
      return NextResponse.json(
        { success: false, message: 'No active shop available.' },
        { status: 404 }
      );
    }

    // Register merchant counter session
    const session = await db.registerOrUpdateSession(merchant.id, shop.id, true);

    const token = createToken({
      type: 'merchant',
      id: merchant.id,
      email: merchant.email,
      name: merchant.name,
      shopId: shop.id,
      shopName: shop.name,
    });

    const response = NextResponse.json({
      success: true,
      token,
      merchant: {
        id: merchant.id,
        name: merchant.name,
        email: merchant.email,
        phone: merchant.phone,
        shopId: shop.id,
        shopName: shop.name,
        shop,
      },
      session,
    });

    response.cookies.set('merchant_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 86400,
    });

    return response;
  } catch (error: any) {
    console.error('Merchant login error:', error?.stack || error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message ? `Authentication failed: ${error.message}` : 'Authentication failed.',
        details: String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const token =
    req.cookies.get('merchant_token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '');

  const session = verifyToken(token);
  if (!session || session.type !== 'merchant') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const merchant = await db.getMerchantById(session.id);
  const shop = session.shopId ? await db.getShopById(session.shopId) : undefined;

  return NextResponse.json({
    success: true,
    merchant,
    shop,
    session,
  });
}

export async function PUT(req: NextRequest) {
  const token =
    req.cookies.get('merchant_token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '');

  const session = verifyToken(token);
  if (!session || session.type !== 'merchant') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const merchant = await db.getMerchantById(session.id);
  const shop = session.shopId ? await db.getShopById(session.shopId) : undefined;

  let updatedShop = shop;
  if (shop && body.shop) {
    updatedShop = await db.saveShop({
      ...shop,
      name: body.shop.name ?? shop.name,
      address: body.shop.address ?? shop.address,
      phone: body.phone,
      category: body.shop.category ?? shop.category,
      latitude: body.shop.latitude !== undefined ? Number(body.shop.latitude) : shop.latitude,
      longitude: body.shop.longitude !== undefined ? Number(body.shop.longitude) : shop.longitude,
    });
  }

  let updatedMerchant = merchant;
  if (merchant && body.merchant) {
    updatedMerchant = await db.saveMerchant({
      ...merchant,
      name: body.merchant.name ?? merchant.name,
      phone: body.merchant.phone ?? merchant.phone,
      email: body.merchant.email ?? merchant.email,
      shopId: merchant.shopId,
      passwordHash: merchant.passwordHash,
    });
  }

  return NextResponse.json({
    success: true,
    message: 'Profile updated successfully',
    merchant: updatedMerchant,
    shop: updatedShop,
  });
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, message: 'Logged out' });
  res.cookies.delete('merchant_token');
  return res;
}
