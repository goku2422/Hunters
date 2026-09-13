import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ClaimStatus } from '@/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const claim = db.getClaimById(params.id);
  if (!claim) {
    return NextResponse.json({ success: false, message: 'Claim not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, claim });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status, resolvedBy, rejectionReason, scratchRevealed } = body;

    let claim = db.getClaimById(params.id);
    if (!claim) {
      return NextResponse.json({ success: false, message: 'Claim not found' }, { status: 404 });
    }

    if (scratchRevealed) {
      claim = db.markScratchRevealed(params.id);
    }

    if (status && ['ACCEPTED', 'REJECTED', 'PENDING'].includes(status)) {
      claim = db.updateClaimStatus(
        params.id,
        status as ClaimStatus,
        resolvedBy,
        rejectionReason
      );
    }

    return NextResponse.json({ success: true, claim });
  } catch (error) {
    console.error('Error updating claim:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update claim.' },
      { status: 500 }
    );
  }
}
