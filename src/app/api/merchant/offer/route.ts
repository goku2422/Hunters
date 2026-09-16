import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token =
    req.cookies.get('merchant_token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '');

  const session = verifyToken(token);
  if (!session || session.type !== 'merchant') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const shopId = session.shopId || 'shop-pizza';
  const offer = db.getShopOffer(shopId);

  return NextResponse.json({
    success: true,
    offer,
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

  const shopId = session.shopId || 'shop-pizza';
  const body = await req.json();

  const updatedOffer = db.updateShopOffer(shopId, {
    title: body.title,
    description: body.description,
    visitsRequired: Number(body.visitsRequired) || 8,
    expiryDays: Number(body.expiryDays) || 30,
    expiryDate: body.expiryDate || undefined,
    image: body.image,
    terms: body.terms,
    discountPercent: body.discountPercent ? Number(body.discountPercent) : undefined,
    isActive: body.isActive,
  });

  return NextResponse.json({
    success: true,
    message: 'Reward offer updated successfully',
    offer: updatedOffer,
  });
}
