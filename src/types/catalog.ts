import type { ComponentType } from 'react';

/**
 * ────────────────────────────────────────────────────────────────────────────
 *  OmniScript platform catalog
 * ────────────────────────────────────────────────────────────────────────────
 *  The platform is a three-level hierarchy:
 *
 *      Domain  →  Template  →  Tool
 *
 *  Every level is described by pure metadata. The UI never hard-codes a card:
 *  it renders whatever the registry contains, which is what lets OmniScript
 *  grow from four utilities to hundreds of tools without touching navigation.
 *
 *  Metadata is deliberately kept free of React imports so the same structures
 *  could later be served by an API/database instead of static TypeScript.
 */

/** Lifecycle of a tool. The UI renders every status, it just disables the dead ones. */
export type ToolStatus = 'available' | 'beta' | 'deprecated' | 'coming-soon';

/** Widest grouping in the hierarchy — a broad field of work. */
export interface Domain {
  /** Stable id, e.g. `"network"`. */
  id: string;
  name: string;
  /** URL segment, e.g. `"/network"`. */
  slug: string;
  description: string;
  /** Emoji/glyph accent, matching the existing blueprint icon convention. */
  icon: string;
  /** Optional palette token (`--os-accent`, `--os-ok`, …) used sparingly. */
  accent?: string;
  tags: string[];
  /** Surfaced first on the home directory. */
  featured?: boolean;
}

/** A themed collection of tools inside a domain. */
export interface ToolTemplate {
  id: string;
  /** Parent domain id. */
  domainId: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  tags: string[];
  featured?: boolean;
}

/** Everything the navigation/search layers need to know about a tool. */
export interface ToolMeta {
  id: string;
  domainId: string;
  templateId: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  status: ToolStatus;
  tags: string[];
  /** Extra hidden terms that should match a search query. */
  keywords?: string[];
  featured?: boolean;
  /**
   * When present, the shell-utility composer renders this tool, pre-selected to
   * the referenced bash blueprint. This is how the four legacy utilities are
   * migrated into the platform without rewriting the compiler.
   */
  scriptTemplateId?: string;
}

/** Props every tool implementation receives. */
export interface ToolComponentProps {
  tool: ToolMeta;
}

/** Metadata + implementation — the two separable concerns of a tool. */
export interface ToolDefinition {
  metadata: ToolMeta;
  Component: ComponentType<ToolComponentProps>;
}

/** Domain joined with its resolved templates (built by the registry). */
export interface DomainNode extends Domain {
  templates: TemplateNode[];
  toolCount: number;
}

/** Template joined with its resolved tools (built by the registry). */
export interface TemplateNode extends ToolTemplate {
  tools: ToolDefinition[];
  domain: Domain;
  toolCount: number;
}

/** Route resolution output — the shell renders one of these per pathname. */
export type ResolvedRoute =
  | { kind: 'home' }
  | { kind: 'search' }
  | { kind: 'favorites' }
  | { kind: 'recent' }
  | { kind: 'domain'; domain: DomainNode }
  | { kind: 'template'; domain: DomainNode; template: TemplateNode }
  | { kind: 'tool'; domain: DomainNode; template: TemplateNode; tool: ToolDefinition }
  | { kind: 'not-found'; path: string };

/** One row of a global search result, carrying its full breadcrumb path. */
export interface SearchHit {
  domain: Domain;
  template: ToolTemplate;
  tool: ToolMeta;
  /** Higher is better. */
  score: number;
  /** Human-readable breadcrumb, e.g. `Security / Authentication / JWT Decoder`. */
  path: string;
  status: ToolStatus;
}
