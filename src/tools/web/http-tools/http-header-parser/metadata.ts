import type { ToolMeta } from '../../../../types/catalog';

export const metadata: ToolMeta = {
  id: 'http-header-parser',
  domainId: 'web',
  templateId: 'http-tools',
  name: 'HTTP Header Parser',
  slug: 'http-header-parser',
  description: 'Turn a pasted request or response header block into a clean table.',
  icon: '⇶',
  status: 'available',
  tags: ['http', 'headers', 'request'],
  keywords: ['curl', 'response', 'status'],
};
