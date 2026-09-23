import { useState } from 'react';
import { DOMAIN_NODES, getAllTools, getToolById, getToolContext } from '../../registry';
import { searchPath } from '../../router/paths';
import { Link } from '../../router/router';
import { useRouter } from '../../router/routerContext';
import { usePlatformContext } from '../../state/platformContext';
import { DomainCard, ToolCard } from '../platform/Cards';
import { Panel } from '../ui';

function HeroSearch() {
  const { navigate } = useRouter();
  const [query, setQuery] = useState('');
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        navigate(searchPath(query.trim()));
      }}
      className="mx-auto flex w-full max-w-xl items-center gap-2 rounded-xl border border-[var(--os-border)] bg-[var(--os-bg)]/70 px-4 py-3 focus-within:border-[var(--os-accent)] focus-within:ring-2 focus-within:ring-[var(--os-accent)]/25"
    >
      <span className="font-mono text-[var(--os-accent)]">⌕</span>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search 30+ tools — try “jwt”, “dns”, “json”…"
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

export function HomePage() {
  const { favorites, isFavorite, toggleFavorite, recent } = usePlatformContext();
  const featuredTools = getAllTools().filter((definition) => definition.metadata.featured).slice(0, 6);
  const recentTools = recent
    .map((id) => getToolById(id))
    .filter((definition): definition is NonNullable<typeof definition> => Boolean(definition))
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col items-center gap-4 py-6 text-center">
        <span className="rounded-full border border-[var(--os-border)] px-3 py-1 font-mono text-[10px] tracking-widest text-[var(--os-muted)] uppercase">
          Domain → Template → Tool
        </span>
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          What do you want to <span className="text-[var(--os-accent)]">work with?</span>
        </h1>
        <p className="max-w-xl text-sm text-[var(--os-muted)]">
          Pick a domain to browse, or jump straight to a tool with search. The directory grows from
          registry data, not from hand-written pages.
        </p>
        <HeroSearch />
      </section>

      {recentTools.length > 0 ? (
        <Panel step="⟲" title="Recently used" subtitle="Jump back into what you were just working on.">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {recentTools.map((definition) => {
              const context = getToolContext(definition);
              if (!context) return null;
              return (
                <ToolCard
                  key={definition.metadata.id}
                  domain={context.domain}
                  template={context.template}
                  tool={definition}
                  isFavorite={isFavorite(definition.metadata.id)}
                  onToggleFavorite={() => toggleFavorite(definition.metadata.id)}
                />
              );
            })}
          </div>
        </Panel>
      ) : null}

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Browse by domain</h2>
            <p className="text-xs text-[var(--os-muted)]">
              {DOMAIN_NODES.length} domains ·{' '}
              {DOMAIN_NODES.reduce((total, domain) => total + domain.templates.length, 0)} templates
            </p>
          </div>
          <Link to={searchPath()} className="font-mono text-[11px] text-[var(--os-accent)] hover:underline">
            or search everything →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {DOMAIN_NODES.map((domain) => (
            <DomainCard key={domain.id} domain={domain} />
          ))}
        </div>
      </section>

      <Panel step="★" title="Featured tools" subtitle="Hand-picked starting points across the platform.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {featuredTools.map((definition) => {
            const context = getToolContext(definition);
            if (!context) return null;
            return (
              <ToolCard
                key={definition.metadata.id}
                domain={context.domain}
                template={context.template}
                tool={definition}
                isFavorite={isFavorite(definition.metadata.id)}
                onToggleFavorite={() => toggleFavorite(definition.metadata.id)}
              />
            );
          })}
        </div>
        <p className="mt-1 font-mono text-[11px] text-[var(--os-muted)]">
          {favorites.length} favorite(s) saved locally · favorites and recents live at{' '}
          <Link to="/favorites" className="text-[var(--os-accent)] hover:underline">
            /favorites
          </Link>{' '}
          and{' '}
          <Link to="/recent" className="text-[var(--os-accent)] hover:underline">
            /recent
          </Link>
        </p>
      </Panel>

      {/* <p className="mx-auto max-w-2xl text-center text-[11px] leading-relaxed text-[var(--os-muted)]">
        Every URL is dynamic:{' '}
        {featuredTools.slice(0, 2).map((definition, index) => {
          const context = getToolContext(definition);
          if (!context) return null;
          return (
            <span key={definition.metadata.id}>
              {index > 0 ? ' · ' : ''}
              <Link
                to={toolPath(context.domain, context.template, definition.metadata)}
                className="font-mono text-[var(--os-accent-alt)] hover:underline"
              >
                /{context.domain.slug}/{context.template.slug}/{definition.metadata.slug}
              </Link>
            </span>
          );
        })}
      </p> */}
    </div>
  );
}
