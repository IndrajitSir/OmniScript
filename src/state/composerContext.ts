import { createContext, useContext } from 'react';
import type { UseScriptComposerResult } from '../hooks/useScriptComposer';

/**
 * Kept separate from `ComposerProvider.tsx` so the provider module exports a
 * single component (React Fast Refresh requirement) while the context and its
 * consumer hook stay importable from anywhere.
 */
export const ComposerContext = createContext<UseScriptComposerResult | null>(null);

export function useComposer(): UseScriptComposerResult {
  const composer = useContext(ComposerContext);
  if (!composer) {
    throw new Error('useComposer() must be used inside <ComposerProvider>');
  }
  return composer;
}
