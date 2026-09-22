import { Link } from '../../router/router';
import { domainPath, templatePath, toolPath } from '../../router/paths';
import type { DomainNode, TemplateNode, ToolDefinition, ToolStatus } from '../../types/catalog';
import { Pill } from '../ui';

const STATUS_TONE: Record<ToolStatus, 'muted' | 'accent' | 'warn' | 'err' | 'ok'> = {
  available: 'ok',
  beta: 'warn',
  deprecated: 'err',
  'coming-soon': 'muted',
};

const STATUS_LABEL: Record<ToolStatus, string> = {
  available: 'available',
  beta: 'beta',
  deprecated: 'deprecated',
  'coming-soon': 'soon',
};

export function ToolStatusPill({ status }: { status: ToolStatus }) {
  if (status === 'available') return null;
  return (
    <Pill tone={STATUS_TONE[status]} title={`Tool status: ${status}`}>
      {STATUS_LABEL[status]}
    </Pill>
  );
}

function accentColor(accent?: string): string {
  return accent ? `var(--os-${accent})` : 'var(--os-accent)';
}

export function DomainCard({ domain }: { domain: DomainNode }) {
  return (
    <Link
      to={domainPath(domain)}
      className="group flex h-full flex-col gap-3 rounded-2xl border border-[var(--os-border)] bg-[var(--os-surface)]/70 p-4 transition hover:border-[var(--os-accent)]/70 hover:bg-[var(--os-surface-alt)]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--os-accent)]"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xl"
          style={{
            color: accentColor(domain.accent),
            borderColor: accentColor(domain.accent),
            backgroundColor: `color-mix(in srgb, ${accentColor(domain.accent)} 12%, transparent)`,
          }}
        >
          {domain.icon}
        </span>
        <span className="text-right font-mono text-[10px] tracking-wider text-[var(--os-muted)] uppercase">
          {domain.toolCount} tools
          <br />
          {domain.templates.length} templates
        </span>
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-[var(--os-text)] group-hover:text-[var(--os-accent)]">
          {domain.name}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-[var(--os-muted)]">{domain.description}</p>
      </div>
      <div className="mt-auto flex flex-wrap gap-1">
        {domain.tags.slice(0, 3).map((tag) => (
          <Pill key={tag}>#{tag}</Pill>
        ))}
      </div>
    </Link>
  );
}

export function TemplateCard({ domain, template }: { domain: DomainNode; template: TemplateNode }) {
  return (
    <Link
      to={templatePath(domain, template)}
      className="group flex h-full flex-col gap-3 rounded-2xl border border-[var(--os-border)] bg-[var(--os-surface)]/70 p-4 transition hover:border-[var(--os-accent)]/70 hover:bg-[var(--os-surface-alt)]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--os-accent)]"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--os-border)] text-base text-[var(--os-accent)]">
          {template.icon}
        </span>
        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--os-text)] group-hover:text-[var(--os-accent)]">
          {template.name}
        </h3>
        <span className="shrink-0 font-mono text-[10px] text-[var(--os-muted)]">{template.toolCount}</span>
      </div>
      <p className="text-xs leading-relaxed text-[var(--os-muted)]">{template.description}</p>
      <div className="mt-auto flex flex-wrap gap-1">
        {template.featured ? <Pill tone="accent">featured</Pill> : null}
        {template.tags.slice(0, 3).map((tag) => (
          <Pill key={tag}>#{tag}</Pill>
        ))}
      </div>
    </Link>
  );
}

export function ToolCard({
  domain,
  template,
  tool,
  isFavorite,
  onToggleFavorite,
}: {
  domain: DomainNode;
  template: TemplateNode;
  tool: ToolDefinition;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const meta = tool.metadata;
  const disabled = meta.status === 'coming-soon';
  const body = (
    <>
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--os-border)] font-mono text-sm text-[var(--os-accent)]">
          {meta.icon}
        </span>
        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--os-text)] group-hover:text-[var(--os-accent)]">
          {meta.name}
        </h3>
        <ToolStatusPill status={meta.status} />
      </div>
      <p className="text-xs leading-relaxed text-[var(--os-muted)]">{meta.description}</p>
      <div className="mt-auto flex flex-wrap gap-1">
        {meta.featured ? <Pill tone="accent">featured</Pill> : null}
        {meta.tags.slice(0, 3).map((tag) => (
          <Pill key={tag}>#{tag}</Pill>
        ))}
      </div>
    </>
  );

  return (
    <div className="group relative flex h-full flex-col gap-3 rounded-2xl border border-[var(--os-border)] bg-[var(--os-surface)]/70 p-4 transition hover:border-[var(--os-accent)]/70 hover:bg-[var(--os-surface-alt)]/60">
      <button
        type="button"
        aria-label={isFavorite ? `Remove ${meta.name} from favorites` : `Add ${meta.name} to favorites`}
        aria-pressed={isFavorite}
        onClick={onToggleFavorite}
        className={`absolute top-3 right-3 z-10 cursor-pointer text-base transition ${
          isFavorite ? 'text-[var(--os-warn)]' : 'text-[var(--os-border)] hover:text-[var(--os-warn)]'
        }`}
      >
        {isFavorite ? '★' : '☆'}
      </button>

      {disabled ? (
        <div className="flex h-full cursor-not-allowed flex-col gap-3 opacity-70">{body}</div>
      ) : (
        <Link
          to={toolPath(domain, template, meta)}
          className="flex h-full flex-col gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--os-accent)]"
        >
          {body}
        </Link>
      )}
    </div>
  );
}

export function ToolRow({
  domain,
  template,
  tool,
}: {
  domain: DomainNode;
  template: TemplateNode;
  tool: ToolDefinition;
}) {
  const meta = tool.metadata;
  return (
    <Link
      to={toolPath(domain, template, meta)}
      className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 transition hover:border-[var(--os-border)] hover:bg-[var(--os-surface-alt)]/60"
    >
      <span className="font-mono text-sm text-[var(--os-accent)]">{meta.icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-mono text-xs text-[var(--os-text)]">{meta.name}</span>
        <span className="block truncate text-[11px] text-[var(--os-muted)]">
          {domain.name} / {template.name}
        </span>
      </span>
      <ToolStatusPill status={meta.status} />
    </Link>
  );
}
