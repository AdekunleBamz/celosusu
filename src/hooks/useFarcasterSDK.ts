'use client';

import { useEffect, useState, useRef } from 'react';
import sdk from '@farcaster/miniapp-sdk';

interface FarcasterContext {
  isSDK: boolean;
  user?: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  };
}

// Call ready immediately when module loads (for fastest splash screen hide)
let readyCalled = false;
const callReadyEarly = () => {
  if (readyCalled || typeof window === 'undefined') return;
  readyCalled = true;
  
  // Call ready after a short delay to let app render
  setTimeout(() => {
    try {
      sdk.actions.ready();
      console.log('Farcaster SDK ready called');
    } catch (e) {
      // Not in Farcaster context, ignore
    }
  }, 500); // 0.5 second delay for app to initialize
};

// Try to call ready as soon as possible
if (typeof window !== 'undefined') {
  callReadyEarly();
}

/**
 * Hook to interact with Farcaster Mini App SDK
 * Provides context about the user and miniapp environment
 */
export function useFarcasterSDK() {
  const [context, setContext] = useState<FarcasterContext>({
    isSDK: false,
  });
  const [isReady, setIsReady] = useState(false);
  const initCalled = useRef(false);

  useEffect(() => {
    if (initCalled.current) return;
    initCalled.current = true;
    
    // Ensure ready is called
    callReadyEarly();
    
    // Initialize SDK and get context
    const initSDK = async () => {
      try {
        // Check if we're in a Farcaster miniapp by checking context
        const sdkContext = await sdk.context;
        
        if (sdkContext) {
          // We're in Farcaster - set context
          setContext({
            isSDK: true,
            user: sdkContext.user ? {
              fid: sdkContext.user.fid,
              username: sdkContext.user.username,
              displayName: sdkContext.user.displayName,
              pfpUrl: sdkContext.user.pfpUrl,
            } : undefined,
          });
        }
        
        setIsReady(true);
      } catch (error) {
        // Not in Farcaster context or SDK failed
        console.log('Not in Farcaster miniapp context');
        setIsReady(true);
      }
    };

    initSDK();
  }, []);

  // Helper functions for SDK actions
  const openUrl = (url: string) => {
    if (context.isSDK) {
      sdk.actions.openUrl(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const composeCast = (text: string, embeds?: string[]) => {
    if (context.isSDK) {
      sdk.actions.composeCast({
        text,
        ...(embeds && embeds.length > 0 ? { embeds: embeds as [string] | [string, string] } : {}),
      });
    } else {
      // Fallback to Warpcast intent URL
      const embedParams = embeds?.map(e => `embeds[]=${encodeURIComponent(e)}`).join('&') || '';
      const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}${embedParams ? '&' + embedParams : ''}`;
      window.open(url, '_blank');
    }
  };

  const addMiniApp = () => {
    if (context.isSDK) {
      sdk.actions.addMiniApp();
    }
  };

  const close = () => {
    if (context.isSDK) {
      sdk.actions.close();
    }
  };

  const viewProfile = (fid: number) => {
    if (context.isSDK) {
      sdk.actions.viewProfile({ fid });
    } else {
      window.open(`https://warpcast.com/~/profiles/${fid}`, '_blank');
    }
  };

  return {
    context,
    isReady,
    actions: {
      openUrl,
      composeCast,
      addMiniApp,
      close,
      viewProfile,
    },
  };
}
