'use client';

import { useState } from 'react';
import { useWallet, formatAddress } from '@/hooks/useWallet';
import { useTokenBalance } from '@/hooks/useContracts';
import { CONTRACTS } from '@/config/contracts';
import { formatTokenAmount } from '@/config/wagmi';
import { LoadingSpinner } from './LoadingSpinner';

export function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const { address, isConnected, isConnecting, error, connectWallet, disconnectWallet } = useWallet();
  
  const { data: cusdBalance } = useTokenBalance(CONTRACTS.CUSD, address);

  const handleDisconnect = () => {
    disconnectWallet();
    setShowDropdown(false);
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
              
              {/* Address Button with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="btn-ghost text-sm flex items-center gap-2"
                >
                  <span>{formatAddress(address)}</span>
                  <span className="text-xs">▼</span>
                </button>
                
                {/* Dropdown Menu */}
                {showDropdown && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowDropdown(false)}
                    />
                    
                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-susu-brown border border-susu-gold/20 shadow-xl z-50">
                      <div className="p-2">
                        <div className="px-3 py-2 border-b border-susu-gold/10">
                          <p className="text-xs text-susu-cream/60">Connected</p>
                          <p className="text-sm text-susu-cream font-mono">{formatAddress(address)}</p>
                        </div>
                        <button
                          onClick={handleDisconnect}
                          className="w-full mt-2 px-3 py-2 text-left text-sm text-susu-error hover:bg-susu-error/10 rounded-lg transition-colors"
                        >
                          🔌 Disconnect
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-end">
              <button
                onClick={connectWallet}
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
    </header>
  );
}