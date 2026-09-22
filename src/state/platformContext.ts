import { createContext, useContext } from 'react';
import type { UsePlatformResult } from '../hooks/usePlatform';

/**
 * Kept separate from `PlatformProvider.tsx` so the provider module exports a
 * single component (React Fast Refresh) while the context stays importable.
 */
export const PlatformContext = createContext<UsePlatformResult | null>(null);

export function usePlatformContext(): UsePlatformResult {
  const platform = useContext(PlatformContext);
  if (!platform) {
    throw new Error('usePlatformContext() must be used inside <PlatformProvider>');
  }
  return platform;
}
