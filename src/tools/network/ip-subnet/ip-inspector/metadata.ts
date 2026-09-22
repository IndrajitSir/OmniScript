import type { ToolMeta } from '../../../../types/catalog';

export const metadata: ToolMeta = {
  id: 'ip-inspector',
  domainId: 'network',
  templateId: 'ip-subnet',
  name: 'IP Address Inspector',
  slug: 'ip-inspector',
  description: 'Classify an IPv4 address: scope, class, binary form and reverse DNS name.',
  icon: '◉',
  status: 'available',
  tags: ['ipv4', 'classification', 'reverse-dns'],
  keywords: ['private', 'loopback', 'multicast', 'arpa'],
};
