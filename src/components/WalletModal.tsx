'use client';

import { useConnect, Connector } from 'wagmi';
import { LoadingSpinner } from './LoadingSpinner';

interface WalletModalProps {
  onClose: () => void;
  onConnect: (connector: Connector) => void;
  isConnecting: boolean;
  error: string | null;
}

export function WalletModal({ onClose, onConnect, isConnecting, error }: WalletModalProps) {
  const { connectors } = useConnect();

  const getConnectorIcon = (connector: Connector) => {
    const id = connector.id.toLowerCase();
    const name = connector.name.toLowerCase();
    
    if (id === 'farcaster' || name.includes('farcaster')) return '🎯';
    if (id.includes('walletconnect') || name.includes('walletconnect')) return '📱';
    if (id.includes('metamask') || name.includes('metamask')) return '🦊';
    if (id.includes('coinbase') || name.includes('coinbase')) return '🔵';
    if (id.includes('safe') || name.includes('safe')) return '🔐';
    if (id.includes('valora') || name.includes('valora')) return '🌿';
    if (id === 'injected') return '💼';
    return '🔗';
  };

  const getConnectorDescription = (connector: Connector) => {
    const id = connector.id.toLowerCase();
    const name = connector.name.toLowerCase();
    
    if (id === 'farcaster' || name.includes('farcaster')) return 'Native Farcaster wallet';
    if (id.includes('walletconnect') || name.includes('walletconnect')) return 'Connect any mobile wallet via QR';
    if (id.includes('metamask') || name.includes('metamask')) return 'MetaMask browser extension';
    if (id.includes('coinbase') || name.includes('coinbase')) return 'Coinbase Wallet app or extension';
    if (id.includes('safe') || name.includes('safe')) return 'Safe multisig wallet';
    if (id.includes('valora') || name.includes('valora')) return 'Celo mobile wallet';
    if (id === 'injected') return 'Browser extension wallet';
    return 'Connect wallet';
  };

  const getPriority = (connector: Connector) => {
    const id = connector.id.toLowerCase();
    
    // Farcaster wallet gets highest priority when inside Farcaster
    if (id === 'farcaster') return 0;
    // WalletConnect next - most compatible
    if (id.includes('walletconnect')) return 1;
    // Coinbase Wallet - popular
    if (id.includes('coinbase')) return 2;
    // Other specific wallets
    if (id.includes('metamask')) return 3;
    if (id.includes('safe')) return 4;
    if (id.includes('valora')) return 5;
    // Generic injected last
    if (id === 'injected') return 9;
    // Everything else
    return 8;
  };

  // Show all available connectors, just sorted by priority
  const sortedConnectors = [...connectors].sort((a, b) => getPriority(a) - getPriority(b));

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-b from-susu-brown to-susu-dark rounded-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-susu-cream">
            Connect Wallet
          </h2>
          <button 
            onClick={onClose}
            className="text-susu-cream/60 hover:text-susu-cream text-2xl"
          >
            ×
          </button>
        </div>

        {/* Description */}
        <p className="text-susu-cream/70 text-sm mb-6">
          Choose how you want to connect to CeloSusu
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-susu-error/10 border border-susu-error/30">
            <p className="text-sm text-susu-error">{error}</p>
          </div>
        )}

        {/* Wallet Options */}
        <div className="space-y-2">
          {sortedConnectors.length === 0 ? (
            <div className="text-center p-6 text-susu-cream/60">
              <p>No wallet options available</p>
              <p className="text-xs mt-2">Please install a Web3 wallet</p>
            </div>
          ) : (
            sortedConnectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => onConnect(connector)}
                disabled={isConnecting}
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getConnectorIcon(connector)}</div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-susu-cream">
                      {connector.name}
                    </p>
                    <p className="text-xs text-susu-cream/50">
                      {getConnectorDescription(connector)}
                    </p>
                  </div>
                  {isConnecting && <LoadingSpinner size="sm" />}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
