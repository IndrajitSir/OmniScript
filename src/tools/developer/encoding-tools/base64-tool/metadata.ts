import type { ToolMeta } from '../../../../types/catalog';

export const metadata: ToolMeta = {
  id: 'base64-tool',
  domainId: 'developer',
  templateId: 'encoding-tools',
  name: 'Base64 Encoder / Decoder',
  slug: 'base64-encoder',
  description: 'Encode UTF-8 text to Base64 and decode it back, URL-safe optional.',
  icon: '⇋',
  status: 'available',
  tags: ['base64', 'encode', 'decode'],
  keywords: ['b64', 'data-url', 'atob', 'btoa'],
};
