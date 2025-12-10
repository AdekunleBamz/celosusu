// Re-export config from appkit
export { config, celoMainnet } from './appkit';

// Helper to format address
export const formatAddress = (address: string) => {
  if (!address) return '';
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
