import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const token =
      req.cookies.get('admin_token')?.value ||
      req.headers.get('authorization')?.replace('Bearer ', '');

    const session = verifyToken(token);
    if (!session || session.type !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const merchants = await db.getMerchants();
    return NextResponse.json({ success: true, merchants });
  } catch (error: any) {
    console.error('Error fetching merchants:', error?.stack || error);
    return NextResponse.json({ success: false, message: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token =
      req.cookies.get('admin_token')?.value ||
      req.headers.get('authorization')?.replace('Bearer ', '');

    const session = verifyToken(token);
    if (!session || session.type !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized. Please login as admin.' }, { status: 401 });
    }

    const body = await req.json();
    const password = (body.password || body.passwordHash || '').trim();
    const cleanEmail = (body.email || '').trim().toLowerCase();
    const cleanName = (body.name || '').trim();
    const cleanShopId = (body.shopId || '').trim();

    if (!cleanShopId || !cleanEmail || !cleanName || !password) {
      return NextResponse.json(
        { success: false, message: 'Shop ID, email, name, and password are required.' },
        { status: 400 }
      );
    }

    const merchant = await db.saveMerchant({
      id: body.id ? body.id.trim() : undefined,
      shopId: cleanShopId,
      email: cleanEmail,
      name: cleanName,
      passwordHash: password,
      phone: body.phone ? String(body.phone).trim() : '',
      isActive: body.isActive ?? true,
      googleEmail: body.gmailEmail || body.googleEmail ? String(body.gmailEmail || body.googleEmail).trim().toLowerCase() : undefined,
      loginType: body.gmailEmail || body.googleEmail ? 'both' : 'password',
    });

    return NextResponse.json({ success: true, merchant });
  } catch (error: any) {
    console.error('Error saving merchant in API route:', error?.stack || error);
    const isDuplicate = error?.code === 11000 || String(error).includes('E11000');
    const msg = isDuplicate
      ? 'A merchant with this email address already exists.'
      : error?.message || 'Server error saving merchant account.';

    return NextResponse.json(
      { success: false, message: msg, details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
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

    const deleted = await db.deleteMerchant(id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    console.error('Error deleting merchant:', error?.stack || error);
    return NextResponse.json({ success: false, message: error?.message || 'Server error' }, { status: 500 });
  }
}
