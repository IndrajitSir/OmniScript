import type { ScriptTemplate } from '../types/script';
import { backupTemplate } from './backupTemplate';
import { networkTemplate } from './networkTemplate';
import { securityTemplate } from './securityTemplate';
import { sysMonTemplate } from './sysMonTemplate';

/**
 * ────────────────────────────────────────────────────────────────────────────
 *  Template registry
 * ────────────────────────────────────────────────────────────────────────────
 *  This array is the single extension point of the composer. Add an import and
 *  push the blueprint — the selector, the control matrix, the compiler and the
 *  preview all pick it up with no further changes.
 */
export const TEMPLATE_REGISTRY: ScriptTemplate[] = [
  networkTemplate,
  sysMonTemplate,
  backupTemplate,
  securityTemplate,
];

export function getTemplate(id: string): ScriptTemplate {
  return (
    TEMPLATE_REGISTRY.find((template) => template.id === id) ??
    TEMPLATE_REGISTRY[0]!
  );
}

/** Modules enabled by default: a pleasant, useful out-of-the-box wrapper. */
export function defaultModulesFor(template: ScriptTemplate): Set<string> {
  return new Set(template.modules.slice(0, Math.min(3, template.modules.length)).map((m) => m.id));
}

export { networkTemplate, sysMonTemplate, backupTemplate, securityTemplate };
