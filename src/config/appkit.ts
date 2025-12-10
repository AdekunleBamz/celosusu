'use client';

import { cookieStorage, createStorage, http } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { celo } from '@reown/appkit/networks';
import type { AppKitNetwork } from '@reown/appkit/networks';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

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

// Create Farcaster miniapp connector
const farcasterConnector = farcasterMiniApp();

// Create Wagmi Adapter with AppKit + Farcaster connector
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId: projectId || '',
  networks,
  // Add Farcaster connector as a custom connector
  connectors: [farcasterConnector],
});

// Export the wagmi config
export const config = wagmiAdapter.wagmiConfig;

// Export Farcaster connector for direct access
export { farcasterConnector };
