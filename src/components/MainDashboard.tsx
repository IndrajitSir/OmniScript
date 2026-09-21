import type { CSSProperties } from 'react';
import { themeToCssVars } from '../config/themes';
import { useComposer } from '../state';
import { CodePreview } from './CodePreview';
import { ControlMatrix } from './ControlMatrix';
import { TemplateSelector } from './TemplateSelector';

export function MainDashboard() {
  const { theme, templates, activeTemplate, activeModules, settings } = useComposer();

  const cssVars = themeToCssVars(theme) as CSSProperties;

  return (
    <div
      data-testid="os-shell"
      style={cssVars}
      className="min-h-screen bg-[var(--os-bg)] text-[var(--os-text)] transition-colors duration-300"
    >
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-72 opacity-60"
        style={{
          background: `radial-gradient(1000px 320px at 20% -10%, var(--os-glow), transparent 70%)`,
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-[104rem] flex-col gap-4 px-4 py-5 lg:px-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--os-accent)]/50 bg-[var(--os-accent)]/10 font-mono text-lg text-[var(--os-accent)]">
                &gt;_
              </span>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  Omni<span className="text-[var(--os-accent)]">Script</span>
                </h1>
                <p className="text-xs text-[var(--os-muted)]">
                  The ultimate Linux shell utility composer — compose, preview, ship
                </p>
              </div>
            </div>
          </div>

          <dl className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-[var(--os-muted)]">
            <div>
              <dt className="tracking-wider uppercase">blueprints</dt>
              <dd className="text-sm text-[var(--os-text)]">{templates.length}</dd>
            </div>
            <div>
              <dt className="tracking-wider uppercase">blueprint</dt>
              <dd className="text-sm text-[var(--os-text)]">{activeTemplate.id}</dd>
            </div>
            <div>
              <dt className="tracking-wider uppercase">modules</dt>
              <dd className="text-sm text-[var(--os-text)]">
                {activeModules.length}/{activeTemplate.modules.length}
              </dd>
            </div>
            <div>
              <dt className="tracking-wider uppercase">executable</dt>
              <dd className="text-sm text-[var(--os-accent)]">{settings.commandName}</dd>
            </div>
          </dl>
        </header>

        <main className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-[minmax(0,23rem)_minmax(0,20rem)_minmax(0,1fr)]">
          <TemplateSelector />
          <ControlMatrix />
          <CodePreview />
        </main>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--os-border)] pt-3 text-[11px] text-[var(--os-muted)]">
          <span>
            Compilation is a pure function —{' '}
            <code className="font-mono text-[var(--os-accent-alt)]">
              compileBashScript(template, enabledModuleIds, settings, themeColors)
            </code>
          </span>
          <span>
            Extend it by dropping a blueprint into{' '}
            <code className="font-mono text-[var(--os-accent-alt)]">src/config</code> and pushing it
            into <code className="font-mono text-[var(--os-accent-alt)]">TEMPLATE_REGISTRY</code>.
          </span>
        </footer>
      </div>
    </div>
  );
}
