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

  const merchants = db.getMerchants();
  return NextResponse.json({ success: true, merchants });
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
  if (!body.shopId || !body.email || !body.name || !body.password) {
    return NextResponse.json(
      { success: false, message: 'Shop ID, email, name, and password are required.' },
      { status: 400 }
    );
  }

  const merchant = db.saveMerchant({
    id: body.id,
    shopId: body.shopId,
    email: body.email,
    name: body.name,
    passwordHash: body.password,
    phone: body.phone,
    isActive: body.isActive ?? true,
    googleEmail: body.gmailEmail || undefined,
    loginType: body.gmailEmail ? 'both' : 'password',
  });

  return NextResponse.json({ success: true, merchant });
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
    return NextResponse.json({ success: false, message: 'Merchant ID required' }, { status: 400 });
  }

  const deleted = db.deleteMerchant(id);
  return NextResponse.json({ success: deleted });
}
