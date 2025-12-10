'use client';

import { createAppKit } from '@reown/appkit/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, type State } from 'wagmi';
import { ReactNode, useEffect, useState } from 'react';
import { wagmiAdapter, projectId, networks, celoMainnet } from '@/config/appkit';

// Create query client
const queryClient = new QueryClient();

// App metadata
const metadata = {
  name: 'CeloSusu',
  description: 'Decentralized Savings Circles on Celo',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://celosusu.vercel.app',
  icons: ['https://celosusu.vercel.app/icon.png'],
};

// Initialize AppKit modal (only on client side)
let modal: ReturnType<typeof createAppKit> | null = null;

function getModal() {
  if (typeof window !== 'undefined' && !modal && projectId) {
    modal = createAppKit({
      adapters: [wagmiAdapter],
      projectId,
      networks,
      defaultNetwork: celoMainnet,
      metadata,
      features: {
        analytics: true,
        email: false, // Disable email login for simplicity
        socials: false, // Disable social logins for simplicity
        swaps: false,
        onramp: false,
      },
      themeMode: 'dark',
      themeVariables: {
        '--w3m-color-mix': '#B8860B',
        '--w3m-color-mix-strength': 20,
        '--w3m-accent': '#DAA520',
        '--w3m-border-radius-master': '12px',
      },
      allowUnsupportedChain: false,
      enableCoinbase: true,
      enableInjected: true,
      enableWalletConnect: true,
    });
  }
  return modal;
}

interface AppKitProviderProps {
  children: ReactNode;
  initialState?: State;
}

export function AppKitProvider({ children, initialState }: AppKitProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Initialize modal on client side
    getModal();
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {mounted ? children : null}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Export modal for direct access
export { getModal };
