import type { Metadata, Viewport } from 'next';
import { AppKitProvider } from '@/providers/AppKitProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'CeloSusu Savings Circles',
  description: 'Join rotating savings circles on Celo. Save together, support each other, build resilience.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'CeloSusu Savings Circles',
    description: 'Join rotating savings circles on Celo. Save together, support each other, build resilience.',
    url: 'https://celosusu.vercel.app',
    siteName: 'CeloSusu',
    images: [{
      url: 'https://celosusu.vercel.app/og-image.png',
      width: 1200,
      height: 630,
      alt: 'CeloSusu - Community Savings Circles'
    }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CeloSusu Savings Circles',
    description: 'Join rotating savings circles on Celo. Save together, support each other, build resilience.',
    images: ['https://celosusu.vercel.app/og-image.png'],
  },
  other: {
    'fc:miniapp': JSON.stringify({
      version: "1",
      imageUrl: "https://celosusu.vercel.app/og-image.png",
      button: {
        title: "🚀 Join Circle",
        action: {
          type: "launch_miniapp",
          name: "CeloSusu",
          url: "https://celosusu.vercel.app",
          splashImageUrl: "https://celosusu.vercel.app/icon.png",
          splashBackgroundColor: "#1A1207"
        }
      }
    }),
    'fc:frame': JSON.stringify({
      version: "1",
      imageUrl: "https://celosusu.vercel.app/og-image.png",
      button: {
        title: "🚀 Join Circle",
        action: {
          type: "launch_frame",
          name: "CeloSusu",
          url: "https://celosusu.vercel.app",
          splashImageUrl: "https://celosusu.vercel.app/icon.png",
          splashBackgroundColor: "#1A1207"
        }
      }
    }),
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
        <AppKitProvider>
          {children}
        </AppKitProvider>
      </body>
    </html>
  );
}
