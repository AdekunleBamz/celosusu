'use client';

import { useEffect, useState } from 'react';
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

/**
 * Hook to interact with Farcaster Mini App SDK
 * Provides context about the user and miniapp environment
 */
export function useFarcasterSDK() {
  const [context, setContext] = useState<FarcasterContext>({
    isSDK: false,
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize SDK and get context
    const initSDK = async () => {
      try {
        // Check if we're in a Farcaster miniapp
        const sdkContext = await sdk.context;
        
        if (sdkContext) {
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

        // Signal that the miniapp is ready (hides splash screen)
        await sdk.actions.ready();
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize Farcaster SDK:', error);
        setIsReady(true); // Still set ready even if SDK fails
      }
    };

    initSDK();
  }, []);

  // Helper functions for SDK actions
  const openUrl = (url: string) => {
    sdk.actions.openUrl(url);
  };

  const composeCast = (text: string, embeds?: string[]) => {
    sdk.actions.composeCast({
      text,
      embeds: embeds || [],
    });
  };

  const addMiniApp = () => {
    sdk.actions.addMiniApp();
  };

  const close = () => {
    sdk.actions.close();
  };

  const viewProfile = (fid: number) => {
    sdk.actions.viewProfile({ fid });
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
