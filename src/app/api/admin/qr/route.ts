import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import QRCode from "qrcode";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function resolveBaseUrl(req: NextRequest): string {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  
  if (host && !host.includes("localhost")) {
    return `${proto}://${host}`;
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

// GET /api/admin/qr?shopId=xxx — generate QR code image for a shop
export async function GET(req: NextRequest) {
  const token =
    req.cookies.get("admin_token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  const session = verifyToken(token);
  if (!session || session.type !== "admin") {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const shopId = searchParams.get("shopId");
  if (!shopId) {
    return NextResponse.json({ success: false, message: "shopId required" }, { status: 400 });
  }

  const shop = db.getShopById(shopId);
  if (!shop) {
    return NextResponse.json({ success: false, message: "Shop not found" }, { status: 404 });
  }

  const baseUrl = resolveBaseUrl(req);
  const qrUrl = `${baseUrl}/shop/${shop.slug}`;

  try {
    // Generate QR code as base64 PNG
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: "#111827",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H",
    });

    return NextResponse.json({
      success: true,
      qrDataUrl,
      qrUrl,
      shop: {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: "QR generation failed" }, { status: 500 });
  }
}

// GET /api/admin/analytics — per-shop analytics
export async function POST(req: NextRequest) {
  const token =
    req.cookies.get("admin_token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  const session = verifyToken(token);
  if (!session || session.type !== "admin") {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = resolveBaseUrl(req);
  const analytics = db.getShopAnalytics(baseUrl);
  return NextResponse.json({ success: true, analytics });
}