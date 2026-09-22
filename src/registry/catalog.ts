import type {
  Domain,
  DomainNode,
  ResolvedRoute,
  TemplateNode,
  ToolDefinition,
} from '../types/catalog';
import { TOOL_DEFINITIONS } from '../tools';
import { DOMAINS } from './domains';
import { TEMPLATES } from './templates';

/**
 * ────────────────────────────────────────────────────────────────────────────
 *  Catalog assembly
 * ────────────────────────────────────────────────────────────────────────────
 *  Joins the three registries (domains, templates, tool definitions) into the
 *  tree the UI consumes. Every page renders from these nodes, and `resolveRoute`
 *  turns an arbitrary pathname into the node to show — that is what makes the
 *  routing table data-driven instead of a list of hand-written pages.
 */

function buildDomainNodes(): DomainNode[] {
  return DOMAINS.map((domain: Domain) => {
    const templates: TemplateNode[] = TEMPLATES.filter(
      (template) => template.domainId === domain.id,
    ).map((template) => {
      const tools = TOOL_DEFINITIONS.filter(
        (definition) => definition.metadata.templateId === template.id,
      );
      return { ...template, tools, domain, toolCount: tools.length };
    });

    return {
      ...domain,
      templates,
      toolCount: templates.reduce((total, template) => total + template.toolCount, 0),
    };
  });
}

/** The resolved hierarchy — the single source the whole UI reads from. */
export const DOMAIN_NODES: DomainNode[] = buildDomainNodes();

/** Flat list of every registered tool, in template order. */
export const ALL_TOOLS: ToolDefinition[] = DOMAIN_NODES.flatMap((domain) =>
  domain.templates.flatMap((template) => template.tools),
);

export function getAllTools(): ToolDefinition[] {
  return ALL_TOOLS;
}

export function getDomainNode(idOrSlug: string): DomainNode | undefined {
  return DOMAIN_NODES.find((domain) => domain.id === idOrSlug || domain.slug === idOrSlug);
}

export function getTemplateNode(idOrSlug: string): TemplateNode | undefined {
  for (const domain of DOMAIN_NODES) {
    const match = domain.templates.find(
      (template) => template.id === idOrSlug || template.slug === idOrSlug,
    );
    if (match) return match;
  }
  return undefined;
}

export function getToolById(id: string): ToolDefinition | undefined {
  return ALL_TOOLS.find((definition) => definition.metadata.id === id);
}

/** The domain + template a tool lives in, for breadcrumbs and card rendering. */
export interface ToolContext {
  domain: DomainNode;
  template: TemplateNode;
}

export function getToolContext(definition: ToolDefinition): ToolContext | undefined {
  const domain = DOMAIN_NODES.find((candidate) => candidate.id === definition.metadata.domainId);
  const template = domain?.templates.find(
    (candidate) => candidate.id === definition.metadata.templateId,
  );
  return domain && template ? { domain, template } : undefined;
}

/** Locate a tool by its three URL slugs. */
export function findTool(
  domainSlug: string,
  templateSlug: string,
  toolSlug: string,
): ToolDefinition | undefined {
  const domain = getDomainNode(domainSlug);
  const template = domain?.templates.find((candidate) => candidate.slug === templateSlug);
  return template?.tools.find((candidate) => candidate.metadata.slug === toolSlug);
}

function normalizePath(path: string): string[] {
  return path.split('/').filter((segment) => segment.length > 0).map(decodeURIComponent);
}

/** Resolve any pathname into a typed route the shell can render. */
export function resolveRoute(path: string): ResolvedRoute {
  const segments = normalizePath(path);

  if (segments.length === 0) return { kind: 'home' };
  if (segments.length === 1 && segments[0] === 'search') return { kind: 'search' };
  if (segments.length === 1 && segments[0] === 'favorites') return { kind: 'favorites' };
  if (segments.length === 1 && segments[0] === 'recent') return { kind: 'recent' };

  const [domainSlug, templateSlug, toolSlug] = segments;
  const domain = domainSlug ? getDomainNode(domainSlug) : undefined;
  if (!domain) return { kind: 'not-found', path };

  if (!templateSlug) return { kind: 'domain', domain };
  const template = domain.templates.find((candidate) => candidate.slug === templateSlug);
  if (!template) return { kind: 'not-found', path };

  if (!toolSlug) return { kind: 'template', domain, template };
  const tool = template.tools.find((candidate) => candidate.metadata.slug === toolSlug);
  if (!tool) return { kind: 'not-found', path };

  return { kind: 'tool', domain, template, tool };
}
