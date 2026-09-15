'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClaimPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const targetShop =
        searchParams.get('shop') ||
        searchParams.get('merchant') ||
        searchParams.get('id') ||
        searchParams.get('slug');

      if (targetShop) {
        router.replace(`/card/${encodeURIComponent(targetShop)}`);
      } else {
        router.replace('/card/brew-and-bean');
      }
    } else {
      router.replace('/card/brew-and-bean');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <p className="text-sm text-slate-500 font-medium">Opening Brew & Bean Cafe Shop Dashboard...</p>
    </div>
  );
}
