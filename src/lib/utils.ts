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

/**
 * Physical Archival Handshake
 * Fetches a file as a blob and triggers a native device download.
 */
export async function saveFileToDevice(url: string, filename: string) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
    });
    
    if (!response.ok) throw new Error('Network response was not ok');
    
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    return true;
  } catch (e) {
    console.error("Binary handshake failed:", e);
    // Fallback: Try direct link if fetch fails due to CORS in prototype
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return false;
  }
}
