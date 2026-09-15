import CardClientView from "@/components/CardClientView";

export const dynamic = "force-dynamic";

interface ShopPageProps {
  params: {
    shopSlug: string;
  };
}

export default function ShopScanPage({ params }: ShopPageProps) {
  const shopSlug = params?.shopSlug || "brew-and-bean";
  return <CardClientView shopSlug={shopSlug} />;
}
