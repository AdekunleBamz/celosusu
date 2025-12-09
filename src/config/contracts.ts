// Contract addresses on Celo Mainnet
export const CONTRACTS = {
  SUSU_FACTORY: '0x65C64b5235d1d5e6e4708fc6013907caB506841e',
  CUSD: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
  CEUR: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
} as const;

// Token metadata
export const TOKENS = {
  [CONTRACTS.CUSD]: {
    symbol: 'cUSD',
    name: 'Celo Dollar',
    decimals: 18,
    icon: '💵',
  },
  [CONTRACTS.CEUR]: {
    symbol: 'cEUR',
    name: 'Celo Euro',
    decimals: 18,
    icon: '💶',
  },
} as const;

// SusuFactory ABI
export const SUSU_FACTORY_ABI = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      { internalType: 'string', name: '_name', type: 'string' },
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'uint256', name: '_contributionAmount', type: 'uint256' },
      { internalType: 'bool', name: '_yieldEnabled', type: 'bool' },
    ],
    name: 'createCircle',
    outputs: [{ internalType: 'address', name: 'circle', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTotalCircles',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_offset', type: 'uint256' },
      { internalType: 'uint256', name: '_limit', type: 'uint256' },
    ],
    name: 'getCircles',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_offset', type: 'uint256' },
      { internalType: 'uint256', name: '_limit', type: 'uint256' },
    ],
    name: 'getOpenCircles',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_user', type: 'address' }],
    name: 'getMemberCircles',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_user', type: 'address' }],
    name: 'getCreatedCircles',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'circle', type: 'address' },
      { indexed: true, internalType: 'address', name: 'creator', type: 'address' },
      { indexed: false, internalType: 'string', name: 'name', type: 'string' },
      { indexed: false, internalType: 'address', name: 'token', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'contributionAmount', type: 'uint256' },
      { indexed: false, internalType: 'bool', name: 'yieldEnabled', type: 'bool' },
    ],
    name: 'CircleCreated',
    type: 'event',
  },
] as const;

// SusuCircle ABI
export const SUSU_CIRCLE_ABI = [
  // Read functions
  {
    inputs: [],
    name: 'getCircleInfo',
    outputs: [
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'uint256', name: 'contribution', type: 'uint256' },
      { internalType: 'uint256', name: 'memberCount', type: 'uint256' },
      { internalType: 'uint256', name: 'cycle', type: 'uint256' },
      { internalType: 'uint256', name: 'totalCyclesCount', type: 'uint256' },
      { internalType: 'uint8', name: 'currentState', type: 'uint8' },
      { internalType: 'bool', name: 'yieldOn', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getMembers',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCurrentRecipient',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCycleTimeRemaining',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'allContributed',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'isMember',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'creator',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'currentCycle',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'contributionAmount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'hasContributed',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_cycle', type: 'uint256' }],
    name: 'getContributionStatus',
    outputs: [
      { internalType: 'address[]', name: 'memberList', type: 'address[]' },
      { internalType: 'bool[]', name: 'contributed', type: 'bool[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // Write functions
  {
    inputs: [],
    name: 'joinCircle',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'leaveCircle',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'startCircle',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'contribute',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claimPayout',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'member', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'memberCount', type: 'uint256' },
    ],
    name: 'MemberJoined',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint256', name: 'totalCycles', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'startTime', type: 'uint256' },
    ],
    name: 'CircleStarted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'member', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'cycle', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'ContributionMade',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'recipient', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'cycle', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'yieldAmount', type: 'uint256' },
    ],
    name: 'PayoutClaimed',
    type: 'event',
  },
] as const;

// ERC20 ABI for token approvals
export const ERC20_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
