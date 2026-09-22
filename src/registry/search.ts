import type { Domain, SearchHit, ToolDefinition, ToolTemplate } from '../types/catalog';
import { DOMAIN_NODES } from './catalog';

/**
 * ────────────────────────────────────────────────────────────────────────────
 *  Global search
 * ────────────────────────────────────────────────────────────────────────────
 *  Searches across domain, template, tool name, slug, description, tags and
 *  hidden keywords. It is a pure function over the registry, so it scales with
 *  the catalog without index maintenance — and can later be swapped for a
 *  server-side endpoint behind the same signature.
 *
 *  Semantics: every whitespace-delimited query token must match somewhere (AND);
 *  weighted field hits are summed for ranking.
 */

const WEIGHT = {
  name: 6,
  slug: 5,
  keywords: 5,
  tags: 4,
  template: 3,
  domain: 3,
  description: 2,
} as const;

function fieldScore(value: string, token: string): number {
  const haystack = value.toLowerCase();
  if (haystack === token) return 3;
  if (haystack.startsWith(token)) return 2;
  if (haystack.includes(token)) return 1;
  return 0;
}

interface ParentPair {
  domain: Domain;
  template: ToolTemplate;
}

function findParents(definition: ToolDefinition): ParentPair | null {
  const domain = DOMAIN_NODES.find((candidate) => candidate.id === definition.metadata.domainId);
  if (!domain) return null;
  const template = domain.templates.find(
    (candidate) => candidate.id === definition.metadata.templateId,
  );
  return template ? { domain, template } : null;
}

function scoreTool(definition: ToolDefinition, tokens: string[], parents: ParentPair): number | null {
  const { metadata } = definition;
  const haystackText = [
    metadata.name,
    metadata.slug,
    metadata.description,
    (metadata.keywords ?? []).join(' '),
    metadata.tags.join(' '),
    parents.template.name,
    parents.template.tags.join(' '),
    parents.domain.name,
    parents.domain.tags.join(' '),
  ];

  let total = 0;
  for (const token of tokens) {
    const name = fieldScore(metadata.name, token) * WEIGHT.name;
    const slug = fieldScore(metadata.slug, token) * WEIGHT.slug;
    const keywords = fieldScore((metadata.keywords ?? []).join(' '), token) * WEIGHT.keywords;
    const tags = fieldScore(metadata.tags.join(' '), token) * WEIGHT.tags;
    const template = fieldScore(parents.template.name, token) * WEIGHT.template;
    const domain = fieldScore(parents.domain.name, token) * WEIGHT.domain;
    const description = fieldScore(metadata.description, token) * WEIGHT.description;
    const hit = name + slug + keywords + tags + template + domain + description;
    if (hit === 0) {
      // Fall back to a plain substring scan so partial words still match.
      const textHit = haystackText.some((value) => value.toLowerCase().includes(token));
      if (!textHit) return null;
      total += 1;
      continue;
    }
    total += hit;
  }
  return total;
}

export function searchCatalog(query: string, limit = 24): SearchHit[] {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
  if (tokens.length === 0) return [];

  const hits: SearchHit[] = [];
  for (const definition of DOMAIN_NODES.flatMap((domain) =>
    domain.templates.flatMap((template) => template.tools),
  )) {
    const parents = findParents(definition);
    if (!parents) continue;
    const score = scoreTool(definition, tokens, parents);
    if (score === null) continue;
    hits.push({
      domain: parents.domain,
      template: parents.template,
      tool: definition.metadata,
      status: definition.metadata.status,
      score,
      path: `${parents.domain.name} / ${parents.template.name} / ${definition.metadata.name}`,
    });
  }

  return hits
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name))
    .slice(0, limit);
}
