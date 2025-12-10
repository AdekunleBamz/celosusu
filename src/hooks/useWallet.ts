'use client';

import { useConnect, useDisconnect, useSwitchChain, useAccount } from 'wagmi';
import { useCallback, useEffect, useState } from 'react';
import { celoMainnet } from '@/config/appkit';
import sdk from '@farcaster/miniapp-sdk';

export function useWallet() {
  const [error, setError] = useState<string | null>(null);
  const [isInFarcaster, setIsInFarcaster] = useState(false);
  const [farcasterChecked, setFarcasterChecked] = useState(false);
  
  // Wagmi hooks
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  // Detect if we're inside Farcaster miniapp on mount
  useEffect(() => {
    const detectFarcaster = async () => {
      try {
        const context = await sdk.context;
        const inFarcaster = !!context;
        setIsInFarcaster(inFarcaster);
        console.log('Farcaster detection:', inFarcaster ? 'IN Farcaster' : 'NOT in Farcaster');
      } catch (err) {
        console.log('Farcaster detection error:', err);
        setIsInFarcaster(false);
      }
      setFarcasterChecked(true);
    };
    detectFarcaster();
  }, []);

  // Log available connectors
  useEffect(() => {
    console.log('Available connectors:', connectors.map(c => ({ id: c.id, name: c.name })));
  }, [connectors]);

  // Monitor chain and enforce Celo mainnet
  useEffect(() => {
    if (isConnected && chain && chain.id !== celoMainnet.id) {
      setError('Please switch to Celo mainnet');
      try {
        switchChain?.({ chainId: celoMainnet.id });
      } catch (err) {
        console.error('Auto chain switch failed:', err);
      }
    } else if (isConnected && chain?.id === celoMainnet.id) {
      setError(null);
    }
  }, [isConnected, chain, switchChain]);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    setError(null);
    
    console.log('=== Connect Wallet Called ===');
    console.log('isInFarcaster:', isInFarcaster);
    console.log('farcasterChecked:', farcasterChecked);
    console.log('Connectors:', connectors.map(c => c.id));
    
    // If Farcaster not yet checked, check now
    let inFarcaster = isInFarcaster;
    if (!farcasterChecked) {
      try {
        const context = await sdk.context;
        inFarcaster = !!context;
        setIsInFarcaster(inFarcaster);
        setFarcasterChecked(true);
        console.log('Farcaster check result:', inFarcaster);
      } catch (e) {
        console.log('Farcaster check failed:', e);
        inFarcaster = false;
        setFarcasterChecked(true);
      }
    }
    
    // Find connectors
    const farcasterConnector = connectors.find(c => c.id === 'farcaster');
    const walletConnectConnector = connectors.find(c => c.id === 'walletConnect');
    
    console.log('Farcaster connector found:', !!farcasterConnector);
    console.log('WalletConnect connector found:', !!walletConnectConnector);
    
    if (inFarcaster && farcasterConnector) {
      // In Farcaster - use Farcaster wallet
      console.log('Attempting Farcaster wallet connection...');
      try {
        connect(
          { connector: farcasterConnector, chainId: celoMainnet.id },
          {
            onSuccess: (data) => console.log('Farcaster connect success:', data),
            onError: (err) => {
              console.error('Farcaster connect error:', err);
              setError('Failed to connect. Please try again.');
            },
          }
        );
      } catch (err) {
        console.error('Farcaster connect exception:', err);
        setError('Connection failed');
      }
    } else if (walletConnectConnector) {
      // Outside Farcaster - use WalletConnect
      console.log('Attempting WalletConnect connection...');
      try {
        connect(
          { connector: walletConnectConnector, chainId: celoMainnet.id },
          {
            onSuccess: (data) => console.log('WalletConnect success:', data),
            onError: (err) => {
              console.error('WalletConnect error:', err);
              setError('Failed to connect. Please try again.');
            },
          }
        );
      } catch (err) {
        console.error('WalletConnect exception:', err);
        setError('Connection failed');
      }
    } else {
      // Fallback to first available connector
      const firstConnector = connectors[0];
      if (firstConnector) {
        console.log('Using fallback connector:', firstConnector.id);
        connect({ connector: firstConnector, chainId: celoMainnet.id });
      } else {
        setError('No wallet connectors available');
      }
    }
  }, [isInFarcaster, farcasterChecked, connectors, connect]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    disconnect();
  }, [disconnect]);

  return {
    address,
    isConnected,
    isConnecting,
    isInFarcaster,
    error,
    connectWallet,
    disconnectWallet,
  };
}

// Helper to format address
export const formatAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
