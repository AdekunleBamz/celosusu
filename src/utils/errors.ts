/**
 * Parse and format contract errors into user-friendly messages
 */
export function formatContractError(error: any): string {
  const errorString = error?.message || error?.toString() || '';
  
  // User rejected transaction
  if (errorString.includes('User rejected') || errorString.includes('user rejected')) {
    return 'Transaction cancelled';
  }
  
  // Insufficient funds
  if (errorString.includes('insufficient funds')) {
    return 'Insufficient funds for transaction';
  }
  
  // Network/RPC errors
  if (errorString.includes('network') || errorString.includes('RPC')) {
    return 'Network error. Please try again';
  }
  
  // Contract-specific errors
  if (errorString.includes('execution reverted')) {
    // Extract error code if present
    const errorCodeMatch = errorString.match(/#(\d+)/);
    if (errorCodeMatch) {
      const code = errorCodeMatch[1];
      return getErrorMessageByCode(code);
    }
    return 'Transaction failed. Please check your inputs and try again';
  }
  
  // Gas errors
  if (errorString.includes('gas')) {
    return 'Transaction may fail. Try increasing gas limit';
  }
  
  // Allowance/approval errors
  if (errorString.includes('allowance') || errorString.includes('ERC20: insufficient allowance')) {
    return 'Token approval required';
  }
  
  // Timeout
  if (errorString.includes('timeout')) {
    return 'Transaction timed out. Please try again';
  }
  
  // Generic fallback
  return 'Transaction failed. Please try again';
}

/**
 * Get user-friendly error message by error code
 */
function getErrorMessageByCode(code: string): string {
  const errorCodes: Record<string, string> = {
    '1000': 'Circle already exists',
    '1001': 'Invalid contribution amount',
    '1002': 'Token approval required before contributing',
    '1003': 'Circle is full',
    '1004': 'Already a member of this circle',
    '1005': 'Not a member of this circle',
    '1006': 'Circle is not active',
    '1007': 'Not your turn to receive payout',
    '1008': 'Already claimed this cycle',
    '1009': 'Cycle not complete',
    '1010': 'Unauthorized action',
  };
  
  return errorCodes[code] || `Transaction failed (Error #${code})`;
}

/**
 * Format transaction hash for display
 */
export function formatTxHash(hash: string, length: number = 10): string {
  if (!hash || hash.length < length) return hash;
  return `${hash.slice(0, length)}...${hash.slice(-6)}`;
}

/**
 * Get block explorer URL for transaction
 */
export function getTxExplorerUrl(hash: string): string {
  return `https://celoscan.io/tx/${hash}`;
}
