import type { ReactNode } from 'react';
import { useScriptComposer } from '../hooks/useScriptComposer';
import { ComposerContext } from './composerContext';

export function ComposerProvider({ children }: { children: ReactNode }) {
  const composer = useScriptComposer();
  return <ComposerContext.Provider value={composer}>{children}</ComposerContext.Provider>;
}
