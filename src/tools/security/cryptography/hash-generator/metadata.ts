import type { ToolMeta } from '../../../../types/catalog';

export const metadata: ToolMeta = {
  id: 'hash-generator',
  domainId: 'security',
  templateId: 'cryptography',
  name: 'Hash Generator',
  slug: 'hash-generator',
  description: 'Digest text with SHA-1, SHA-256, SHA-384 and SHA-512.',
  icon: '⚷',
  status: 'available',
  tags: ['hash', 'sha', 'digest'],
  keywords: ['checksum', 'integrity', 'webcrypto'],
};
