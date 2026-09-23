import type { CSSProperties } from 'react';
import { useEffect } from 'react';
import { themeToCssVars } from '../../config/themes';
import { ComposerProvider } from '../../state';
import { usePlatformContext } from '../../state/platformContext';
import { copyTextToClipboard } from '../../utils/fileActions';
import { MainDashboard } from '../MainDashboard';
import { Breadcrumbs } from './Breadcrumbs';
import { ToolStatusPill } from './Cards';
import { Pill } from '../ui';
import { domainPath, homePath, templatePath } from '../../router/paths';
import type { DomainNode, TemplateNode, ToolDefinition } from '../../types/catalog';

/**
 * ToolWorkspace — embeds a tool inside the MainDashboard three-column layout.
 *
 * For composer tools (those with scriptTemplateId), it renders the full embedded
 * MainDashboard composer wrapped in a ComposerProvider. For regular tools, it
 * renders the tool component inside the workspace with a palette-carrying header
 * and a copy control, using the platform theme for the color palette.
 */
export function ToolWorkspace({
  domain,
  template,
  tool,
}: {
  domain: DomainNode;
  template: TemplateNode;
  tool: ToolDefinition;
}) {
  const { isFavorite, toggleFavorite, recordVisit } = usePlatformContext();
  const { theme: platformTheme } = usePlatformContext();
  const meta = tool.metadata;
  const favorite = isFavorite(meta.id);
  const cssVars = themeToCssVars(platformTheme) as CSSProperties;

  useEffect(() => {
    recordVisit(meta.id);
  }, [meta.id, recordVisit]);

  const handleCopy = async () => {
    await copyTextToClipboard('');
  };

  // Composer tools render the full embedded composer workspace
  if (meta.scriptTemplateId) {
    return (
      <ComposerProvider>
        <MainDashboard embedded />
      </ComposerProvider>
    );
  }

  return (
    <div
      data-testid="os-tool-workspace"
      style={cssVars}
      className="bg-[var(--os-bg)] text-[var(--os-text)] transition-colors duration-300"
    >
      {/* Header carrying the palette — same radial glow as AppShell */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-48 opacity-40"
        style={{
          background: 'radial-gradient(1000px 320px at 20% -10%, var(--os-glow), transparent 70%)',
        }}
      />

      {/* Sticky header */}
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--os-border)] bg-[var(--os-bg)]/80 backdrop-blur-md px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <Breadcrumbs
            crumbs={[
              { label: 'Home', to: homePath() },
              { label: domain.name, to: domainPath(domain) },
              { label: template.name, to: templatePath(domain, template) },
              { label: meta.name },
            ]}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--os-accent)]/40 bg-[var(--os-accent)]/10 px-3 py-1.5 font-mono text-[11px] text-[var(--os-accent)] transition hover:bg-[var(--os-accent)]/20"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </button>
          <button
            type="button"
            onClick={() => toggleFavorite(meta.id)}
            aria-pressed={favorite}
            className={`cursor-pointer rounded-lg border px-3 py-1.5 font-mono text-[11px] transition ${
              favorite
                ? 'border-[var(--os-warn)]/60 text-[var(--os-warn)]'
                : 'border-[var(--os-border)] text-[var(--os-muted)] hover:border-[var(--os-warn)] hover:text-[var(--os-warn)]'
            }`}
          >
            {favorite ? '★ Favorited' : '☆ Favorite'}
          </button>
        </div>
      </header>

      {/* Tool content */}
      <main className="flex min-h-0 flex-1 flex-col gap-4 px-4 py-5 lg:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--os-accent)]/40 bg-[var(--os-accent)]/10 font-mono text-xl text-[var(--os-accent)]">
            {meta.icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">{meta.name}</h1>
              <ToolStatusPill status={meta.status} />
              <Pill tone="muted">{meta.id}</Pill>
            </div>
            <p className="mt-1 max-w-3xl text-sm text-[var(--os-muted)]">{meta.description}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {meta.tags.map((tag) => (
                <Pill key={tag}>#{tag}</Pill>
              ))}
            </div>
          </div>
        </div>

        <div className="min-h-0 overflow-auto rounded-2xl border border-[var(--os-border)] bg-[var(--os-surface)]/60 p-5">
          <tool.Component tool={meta} />
        </div>
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--os-border)] px-4 py-3 text-[11px] text-[var(--os-muted)]">
        <span>
          {domain.name} / {template.name} · {meta.name}
        </span>
        <span>
          <kbd className="rounded border border-[var(--os-border)] px-1 font-mono text-[10px]">⌘C</kbd> to copy
        </span>
      </footer>
    </div>
  );
}
