'use client';

import { useEffect, useState, useCallback } from 'react';
import { useConnect, useAccount, useDisconnect, useSwitchChain, Connector } from 'wagmi';
import { celoMainnet } from '@/config/wagmi';

// Farcaster Frame SDK types
interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

interface FrameContext {
  user?: FarcasterUser;
  isInFrame: boolean;
  ready: boolean;
}

// Hook to handle Farcaster frame context
export function useFarcasterFrame() {
  const [context, setContext] = useState<FrameContext>({
    isInFrame: false,
    ready: false,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { connect, connectors, status, error: connectError } = useConnect();
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  // Check if we're in a Farcaster frame
  useEffect(() => {
    const checkFrame = async () => {
      const isInFrame = typeof window !== 'undefined' && 
        (window.parent !== window || window !== window.top);

      if (isInFrame) {
        try {
          const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'farcaster:frame:context') {
              setContext({
                user: event.data.user,
                isInFrame: true,
                ready: true,
              });
            }
          };

          window.addEventListener('message', handleMessage);
          window.parent.postMessage({ type: 'farcaster:frame:ready' }, '*');

          setTimeout(() => {
            setContext(prev => ({ ...prev, isInFrame: true, ready: true }));
          }, 1000);

          return () => window.removeEventListener('message', handleMessage);
        } catch (e) {
          setContext({ isInFrame: true, ready: true });
        }
      } else {
        setContext({ isInFrame: false, ready: true });
      }
    };

    checkFrame();
  }, []);

  // Update connecting state based on wagmi status
  useEffect(() => {
    if (status === 'pending') {
      setIsConnecting(true);
    } else {
      setIsConnecting(false);
    }
  }, [status]);

  // Handle connect errors
  useEffect(() => {
    if (connectError) {
      setError(connectError.message);
      setIsConnecting(false);
    }
  }, [connectError]);

  // Monitor chain and enforce Celo mainnet
  useEffect(() => {
    if (isConnected && chain && chain.id !== celoMainnet.id && switchChain) {
      // User is connected but on wrong network
      setError('Please switch to Celo mainnet');
      // Auto-attempt to switch chain
      try {
        switchChain({ chainId: celoMainnet.id });
      } catch (err) {
        console.error('Auto chain switch failed:', err);
      }
    } else if (isConnected && chain && chain.id === celoMainnet.id) {
      // Clear error if we're on the correct chain
      if (error === 'Please switch to Celo mainnet') {
        setError(null);
      }
    }
  }, [isConnected, chain, switchChain, error]);

  // Auto-connect wallet in frame context
  const autoConnect = useCallback(async () => {
    if (isConnected || isConnecting || connectors.length === 0) return;

    try {
      setError(null);
      // Prioritize Farcaster miniapp connector when inside Farcaster
      const farcasterConnector = connectors.find(c => c.id === 'farcaster');
      const connector = farcasterConnector || connectors[0];
      
      if (connector) {
        console.log('Auto-connecting with:', connector.name);
        connect({ connector, chainId: celoMainnet.id });
      }
    } catch (err) {
      console.error('Auto-connect failed:', err);
    }
  }, [connect, connectors, isConnected, isConnecting]);

  // Connect wallet manually with chain enforcement
  const connectWallet = useCallback(async (selectedConnector?: Connector) => {
    if (isConnecting) return;
    
    setError(null);
    setIsConnecting(true);
    
    try {
      // If no connectors available
      if (connectors.length === 0) {
        setError('No wallet found. Please install a Web3 wallet or use WalletConnect');
        setIsConnecting(false);
        return;
      }
      
      let connector: Connector | undefined = selectedConnector;
      
      // If no specific connector selected, check if we're in Farcaster and auto-select
      if (!connector) {
        // Try Farcaster connector first
        const farcasterConnector = connectors.find(c => c.id === 'farcaster');
        if (farcasterConnector && context.isInFrame) {
          connector = farcasterConnector;
          console.log('Using Farcaster miniapp wallet');
        } else {
          // Let the calling component handle showing the modal
          setIsConnecting(false);
          return;
        }
      }
      
      console.log('Attempting connection with:', connector.name);
      
      // Connect to wallet with Celo mainnet chain ID
      await connect({ connector, chainId: celoMainnet.id });
      
      // Note: Chain switching will be handled by the useEffect monitoring chain changes
    } catch (err: any) {
      console.error('Connect failed:', err);
      setError(err?.message || 'Connection failed. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  }, [connect, connectors, isConnecting, context.isInFrame]);

  return {
    context,
    address,
    isConnected,
    isConnecting,
    error,
    autoConnect,
    connectWallet,
    disconnect,
    connectors,
  };
}

// Hook to send Farcaster frame actions
export function useFarcasterActions() {
  const shareToFarcaster = useCallback((text: string, url?: string) => {
    const shareUrl = url || window.location.href;
    const castIntent = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(shareUrl)}`;
    window.open(castIntent, '_blank');
  }, []);

  const openProfile = useCallback((fid: number) => {
    window.open(`https://warpcast.com/~/profiles/${fid}`, '_blank');
  }, []);

  return {
    shareToFarcaster,
    openProfile,
  };
}
