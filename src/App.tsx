import { AppShell } from './components/platform/AppShell';
import { FavoritesPage, NotFoundPage, RecentPage } from './components/pages/CollectionPages';
import { DomainPage } from './components/pages/DomainPage';
import { HomePage } from './components/pages/HomePage';
import { SearchPage } from './components/pages/SearchPage';
import { TemplatePage } from './components/pages/TemplatePage';
import { ToolPage } from './components/pages/ToolPage';
import { resolveRoute } from './registry';
import { RouterProvider } from './router/router';
import { useRouter } from './router/routerContext';
import { PlatformProvider } from './state/PlatformProvider';
import { ComposerProvider } from './state';

/**
 * Route resolution is entirely data-driven: `resolveRoute` maps any pathname
 * onto catalog nodes, and the switch below just picks a layout. Adding a domain,
 * template or tool never touches this file.
 */
function RouterOutlet() {
  const { path } = useRouter();
  const route = resolveRoute(path);

  switch (route.kind) {
    case 'home':
      return <HomePage />;
    case 'search':
      return <SearchPage />;
    case 'favorites':
      return <FavoritesPage />;
    case 'recent':
      return <RecentPage />;
    case 'domain':
      return <DomainPage domain={route.domain} />;
    case 'template':
      return <TemplatePage domain={route.domain} template={route.template} />;
    case 'tool':
      return <ToolPage domain={route.domain} template={route.template} tool={route.tool} />;
    case 'not-found':
      return <NotFoundPage path={route.path} />;
  }
}

export default function App() {
  return (
    <RouterProvider>
      <PlatformProvider>
        <ComposerProvider>
          <AppShell>
            <RouterOutlet />
          </AppShell>
        </ComposerProvider>
      </PlatformProvider>
    </RouterProvider>
  );
}
