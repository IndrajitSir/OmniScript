import type { ToolMeta } from '../../../../types/catalog';

export const metadata: ToolMeta = {
  id: 'csv-json',
  domainId: 'data',
  templateId: 'data-converters',
  name: 'CSV ↔ JSON Converter',
  slug: 'csv-json-converter',
  description: 'Convert delimited data to a JSON array and back, with quoted-field support.',
  icon: '⇋',
  status: 'available',
  tags: ['csv', 'json', 'convert'],
  keywords: ['tsv', 'spreadsheet', 'records'],
  featured: true,
};
