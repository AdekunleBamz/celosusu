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
    if (id.includes('valora') || name.includes('valora')) return '🌿';
    if (id === 'injected') return '💼';
    return '🔗';
  };

  const getConnectorDescription = (connector: Connector) => {
    const id = connector.id.toLowerCase();
    const name = connector.name.toLowerCase();
    
    if (id === 'farcaster' || name.includes('farcaster')) return 'Farcaster Wallet';
    if (id.includes('walletconnect') || name.includes('walletconnect')) return 'Scan QR code with any wallet';
    if (id.includes('metamask') || name.includes('metamask')) return 'Browser extension';
    if (id.includes('coinbase') || name.includes('coinbase')) return 'Browser extension or app';
    if (id.includes('valora') || name.includes('valora')) return 'Celo mobile wallet';
    if (id === 'injected') return 'Detected browser wallet';
    return 'Connect wallet';
  };

  const getPriority = (connector: Connector) => {
    const id = connector.id.toLowerCase();
    const name = connector.name.toLowerCase();
    
    // Farcaster wallet gets highest priority when inside Farcaster
    if (id === 'farcaster') return 0;
    // WalletConnect next
    if (id.includes('walletconnect') || name.includes('walletconnect')) return 1;
    // Detected specific wallets
    if (id.includes('metamask') || id.includes('coinbase') || id.includes('valora')) return 2;
    // Generic injected last
    if (id === 'injected') return 3;
    // Everything else
    return 4;
  };

  // Filter and sort connectors
  // Only show injected if no specific wallet extensions detected
  const hasSpecificWallet = connectors.some(c => 
    c.id.includes('metamask') || c.id.includes('coinbase') || c.id.includes('valora')
  );
  
  const filteredConnectors = connectors.filter(connector => {
    // Always show Farcaster, WalletConnect, and specific wallets
    if (connector.id === 'farcaster') return true;
    if (connector.id.includes('walletconnect')) return true;
    if (connector.id.includes('metamask')) return true;
    if (connector.id.includes('coinbase')) return true;
    if (connector.id.includes('valora')) return true;
    
    // Only show generic "Injected" if no specific wallet detected
    if (connector.id === 'injected') return !hasSpecificWallet;
    
    return false;
  });

  const sortedConnectors = [...filteredConnectors].sort((a, b) => getPriority(a) - getPriority(b));

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
          {sortedConnectors.length === 0 ? (
            <div className="text-center p-6 text-susu-cream/60">
              <p>No wallet detected</p>
              <p className="text-xs mt-2">Please install a Web3 wallet extension</p>
            </div>
          ) : (
            sortedConnectors.map((connector) => {
              const isFarcaster = connector.id === 'farcaster';
              const isWalletConnect = connector.id.includes('walletconnect') || 
                                     connector.name.toLowerCase().includes('walletconnect');
              const isHighlighted = isFarcaster || isWalletConnect;
              
              return (
                <button
                  key={connector.id}
                  onClick={() => onConnect(connector)}
                  disabled={isConnecting}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    isHighlighted
                      ? 'bg-gradient-to-r from-susu-gold/20 to-susu-amber/10 border-susu-gold hover:border-susu-gold hover:from-susu-gold/30 hover:to-susu-amber/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{getConnectorIcon(connector)}</div>
                    <div className="flex-1 text-left">
                      <p className={`font-semibold ${
                        isHighlighted ? 'text-susu-gold' : 'text-susu-cream'
                      }`}>
                        {connector.name}
                        {isHighlighted && (
                          <span className="ml-2 text-xs bg-susu-gold/20 text-susu-gold px-2 py-0.5 rounded-full">
                            {isFarcaster ? 'Native' : 'Recommended'}
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
            })
          )}
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
