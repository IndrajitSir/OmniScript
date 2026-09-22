import type { ReactNode } from 'react';
import { usePlatform } from '../hooks/usePlatform';
import { PlatformContext } from './platformContext';

export function PlatformProvider({ children }: { children: ReactNode }) {
  const platform = usePlatform();
  return <PlatformContext.Provider value={platform}>{children}</PlatformContext.Provider>;
}
