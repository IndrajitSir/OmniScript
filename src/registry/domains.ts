import type { Domain } from '../types/catalog';

/**
 * ────────────────────────────────────────────────────────────────────────────
 *  Domain registry
 * ────────────────────────────────────────────────────────────────────────────
 *  The broadest level of the OmniScript hierarchy. Adding a domain here (plus
 *  a template in `templates.ts` and a tool folder under `src/tools`) makes it
 *  appear on the home directory automatically — no page edits required.
 *
 *  Today the registry is a static array; the shape is intentionally narrow so a
 *  future API/DB implementation can satisfy the same `Domain` interface.
 */
export const DOMAINS: Domain[] = [
  {
    id: 'network',
    name: 'Network',
    slug: 'network',
    description: 'Diagnose connectivity, routing, DNS, subnets and services.',
    icon: '⇄',
    accent: 'accentAlt',
    tags: ['networking', 'diagnostics', 'infrastructure'],
    featured: true,
  },
  {
    id: 'security',
    name: 'Cybersecurity',
    slug: 'security',
    description: 'Audit headers, tokens, hashes and hardening policy.',
    icon: '⛨',
    accent: 'err',
    tags: ['security', 'audit', 'hardening'],
    featured: true,
  },
  {
    id: 'developer',
    name: 'Developer',
    slug: 'developer',
    description: 'Format, decode and inspect the payloads you work with daily.',
    icon: '⟨⟩',
    accent: 'accent',
    tags: ['developer', 'json', 'code', 'regex'],
    featured: true,
  },
  {
    id: 'web',
    name: 'Web',
    slug: 'web',
    description: 'Understand URLs, headers and everything HTTP moves around.',
    icon: '◈',
    accent: 'accentAlt',
    tags: ['http', 'url', 'web'],
  },
  {
    id: 'text',
    name: 'Text',
    slug: 'text',
    description: 'Clean, transform and measure raw text.',
    icon: '¶',
    accent: 'ok',
    tags: ['text', 'strings', 'writing'],
  },
  {
    id: 'data',
    name: 'Data',
    slug: 'data',
    description: 'Reshape structured data and plan durable backups.',
    icon: '▦',
    accent: 'warn',
    tags: ['data', 'csv', 'json', 'backup'],
  },
  {
    id: 'encoding',
    name: 'Encoding',
    slug: 'encoding',
    description: 'Move values between bases, bytes and binary.',
    icon: '⇌',
    accent: 'accentAlt',
    tags: ['encoding', 'bases', 'bytes'],
  },
  {
    id: 'system',
    name: 'System',
    slug: 'system',
    description: 'Inspect the machine you are standing on.',
    icon: '▤',
    accent: 'ok',
    tags: ['system', 'metrics', 'linux'],
  },
  {
    id: 'utilities',
    name: 'Utilities',
    slug: 'utilities',
    description: 'Everyday generators, converters and shell autowriters.',
    icon: '⚙',
    accent: 'accent',
    tags: ['utilities', 'generators', 'shell'],
    featured: true,
  },
];
