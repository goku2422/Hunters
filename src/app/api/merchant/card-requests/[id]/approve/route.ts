import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// POST /api/merchant/card-requests/[id]/approve
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
    const claim = db.getClaimById(requestId);

    if (!claim) {
      return NextResponse.json({ success: false, message: 'Card collection request not found.' }, { status: 404 });
    }

    // Verify request belongs to the logged-in merchant
    if (claim.shopId !== session.shopId) {
      return NextResponse.json(
        { success: false, message: 'Forbidden. You cannot approve requests belonging to another merchant.' },
        { status: 403 }
      );
    }

    // Idempotency: verify status is still PENDING
    if (claim.status !== 'PENDING') {
      return NextResponse.json(
        {
          success: false,
          message: `Request is already ${claim.status.toLowerCase()} and cannot be modified again.`,
          claim,
        },
        { status: 400 }
      );
    }

    // Update status to ACCEPTED/APPROVED
    const updatedClaim = db.updateClaimStatus(requestId, 'ACCEPTED', session.name || 'Merchant Cashier');
    const stampCount = db.getCustomerStampCount(claim.customerMobile, claim.shopId);

    return NextResponse.json({
      success: true,
      message: 'Card collected successfully!',
      claim: updatedClaim,
      stampCount,
    });
  } catch (error) {
    console.error('Error approving card collection request:', error);
    return NextResponse.json({ success: false, message: 'Server error processing approval.' }, { status: 500 });
  }
}
