import type { ToolMeta } from '../../../../types/catalog';

export const metadata: ToolMeta = {
  id: 'network-diagnostics-composer',
  domainId: 'network',
  templateId: 'network-diagnostics',
  name: 'Network Diagnostics Composer',
  slug: 'network-diagnostics-composer',
  description:
    'Compose the myip wrapper: interfaces, public IP, DNS, port sweeps, route traces, throughput and wireless visibility.',
  icon: '⇄',
  status: 'available',
  tags: ['bash', 'composer', 'network', 'myip'],
  keywords: ['shell', 'script', 'generator', 'linux'],
  featured: true,
  scriptTemplateId: 'network-diagnostics',
};
