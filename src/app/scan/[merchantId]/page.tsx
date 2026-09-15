import { redirect } from "next/navigation";

interface ScanPageProps {
  params: {
    merchantId: string;
  };
}

export default function MerchantScanRedirect({ params }: ScanPageProps) {
  const merchantId = params?.merchantId || "brew-and-bean";
  redirect(`/card/${encodeURIComponent(merchantId)}`);
}
