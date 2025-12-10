'use client';

import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { useDisconnect, useSwitchChain } from 'wagmi';
import { useCallback, useEffect, useState } from 'react';
import { celoMainnet } from '@/config/appkit';

export function useWallet() {
  const [error, setError] = useState<string | null>(null);
  
  // AppKit hooks
  const { open, close } = useAppKit();
  const { address, isConnected, status } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  
  // Wagmi hooks
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const isConnecting = status === 'connecting';

  // Monitor chain and enforce Celo mainnet
  useEffect(() => {
    if (isConnected && chainId && chainId !== celoMainnet.id) {
      setError('Please switch to Celo mainnet');
      // Auto-attempt to switch chain
      try {
        switchChain?.({ chainId: celoMainnet.id });
      } catch (err) {
        console.error('Auto chain switch failed:', err);
      }
    } else if (isConnected && chainId === celoMainnet.id) {
      setError(null);
    }
  }, [isConnected, chainId, switchChain]);

  // Open wallet modal - this opens AppKit's beautiful modal
  const connectWallet = useCallback(() => {
    setError(null);
    open({ view: 'Connect' });
  }, [open]);

  // Open account modal for switching accounts or viewing details
  const openAccount = useCallback(() => {
    open({ view: 'Account' });
  }, [open]);

  // Open network modal for switching networks
  const openNetwork = useCallback(() => {
    open({ view: 'Networks' });
  }, [open]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    disconnect();
    close();
  }, [disconnect, close]);

  return {
    address: address as `0x${string}` | undefined,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    openAccount,
    openNetwork,
  };
}

// Helper to format address
export const formatAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
