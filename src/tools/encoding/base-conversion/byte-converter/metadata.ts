import type { ToolMeta } from '../../../../types/catalog';

export const metadata: ToolMeta = {
  id: 'byte-converter',
  domainId: 'encoding',
  templateId: 'base-conversion',
  name: 'Data Size Converter',
  slug: 'data-size-converter',
  description: 'Convert between bytes, kilobytes, megabytes and binary units.',
  icon: '⇋',
  status: 'available',
  tags: ['bytes', 'storage', 'si'],
  keywords: ['kib', 'mib', 'gb', 'throughput'],
};
