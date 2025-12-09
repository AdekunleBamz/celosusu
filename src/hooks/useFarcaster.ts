'use client';

import { useEffect, useState, useCallback } from 'react';
import { useConnect, useAccount, useDisconnect, Connector } from 'wagmi';

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
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

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

  // Auto-connect wallet in frame context
  const autoConnect = useCallback(async () => {
    if (isConnected || isConnecting || connectors.length === 0) return;

    try {
      setError(null);
      const connector = connectors[0];
      if (connector) {
        connect({ connector });
      }
    } catch (err) {
      console.error('Auto-connect failed:', err);
    }
  }, [connect, connectors, isConnected, isConnecting]);

  // Connect wallet manually
  const connectWallet = useCallback(async () => {
    if (isConnecting || connectors.length === 0) return;
    
    setError(null);
    
    try {
      // Find the best connector (prefer injected/MetaMask)
      let connector: Connector | undefined = connectors.find(c => c.id === 'injected');
      
      if (!connector) {
        connector = connectors[0];
      }
      
      if (connector) {
        console.log('Connecting with:', connector.name);
        connect({ connector });
      } else {
        setError('No wallet connector available');
      }
    } catch (err: any) {
      console.error('Connect failed:', err);
      setError(err?.message || 'Connection failed');
    }
  }, [connect, connectors, isConnecting]);

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
