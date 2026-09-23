import type { CSSProperties } from "react";
import { themeToCssVars } from "../config/themes";
import { useComposer } from "../state";
import { CodePreview } from "./CodePreview";
import { ControlMatrix } from "./ControlMatrix";
import { TemplateSelector } from "./TemplateSelector";
import { usePlatformContext } from "../state/platformContext";

/**
 * The original OmniScript three-column workspace, now hosted as a platform tool.
 *
 * `embedded` trims the standalone branding/hero chrome so the workspace can sit
 * inside the platform shell (breadcrumbs + app header) without double headers,
 * while the default render remains fully standalone for the existing tests.
 */
export function MainDashboard({
  embedded = false,
}: { embedded?: boolean } = {}) {
  // Composer state — application/tool state
  const {
    templates,
    activeTemplate,
    activeModules,
    settings,
  } = useComposer();

  // Platform state — global theme/palette
  const { theme } = usePlatformContext();

  // IMPORTANT:
  // CSS variables must come from PlatformContext because
  // the palette selector updates PlatformContext.
  const cssVars = themeToCssVars(theme) as CSSProperties;

  return (
    <div
      data-testid="os-shell"
      style={cssVars}
      className={`bg-[var(--os-bg)] text-[var(--os-text)] transition-colors duration-300 ${
        embedded ? "rounded-none" : "min-h-screen"
      }`}
    >

      <div
        className={`relative mx-auto flex max-w-[104rem] flex-col gap-4 px-4 lg:px-6 ${
          embedded ? "py-1" : "min-h-screen py-5"
        }`}
      >
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs text-[var(--os-muted)]">
                  The ultimate Linux shell utility composer — compose, preview,
                  ship
                </p>
              </div>
            </div>
          </div>

          <dl className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-[var(--os-muted)]">
            <div>
              <dt className="tracking-wider uppercase">blueprints</dt>
              <dd className="text-sm text-[var(--os-text)]">
                {templates.length}
              </dd>
            </div>

            <div>
              <dt className="tracking-wider uppercase">blueprint</dt>
              <dd className="text-sm text-[var(--os-text)]">
                {activeTemplate.id}
              </dd>
            </div>

            <div>
              <dt className="tracking-wider uppercase">modules</dt>
              <dd className="text-sm text-[var(--os-text)]">
                {activeModules.length}/{activeTemplate.modules.length}
              </dd>
            </div>

            <div>
              <dt className="tracking-wider uppercase">executable</dt>
              <dd className="text-sm text-[var(--os-accent)]">
                {settings.commandName}
              </dd>
            </div>
          </dl>
        </header>

        <main className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-[minmax(0,23rem)_minmax(0,20rem)_minmax(0,1fr)]">
          <TemplateSelector />
          <ControlMatrix />
          <CodePreview />
        </main>
      </div>
    </div>
  );
}