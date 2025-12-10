'use client';

import { useState, useEffect } from 'react';
import { 
  useCircleInfo, 
  useCircleMembers, 
  useIsMember,
  useCurrentRecipient,
  useCycleTimeRemaining,
  useJoinCircle,
  useTokenAllowance,
  useApproveToken,
  CircleState,
  CIRCLE_STATE_LABELS 
} from '@/hooks/useContracts';
import { CONTRACTS, TOKENS } from '@/config/contracts';
import { formatAddress, formatTokenAmount } from '@/config/wagmi';
import { LoadingSpinner } from './LoadingSpinner';
import { CircleDetailModal } from './CircleDetailModal';
import { SelfVerification, useSelfVerified } from './SelfVerification';

interface CircleCardProps {
  circleAddress: string;
  userAddress: string | undefined;
  showJoinButton?: boolean;
}

export function CircleCard({ circleAddress, userAddress, showJoinButton }: CircleCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [showSelfVerification, setShowSelfVerification] = useState(false);
  const [pendingJoin, setPendingJoin] = useState(false);
  
  const { data: info, isLoading } = useCircleInfo(circleAddress);
  const { data: members } = useCircleMembers(circleAddress);
  const { data: isMember } = useIsMember(circleAddress, userAddress);
  const { data: currentRecipient } = useCurrentRecipient(circleAddress);
  const { data: timeRemaining } = useCycleTimeRemaining(circleAddress);
  
  const { joinCircle, isPending: isJoining, isConfirming, isSuccess: joinSuccess } = useJoinCircle();
  
  // Token approval hooks
  const tokenAddress = info ? info[1] : undefined;
  const contributionAmount = info ? info[2] : BigInt(0);
  const cycleCount = info ? info[5] : BigInt(12);
  
  const { data: allowance, refetch: refetchAllowance } = useTokenAllowance(
    tokenAddress as string,
    userAddress,
    circleAddress
  );
  const { approve, isPending: isApproving, isConfirming: isConfirmingApprove, isSuccess: approveSuccess } = useApproveToken();
  
  // Check if user is Self verified
  const isVerified = useSelfVerified(userAddress);
  
  // Calculate if approval is needed (approve enough for all cycles)
  const totalRequired = contributionAmount * BigInt(Number(cycleCount) || 12);
  const needsApproval = allowance !== undefined && allowance < totalRequired;

  // After approval succeeds, join the circle
  useEffect(() => {
    if (approveSuccess && pendingJoin) {
      refetchAllowance();
      // Small delay to ensure state is updated
      setTimeout(() => {
        joinCircle(circleAddress);
        setPendingJoin(false);
      }, 500);
    }
  }, [approveSuccess, pendingJoin, circleAddress, joinCircle, refetchAllowance]);

  // Reset pending state after join success
  useEffect(() => {
    if (joinSuccess) {
      setPendingJoin(false);
    }
  }, [joinSuccess]);

  if (isLoading || !info) {
    return <div className="card shimmer h-40" />;
  }

  const [name, token, contribution, memberCount, cycle, totalCycles, state, yieldEnabled] = info;
  const tokenInfo = TOKENS[token as keyof typeof TOKENS];
  const circleState = state as CircleState;
  
  const formatTimeRemaining = (seconds: bigint | undefined) => {
    if (!seconds || seconds === BigInt(0)) return 'Ended';
    const s = Number(seconds);
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    if (days > 0) return `${days}d ${hours}h`;
    const minutes = Math.floor((s % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If not verified, show Self verification first
    if (!isVerified) {
      setShowSelfVerification(true);
      return;
    }
    
    // If needs approval, approve first then join
    if (needsApproval && tokenAddress) {
      setPendingJoin(true);
      approve(tokenAddress, circleAddress, totalRequired);
      return;
    }
    
    // If verified and approved, proceed to join
    joinCircle(circleAddress);
  };

  const handleVerified = () => {
    setShowSelfVerification(false);
    
    // After verification, check if approval is needed
    if (needsApproval && tokenAddress) {
      setPendingJoin(true);
      approve(tokenAddress, circleAddress, totalRequired);
      return;
    }
    
    // If no approval needed, join directly
    joinCircle(circleAddress);
  };

  const isMyTurn = currentRecipient?.toLowerCase() === userAddress?.toLowerCase();
  
  return (
    <>
      <div 
        onClick={() => setShowDetail(true)}
        className="card-hover cursor-pointer"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-susu-gold/20 to-susu-amber/10 flex items-center justify-center text-2xl">
              {yieldEnabled ? '🌱' : '🏦'}
            </div>
            <div>
              <h3 className="font-display font-semibold text-susu-cream text-lg">
                {name}
              </h3>
              <p className="text-sm text-susu-cream/60">
                {formatTokenAmount(contribution)} {tokenInfo?.symbol || 'tokens'}/cycle
              </p>
            </div>
          </div>
          
          <span className={`badge ${
            circleState === CircleState.OPEN ? 'badge-open' :
            circleState === CircleState.ACTIVE ? 'badge-active' :
            'badge-completed'
          }`}>
            {CIRCLE_STATE_LABELS[circleState]}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 rounded-lg bg-white/5">
            <p className="text-lg font-semibold text-susu-cream">{memberCount.toString()}/12</p>
            <p className="text-xs text-susu-cream/60">Members</p>
          </div>
          
          {circleState === CircleState.ACTIVE && (
            <>
              <div className="text-center p-2 rounded-lg bg-white/5">
                <p className="text-lg font-semibold text-susu-gold">
                  {cycle.toString()}/{totalCycles.toString()}
                </p>
                <p className="text-xs text-susu-cream/60">Cycle</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/5">
                <p className="text-lg font-semibold text-susu-cream">
                  {formatTimeRemaining(timeRemaining)}
                </p>
                <p className="text-xs text-susu-cream/60">Remaining</p>
              </div>
            </>
          )}
          
          {circleState === CircleState.OPEN && (
            <>
              <div className="text-center p-2 rounded-lg bg-white/5">
                <p className="text-lg font-semibold text-susu-cream">
                  {formatTokenAmount(contribution * memberCount)}
                </p>
                <p className="text-xs text-susu-cream/60">Pool/Cycle</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/5">
                <p className="text-lg font-semibold text-celo-green">
                  {yieldEnabled ? '✓' : '✗'}
                </p>
                <p className="text-xs text-susu-cream/60">Yield</p>
              </div>
            </>
          )}
        </div>

        {/* Action Row */}
        {circleState === CircleState.ACTIVE && isMember && isMyTurn && (
          <div className="p-3 rounded-xl bg-susu-gold/10 border border-susu-gold/30 mb-3">
            <p className="text-center text-susu-gold font-medium">
              🎉 It's your turn to receive the payout!
            </p>
          </div>
        )}

        {/* Join Button */}
        {showJoinButton && circleState === CircleState.OPEN && !isMember && (
          <button
            onClick={handleJoinClick}
            disabled={isJoining || isConfirming || isApproving || isConfirmingApprove}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            {(isApproving || isConfirmingApprove) ? (
              <>
                <LoadingSpinner size="sm" />
                {isApproving ? 'Approving...' : 'Confirming Approval...'}
              </>
            ) : (isJoining || isConfirming) ? (
              <>
                <LoadingSpinner size="sm" />
                {isJoining ? 'Joining...' : 'Confirming...'}
              </>
            ) : !isVerified ? (
              <>
                <span>🛡️</span>
                Verify & Join
              </>
            ) : needsApproval ? (
              <>
                <span>✓</span>
                Approve & Join
              </>
            ) : (
              'Join Circle'
            )}
          </button>
        )}

        {/* Member Badge */}
        {isMember && (
          <div className="flex items-center justify-center gap-2 text-sm text-celo-green">
            <span>✓</span>
            <span>You're a member</span>
            {isVerified && <span className="text-susu-gold">• Verified</span>}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <CircleDetailModal
          circleAddress={circleAddress}
          userAddress={userAddress}
          onClose={() => setShowDetail(false)}
        />
      )}

      {/* Self Verification Modal */}
      {showSelfVerification && userAddress && (
        <SelfVerification
          userAddress={userAddress}
          onVerified={handleVerified}
          onClose={() => setShowSelfVerification(false)}
        />
      )}
    </>
  );
}
