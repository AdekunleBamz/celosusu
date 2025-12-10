'use client';

import { useState, useEffect } from 'react';
import {
  useCircleInfo,
  useCircleMembers,
  useIsMember,
  useCircleCreator,
  useCurrentRecipient,
  useCycleTimeRemaining,
  useAllContributed,
  useHasContributed,
  useTokenAllowance,
  useTokenBalance,
  useApproveToken,
  useContribute,
  useClaimPayout,
  useStartCircle,
  useLeaveCircle,
  CircleState,
  CIRCLE_STATE_LABELS,
} from '@/hooks/useContracts';
import { TOKENS } from '@/config/contracts';
import { formatAddress, formatTokenAmount } from '@/config/wagmi';
import { LoadingSpinner } from './LoadingSpinner';

interface CircleDetailModalProps {
  circleAddress: string;
  userAddress: string | undefined;
  onClose: () => void;
}

export function CircleDetailModal({ circleAddress, userAddress, onClose }: CircleDetailModalProps) {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  
  // Data fetching
  const { data: info, refetch: refetchInfo } = useCircleInfo(circleAddress);
  const { data: members, refetch: refetchMembers } = useCircleMembers(circleAddress);
  const { data: isMember } = useIsMember(circleAddress, userAddress);
  const { data: creator } = useCircleCreator(circleAddress);
  const { data: currentRecipient } = useCurrentRecipient(circleAddress);
  const { data: timeRemaining } = useCycleTimeRemaining(circleAddress);
  const { data: allContributed } = useAllContributed(circleAddress);
  
  // Get current cycle from info for contribution check
  const currentCycle = info ? info[4] : BigInt(0);
  const { data: hasContributed, refetch: refetchContributed } = useHasContributed(
    circleAddress, 
    currentCycle, 
    userAddress
  );

  // Token data
  const tokenAddress = info ? info[1] : undefined;
  const contributionAmount = info ? info[2] : BigInt(0);
  const { data: allowance, refetch: refetchAllowance } = useTokenAllowance(
    tokenAddress as string,
    userAddress,
    circleAddress
  );
  const { data: balance } = useTokenBalance(tokenAddress as string, userAddress);

  // Actions
  const { approve, isPending: isApproving, isConfirming: isConfirmingApprove, isSuccess: approveSuccess } = useApproveToken();
  const { contribute, isPending: isContributing, isConfirming: isConfirmingContribute, isSuccess: contributeSuccess } = useContribute();
  const { claimPayout, isPending: isClaiming, isConfirming: isConfirmingClaim, isSuccess: claimSuccess } = useClaimPayout();
  const { startCircle, isPending: isStarting, isConfirming: isConfirmingStart, isSuccess: startSuccess } = useStartCircle();
  const { leaveCircle, isPending: isLeaving, isConfirming: isConfirmingLeave, isSuccess: leaveSuccess } = useLeaveCircle();

  // Refetch on success
  useEffect(() => {
    if (approveSuccess) {
      refetchAllowance();
      setActiveAction(null);
    }
  }, [approveSuccess, refetchAllowance]);

  useEffect(() => {
    if (contributeSuccess) {
      refetchContributed();
      refetchInfo();
      setActiveAction(null);
    }
  }, [contributeSuccess, refetchContributed, refetchInfo]);

  useEffect(() => {
    if (claimSuccess || startSuccess || leaveSuccess) {
      refetchInfo();
      refetchMembers();
      setActiveAction(null);
      if (leaveSuccess) onClose();
    }
  }, [claimSuccess, startSuccess, leaveSuccess, refetchInfo, refetchMembers, onClose]);

  if (!info) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <LoadingSpinner />
      </div>
    );
  }

  const [name, token, contribution, memberCount, cycle, totalCycles, state, yieldEnabled] = info;
  const tokenInfo = TOKENS[token as keyof typeof TOKENS];
  const circleState = state as CircleState;
  const isCreator = creator?.toLowerCase() === userAddress?.toLowerCase();
  const isMyTurn = currentRecipient?.toLowerCase() === userAddress?.toLowerCase();
  const needsApproval = allowance !== undefined && allowance < contribution;
  const hasBalance = balance !== undefined && balance >= contribution;

  const formatTime = (seconds: bigint | undefined) => {
    if (!seconds || seconds === BigInt(0)) return 'Cycle ended';
    const s = Number(seconds);
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    return `${hours}h ${minutes}m`;
  };

  const handleApprove = () => {
    setActiveAction('approve');
    // Approve enough for all cycles (totalCycles)
    const approvalAmount = contribution * BigInt(Number(totalCycles) || 100);
    approve(token, circleAddress, approvalAmount);
  };

  const handleContribute = () => {
    // Double-check approval before contributing
    if (needsApproval) {
      handleApprove();
      return;
    }
    setActiveAction('contribute');
    contribute(circleAddress);
  };

  const handleClaim = () => {
    setActiveAction('claim');
    claimPayout(circleAddress);
  };

  const handleStart = () => {
    setActiveAction('start');
    startCircle(circleAddress);
  };

  const handleLeave = () => {
    setActiveAction('leave');
    leaveCircle(circleAddress);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80" onClick={onClose}>
      <div 
        className="absolute bottom-0 left-0 right-0 max-h-[90vh] bg-gradient-to-b from-susu-brown to-susu-dark rounded-t-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 rounded-full bg-susu-cream/30" />
        </div>

        {/* Content */}
        <div className="px-5 pb-8 overflow-y-auto max-h-[85vh]">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{yieldEnabled ? '🌱' : '🏦'}</span>
                <h2 className="font-display text-2xl font-bold text-susu-cream">{name}</h2>
              </div>
              <span className={`badge ${
                circleState === CircleState.OPEN ? 'badge-open' :
                circleState === CircleState.ACTIVE ? 'badge-active' :
                'badge-completed'
              }`}>
                {CIRCLE_STATE_LABELS[circleState]}
              </span>
            </div>
            <button onClick={onClose} className="text-susu-cream/60 text-2xl">×</button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <StatBox 
              label="Contribution" 
              value={`${formatTokenAmount(contribution)} ${tokenInfo?.symbol}`} 
            />
            <StatBox 
              label="Members" 
              value={`${memberCount.toString()}/12`} 
            />
            {circleState === CircleState.ACTIVE && (
              <>
                <StatBox 
                  label="Current Cycle" 
                  value={`${cycle.toString()}/${totalCycles.toString()}`} 
                />
                <StatBox 
                  label="Time Left" 
                  value={formatTime(timeRemaining)} 
                />
              </>
            )}
            <StatBox 
              label="Yield" 
              value={yieldEnabled ? 'Enabled 🌱' : 'Disabled'} 
            />
            <StatBox 
              label="Pool/Cycle" 
              value={`${formatTokenAmount(contribution * memberCount)} ${tokenInfo?.symbol}`} 
            />
          </div>

          {/* Current Recipient (Active circles) */}
          {circleState === CircleState.ACTIVE && currentRecipient && (
            <div className={`p-4 rounded-xl mb-6 ${
              isMyTurn 
                ? 'bg-susu-gold/20 border border-susu-gold' 
                : 'bg-white/5'
            }`}>
              <p className="text-sm text-susu-cream/60 mb-1">This cycle's recipient</p>
              <p className="font-semibold text-susu-cream">
                {isMyTurn ? '🎉 You!' : formatAddress(currentRecipient)}
              </p>
            </div>
          )}

          {/* Members List */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-susu-cream/60 uppercase tracking-wider mb-3">
              Members
            </h3>
            <div className="space-y-2">
              {members?.map((member, index) => (
                <div 
                  key={member}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-susu-gold/20 flex items-center justify-center text-sm">
                      {index + 1}
                    </div>
                    <span className="text-susu-cream">
                      {member.toLowerCase() === userAddress?.toLowerCase() 
                        ? 'You' 
                        : formatAddress(member)}
                    </span>
                  </div>
                  {member.toLowerCase() === creator?.toLowerCase() && (
                    <span className="text-xs text-susu-gold">Creator</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {isMember && (
            <div className="space-y-3">
              {/* OPEN state actions */}
              {circleState === CircleState.OPEN && (
                <>
                  {isCreator && Number(memberCount) >= 3 && (
                    <button
                      onClick={handleStart}
                      disabled={isStarting || isConfirmingStart}
                      className="w-full btn-primary"
                    >
                      {isStarting || isConfirmingStart ? (
                        <span className="flex items-center justify-center gap-2">
                          <LoadingSpinner size="sm" />
                          {isStarting ? 'Starting...' : 'Confirming...'}
                        </span>
                      ) : (
                        'Start Circle'
                      )}
                    </button>
                  )}
                  {isCreator && Number(memberCount) < 3 && (
                    <p className="text-center text-susu-cream/60 text-sm">
                      Need {3 - Number(memberCount)} more member(s) to start
                    </p>
                  )}
                  {!isCreator && (
                    <button
                      onClick={handleLeave}
                      disabled={isLeaving || isConfirmingLeave}
                      className="w-full btn-secondary text-susu-error border-susu-error hover:bg-susu-error hover:text-white"
                    >
                      {isLeaving || isConfirmingLeave ? 'Leaving...' : 'Leave Circle'}
                    </button>
                  )}
                </>
              )}

              {/* ACTIVE state actions */}
              {circleState === CircleState.ACTIVE && (
                <>
                  {/* Contribute */}
                  {!hasContributed && (
                    <>
                      {needsApproval ? (
                        <div className="space-y-2">
                          <div className="p-3 rounded-xl bg-susu-gold/10 border border-susu-gold/30">
                            <p className="text-sm text-susu-cream/80 text-center">
                              ⚠️ First, approve {tokenInfo?.symbol} spending
                            </p>
                          </div>
                          <button
                            onClick={handleApprove}
                            disabled={isApproving || isConfirmingApprove}
                            className="w-full btn-primary"
                          >
                            {isApproving || isConfirmingApprove ? (
                              <span className="flex items-center justify-center gap-2">
                                <LoadingSpinner size="sm" />
                                {isApproving ? 'Approving...' : 'Confirming...'}
                              </span>
                            ) : (
                              `1️⃣ Approve ${tokenInfo?.symbol} (One-time)`
                            )}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleContribute}
                          disabled={isContributing || isConfirmingContribute || !hasBalance}
                          className="w-full btn-primary"
                        >
                          {isContributing || isConfirmingContribute ? (
                            <span className="flex items-center justify-center gap-2">
                              <LoadingSpinner size="sm" />
                              {isContributing ? 'Contributing...' : 'Confirming...'}
                            </span>
                          ) : !hasBalance ? (
                            '❌ Insufficient Balance'
                          ) : (
                            `💰 Contribute ${formatTokenAmount(contribution)} ${tokenInfo?.symbol}`
                          )}
                        </button>
                      )}
                    </>
                  )}

                  {hasContributed && !isMyTurn && (
                    <div className="text-center p-4 rounded-xl bg-celo-green/10 border border-celo-green/30">
                      <p className="text-celo-green">✓ You've contributed this cycle</p>
                    </div>
                  )}

                  {/* Claim Payout */}
                  {isMyTurn && allContributed && timeRemaining === BigInt(0) && (
                    <button
                      onClick={handleClaim}
                      disabled={isClaiming || isConfirmingClaim}
                      className="w-full btn-primary pulse-gold"
                    >
                      {isClaiming || isConfirmingClaim ? (
                        <span className="flex items-center justify-center gap-2">
                          <LoadingSpinner size="sm" />
                          Claiming...
                        </span>
                      ) : (
                        '🎉 Claim Your Payout!'
                      )}
                    </button>
                  )}

                  {isMyTurn && !allContributed && (
                    <div className="text-center p-4 rounded-xl bg-susu-gold/10">
                      <p className="text-susu-gold">Waiting for all members to contribute...</p>
                    </div>
                  )}
                </>
              )}

              {/* COMPLETED state */}
              {circleState === CircleState.COMPLETED && (
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <p className="text-susu-cream/60">This circle has completed all cycles 🎉</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-white/5 text-center">
      <p className="text-xs text-susu-cream/60 mb-1">{label}</p>
      <p className="font-semibold text-susu-cream">{value}</p>
    </div>
  );
}
