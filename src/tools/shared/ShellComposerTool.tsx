import { MainDashboard } from '../../components/MainDashboard';
import { ComposerProvider } from '../../state';
import type { ToolComponentProps } from '../../types/catalog';

/**
 * The legacy OmniScript composer, hosted as a platform tool.
 *
 * All four original blueprints (myip, sysinfo, snapkit, sentinel) share this
 * implementation — each tool's metadata pins `scriptTemplateId`, and the
 * provider opens the workspace on that blueprint while preserving the user's
 * per-template module selections.
 */
export function ShellComposerTool({ tool }: ToolComponentProps) {
  return (
    <ComposerProvider initialTemplateId={tool.scriptTemplateId}>
      <MainDashboard embedded />
    </ComposerProvider>
  );
}
