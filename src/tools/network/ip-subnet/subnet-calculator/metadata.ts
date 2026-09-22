import type { ToolMeta } from '../../../../types/catalog';

export const metadata: ToolMeta = {
  id: 'subnet-calculator',
  domainId: 'network',
  templateId: 'ip-subnet',
  name: 'Subnet Calculator',
  slug: 'subnet-calculator',
  description: 'Break a CIDR block into network, broadcast, host range and netmask.',
  icon: '⊞',
  status: 'available',
  tags: ['ipv4', 'cidr', 'subnet'],
  keywords: ['netmask', 'vlsm', 'prefix', 'wildcard'],
  featured: true,
};
