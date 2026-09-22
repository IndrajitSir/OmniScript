import { useMemo, useState, type KeyboardEvent } from 'react';
import { getToolById, searchCatalog } from '../../registry';
import type { ToolDefinition } from '../../types/catalog';
import { useRouter } from '../../router/routerContext';
import { toolPath } from '../../router/paths';
import { usePlatformContext } from '../../state/platformContext';
import { ToolStatusPill } from './Cards';

const RECENT_LIMIT = 8;

/**
 * Global search overlay. It indexes domain, template, tool, tags and
 * descriptions through `searchCatalog`, and is the fast path that lets users
 * skip the hierarchy entirely: type “JWT”, press Enter, land in the decoder.
 *
 * The dialog mounts fresh on every open, so its query state always starts empty
 * without an effect.
 */
export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return <SearchDialog onClose={onClose} />;
}

function SearchDialog({ onClose }: { onClose: () => void }) {
  const { navigate } = useRouter();
  const { recent } = usePlatformContext();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const results = useMemo(() => searchCatalog(query, 14), [query]);

  const idleSuggestions = useMemo(
    () =>
      recent
        .map((id) => getToolById(id))
        .filter((definition): definition is ToolDefinition => Boolean(definition))
        .slice(0, RECENT_LIMIT),
    [recent],
  );

  const navigateTo = (domainSlug: string, templateSlug: string, toolSlug: string) => {
    navigate(toolPath({ slug: domainSlug }, { slug: templateSlug }, { slug: toolSlug }));
    onClose();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      onClose();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((current) => Math.min(current + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((current) => Math.max(current - 1, 0));
    } else if (event.key === 'Enter') {
      const hit = results[active];
      if (hit) navigateTo(hit.domain.slug, hit.template.slug, hit.tool.slug);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[10vh] backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search OmniScript"
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[var(--os-border)] bg-[var(--os-surface)] shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-[var(--os-border)] px-4 py-3">
          <span className="font-mono text-sm text-[var(--os-accent)]">⌕</span>
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search domains, templates, tools, tags…"
            className="w-full bg-transparent font-mono text-sm text-[var(--os-text)] outline-none placeholder:text-[var(--os-muted)]"
          />
          <kbd className="rounded border border-[var(--os-border)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--os-muted)]">
            esc
          </kbd>
        </div>

        <div className="os-scroll max-h-[60vh] overflow-auto p-2">
          {query.trim().length === 0 ? (
            idleSuggestions.length > 0 ? (
              <>
                <p className="px-2 py-1 font-mono text-[10px] tracking-widest text-[var(--os-muted)] uppercase">
                  Recently used
                </p>
                {idleSuggestions.map((definition) => (
                  <button
                    key={definition.metadata.id}
                    type="button"
                    onClick={() =>
                      navigateTo(
                        definition.metadata.domainId,
                        definition.metadata.templateId,
                        definition.metadata.slug,
                      )
                    }
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-[var(--os-surface-alt)]"
                  >
                    <span className="font-mono text-[var(--os-accent)]">{definition.metadata.icon}</span>
                    <span className="min-w-0 flex-1 truncate text-xs text-[var(--os-text)]">
                      {definition.metadata.name}
                    </span>
                  </button>
                ))}
              </>
            ) : (
              <p className="px-3 py-6 text-center text-xs text-[var(--os-muted)]">
                Start typing to search every domain, template and tool.
              </p>
            )
          ) : results.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-[var(--os-muted)]">
              No tools match “{query}”.
            </p>
          ) : (
            results.map((hit, index) => (
              <button
                key={hit.tool.id}
                type="button"
                onMouseEnter={() => setActive(index)}
                onClick={() => navigateTo(hit.domain.slug, hit.template.slug, hit.tool.slug)}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                  index === active ? 'bg-[var(--os-accent)]/15' : 'hover:bg-[var(--os-surface-alt)]'
                }`}
              >
                <span className="font-mono text-sm text-[var(--os-accent)]">{hit.tool.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs text-[var(--os-text)]">{hit.tool.name}</span>
                  <span className="block truncate text-[11px] text-[var(--os-muted)]">{hit.path}</span>
                </span>
                <ToolStatusPill status={hit.status} />
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-[var(--os-border)] px-4 py-2 font-mono text-[10px] text-[var(--os-muted)]">
          <span>↑↓ navigate · ↵ open</span>
          <span>{results.length} result(s)</span>
        </div>
      </div>
    </div>
  );
}
