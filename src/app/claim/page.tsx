'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClaimPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/shop/brew-and-bean');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <p className="text-sm text-slate-500 font-medium">Shop Dashboard Redirecting...</p>
    </div>
  );
}
