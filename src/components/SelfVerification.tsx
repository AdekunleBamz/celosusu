'use client';

import { useState, useEffect } from 'react';
import { SelfAppBuilder, SelfQRcodeWrapper, type SelfApp } from '@selfxyz/qrcode';
import { getUniversalLink } from '@selfxyz/core';
import { LoadingSpinner } from './LoadingSpinner';

interface SelfVerificationProps {
  userAddress: string;
  onVerified: () => void;
  onClose: () => void;
}

export function SelfVerification({ userAddress, onVerified, onClose }: SelfVerificationProps) {
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'verifying' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    try {
      // Build Self app configuration
      const app = new SelfAppBuilder({
        appName: 'CeloSusu',
        scope: 'celosusu-savings',
        // Use your deployed backend endpoint for verification
        endpoint: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/self/verify`,
        endpointType: 'https',
        logoBase64: 'https://i.postimg.cc/mrmVf9hm/self.png',
        userId: userAddress,
        userIdType: 'hex',
        disclosures: {
          // Verify user is a unique human (18+ for financial services)
          minimumAge: 18,
          // We just need proof of humanity, not specific nationality
          excludedCountries: [],
        },
      }).build();

      setSelfApp(app);
      setStatus('ready');
    } catch (error) {
      console.error('Failed to initialize Self app:', error);
      setStatus('error');
      setErrorMessage('Failed to initialize verification');
    }
  }, [userAddress]);

  const handleSuccess = () => {
    setStatus('success');
    // Store verification in localStorage (in production, store on backend)
    localStorage.setItem(`self_verified_${userAddress}`, 'true');
    setTimeout(() => {
      onVerified();
    }, 1500);
  };

  const handleError = (error: any) => {
    console.error('Verification error:', error);
    setStatus('error');
    setErrorMessage(error?.message || 'Verification failed. Please try again.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80" onClick={onClose}>
      <div 
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-susu-brown to-susu-dark rounded-t-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 rounded-full bg-susu-cream/30" />
        </div>

        <div className="px-5 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-susu-cream">
                Verify Identity
              </h2>
              <p className="text-sm text-susu-cream/60">
                Powered by Self Protocol
              </p>
            </div>
            <button onClick={onClose} className="text-susu-cream/60 text-2xl">×</button>
          </div>

          {/* Why Verify */}
          <div className="mb-6 p-4 rounded-xl bg-white/5">
            <h3 className="font-semibold text-susu-cream mb-2">Why verify?</h3>
            <ul className="text-sm text-susu-cream/70 space-y-1">
              <li>✓ Proves you're a unique human</li>
              <li>✓ Prevents fake accounts in circles</li>
              <li>✓ Builds trust with other members</li>
              <li>✓ Your data stays private (zero-knowledge)</li>
            </ul>
          </div>

          {/* QR Code / Status */}
          <div className="flex flex-col items-center py-6">
            {status === 'loading' && (
              <div className="flex flex-col items-center gap-3">
                <LoadingSpinner />
                <p className="text-susu-cream/60">Initializing...</p>
              </div>
            )}

            {status === 'ready' && selfApp && (
              <div className="flex flex-col items-center">
                <p className="text-sm text-susu-cream/80 mb-4 text-center">
                  Scan with the Self app to verify your identity
                </p>
                <div className="bg-white p-4 rounded-2xl">
                  <SelfQRcodeWrapper
                    selfApp={selfApp}
                    onSuccess={handleSuccess}
                    onError={handleError}
                    size={200}
                  />
                </div>
                <p className="text-xs text-susu-cream/50 mt-4 text-center">
                  Don't have the Self app?{' '}
                  <a 
                    href="https://self.xyz" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-susu-gold underline"
                  >
                    Download it here
                  </a>
                </p>
              </div>
            )}

            {status === 'verifying' && (
              <div className="flex flex-col items-center gap-3">
                <LoadingSpinner />
                <p className="text-susu-gold">Verifying your proof...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-celo-green/20 flex items-center justify-center">
                  <span className="text-3xl">✓</span>
                </div>
                <p className="text-celo-green font-semibold">Verified Successfully!</p>
                <p className="text-sm text-susu-cream/60">Redirecting...</p>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-susu-error/20 flex items-center justify-center">
                  <span className="text-3xl">✗</span>
                </div>
                <p className="text-susu-error font-semibold">Verification Failed</p>
                <p className="text-sm text-susu-cream/60 text-center">{errorMessage}</p>
                <button
                  onClick={() => setStatus('ready')}
                  className="btn-secondary mt-2"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* Skip Option (for testing) */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => {
                localStorage.setItem(`self_verified_${userAddress}`, 'true');
                onVerified();
              }}
              className="w-full text-sm text-susu-cream/40 py-2"
            >
              [DEV] Skip verification
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook to check if user is verified
export function useSelfVerified(userAddress: string | undefined): boolean {
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (userAddress && typeof window !== 'undefined') {
      const verified = localStorage.getItem(`self_verified_${userAddress}`);
      setIsVerified(verified === 'true');
    }
  }, [userAddress]);

  return isVerified;
}
