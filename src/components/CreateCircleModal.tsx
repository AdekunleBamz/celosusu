'use client';

import { useState, useEffect } from 'react';
import { useCreateCircle } from '@/hooks/useContracts';
import { CONTRACTS, TOKENS } from '@/config/contracts';
import { LoadingSpinner } from './LoadingSpinner';

interface CreateCircleModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateCircleModal({ onClose, onSuccess }: CreateCircleModalProps) {
  const [name, setName] = useState('');
  const [token, setToken] = useState<string>(CONTRACTS.CUSD);
  const [contribution, setContribution] = useState('10');
  const [yieldEnabled, setYieldEnabled] = useState(true);
  const [error, setError] = useState('');

  const { createCircle, isPending, isConfirming, isSuccess, error: txError } = useCreateCircle();

  useEffect(() => {
    if (isSuccess) {
      onSuccess();
    }
  }, [isSuccess, onSuccess]);

  useEffect(() => {
    if (txError) {
      setError(txError.message || 'Transaction failed');
    }
  }, [txError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a circle name');
      return;
    }

    if (name.length > 50) {
      setError('Name must be 50 characters or less');
      return;
    }

    const contributionNum = parseFloat(contribution);
    if (isNaN(contributionNum) || contributionNum <= 0) {
      setError('Please enter a valid contribution amount');
      return;
    }

    createCircle(name.trim(), token, contribution, yieldEnabled);
  };

  const tokenInfo = TOKENS[token as keyof typeof TOKENS];

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

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-5 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-susu-cream">
              Create Circle
            </h2>
            <button 
              type="button" 
              onClick={onClose} 
              className="text-susu-cream/60 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Circle Name */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-susu-cream/80 mb-2">
              Circle Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Family Savings, Friends Circle"
              maxLength={50}
              className="input"
            />
            <p className="text-xs text-susu-cream/50 mt-1">{name.length}/50</p>
          </div>

          {/* Token Selection */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-susu-cream/80 mb-2">
              Contribution Token
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setToken(CONTRACTS.CUSD)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  token === CONTRACTS.CUSD
                    ? 'border-susu-gold bg-susu-gold/10'
                    : 'border-susu-gold/20 bg-white/5'
                }`}
              >
                <span className="text-2xl mb-1 block">💵</span>
                <span className="font-semibold text-susu-cream">cUSD</span>
                <p className="text-xs text-susu-cream/60">Celo Dollar</p>
              </button>
              
              <button
                type="button"
                onClick={() => setToken(CONTRACTS.CEUR)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  token === CONTRACTS.CEUR
                    ? 'border-susu-gold bg-susu-gold/10'
                    : 'border-susu-gold/20 bg-white/5'
                }`}
              >
                <span className="text-2xl mb-1 block">💶</span>
                <span className="font-semibold text-susu-cream">cEUR</span>
                <p className="text-xs text-susu-cream/60">Celo Euro</p>
              </button>
            </div>
          </div>

          {/* Contribution Amount */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-susu-cream/80 mb-2">
              Weekly Contribution ({tokenInfo?.symbol})
            </label>
            <div className="relative">
              <input
                type="number"
                value={contribution}
                onChange={(e) => setContribution(e.target.value)}
                placeholder="10"
                min="0.01"
                step="0.01"
                className="input pr-16"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-susu-cream/60">
                {tokenInfo?.symbol}
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              {['5', '10', '25', '50', '100'].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setContribution(amount)}
                  className={`flex-1 py-1.5 text-sm rounded-lg transition-all ${
                    contribution === amount
                      ? 'bg-susu-gold text-susu-dark'
                      : 'bg-white/10 text-susu-cream/80'
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {/* Yield Toggle */}
          <div className="mb-6">
            <div 
              onClick={() => setYieldEnabled(!yieldEnabled)}
              className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                yieldEnabled 
                  ? 'bg-celo-green/10 border border-celo-green/30' 
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{yieldEnabled ? '🌱' : '🏦'}</span>
                <div>
                  <p className="font-medium text-susu-cream">Yield Generation</p>
                  <p className="text-xs text-susu-cream/60">
                    Earn interest via Moola Market
                  </p>
                </div>
              </div>
              <div className={`w-12 h-7 rounded-full transition-all ${
                yieldEnabled ? 'bg-celo-green' : 'bg-white/20'
              }`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all mt-1 ${
                  yieldEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mb-6 p-4 rounded-xl bg-white/5">
            <h4 className="text-sm font-medium text-susu-cream/60 mb-3">Preview</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-susu-cream/60">Weekly contribution</span>
                <span className="text-susu-cream">{contribution} {tokenInfo?.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-susu-cream/60">Max pool (12 members)</span>
                <span className="text-susu-cream">{parseFloat(contribution) * 12} {tokenInfo?.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-susu-cream/60">Cycle duration</span>
                <span className="text-susu-cream">7 days</span>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-susu-error/10 border border-susu-error/30">
              <p className="text-sm text-susu-error">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending || isConfirming}
            className="w-full btn-primary"
          >
            {isPending || isConfirming ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                {isPending ? 'Creating...' : 'Confirming...'}
              </span>
            ) : (
              'Create Circle'
            )}
          </button>

          <p className="text-xs text-center text-susu-cream/50 mt-3">
            You'll be the first member and can start the circle once 3+ members join.
          </p>
        </form>
      </div>
    </div>
  );
}
