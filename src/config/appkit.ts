'use client';

import { cookieStorage, createStorage } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { celo } from '@reown/appkit/networks';
import type { AppKitNetwork } from '@reown/appkit/networks';

// Get WalletConnect project ID from environment
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  console.warn('WalletConnect project ID is not set. Please add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to your .env.local file');
}

// Celo mainnet network config
export const celoMainnet = {
  ...celo,
  rpcUrls: {
    default: {
      http: ['https://forno.celo.org'],
    },
  },
} as const satisfies AppKitNetwork;

// Define the networks with proper tuple type
export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [celoMainnet];

// Create Wagmi Adapter with AppKit
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId: projectId || '',
  networks,
});

// Export the wagmi config
export const config = wagmiAdapter.wagmiConfig;
