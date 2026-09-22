import type { ToolMeta } from '../../../../types/catalog';

export const metadata: ToolMeta = {
  id: 'password-strength',
  domainId: 'security',
  templateId: 'authentication',
  name: 'Password Strength Analyzer',
  slug: 'password-strength-analyzer',
  description: 'Estimate search-space entropy and flag predictable patterns.',
  icon: '✱',
  status: 'beta',
  tags: ['password', 'entropy', 'policy'],
  keywords: ['strength', 'crack-time', 'zxcvn'],
};
