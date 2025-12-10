'use client';

import { cookieStorage, createStorage, http, createConfig } from '@wagmi/core';
import { celo } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

// Get WalletConnect project ID from environment
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

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
    public: {
      http: ['https://forno.celo.org'],
    },
  },
};

// Create wagmi config with Farcaster connector FIRST (highest priority)
export const config = createConfig({
  chains: [celoMainnet],
  connectors: [
    // Farcaster connector - first priority for miniapp
    farcasterMiniApp(),
    // WalletConnect for external wallets
    walletConnect({
      projectId,
      metadata: {
        name: 'CeloSusu',
        description: 'Decentralized Savings Circles on Celo',
        url: 'https://celosusu.vercel.app',
        icons: ['https://celosusu.vercel.app/icon.png'],
      },
      showQrModal: true,
    }),
    // Coinbase Wallet
    coinbaseWallet({
      appName: 'CeloSusu',
    }),
    // Injected wallets (MetaMask, etc)
    injected(),
  ],
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [celoMainnet.id]: http('https://forno.celo.org'),
  },
  ssr: true,
});

// For AppKit compatibility
export const networks = [celoMainnet] as const;
