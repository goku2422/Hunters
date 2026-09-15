import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CreateClaimRequest } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shopId = searchParams.get('shopId') || undefined;
  const mobile = searchParams.get('mobile')?.replace(/[^0-9]/g, '').slice(-10) || undefined;
  const claims = db.getClaims(shopId).filter((claim) => !mobile || claim.customerMobile === mobile);
  return NextResponse.json({ success: true, claims });
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateClaimRequest = await req.json();

    if (!body.name || body.name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'Please enter your valid name (at least 2 characters).' },
        { status: 400 }
      );
    }

    const cleanMobile = (body.mobile || '').replace(/[^0-9]/g, '').slice(-10);
    if (!cleanMobile || cleanMobile.length !== 10) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    if (!body.shopId || typeof body.shopId !== 'string' || !body.shopId.trim()) {
      return NextResponse.json(
        { success: false, message: 'Merchant ID is required before creating an approval request. Please scan a merchant QR code.' },
        { status: 400 }
      );
    }

    const shop = db.getShopById(body.shopId.trim());
    if (!shop) {
      return NextResponse.json(
        { success: false, message: 'Invalid shop or merchant identification. Please scan a valid merchant QR code.' },
        { status: 404 }
      );
    }

    // Strict 1-scan-per-day restriction per customer per merchant handled on backend/database
    const existingTodayClaim = db.hasScannedToday(cleanMobile, body.shopId);
    if (existingTodayClaim) {
      return NextResponse.json(
        {
          success: false,
          isDuplicate: true,
          claim: existingTodayClaim,
          message: `Already scanned today. You can scan ${shop.name}'s QR code again tomorrow.`,
        },
        { status: 429 }
      );
    }

    const claim = db.createClaim({
      customerName: body.name.trim(),
      customerMobile: cleanMobile,
      shopId: body.shopId,
      identificationMethod: body.identificationMethod || 'GEOFENCE',
      customerLat: body.customerLat,
      customerLng: body.customerLng,
      distanceMeters: body.distanceMeters,
    });

    return NextResponse.json({ success: true, claim });
  } catch (error) {
    console.error('Error creating claim:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create discount claim.' },
      { status: 500 }
    );
  }
}
