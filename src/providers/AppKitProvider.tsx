'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, type State } from 'wagmi';
import { ReactNode, useState } from 'react';
import { config } from '@/config/appkit';

interface AppKitProviderProps {
  children: ReactNode;
  initialState?: State;
}

export function AppKitProvider({ children, initialState }: AppKitProviderProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
