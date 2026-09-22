import type { DomainNode, TemplateNode } from '../../types/catalog';
import { Breadcrumbs } from '../platform/Breadcrumbs';
import { ToolCard } from '../platform/Cards';
import { Pill } from '../ui';
import { domainPath, homePath } from '../../router/paths';
import { usePlatformContext } from '../../state/platformContext';

export function TemplatePage({ domain, template }: { domain: DomainNode; template: TemplateNode }) {
  const { isFavorite, toggleFavorite } = usePlatformContext();

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        crumbs={[
          { label: 'Home', to: homePath() },
          { label: domain.name, to: domainPath(domain) },
          { label: template.name },
        ]}
      />

      <header className="flex flex-wrap items-center gap-4 rounded-2xl border border-[var(--os-border)] bg-[var(--os-surface)]/60 p-5">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--os-border)] text-xl text-[var(--os-accent)]">
          {template.icon}
        </span>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">{template.name}</h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--os-muted)]">{template.description}</p>
        </div>
        <div className="ml-auto flex flex-wrap gap-1.5">
          {template.featured ? <Pill tone="accent">featured</Pill> : null}
          {template.tags.map((tag) => (
            <Pill key={tag}>#{tag}</Pill>
          ))}
          <Pill tone="muted">{template.toolCount} tools</Pill>
        </div>
      </header>

      {template.tools.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--os-border)] px-4 py-10 text-center text-xs text-[var(--os-muted)]">
          No tools are registered under this template yet.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {template.tools.map((tool) => (
            <ToolCard
              key={tool.metadata.id}
              domain={domain}
              template={template}
              tool={tool}
              isFavorite={isFavorite(tool.metadata.id)}
              onToggleFavorite={() => toggleFavorite(tool.metadata.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
