import { Link } from '../../router/router';

export interface Crumb {
  label: string;
  to?: string;
}

/**
 * Breadcrumb trail that mirrors the Domain → Template → Tool hierarchy. Every
 * intermediate level is a link, so a user can climb back out of a deep tool
 * without leaning on the browser back button.
 */
export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px]">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-2">
              {crumb.to && !isLast ? (
                <Link
                  to={crumb.to}
                  className="truncate text-[var(--os-muted)] transition hover:text-[var(--os-accent)]"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className="truncate text-[var(--os-text)]"
                >
                  {crumb.label}
                </span>
              )}
              {isLast ? null : <span className="text-[var(--os-border)]">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
