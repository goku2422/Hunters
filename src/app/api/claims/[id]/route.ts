import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ClaimStatus } from '@/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const claim = await db.getClaimById(params.id);
  if (!claim) {
    return NextResponse.json({ success: false, message: 'Claim not found' }, { status: 404 });
  }

  const stampCount = await db.getCustomerStampCount(claim.customerMobile, claim.shopId);
  return NextResponse.json({
    success: true,
    claim,
    stampCount,
    targetStamps: 5,
    xpEarned: stampCount * 10,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status, resolvedBy, rejectionReason, scratchRevealed } = body;

    let claim = await db.getClaimById(params.id);
    if (!claim) {
      return NextResponse.json({ success: false, message: 'Claim not found' }, { status: 404 });
    }

    if (scratchRevealed) {
      claim = await db.markScratchRevealed(params.id);
    }

    if (status && ['ACCEPTED', 'REJECTED', 'PENDING'].includes(status)) {
      claim = await db.updateClaimStatus(
        params.id,
        status as ClaimStatus,
        resolvedBy,
        rejectionReason
      );
    }

    const stampCount = claim ? await db.getCustomerStampCount(claim.customerMobile, claim.shopId) : 0;

    return NextResponse.json({
      success: true,
      claim,
      stampCount,
      targetStamps: 5,
      xpEarned: stampCount * 10,
    });
  } catch (error) {
    console.error('Error updating claim:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update claim.' },
      { status: 500 }
    );
  }
}
