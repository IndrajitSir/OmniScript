import type { ToolMeta } from '../../../../types/catalog';

export const metadata: ToolMeta = {
  id: 'case-converter',
  domainId: 'text',
  templateId: 'text-tools',
  name: 'Case Converter',
  slug: 'case-converter',
  description: 'Convert text across camel, snake, kebab, constant, title and sentence case.',
  icon: 'Aa',
  status: 'available',
  tags: ['text', 'case', 'naming'],
  keywords: ['camelcase', 'snake_case', 'kebab'],
  featured: true,
};
