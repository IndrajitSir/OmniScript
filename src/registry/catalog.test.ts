import { describe, expect, it } from 'vitest';
import {
  ALL_TOOLS,
  DOMAIN_NODES,
  findTool,
  getDomainNode,
  getTemplateNode,
  getToolById,
  getToolContext,
  resolveRoute,
  searchCatalog,
} from './index';

describe('catalog integrity', () => {
  it('every domain owns at least one template', () => {
    for (const domain of DOMAIN_NODES) {
      expect(domain.templates.length).toBeGreaterThan(0);
    }
  });

  it('resolves each tool through its declared domain and template', () => {
    for (const definition of ALL_TOOLS) {
      const { domainId, templateId } = definition.metadata;
      const domain = getDomainNode(domainId);
      const template = getTemplateNode(templateId);
      expect(domain, `missing domain ${domainId}`).toBeTruthy();
      expect(template, `missing template ${templateId}`).toBeTruthy();
      expect(template!.domainId).toBe(domainId);
    }
  });

  it('keeps ids and slugs unique at every level', () => {
    const ids = (values: Array<{ id: string; slug: string }>) => values.map((value) => value.id);
    const slugs = (values: Array<{ id: string; slug: string }>) => values.map((value) => value.slug);

    expect(new Set(ids(DOMAIN_NODES)).size).toBe(DOMAIN_NODES.length);
    expect(new Set(slugs(DOMAIN_NODES)).size).toBe(DOMAIN_NODES.length);

    const templates = DOMAIN_NODES.flatMap((domain) => domain.templates);
    expect(new Set(ids(templates)).size).toBe(templates.length);

    const toolMeta = ALL_TOOLS.map((definition) => definition.metadata);
    expect(new Set(ids(toolMeta)).size).toBe(toolMeta.length);
    expect(new Set(slugs(toolMeta)).size).toBe(toolMeta.length);
  });

  it('counts tools per domain and per template', () => {
    for (const domain of DOMAIN_NODES) {
      const sum = domain.templates.reduce((total, template) => total + template.toolCount, 0);
      expect(domain.toolCount).toBe(sum);
    }
  });
});

describe('resolveRoute', () => {
  it('maps every level of the hierarchy', () => {
    expect(resolveRoute('/').kind).toBe('home');
    expect(resolveRoute('/search').kind).toBe('search');
    expect(resolveRoute('/favorites').kind).toBe('favorites');
    expect(resolveRoute('/recent').kind).toBe('recent');
    expect(resolveRoute('/network').kind).toBe('domain');
    expect(resolveRoute('/network/dns-tools').kind).toBe('template');
    expect(resolveRoute('/network/dns-tools/dns-lookup').kind).toBe('tool');
  });

  it('resolves the documented example route', () => {
    const route = resolveRoute('/network/dns-tools/dns-lookup');
    expect(route.kind).toBe('tool');
    if (route.kind !== 'tool') return;
    expect(route.domain.name).toBe('Network');
    expect(route.template.name).toBe('DNS Tools');
    expect(route.tool.metadata.name).toBe('DNS Lookup');
  });

  it('returns not-found for unknown paths', () => {
    expect(resolveRoute('/does-not-exist').kind).toBe('not-found');
    expect(resolveRoute('/network/nope').kind).toBe('not-found');
    expect(resolveRoute('/network/dns-tools/nope').kind).toBe('not-found');
  });

  it('resolves the security example route', () => {
    const tool = findTool('security', 'authentication', 'jwt-decoder');
    expect(tool?.metadata.id).toBe('jwt-decoder');
  });
});

describe('searchCatalog', () => {
  it('returns nothing for an empty query', () => {
    expect(searchCatalog('   ')).toEqual([]);
  });

  it('finds tools across domains by name, tag and keyword', () => {
    expect(searchCatalog('jwt').map((hit) => hit.tool.id)).toContain('jwt-decoder');
    const dnsIds = searchCatalog('dns').map((hit) => hit.tool.id);
    expect(dnsIds).toContain('dns-lookup');
    expect(dnsIds).toContain('dns-record-reference');
    expect(searchCatalog('json').some((hit) => hit.tool.id === 'json-formatter')).toBe(true);
  });

  it('requires every token to match (AND semantics)', () => {
    expect(searchCatalog('jwt nonexistentterm')).toHaveLength(0);
  });

  it('ranks a name match above a description match', () => {
    const hits = searchCatalog('formatter');
    expect(hits[0]?.tool.id).toBe('json-formatter');
  });
});

describe('lookups', () => {
  it('finds a tool by id and resolves its parents', () => {
    const definition = getToolById('subnet-calculator');
    expect(definition).toBeTruthy();
    const context = getToolContext(definition!);
    expect(context?.domain.slug).toBe('network');
    expect(context?.template.slug).toBe('ip-subnet');
  });

  it('migrates the four legacy blueprints as composer tools', () => {
    const composers = ALL_TOOLS.filter((definition) => definition.metadata.scriptTemplateId);
    const templateIds = composers.map((definition) => definition.metadata.scriptTemplateId).sort();
    expect(templateIds).toEqual([
      'backup-engine',
      'network-diagnostics',
      'security-hardening',
      'system-metrics',
    ]);
  });
});
