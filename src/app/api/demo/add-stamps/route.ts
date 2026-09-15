import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { name, mobile, shopId, targetStamps = 8 } = await req.json();
    const cleanMobile = (mobile || '').replace(/[^0-9]/g, '').slice(-10);

    if (!cleanMobile || !shopId) {
      return NextResponse.json({ success: false, message: 'Mobile and shopId required' }, { status: 400 });
    }

    const currentCount = db.getCustomerStampCount(cleanMobile, shopId);
    const needed = Math.max(0, Number(targetStamps) - currentCount);

    for (let i = 0; i < needed; i++) {
      const claim = db.createClaim({
        customerName: name || 'Demo User',
        customerMobile: cleanMobile,
        shopId,
        identificationMethod: 'SIMULATOR',
      });
      db.updateClaimStatus(claim.id, 'ACCEPTED', 'Demo Fast-Forward');
    }

    const newCount = db.getCustomerStampCount(cleanMobile, shopId);
    return NextResponse.json({ success: true, stampsCount: newCount });
  } catch (err) {
    console.error('Error fast forwarding stamps:', err);
    return NextResponse.json({ success: false, message: 'Failed to fast forward stamps.' }, { status: 500 });
  }
}
