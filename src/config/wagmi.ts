import { http, createConfig, createStorage } from 'wagmi';
import { celo } from 'wagmi/chains';
import { injected, metaMask } from 'wagmi/connectors';

// Celo Mainnet configuration
export const celoMainnet = {
  ...celo,
  rpcUrls: {
    default: {
      http: ['https://forno.celo.org'],
    },
    public: {
      http: ['https://forno.celo.org'],
    },
  },
};

// Check if running inside Farcaster frame
export const isFarcasterFrame = () => {
  if (typeof window === 'undefined') return false;
  return window.parent !== window || window.location !== window.parent.location;
};

// Create wagmi config with multiple connectors
export const config = createConfig({
  chains: [celoMainnet],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    metaMask({
      dappMetadata: {
        name: 'CeloSusu',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://celosusu.app',
      },
    }),
  ],
  storage: createStorage({
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  }),
  transports: {
    [celoMainnet.id]: http('https://forno.celo.org'),
  },
  ssr: true,
});

// Helper to format address
export const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Helper to format token amounts
export const formatTokenAmount = (amount: bigint, decimals: number = 18) => {
  const divisor = BigInt(10 ** decimals);
  const integerPart = amount / divisor;
  const fractionalPart = amount % divisor;
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0').slice(0, 2);
  return `${integerPart}.${fractionalStr}`;
};

// Helper to parse token amounts
export const parseTokenAmount = (amount: string, decimals: number = 18) => {
  const [integer, fraction = ''] = amount.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(integer + paddedFraction);
};
