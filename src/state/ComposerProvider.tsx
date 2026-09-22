import type { ReactNode } from 'react';
import { useScriptComposer } from '../hooks/useScriptComposer';
import { ComposerContext } from './composerContext';

/**
 * Wraps the composer workspace. `initialTemplateId` lets a platform tool pin the
 * blueprint it represents (e.g. the sysinfo composer always opens on the system
 * metrics blueprint) while still restoring the user's per-template selections.
 */
export function ComposerProvider({
  children,
  initialTemplateId,
}: {
  children: ReactNode;
  initialTemplateId?: string;
}) {
  const composer = useScriptComposer(initialTemplateId);
  return <ComposerContext.Provider value={composer}>{children}</ComposerContext.Provider>;
}
