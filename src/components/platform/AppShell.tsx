import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { themeToCssVars } from '../../config/themes';
import { ALL_TOOLS, DOMAIN_NODES } from '../../registry';
import { favoritesPath, homePath, recentPath } from '../../router/paths';
import { Link } from '../../router/router';
import { useRouter } from '../../router/routerContext';
import { usePlatformContext } from '../../state/platformContext';
import type { ThemeId } from '../../types/script';
import { SearchPalette } from './SearchPalette';

/**
 * The platform chrome. It owns the global palette, the primary navigation
 * (directory / favorites / recent), the search trigger and the footer stats.
 * Page content is rendered as children; every route shares this shell so the
 * hierarchy never loses its bearings.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { path } = useRouter();
  const { theme, themes, themeId, setTheme } = usePlatformContext();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((open) => !open);
      } else if (event.key === '/' && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const cssVars = themeToCssVars(theme) as CSSProperties;

  const navItems = [
    { label: 'Directory', to: homePath() },
    { label: 'Favorites', to: favoritesPath() },
    { label: 'Recent', to: recentPath() },
  ];

  return (
    <div
      style={cssVars}
      className="min-h-screen bg-[var(--os-bg)] text-[var(--os-text)] transition-colors duration-300"
    >
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-72 opacity-60"
        style={{ background: 'radial-gradient(1000px 320px at 20% -10%, var(--os-glow), transparent 70%)' }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-[96rem] flex-col gap-6 px-4 py-5 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link to={homePath()} className="flex items-center gap-3 focus:outline-none">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--os-accent)]/50 bg-[var(--os-accent)]/10 font-mono text-lg text-[var(--os-accent)]">
              &gt;_
            </span>
            <span>
              <span className="block text-lg font-semibold tracking-tight">
                Omni<span className="text-[var(--os-accent)]">Script</span>
              </span>
              <span className="block text-[11px] text-[var(--os-muted)]">
                A platform for browser-side tools
              </span>
            </span>
          </Link>

          <nav aria-label="Primary" className="order-3 flex flex-wrap items-center gap-1 sm:order-none">
            {navItems.map((item) => {
              const active = path === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-lg border px-3 py-1.5 font-mono text-[11px] transition ${
                    active
                      ? 'border-[var(--os-accent)]/60 bg-[var(--os-accent)]/10 text-[var(--os-accent)]'
                      : 'border-transparent text-[var(--os-muted)] hover:border-[var(--os-border)] hover:text-[var(--os-text)]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--os-border)] bg-[var(--os-bg)]/60 px-3 py-2 font-mono text-[11px] text-[var(--os-muted)] transition hover:border-[var(--os-accent)] hover:text-[var(--os-accent)]"
            >
              <span>⌕ Search</span>
              <kbd className="hidden rounded border border-[var(--os-border)] px-1 py-0.5 text-[10px] sm:inline">
                ⌘K
              </kbd>
            </button>
            <label className="flex items-center gap-1.5">
              <span className="sr-only">Palette</span>
              <select
                value={themeId}
                onChange={(event) => setTheme(event.target.value as ThemeId)}
                className="cursor-pointer rounded-lg border border-[var(--os-border)] bg-[var(--os-bg)]/60 px-2 py-2 font-mono text-[11px] text-[var(--os-text)] outline-none focus:border-[var(--os-accent)]"
              >
                {themes.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col gap-6">{children}</main>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--os-border)] pt-3 text-[11px] text-[var(--os-muted)]">
          <span className="font-mono">
            {DOMAIN_NODES.length} domains ·{' '}
            {DOMAIN_NODES.reduce((total, domain) => total + domain.templates.length, 0)} templates ·{' '}
            {ALL_TOOLS.length} tools
          </span>
          <span>
            Metadata and implementation stay separate —{' '}
            <code className="font-mono text-[var(--os-accent-alt)]">src/tools/**/metadata.ts</code> + a
            component.
          </span>
        </footer>
      </div>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
