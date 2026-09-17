import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { INITIAL_SHOPS } from "@/lib/seed";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const mobile = searchParams.get("mobile");

  const cleanSlug = slug?.trim().toLowerCase() || "";
  if (!cleanSlug) {
    return NextResponse.json(
      { success: false, message: "Shop slug parameter is required." },
      { status: 400 }
    );
  }

  const shop = await db.getShopById(cleanSlug);

  if (!shop) {
    return NextResponse.json(
      { success: false, message: "Shop not found." },
      { status: 404 }
    );
  }

  const offer = await db.getShopOffer(shop.id);
  const stampsCount = mobile ? await db.getCustomerStampCount(mobile, shop.id) : 0;
  const isExpired = db.isOfferExpired(offer);

  return NextResponse.json({
    success: true,
    shop: {
      id: shop.id,
      name: shop.name,
      category: shop.category,
      address: shop.address,
      phone: shop.phone,
      slug: shop.slug || "brew-and-bean",
    },
    offer: {
      title: offer?.title || "Get 5% discount on your total bill after 8 visits",
      discountPercent: offer?.discountPercent || 15,
      visitsRequired: offer?.visitsRequired || 8,
      expiryDays: offer?.expiryDays || 30,
      expiryDate: offer?.expiryDate || "",
      description: offer?.description || "",
      terms: offer?.terms || "",
      image: offer?.image || "",
      isActive: offer?.isActive ?? true,
      isExpired,
    },
    stampsCount,
  });
}