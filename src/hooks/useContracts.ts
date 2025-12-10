'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { 
  CONTRACTS, 
  SUSU_FACTORY_ABI, 
  SUSU_CIRCLE_ABI, 
  ERC20_ABI,
  TOKENS 
} from '@/config/contracts';
import { parseTokenAmount } from '@/config/wagmi';

// Circle state enum
export enum CircleState {
  OPEN = 0,
  ACTIVE = 1,
  COMPLETED = 2,
  CANCELLED = 3,
}

export const CIRCLE_STATE_LABELS = {
  [CircleState.OPEN]: 'Open',
  [CircleState.ACTIVE]: 'Active',
  [CircleState.COMPLETED]: 'Completed',
  [CircleState.CANCELLED]: 'Cancelled',
};

// Hook to get all circles from factory
export function useAllCircles(offset: number = 0, limit: number = 20) {
  return useReadContract({
    address: CONTRACTS.SUSU_FACTORY as `0x${string}`,
    abi: SUSU_FACTORY_ABI,
    functionName: 'getCircles',
    args: [BigInt(offset), BigInt(limit)],
  });
}

// Hook to get open circles
export function useOpenCircles(offset: number = 0, limit: number = 20) {
  return useReadContract({
    address: CONTRACTS.SUSU_FACTORY as `0x${string}`,
    abi: SUSU_FACTORY_ABI,
    functionName: 'getOpenCircles',
    args: [BigInt(offset), BigInt(limit)],
  });
}

// Hook to get user's circles
export function useUserCircles(userAddress: string | undefined) {
  return useReadContract({
    address: CONTRACTS.SUSU_FACTORY as `0x${string}`,
    abi: SUSU_FACTORY_ABI,
    functionName: 'getMemberCircles',
    args: [userAddress as `0x${string}`],
    query: {
      enabled: !!userAddress,
    },
  });
}

// Hook to get total circles count
export function useTotalCircles() {
  return useReadContract({
    address: CONTRACTS.SUSU_FACTORY as `0x${string}`,
    abi: SUSU_FACTORY_ABI,
    functionName: 'getTotalCircles',
  });
}

// Hook to create a new circle - WITH EXPLICIT GAS LIMIT FOR FARCASTER
export function useCreateCircle() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createCircle = (
    name: string,
    token: string,
    contributionAmount: string,
    yieldEnabled: boolean
  ) => {
    const amount = parseTokenAmount(contributionAmount);
    
    writeContract({
      address: CONTRACTS.SUSU_FACTORY as `0x${string}`,
      abi: SUSU_FACTORY_ABI,
      functionName: 'createCircle',
      args: [name, token as `0x${string}`, amount, yieldEnabled],
      gas: BigInt(2000000), // Explicit gas limit - bypasses estimation
    });
  };

  return {
    createCircle,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// Hook to get circle info
export function useCircleInfo(circleAddress: string | undefined) {
  return useReadContract({
    address: circleAddress as `0x${string}`,
    abi: SUSU_CIRCLE_ABI,
    functionName: 'getCircleInfo',
    query: {
      enabled: !!circleAddress,
    },
  });
}

// Hook to get circle members
export function useCircleMembers(circleAddress: string | undefined) {
  return useReadContract({
    address: circleAddress as `0x${string}`,
    abi: SUSU_CIRCLE_ABI,
    functionName: 'getMembers',
    query: {
      enabled: !!circleAddress,
    },
  });
}

// Hook to get current recipient
export function useCurrentRecipient(circleAddress: string | undefined) {
  return useReadContract({
    address: circleAddress as `0x${string}`,
    abi: SUSU_CIRCLE_ABI,
    functionName: 'getCurrentRecipient',
    query: {
      enabled: !!circleAddress,
    },
  });
}

// Hook to get cycle time remaining
export function useCycleTimeRemaining(circleAddress: string | undefined) {
  return useReadContract({
    address: circleAddress as `0x${string}`,
    abi: SUSU_CIRCLE_ABI,
    functionName: 'getCycleTimeRemaining',
    query: {
      enabled: !!circleAddress,
      refetchInterval: 60000, // Refresh every minute
    },
  });
}

// Hook to check if user is member
export function useIsMember(circleAddress: string | undefined, userAddress: string | undefined) {
  return useReadContract({
    address: circleAddress as `0x${string}`,
    abi: SUSU_CIRCLE_ABI,
    functionName: 'isMember',
    args: [userAddress as `0x${string}`],
    query: {
      enabled: !!circleAddress && !!userAddress,
    },
  });
}

// Hook to check contribution status
export function useHasContributed(
  circleAddress: string | undefined,
  cycle: bigint | undefined,
  userAddress: string | undefined
) {
  return useReadContract({
    address: circleAddress as `0x${string}`,
    abi: SUSU_CIRCLE_ABI,
    functionName: 'hasContributed',
    args: [cycle || BigInt(0), userAddress as `0x${string}`],
    query: {
      enabled: !!circleAddress && cycle !== undefined && !!userAddress,
    },
  });
}

// Hook to check all contributed
export function useAllContributed(circleAddress: string | undefined) {
  return useReadContract({
    address: circleAddress as `0x${string}`,
    abi: SUSU_CIRCLE_ABI,
    functionName: 'allContributed',
    query: {
      enabled: !!circleAddress,
    },
  });
}

// Hook to get circle creator
export function useCircleCreator(circleAddress: string | undefined) {
  return useReadContract({
    address: circleAddress as `0x${string}`,
    abi: SUSU_CIRCLE_ABI,
    functionName: 'creator',
    query: {
      enabled: !!circleAddress,
    },
  });
}

// Hook to join circle - WITH EXPLICIT GAS LIMIT
export function useJoinCircle() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const joinCircle = (circleAddress: string) => {
    writeContract({
      address: circleAddress as `0x${string}`,
      abi: SUSU_CIRCLE_ABI,
      functionName: 'joinCircle',
      gas: BigInt(500000),
    });
  };

  return { joinCircle, hash, isPending, isConfirming, isSuccess, error };
}

// Hook to leave circle
export function useLeaveCircle() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const leaveCircle = (circleAddress: string) => {
    writeContract({
      address: circleAddress as `0x${string}`,
      abi: SUSU_CIRCLE_ABI,
      functionName: 'leaveCircle',
      gas: BigInt(300000),
    });
  };

  return { leaveCircle, hash, isPending, isConfirming, isSuccess, error };
}

// Hook to start circle
export function useStartCircle() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const startCircle = (circleAddress: string) => {
    writeContract({
      address: circleAddress as `0x${string}`,
      abi: SUSU_CIRCLE_ABI,
      functionName: 'startCircle',
      gas: BigInt(500000),
    });
  };

  return { startCircle, hash, isPending, isConfirming, isSuccess, error };
}

// Hook to approve token spending
export function useApproveToken() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = (tokenAddress: string, spenderAddress: string, amount: bigint) => {
    writeContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spenderAddress as `0x${string}`, amount],
      gas: BigInt(100000),
    });
  };

  return { approve, hash, isPending, isConfirming, isSuccess, error };
}

// Hook to contribute - WITH EXPLICIT GAS LIMIT
export function useContribute() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const contribute = (circleAddress: string) => {
    writeContract({
      address: circleAddress as `0x${string}`,
      abi: SUSU_CIRCLE_ABI,
      functionName: 'contribute',
      gas: BigInt(500000),
    });
  };

  return { contribute, hash, isPending, isConfirming, isSuccess, error };
}

// Hook to claim payout
export function useClaimPayout() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claimPayout = (circleAddress: string) => {
    writeContract({
      address: circleAddress as `0x${string}`,
      abi: SUSU_CIRCLE_ABI,
      functionName: 'claimPayout',
      gas: BigInt(500000),
    });
  };

  return { claimPayout, hash, isPending, isConfirming, isSuccess, error };
}

// Hook to get token balance
export function useTokenBalance(tokenAddress: string | undefined, userAddress: string | undefined) {
  return useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [userAddress as `0x${string}`],
    query: {
      enabled: !!tokenAddress && !!userAddress,
    },
  });
}

// Hook to get token allowance
export function useTokenAllowance(
  tokenAddress: string | undefined,
  ownerAddress: string | undefined,
  spenderAddress: string | undefined
) {
  return useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [ownerAddress as `0x${string}`, spenderAddress as `0x${string}`],
    query: {
      enabled: !!tokenAddress && !!ownerAddress && !!spenderAddress,
    },
  });
}