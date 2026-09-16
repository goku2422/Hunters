import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Flinty | Digital Loyalty & Scratch Card Network',
  description: 'One Common QR Code network for retail scratch card offers and merchant counter notifications.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col">
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
