import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createToken, verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const merchant = db.getMerchantByEmail(email);
    if (!merchant || merchant.passwordHash !== password) {
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

    let shop = db.getShopById(merchant.shopId);
    if (!shop) {
      shop = db.getShops().find((s) => s.isActive) || db.getShops()[0];
    }
    if (!shop) {
      return NextResponse.json(
        { success: false, message: 'No active shop available.' },
        { status: 404 }
      );
    }

    // Register merchant counter session
    const session = db.registerOrUpdateSession(merchant.id, shop.id, true);

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
  } catch (error) {
    console.error('Merchant login error:', error);
    return NextResponse.json(
      { success: false, message: 'Authentication failed.' },
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

  const merchant = db.getMerchantById(session.id);
  const shop = session.shopId ? db.getShopById(session.shopId) : undefined;

  return NextResponse.json({
    success: true,
    merchant,
    shop,
    session,
  });
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, message: 'Logged out' });
  res.cookies.delete('merchant_token');
  return res;
}
