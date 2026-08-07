/**
 * Diamond transaction fee policy.
 *
 * Balances are stored as whole Diamonds, so fees are whole Diamonds too.
 * Every positive transaction pays at least 1 Diamond, while larger
 * transactions pay the exact whole-Diamond 10% amount.
 */
export function calculatePlatformFee(amount: number): number {
  const wholeAmount = Math.floor(Number(amount));
  if (!Number.isFinite(wholeAmount) || wholeAmount <= 0) return 0;
  return Math.max(1, Math.floor(wholeAmount * 0.1));
}

export const PLATFORM_FEE_PERCENT = 10;