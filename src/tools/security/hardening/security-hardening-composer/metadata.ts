import type { ToolMeta } from '../../../../types/catalog';

export const metadata: ToolMeta = {
  id: 'security-hardening-composer',
  domainId: 'security',
  templateId: 'hardening',
  name: 'Security Hardening Composer',
  slug: 'security-hardening-composer',
  description:
    'Compose the sentinel wrapper: privilege audit, firewall policy, updates, SSH rules, SUID inventory and hardening.',
  icon: '⌘',
  status: 'available',
  tags: ['bash', 'composer', 'audit', 'sentinel'],
  keywords: ['shell', 'script', 'generator', 'linux', 'security'],
  scriptTemplateId: 'security-hardening',
};
