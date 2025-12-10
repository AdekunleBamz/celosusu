'use client';

import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { useCallback, useEffect, useState, useRef } from 'react';
import { celoMainnet } from '@/config/appkit';

export function useWallet() {
  const [error, setError] = useState<string | null>(null);
  const [isInFarcaster, setIsInFarcaster] = useState(false);
  const autoConnectAttempted = useRef(false);
  
  // AppKit hooks
  const { open, close } = useAppKit();
  const { address, isConnected, status } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  
  // Wagmi hooks
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const isConnecting = status === 'connecting';

  // Detect if we're inside Farcaster miniapp
  useEffect(() => {
    const detectFarcaster = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const sdk = (await import('@farcaster/miniapp-sdk')).default;
        const context = await sdk.context;
        if (context) {
          setIsInFarcaster(true);
          console.log('Detected Farcaster miniapp context');
        }
      } catch (err) {
        // Not in Farcaster context
        setIsInFarcaster(false);
      }
    };
    detectFarcaster();
  }, []);

  // Auto-connect with Farcaster wallet when in miniapp
  useEffect(() => {
    if (isInFarcaster && !isConnected && !isConnecting && !autoConnectAttempted.current) {
      autoConnectAttempted.current = true;
      
      // Find the Farcaster connector
      const farcasterConnector = connectors.find(c => c.id === 'farcaster');
      if (farcasterConnector) {
        console.log('Auto-connecting with Farcaster wallet...');
        connect({ connector: farcasterConnector, chainId: celoMainnet.id });
      }
    }
  }, [isInFarcaster, isConnected, isConnecting, connectors, connect]);

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

  // Connect wallet - use Farcaster in miniapp, AppKit modal otherwise
  const connectWallet = useCallback(() => {
    setError(null);
    
    if (isInFarcaster) {
      // In Farcaster, connect directly with Farcaster wallet
      const farcasterConnector = connectors.find(c => c.id === 'farcaster');
      if (farcasterConnector) {
        console.log('Connecting with Farcaster wallet...');
        connect({ connector: farcasterConnector, chainId: celoMainnet.id });
        return;
      }
    }
    
    // Outside Farcaster, open AppKit modal
    open({ view: 'Connect' });
  }, [isInFarcaster, connectors, connect, open]);

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
    autoConnectAttempted.current = false;
  }, [disconnect, close]);

  return {
    address: address as `0x${string}` | undefined,
    isConnected,
    isConnecting,
    isInFarcaster,
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
