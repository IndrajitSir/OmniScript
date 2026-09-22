import type { ToolTemplate } from '../types/catalog';

/**
 * ────────────────────────────────────────────────────────────────────────────
 *  Template registry
 * ────────────────────────────────────────────────────────────────────────────
 *  A template groups related tools inside a domain. The domain and template
 *  pages render whatever is registered here, so a new template is a data-only
 *  change: add one object, then point tool metadata at its `id`.
 */
export const TEMPLATES: ToolTemplate[] = [
  /* ── Network ───────────────────────────────────────────────────────────── */
  {
    id: 'network-diagnostics',
    domainId: 'network',
    name: 'Network Diagnostics',
    slug: 'network-diagnostics',
    description: 'Compose a full troubleshooting wrapper or run focused probes.',
    icon: '⇄',
    tags: ['icmp', 'connectivity', 'troubleshooting'],
    featured: true,
  },
  {
    id: 'dns-tools',
    domainId: 'network',
    name: 'DNS Tools',
    slug: 'dns-tools',
    description: 'Resolve records and learn the DNS record catalogue.',
    icon: '☍',
    tags: ['dns', 'records', 'resolution'],
  },
  {
    id: 'ip-subnet',
    domainId: 'network',
    name: 'IP & Subnet Tools',
    slug: 'ip-subnet',
    description: 'Reason about addressing, ranges and CIDR notation.',
    icon: '⊞',
    tags: ['ip', 'cidr', 'addressing'],
  },
  {
    id: 'ports-services',
    domainId: 'network',
    name: 'Port & Service Tools',
    slug: 'ports-services',
    description: 'Decipher the port numbers in your socket tables.',
    icon: '⇹',
    tags: ['ports', 'services', 'tcp'],
  },

  /* ── Security ──────────────────────────────────────────────────────────── */
  {
    id: 'web-security',
    domainId: 'security',
    name: 'Web Security',
    slug: 'web-security',
    description: 'Inspect the response headers that decide browser trust.',
    icon: '⛨',
    tags: ['headers', 'csp', 'browser'],
    featured: true,
  },
  {
    id: 'authentication',
    domainId: 'security',
    name: 'Authentication',
    slug: 'authentication',
    description: 'Decode tokens and pressure-test credentials.',
    icon: '⚿',
    tags: ['jwt', 'tokens', 'passwords'],
  },
  {
    id: 'cryptography',
    domainId: 'security',
    name: 'Cryptography',
    slug: 'cryptography',
    description: 'Hash payloads with the standard digest families.',
    icon: '⚷',
    tags: ['hash', 'sha', 'digest'],
  },
  {
    id: 'hardening',
    domainId: 'security',
    name: 'Security Hardening',
    slug: 'hardening',
    description: 'Compile an audit-and-harden wrapper for a Linux host.',
    icon: '⌘',
    tags: ['audit', 'firewall', 'ssh'],
  },

  /* ── Developer ─────────────────────────────────────────────────────────── */
  {
    id: 'json-tools',
    domainId: 'developer',
    name: 'JSON Tools',
    slug: 'json-tools',
    description: 'Validate, prettify and minify JSON payloads.',
    icon: '{}',
    tags: ['json', 'format', 'validate'],
    featured: true,
  },
  {
    id: 'code-tools',
    domainId: 'developer',
    name: 'Code Tools',
    slug: 'code-tools',
    description: 'Test regular expressions and decode cron schedules.',
    icon: '⌨',
    tags: ['regex', 'cron', 'syntax'],
  },
  {
    id: 'encoding-tools',
    domainId: 'developer',
    name: 'Encoding Tools',
    slug: 'encoding-tools',
    description: 'Encode and decode the formats APIs exchange.',
    icon: '⇋',
    tags: ['base64', 'url', 'encode'],
  },

  /* ── Web ───────────────────────────────────────────────────────────────── */
  {
    id: 'url-tools',
    domainId: 'web',
    name: 'URL Tools',
    slug: 'url-tools',
    description: 'Dissect URLs into their constituent parts.',
    icon: '⛓',
    tags: ['url', 'query', 'parse'],
  },
  {
    id: 'http-tools',
    domainId: 'web',
    name: 'HTTP Tools',
    slug: 'http-tools',
    description: 'Turn pasted header blocks into structured tables.',
    icon: '⇶',
    tags: ['http', 'headers', 'request'],
  },

  /* ── Text ──────────────────────────────────────────────────────────────── */
  {
    id: 'text-tools',
    domainId: 'text',
    name: 'Text Tools',
    slug: 'text-tools',
    description: 'Transform casing, build slugs and count content.',
    icon: '¶',
    tags: ['text', 'case', 'slug'],
  },

  /* ── Data ──────────────────────────────────────────────────────────────── */
  {
    id: 'data-converters',
    domainId: 'data',
    name: 'Data Converters',
    slug: 'data-converters',
    description: 'Convert between tabular and structured formats.',
    icon: '▦',
    tags: ['csv', 'json', 'convert'],
  },
  {
    id: 'backup-restore',
    domainId: 'data',
    name: 'Backup & Restore',
    slug: 'backup-restore',
    description: 'Compile a snapshot, encryption and restore wrapper.',
    icon: '⛁',
    tags: ['backup', 'restore', 'archive'],
  },

  /* ── Encoding ──────────────────────────────────────────────────────────── */
  {
    id: 'base-conversion',
    domainId: 'encoding',
    name: 'Base & Byte Conversion',
    slug: 'base-conversion',
    description: 'Translate values across number bases and size units.',
    icon: '⇌',
    tags: ['binary', 'hex', 'bytes'],
  },

  /* ── System ────────────────────────────────────────────────────────────── */
  {
    id: 'system-metrics',
    domainId: 'system',
    name: 'System Metrics',
    slug: 'system-metrics',
    description: 'Compile a CPU, memory, disk and I/O diagnostics wrapper.',
    icon: '▤',
    tags: ['cpu', 'memory', 'linux'],
  },

  /* ── Utilities ─────────────────────────────────────────────────────────── */
  {
    id: 'generators',
    domainId: 'utilities',
    name: 'Generators',
    slug: 'generators',
    description: 'Produce identifiers, secrets and placeholder copy.',
    icon: '✦',
    tags: ['uuid', 'password', 'lorem'],
  },
  {
    id: 'unit-converters',
    domainId: 'utilities',
    name: 'Unit Converters',
    slug: 'unit-converters',
    description: 'Convert timestamps and colour values.',
    icon: '⇄',
    tags: ['time', 'colour', 'convert'],
  },
];
