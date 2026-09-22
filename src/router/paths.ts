import type { Domain, ToolMeta, ToolTemplate } from '../types/catalog';

/**
 * Canonical URL builders — every link in the app goes through these, so the
 * route shape lives in exactly one place:
 *
 *     /                     home / directory
 *     /search?q=…           global search
 *     /favorites            bookmarked tools
 *     /recent               recently used tools
 *     /:domain              domain → templates
 *     /:domain/:template    template → tools
 *     /:domain/:template/:tool
 */
export function homePath(): string {
  return '/';
}

export function domainPath(domain: Pick<Domain, 'slug'>): string {
  return `/${domain.slug}`;
}

export function templatePath(
  domain: Pick<Domain, 'slug'>,
  template: Pick<ToolTemplate, 'slug'>,
): string {
  return `/${domain.slug}/${template.slug}`;
}

export function toolPath(
  domain: Pick<Domain, 'slug'>,
  template: Pick<ToolTemplate, 'slug'>,
  tool: Pick<ToolMeta, 'slug'>,
): string {
  return `/${domain.slug}/${template.slug}/${tool.slug}`;
}

export function searchPath(query = ''): string {
  return query.length > 0 ? `/search?q=${encodeURIComponent(query)}` : '/search';
}

export function favoritesPath(): string {
  return '/favorites';
}

export function recentPath(): string {
  return '/recent';
}
