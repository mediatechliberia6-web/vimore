'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Notification Hub decommissioned. 
 * High-velocity redirect back to Home feed.
 */
export default function NotificationsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}
