import type { Metadata, Viewport } from 'next';
import { Providers } from '@/providers/WagmiProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'CeloSusu - Savings Circles on Celo',
  description: 'Join decentralized savings circles (Ajo/Esusu) on Celo. Pool funds with friends, earn yield, and build financial community.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'CeloSusu - Savings Circles',
    description: 'Decentralized rotating savings circles on Celo blockchain',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CeloSusu - Savings Circles',
    description: 'Decentralized rotating savings circles on Celo blockchain',
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': '/og-image.png',
    'fc:frame:button:1': 'Join Savings Circle',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': 'https://your-domain.com',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1A1207',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
