import type { ToolMeta } from '../../../../types/catalog';

export const metadata: ToolMeta = {
  id: 'port-reference',
  domainId: 'network',
  templateId: 'ports-services',
  name: 'Service Port Reference',
  slug: 'port-reference',
  description: 'Look up common TCP/UDP ports by number or service name.',
  icon: '⇹',
  status: 'available',
  tags: ['ports', 'services', 'reference'],
  keywords: ['iana', 'well-known', 'socket'],
};
