import type { ToolMeta } from '../../../../types/catalog';

export const metadata: ToolMeta = {
  id: 'dns-lookup',
  domainId: 'network',
  templateId: 'dns-tools',
  name: 'DNS Lookup',
  slug: 'dns-lookup',
  description: 'Resolve A, AAAA, MX, TXT, NS and CNAME records over DNS-over-HTTPS.',
  icon: '☍',
  status: 'available',
  tags: ['dns', 'records', 'resolution'],
  keywords: ['dig', 'nslookup', 'doh'],
  featured: true,
};
