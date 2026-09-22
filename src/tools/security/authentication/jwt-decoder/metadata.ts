import type { ToolMeta } from '../../../../types/catalog';

export const metadata: ToolMeta = {
  id: 'jwt-decoder',
  domainId: 'security',
  templateId: 'authentication',
  name: 'JWT Decoder',
  slug: 'jwt-decoder',
  description: 'Inspect a JSON Web Token: header, claims, expiry and algorithm.',
  icon: '⚿',
  status: 'available',
  tags: ['jwt', 'token', 'claims'],
  keywords: ['bearer', 'oidc', 'oauth', 'auth'],
  featured: true,
};
