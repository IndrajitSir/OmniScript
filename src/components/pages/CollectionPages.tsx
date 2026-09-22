import { getToolById, getToolContext } from '../../registry';
import { homePath } from '../../router/paths';
import { Link } from '../../router/router';
import type { ToolDefinition } from '../../types/catalog';
import { usePlatformContext } from '../../state/platformContext';
import { Breadcrumbs } from '../platform/Breadcrumbs';
import { ToolCard } from '../platform/Cards';
import { EmptyState } from '../toolkit';

function useResolvedTools(ids: string[]): ToolDefinition[] {
  return ids
    .map((id) => getToolById(id))
    .filter((definition): definition is ToolDefinition => Boolean(definition));
}

function ToolCollection({
  title,
  subtitle,
  crumb,
  emptyTitle,
  ids,
}: {
  title: string;
  subtitle: string;
  crumb: string;
  emptyTitle: string;
  ids: string[];
}) {
  const { isFavorite, toggleFavorite } = usePlatformContext();
  const tools = useResolvedTools(ids);

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs crumbs={[{ label: 'Home', to: homePath() }, { label: crumb }]} />
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-[var(--os-muted)]">{subtitle}</p>
      </header>

      {tools.length === 0 ? (
        <EmptyState title={emptyTitle}>
          Visit the{' '}
          <Link to={homePath()} className="text-[var(--os-accent)] hover:underline">
            directory
          </Link>{' '}
          and star a tool to pin it here.
        </EmptyState>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((definition) => {
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
      )}
    </div>
  );
}

export function FavoritesPage() {
  const { favorites } = usePlatformContext();
  return (
    <ToolCollection
      title="Favorites"
      subtitle="Tools you starred, stored locally in your browser."
      crumb="Favorites"
      emptyTitle="No favorites yet"
      ids={favorites}
    />
  );
}

export function RecentPage() {
  const { recent } = usePlatformContext();
  return (
    <ToolCollection
      title="Recently used"
      subtitle="The last tools you opened, most recent first."
      crumb="Recent"
      emptyTitle="Nothing used yet"
      ids={recent}
    />
  );
}

export function NotFoundPage({ path }: { path: string }) {
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs crumbs={[{ label: 'Home', to: homePath() }, { label: 'Not found' }]} />
      <EmptyState title={`No route matches “${path}”`}>
        The catalog resolves routes from registry metadata, so this path is not registered. Head back
        to the{' '}
        <Link to={homePath()} className="text-[var(--os-accent)] hover:underline">
          directory
        </Link>
        .
      </EmptyState>
    </div>
  );
}
