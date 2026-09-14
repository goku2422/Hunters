import { redirect } from "next/navigation";

interface ScanPageProps {
  params: {
    merchantId: string;
  };
}

export default function MerchantScanRedirect({ params }: ScanPageProps) {
  const merchantId = params?.merchantId || "pancake-house";
  redirect(`/shop/${merchantId}`);
}
