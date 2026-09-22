import type { ToolMeta } from '../../../../types/catalog';

export const metadata: ToolMeta = {
  id: 'url-parser',
  domainId: 'web',
  templateId: 'url-tools',
  name: 'URL Parser',
  slug: 'url-parser',
  description: 'Decompose a URL into scheme, host, path, query parameters and fragment.',
  icon: '⛓',
  status: 'available',
  tags: ['url', 'query', 'parse'],
  keywords: ['uri', 'origin', 'params'],
  featured: true,
};
