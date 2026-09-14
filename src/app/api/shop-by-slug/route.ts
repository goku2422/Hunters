import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const mobile = searchParams.get("mobile");

  if (!slug) {
    return NextResponse.json({ success: false, message: "slug required" }, { status: 400 });
  }

  const shop = db.getShops().find((s) => s.slug === slug && s.isActive);
  if (!shop) {
    return NextResponse.json({ success: false, message: "Shop not found" }, { status: 404 });
  }

  const offer = db.getDefaultOffer();
  const stampsCount = mobile ? db.getCustomerStampCount(mobile, shop.id) : 0;

  return NextResponse.json({
    success: true,
    shop: {
      id: shop.id,
      name: shop.name,
      category: shop.category,
      address: shop.address,
      phone: shop.phone,
      slug: shop.slug,
    },
    offer: {
      title: offer?.title || "Get 5% discount on your total bill after 8 visits",
      discountPercent: offer?.discountPercent || 5,
      visitsRequired: 8,
      expiryDays: 30,
    },
    stampsCount,
  });
}