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

  const stats = db.getStats();
  const customers = db.getCustomers();
  const recentClaims = db.getClaims().slice(0, 10);

  return NextResponse.json({
    success: true,
    stats,
    totalCustomersCount: customers.length,
    recentClaims,
  });
}
