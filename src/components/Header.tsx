'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useFarcasterFrame } from '@/hooks/useFarcaster';
import { formatAddress } from '@/config/wagmi';
import { useTokenBalance } from '@/hooks/useContracts';
import { CONTRACTS } from '@/config/contracts';
import { formatTokenAmount } from '@/config/wagmi';
import { LoadingSpinner } from './LoadingSpinner';
import { WalletModal } from './WalletModal';

export function Header() {
  const [showWalletModal, setShowWalletModal] = useState(false);
  const { address, isConnected } = useAccount();
  const { connectWallet, disconnect, isConnecting, error } = useFarcasterFrame();
  
  const { data: cusdBalance } = useTokenBalance(CONTRACTS.CUSD, address);

  const handleConnectClick = () => {
    setShowWalletModal(true);
  };

  const handleWalletSelect = (connector: any) => {
    connectWallet(connector);
    setShowWalletModal(false);
  };

  const handleDisconnect = () => {
    console.log('Disconnect clicked');
    disconnect();
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-susu-gold/20">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-susu-gold to-susu-amber flex items-center justify-center">
              <span className="text-xl">🏦</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-susu-cream leading-tight">
                CeloSusu
              </h1>
              <p className="text-[10px] text-susu-gold uppercase tracking-wider">
                Savings Circles
              </p>
            </div>
          </div>

          {/* Wallet */}
          {isConnected && address ? (
            <div className="flex items-center gap-3">
              {/* Balance */}
              {cusdBalance !== undefined && (
                <div className="text-right">
                  <p className="text-xs text-susu-cream/60">Balance</p>
                  <p className="text-sm font-semibold text-susu-gold">
                    {formatTokenAmount(cusdBalance)} cUSD
                  </p>
                </div>
              )}
              
              {/* Address Button */}
              <button
                onClick={handleDisconnect}
                className="btn-ghost text-sm"
              >
                {formatAddress(address)}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-end">
              <button
                onClick={handleConnectClick}
                disabled={isConnecting}
                className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  'Connect Wallet'
                )}
              </button>
              {error && (
                <p className="text-xs text-susu-error mt-1 max-w-[150px] truncate">
                  {error}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Wallet Modal */}
      {showWalletModal && (
        <WalletModal
          onClose={() => setShowWalletModal(false)}
          onConnect={handleWalletSelect}
          isConnecting={isConnecting}
          error={error}
        />
      )}
    </header>
  );
}
