import type { ToolMeta } from '../../../../types/catalog';

export const metadata: ToolMeta = {
  id: 'timestamp-converter',
  domainId: 'utilities',
  templateId: 'unit-converters',
  name: 'Timestamp Converter',
  slug: 'timestamp-converter',
  description: 'Translate between Unix epoch seconds/milliseconds and ISO 8601.',
  icon: '⏱',
  status: 'available',
  tags: ['unix', 'epoch', 'iso8601'],
  keywords: ['time', 'utc', 'date'],
};
