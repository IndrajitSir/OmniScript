import type { ToolMeta } from '../../../../types/catalog';

export const metadata: ToolMeta = {
  id: 'text-stats',
  domainId: 'text',
  templateId: 'text-tools',
  name: 'Word & Character Counter',
  slug: 'word-counter',
  description: 'Count words, characters, sentences and reading time, with word frequency.',
  icon: '#',
  status: 'available',
  tags: ['text', 'count', 'reading-time'],
  keywords: ['wc', 'statistics', 'frequency'],
};
