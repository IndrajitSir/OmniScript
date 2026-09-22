import type { ToolMeta } from '../../../../types/catalog';

export const metadata: ToolMeta = {
  id: 'dns-record-reference',
  domainId: 'network',
  templateId: 'dns-tools',
  name: 'DNS Record Reference',
  slug: 'dns-record-reference',
  description: 'A searchable catalogue of DNS record types and what each one is for.',
  icon: '≡',
  status: 'available',
  tags: ['dns', 'reference', 'records'],
  keywords: ['rfc', 'zone', 'soa', 'srv'],
};
