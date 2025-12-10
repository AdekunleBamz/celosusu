'use client';

import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { useCallback, useEffect, useState } from 'react';
import { celoMainnet } from '@/config/appkit';
import sdk from '@farcaster/miniapp-sdk';

export function useWallet() {
  const [error, setError] = useState<string | null>(null);
  const [isInFarcaster, setIsInFarcaster] = useState(false);
  const [farcasterReady, setFarcasterReady] = useState(false);
  
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
        const context = await sdk.context;
        if (context) {
          setIsInFarcaster(true);
          setFarcasterReady(true);
          console.log('Detected Farcaster miniapp context');
        } else {
          setFarcasterReady(true);
        }
      } catch (err) {
        // Not in Farcaster context
        setIsInFarcaster(false);
        setFarcasterReady(true);
      }
    };
    detectFarcaster();
  }, []);

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
  const connectWallet = useCallback(async () => {
    setError(null);
    console.log('connectWallet called, isInFarcaster:', isInFarcaster, 'connectors:', connectors.map(c => c.id));
    
    // Check Farcaster context directly if not yet detected
    let inFarcaster = isInFarcaster;
    if (!farcasterReady) {
      try {
        const context = await sdk.context;
        inFarcaster = !!context;
        setIsInFarcaster(inFarcaster);
        setFarcasterReady(true);
      } catch (e) {
        inFarcaster = false;
      }
    }
    
    if (inFarcaster) {
      // In Farcaster, connect with Farcaster wallet
      const farcasterConnector = connectors.find(c => c.id === 'farcaster');
      console.log('Farcaster connector:', farcasterConnector);
      
      if (farcasterConnector) {
        try {
          console.log('Connecting with Farcaster wallet...');
          connect({ connector: farcasterConnector, chainId: celoMainnet.id });
          return;
        } catch (err) {
          console.error('Farcaster connect error:', err);
          setError('Failed to connect Farcaster wallet');
        }
      } else {
        console.log('Farcaster connector not found, falling back to AppKit');
        // Fallback to AppKit if Farcaster connector not available
        open({ view: 'Connect' });
      }
      return;
    }
    
    // Outside Farcaster, open AppKit modal
    console.log('Opening AppKit modal');
    open({ view: 'Connect' });
  }, [isInFarcaster, farcasterReady, connectors, connect, open]);

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
