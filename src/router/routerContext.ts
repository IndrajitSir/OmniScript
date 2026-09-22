import { createContext, useContext } from 'react';

/**
 * Kept separate from `router.tsx` so the provider module only exports
 * components (React Fast Refresh), mirroring the composer/platform contexts.
 */
export interface RouterValue {
  /** `pathname` of the current location, e.g. `/network/dns-tools`. */
  path: string;
  /** Parsed query string of the current location. */
  query: URLSearchParams;
  /** Full location including the query string. */
  href: string;
  navigate: (to: string, options?: { replace?: boolean }) => void;
}

export const RouterContext = createContext<RouterValue | null>(null);

export function useRouter(): RouterValue {
  const router = useContext(RouterContext);
  if (!router) throw new Error('useRouter() must be used inside <RouterProvider>');
  return router;
}
