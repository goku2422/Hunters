import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

// POST /api/qr-scan — log a QR scan when customer lands on shop page
export async function POST(req: NextRequest) {
  try {
    const { shopId } = await req.json();
    if (!shopId) {
      return NextResponse.json({ success: false, message: "shopId required" }, { status: 400 });
    }
    const shop = db.getShopById(shopId);
    if (!shop) {
      return NextResponse.json({ success: false, message: "Shop not found" }, { status: 404 });
    }
    const userAgent = req.headers.get("user-agent") || undefined;
    const scan = db.logQrScan(shopId, userAgent);
    return NextResponse.json({ success: true, scan });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Error logging scan" }, { status: 500 });
  }
}

// GET /api/qr-scan?shopId=xxx — get scan count for a shop
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shopId = searchParams.get("shopId");
  const scans = db.getQrScans(shopId || undefined);
  return NextResponse.json({ success: true, count: scans.length, scans });
}