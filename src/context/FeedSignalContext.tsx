'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface FeedSignalContextType {
  newFollowingPostsCount: number;
  incrementNewPosts: () => void;
  clearNewPosts: () => void;
}

const FeedSignalContext = createContext<FeedSignalContextType | undefined>(undefined);

export function FeedSignalProvider({ children }: { children: ReactNode }) {
  const [newFollowingPostsCount, setNewFollowingPostsCount] = useState(0);
  const incrementNewPosts = useCallback(() => setNewFollowingPostsCount(p => p + 1), []);
  const clearNewPosts = useCallback(() => setNewFollowingPostsCount(0), []);

  return (
    <FeedSignalContext.Provider value={{ newFollowingPostsCount, incrementNewPosts, clearNewPosts }}>
      {children}
    </FeedSignalContext.Provider>
  );
}

export function useFeedSignal() {
  const ctx = useContext(FeedSignalContext);
  if (!ctx) throw new Error('useFeedSignal must be within FeedSignalProvider');
  return ctx;
}
