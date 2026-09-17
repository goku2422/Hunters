import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token =
      req.cookies.get('merchant_token')?.value ||
      req.headers.get('authorization')?.replace('Bearer ', '');

    const session = verifyToken(token);
    if (!session || session.type !== 'merchant') {
      return NextResponse.json({ success: false, message: 'Unauthorized. Merchant login required.' }, { status: 401 });
    }

    const requestId = params.id;
    const claim = await db.getClaimById(requestId);

    if (!claim) {
      return NextResponse.json({ success: false, message: 'Reward claim request not found.' }, { status: 404 });
    }

    if (claim.shopId !== session.shopId) {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Request belongs to another merchant.' },
        { status: 403 }
      );
    }

    const updatedClaim = await db.markClaimRedeemed(requestId, session.name || 'Merchant Cashier');
    const stampCount = await db.getCustomerStampCount(claim.customerMobile, claim.shopId);

    return NextResponse.json({
      success: true,
      message: '8th Stamp Reward Marked as Redeemed!',
      claim: updatedClaim,
      stampCount,
    });
  } catch (error) {
    console.error('Error redeeming reward request:', error);
    return NextResponse.json({ success: false, message: 'Server error processing redemption.' }, { status: 500 });
  }
}
