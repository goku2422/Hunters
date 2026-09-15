import CardClientView from "@/components/CardClientView";

export const dynamic = "force-dynamic";

interface CardPageProps {
  params: {
    shopSlug: string;
  };
}

export default function CardShopPage({ params }: CardPageProps) {
  const shopSlug = params?.shopSlug || "brew-and-bean";
  return <CardClientView shopSlug={shopSlug} />;
}
