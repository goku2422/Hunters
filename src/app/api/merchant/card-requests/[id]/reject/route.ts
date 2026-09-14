import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// POST /api/merchant/card-requests/[id]/reject
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
        { success: false, message: 'Forbidden. You cannot reject requests belonging to another merchant.' },
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

    const body = await req.json().catch(() => ({}));
    const rejectionReason = body.reason || 'Merchant rejected your card collection request.';

    // Update status to REJECTED
    const updatedClaim = db.updateClaimStatus(requestId, 'REJECTED', session.name || 'Merchant Cashier', rejectionReason);

    return NextResponse.json({
      success: true,
      message: 'Card collection request rejected.',
      claim: updatedClaim,
    });
  } catch (error) {
    console.error('Error rejecting card collection request:', error);
    return NextResponse.json({ success: false, message: 'Server error processing rejection.' }, { status: 500 });
  }
}
