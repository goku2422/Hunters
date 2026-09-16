import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createToken, verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const admin = db.getAdminByEmail(email);
    if (!admin || admin.passwordHash !== password) {
      return NextResponse.json(
        { success: false, message: 'Invalid admin email or password.' },
        { status: 401 }
      );
    }

    const token = createToken({
      type: 'admin',
      id: admin.id,
      email: admin.email,
      name: admin.name,
    });

    const response = NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });

    response.cookies.set('admin_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 86400,
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, message: 'Authentication failed.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const token =
    req.cookies.get('admin_token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '');

  const session = verifyToken(token);
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    admin: session,
  });
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, message: 'Logged out' });
  res.cookies.delete('admin_token');
  return res;
}
