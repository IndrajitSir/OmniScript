import type { ToolMeta } from '../../../../types/catalog';

export const metadata: ToolMeta = {
  id: 'security-headers',
  domainId: 'security',
  templateId: 'web-security',
  name: 'HTTP Security Header Analyzer',
  slug: 'security-headers-analyzer',
  description: 'Grade a response header block against the browser security baseline.',
  icon: '⛨',
  status: 'available',
  tags: ['headers', 'csp', 'hsts'],
  keywords: ['cors', 'x-frame-options', 'hardening', 'audit'],
  featured: true,
};
