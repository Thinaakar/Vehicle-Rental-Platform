import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FIREBASE_FAVICON } from '@/data/firebase-assets';

const siteName = 'DriveXPro — Premium Vehicle Rental';
const siteDescription = 'Rent premium cars, bikes, SUVs and electric vehicles with confidence. Trusted by 10,000+ renters across 50+ cities.';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0F172A',
};

export const metadata: Metadata = {
  title: siteName,
  description: siteDescription,
  icons: {
    icon: { url: FIREBASE_FAVICON, type: 'image/svg+xml' },
  },
  openGraph: {
    type: 'website',
    siteName,
    title: siteName,
    description: siteDescription,
  },
  twitter: {
    card: 'summary',
    title: siteName,
    description: siteDescription,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
