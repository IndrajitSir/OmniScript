import type { DomainNode } from '../../types/catalog';
import { Breadcrumbs } from '../platform/Breadcrumbs';
import { TemplateCard, ToolRow } from '../platform/Cards';
import { Panel, Pill } from '../ui';
import { Link } from '../../router/router';
import { homePath, templatePath } from '../../router/paths';

export function DomainPage({ domain }: { domain: DomainNode }) {
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs crumbs={[{ label: 'Home', to: homePath() }, { label: domain.name }]} />

      <header className="flex flex-col gap-3 rounded-2xl border border-[var(--os-border)] bg-[var(--os-surface)]/60 p-5">
        <div className="flex flex-wrap items-center gap-4">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl border text-2xl"
            style={{
              color: `var(--os-${domain.accent ?? 'accent'})`,
              borderColor: `var(--os-${domain.accent ?? 'accent'})`,
            }}
          >
            {domain.icon}
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">{domain.name}</h1>
            <p className="mt-1 max-w-2xl text-sm text-[var(--os-muted)]">{domain.description}</p>
          </div>
          <dl className="ml-auto flex gap-5 font-mono text-[11px] text-[var(--os-muted)]">
            <div>
              <dt className="uppercase">templates</dt>
              <dd className="text-base text-[var(--os-text)]">{domain.templates.length}</dd>
            </div>
            <div>
              <dt className="uppercase">tools</dt>
              <dd className="text-base text-[var(--os-text)]">{domain.toolCount}</dd>
            </div>
          </dl>
        </div>
        {domain.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {domain.tags.map((tag) => (
              <Pill key={tag}>#{tag}</Pill>
            ))}
          </div>
        ) : null}
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-wide text-[var(--os-muted)] uppercase">
          Templates in {domain.name}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {domain.templates.map((template) => (
            <TemplateCard key={template.id} domain={domain} template={template} />
          ))}
        </div>
      </section>

      {domain.templates.map((template) => (
        <Panel
          key={template.id}
          step="›"
          title={template.name}
          subtitle={template.description}
          actions={
            <Link
              to={templatePath(domain, template)}
              className="font-mono text-[11px] text-[var(--os-accent)] hover:underline"
            >
              open template →
            </Link>
          }
        >
          {template.tools.length === 0 ? (
            <p className="text-xs text-[var(--os-muted)]">No tools registered yet.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {template.tools.map((tool) => (
                <ToolRow key={tool.metadata.id} domain={domain} template={template} tool={tool} />
              ))}
            </div>
          )}
        </Panel>
      ))}
    </div>
  );
}
