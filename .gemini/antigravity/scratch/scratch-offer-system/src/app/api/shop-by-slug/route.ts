import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ success: false, message: "slug required" }, { status: 400 });
  }

  const shop = db.getShops().find((s) => s.slug === slug && s.isActive);
  if (!shop) {
    return NextResponse.json({ success: false, message: "Shop not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    shop: {
      id: shop.id,
      name: shop.name,
      category: shop.category,
      address: shop.address,
      slug: shop.slug,
    },
  });
}