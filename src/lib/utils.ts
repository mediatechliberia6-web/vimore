import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * High-Velocity Follower Parser
 * Converts strings like "8.4k" or "1.2M" into raw integers for logical handshakes.
 */
export function parseFollowerCount(count: string | number | undefined): number {
  if (count === undefined) return 0;
  if (typeof count === 'number') return count;
  
  const clean = count.toLowerCase().trim();
  if (clean.endsWith('k')) {
    return parseFloat(clean.replace('k', '')) * 1000;
  }
  if (clean.endsWith('m')) {
    return parseFloat(clean.replace('m', '')) * 1000000;
  }
  return parseFloat(clean) || 0;
}
