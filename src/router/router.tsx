import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type ReactNode,
} from 'react';
import { RouterContext, useRouter, type RouterValue } from './routerContext';

/**
 * ────────────────────────────────────────────────────────────────────────────
 *  Minimal history router
 * ────────────────────────────────────────────────────────────────────────────
 *  OmniScript ships its own tiny router instead of pulling in a routing
 *  dependency. It speaks the real History API (`pushState`/`popstate`), so URLs
 *  like `/network/dns-tools/dns-lookup` are shareable and back/forward behave
 *  exactly as users expect. Route matching happens against the catalog registry,
 *  never against hand-written page tables.
 */

function readHref(): string {
  if (typeof window === 'undefined') return '/';
  return `${window.location.pathname}${window.location.search}`;
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [href, setHref] = useState(readHref);

  useEffect(() => {
    const onPopState = () => setHref(readHref());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    if (typeof window === 'undefined') return;
    if (options?.replace) window.history.replaceState(null, '', to);
    else window.history.pushState(null, '', to);
    setHref(to);
    try {
      window.scrollTo({ top: 0 });
    } catch {
      // jsdom and some embedded webviews do not implement scrolling.
    }
  }, []);

  const value = useMemo<RouterValue>(() => {
    const queryIndex = href.indexOf('?');
    return {
      href,
      path: queryIndex === -1 ? href : href.slice(0, queryIndex),
      query: new URLSearchParams(queryIndex === -1 ? '' : href.slice(queryIndex + 1)),
      navigate,
    };
  }, [href, navigate]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
  replace?: boolean;
};

/**
 * Anchor that routes client-side. It still renders a real `href`, so
 * middle-click / open-in-new-tab / copy-link all keep working.
 */
export function Link({ to, replace = false, onClick, children, ...rest }: LinkProps) {
  const { navigate } = useRouter();
  return (
    <a
      href={to}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }
        event.preventDefault();
        navigate(to, { replace });
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
