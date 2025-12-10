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
    const name = connector.name.toLowerCase();
    if (name.includes('walletconnect')) return '📱';
    if (name.includes('metamask')) return '🦊';
    if (name.includes('coinbase')) return '🔵';
    if (name.includes('injected')) return '💼';
    return '🔗';
  };

  const getConnectorDescription = (connector: Connector) => {
    const name = connector.name.toLowerCase();
    if (name.includes('walletconnect')) return 'Connect with any mobile wallet';
    if (name.includes('metamask')) return 'Browser extension wallet';
    if (name.includes('coinbase')) return 'Coinbase Wallet';
    if (name.includes('injected')) return 'Browser wallet extension';
    return 'Connect your wallet';
  };

  const getPriority = (connector: Connector) => {
    // WalletConnect gets highest priority
    if (connector.id === 'walletConnect') return 1;
    if (connector.name.toLowerCase().includes('walletconnect')) return 1;
    // Then injected wallets
    if (connector.id === 'injected') return 2;
    // Everything else
    return 3;
  };

  // Sort connectors to show WalletConnect first
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
        <div className="space-y-3">
          {sortedConnectors.map((connector) => {
            const isWalletConnect = connector.id === 'walletConnect' || 
                                   connector.name.toLowerCase().includes('walletconnect');
            
            return (
              <button
                key={connector.id}
                onClick={() => onConnect(connector)}
                disabled={isConnecting}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  isWalletConnect
                    ? 'bg-gradient-to-r from-susu-gold/20 to-susu-amber/10 border-susu-gold hover:border-susu-gold hover:from-susu-gold/30 hover:to-susu-amber/20'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{getConnectorIcon(connector)}</div>
                  <div className="flex-1 text-left">
                    <p className={`font-semibold ${
                      isWalletConnect ? 'text-susu-gold' : 'text-susu-cream'
                    }`}>
                      {connector.name}
                      {isWalletConnect && (
                        <span className="ml-2 text-xs bg-susu-gold/20 text-susu-gold px-2 py-0.5 rounded-full">
                          Recommended
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-susu-cream/60">
                      {getConnectorDescription(connector)}
                    </p>
                  </div>
                  {isConnecting && (
                    <LoadingSpinner size="sm" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-6 p-3 rounded-xl bg-white/5">
          <p className="text-xs text-susu-cream/60 text-center">
            💡 <strong>Mobile users:</strong> Use WalletConnect to connect with any wallet app
          </p>
        </div>
      </div>
    </div>
  );
}
