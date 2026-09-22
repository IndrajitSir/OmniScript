import { useMemo, useState } from 'react';
import { searchCatalog } from '../../registry';
import { homePath, searchPath, toolPath } from '../../router/paths';
import { Link } from '../../router/router';
import { useRouter } from '../../router/routerContext';
import type { SearchHit } from '../../types/catalog';
import { Breadcrumbs } from '../platform/Breadcrumbs';
import { ToolStatusPill } from '../platform/Cards';

function SearchForm({ initial }: { initial: string }) {
  const { navigate } = useRouter();
  const [value, setValue] = useState(initial);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        navigate(searchPath(value.trim()));
      }}
      className="flex items-center gap-2 rounded-xl border border-[var(--os-border)] bg-[var(--os-bg)]/70 px-4 py-3 focus-within:border-[var(--os-accent)] focus-within:ring-2 focus-within:ring-[var(--os-accent)]/25"
    >
      <span className="font-mono text-[var(--os-accent)]">⌕</span>
      <input
        autoFocus
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search domains, templates, tools, tags and descriptions…"
        className="w-full bg-transparent font-mono text-sm text-[var(--os-text)] outline-none placeholder:text-[var(--os-muted)]"
      />
      <button
        type="submit"
        className="shrink-0 cursor-pointer rounded-lg border border-[var(--os-accent)] bg-[var(--os-accent)]/15 px-3 py-1.5 font-mono text-[11px] text-[var(--os-accent)] transition hover:bg-[var(--os-accent)]/25"
      >
        Search
      </button>
    </form>
  );
}

export function SearchPage() {
  const { query } = useRouter();
  const value = query.get('q') ?? '';

  const results = useMemo(() => searchCatalog(value, 60), [value]);

  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; hits: SearchHit[] }>();
    for (const hit of results) {
      const key = `${hit.domain.id}/${hit.template.id}`;
      const bucket = map.get(key);
      if (bucket) bucket.hits.push(hit);
      else map.set(key, { label: `${hit.domain.name} → ${hit.template.name}`, hits: [hit] });
    }
    return [...map.values()];
  }, [results]);

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs crumbs={[{ label: 'Home', to: homePath() }, { label: 'Search' }]} />

      {/* Remounts on query change so the input always reflects the URL. */}
      <SearchForm key={value} initial={value} />

      {value.trim().length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--os-border)] px-4 py-12 text-center text-xs text-[var(--os-muted)]">
          Search spans domain, template, tool name, slug, tags and description.
        </p>
      ) : results.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--os-border)] px-4 py-12 text-center text-xs text-[var(--os-muted)]">
          Nothing matches “{value}”.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          <p className="font-mono text-[11px] text-[var(--os-muted)]">
            {results.length} result(s) for “{value}”
          </p>
          {grouped.map((group) => (
            <section key={group.label} className="flex flex-col gap-2">
              <h2 className="font-mono text-[11px] tracking-widest text-[var(--os-muted)] uppercase">
                {group.label}
              </h2>
              <div className="flex flex-col gap-1.5">
                {group.hits.map((hit) => (
                  <Link
                    key={hit.tool.id}
                    to={toolPath(hit.domain, hit.template, hit.tool)}
                    className="flex items-center gap-3 rounded-lg border border-[var(--os-border)] bg-[var(--os-surface)]/50 px-3 py-2.5 transition hover:border-[var(--os-accent)]/70 hover:bg-[var(--os-surface-alt)]/60"
                  >
                    <span className="font-mono text-sm text-[var(--os-accent)]">{hit.tool.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-xs text-[var(--os-text)]">
                        {hit.tool.name}
                      </span>
                      <span className="block truncate text-[11px] text-[var(--os-muted)]">
                        {hit.tool.description}
                      </span>
                    </span>
                    <ToolStatusPill status={hit.status} />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
