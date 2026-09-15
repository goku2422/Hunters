import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { INITIAL_SHOPS } from "@/lib/seed";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const mobile = searchParams.get("mobile");

  const cleanSlug = slug?.trim().toLowerCase() || "";
  let shops = db.getShops();
  if (!shops || shops.length === 0) {
    shops = INITIAL_SHOPS;
  }

  // Find shop by slug, id, normalized name, or partial keyword match
  const shop =
    shops.find(
      (s) =>
        s.isActive &&
        (s.slug?.toLowerCase() === cleanSlug ||
          s.id?.toLowerCase() === cleanSlug ||
          s.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") === cleanSlug ||
          (cleanSlug && s.slug?.toLowerCase().includes(cleanSlug)) ||
          (cleanSlug && cleanSlug.includes(s.slug?.toLowerCase() || "")))
    ) ||
    shops.find(
      (s) =>
        s.slug?.toLowerCase() === cleanSlug ||
        s.id?.toLowerCase() === cleanSlug ||
        (cleanSlug && s.name?.toLowerCase().includes(cleanSlug))
    ) ||
    shops.find((s) => s.isActive) ||
    shops[0] ||
    INITIAL_SHOPS[0];

  const offer = db.getShopOffer(shop.id);
  const stampsCount = mobile ? db.getCustomerStampCount(mobile, shop.id) : 0;

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
      description: offer?.description || "",
    },
    stampsCount,
  });
}