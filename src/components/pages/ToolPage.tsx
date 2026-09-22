import { useEffect } from 'react';
import type { DomainNode, TemplateNode, ToolDefinition } from '../../types/catalog';
import { Breadcrumbs } from '../platform/Breadcrumbs';
import { ToolStatusPill } from '../platform/Cards';
import { Pill } from '../ui';
import { domainPath, homePath, templatePath } from '../../router/paths';
import { usePlatformContext } from '../../state/platformContext';

export function ToolPage({
  domain,
  template,
  tool,
}: {
  domain: DomainNode;
  template: TemplateNode;
  tool: ToolDefinition;
}) {
  const { isFavorite, toggleFavorite, recordVisit } = usePlatformContext();
  const meta = tool.metadata;
  const favorite = isFavorite(meta.id);

  useEffect(() => {
    recordVisit(meta.id);
  }, [meta.id, recordVisit]);

  const Component = tool.Component;

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs
        crumbs={[
          { label: 'Home', to: homePath() },
          { label: domain.name, to: domainPath(domain) },
          { label: template.name, to: templatePath(domain, template) },
          { label: meta.name },
        ]}
      />

      <header className="flex flex-wrap items-start gap-4 rounded-2xl border border-[var(--os-border)] bg-[var(--os-surface)]/60 p-5">
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
        <button
          type="button"
          onClick={() => toggleFavorite(meta.id)}
          aria-pressed={favorite}
          className={`shrink-0 cursor-pointer rounded-lg border px-3 py-2 font-mono text-[11px] transition ${
            favorite
              ? 'border-[var(--os-warn)]/60 text-[var(--os-warn)]'
              : 'border-[var(--os-border)] text-[var(--os-muted)] hover:border-[var(--os-warn)] hover:text-[var(--os-warn)]'
          }`}
        >
          {favorite ? '★ Favorited' : '☆ Favorite'}
        </button>
      </header>

      <Component tool={meta} />
    </div>
  );
}
