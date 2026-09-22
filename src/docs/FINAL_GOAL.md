I want to restructure and future-proof my existing OmniScript application:

Project URL:
https://omniscript-two.vercel.app/

The current application has a base architecture containing utility templates, and currently there are only around 4 utility templates. However, this project is intended to grow significantly. In the future, there may be dozens of domains/categories, dozens of templates under each domain, and dozens of individual tools under each template.

The current architecture should therefore be redesigned around scalability and discoverability rather than optimizing only for the current 4 templates.

## Core Architectural Change

Introduce a hierarchical navigation model:

**Domain → Template → Tool**

Instead of exposing the existing utility templates directly as the primary navigation level, introduce a dedicated domain/category selection page.

The intended user flow should become:

**Home → Select Domain → Select Template → Select Tool**

For example:

**Home**
→ **Network**
→ **Network Diagnostics**
→ **Ping Tester**

or:

**Home**
→ **Security**
→ **Web Security**
→ **HTTP Header Analyzer**

or:

**Home**
→ **Developer**
→ **JSON Tools**
→ **JSON Formatter**

or:

**Home**
→ **Utilities**
→ **Text Tools**
→ **Text Formatter**

---

# 1. Domain Selection Page

Create a dedicated page where users can select the broad type/domain of tool they want.

This page should be designed to support potentially dozens of domains in the future.

Example domains:

* Network
* Cybersecurity
* Developer
* Web
* Database
* DevOps
* System
* Text
* Data
* Encoding
* Cryptography
* Image
* File
* Productivity
* Utilities

Do not hard-code the UI around only these examples. The architecture should make adding a new domain primarily a data/configuration change.

Each domain should have:

* Name
* Short description
* Icon
* Optional visual accent
* Number of available templates/tools
* Slug
* Metadata
* Optional tags

Example conceptual object:

```ts
{
  id: "network",
  name: "Network",
  slug: "network",
  description: "Tools for network diagnostics, analysis and troubleshooting.",
  icon: "network",
  tags: ["networking", "diagnostics", "infrastructure"]
}
```

The UI should automatically render domains from this data.

---

# 2. Template Selection Page

After selecting a domain, show the templates belonging to that domain.

Example:

**Network**

* Network Diagnostics
* DNS Tools
* IP & Subnet Tools
* Port & Service Tools
* Network Analysis

Each template should contain:

* Name
* Description
* Icon
* Slug
* Tool count
* Tags
* Domain ID
* Optional featured status

Example:

```ts
{
  id: "network-diagnostics",
  domainId: "network",
  name: "Network Diagnostics",
  slug: "network-diagnostics",
  description: "Tools for diagnosing network connectivity and routing.",
  icon: "activity"
}
```

The template page should not know about individual tools through hard-coded JSX.

It should retrieve/render the tools associated with that template.

---

# 3. Tool Selection / Tool Page

After selecting a template, display the tools belonging to that template.

Example:

**Network Diagnostics**

* Ping
* Traceroute
* DNS Lookup
* HTTP Connectivity Test
* IP Information
* Port Checker

Each tool should have metadata such as:

```ts
{
  id: "ping",
  templateId: "network-diagnostics",
  name: "Ping",
  slug: "ping",
  description: "Check whether a host is reachable.",
  icon: "radio",
  status: "available",
  tags: ["icmp", "network", "diagnostics"]
}
```

Selecting a tool should open its actual tool interface.

---

# 4. Do NOT Build Separate Pages Manually for Every Tool

The architecture must support dynamic routing.

Prefer a structure conceptually similar to:

```text
/[domain]
/[domain]/[template]
/[domain]/[template]/[tool]
```

For example:

```text
/network
/network/network-diagnostics
/network/network-diagnostics/ping

/security
/security/web-security
/security/web-security/http-header-analyzer

/developer
/developer/json-tools
/developer/json-tools/json-formatter
```

The exact routing implementation should follow the framework already being used by the project.

Avoid creating dozens of manually duplicated pages.

The route should determine which domain, template and tool to render from centralized configuration/registry data.

---

# 5. Introduce a Central Tool Registry

Create a scalable registry/configuration layer.

The UI should be driven by structured metadata rather than hard-coded navigation.

Conceptually:

```ts
domains
  └── templates
        └── tools
```

For example:

```ts
const toolRegistry = {
  network: {
    templates: {
      "network-diagnostics": {
        tools: [
          "ping",
          "traceroute",
          "dns-lookup"
        ]
      }
    }
  }
}
```

However, do not necessarily use this exact structure if a better architecture fits the existing codebase.

The important requirement is:

**Adding a new domain, template or tool should require minimal changes to the UI.**

Ideally:

```text
Add metadata
+
Add tool implementation
=
Tool automatically appears in the correct location
```

---

# 6. Separate Tool Metadata from Tool Implementation

This is extremely important for long-term scalability.

A tool should have two distinct concerns:

### Metadata

```ts
{
  id,
  name,
  slug,
  description,
  domain,
  template,
  icon,
  tags,
  status,
  featured
}
```

### Implementation

The actual React/component/tool logic.

For example:

```text
tools/
├── network/
│   ├── ping/
│   │   ├── metadata.ts
│   │   └── PingTool.tsx
│   │
│   ├── traceroute/
│   │   ├── metadata.ts
│   │   └── TracerouteTool.tsx
│
├── security/
│   ├── jwt-decoder/
│   │   ├── metadata.ts
│   │   └── JwtDecoderTool.tsx
```

Use a registry/factory approach so the application can map a tool ID to its implementation.

For example conceptually:

```ts
toolComponents["ping"] = PingTool
toolComponents["jwt-decoder"] = JwtDecoderTool
```

Do not tightly couple the navigation UI to individual tool components.

---

# 7. Design for Dozens/Hundreds of Tools

The UI should remain usable when the project grows from:

```text
4 tools
```

to:

```text
50 tools
```

to:

```text
200+ tools
```

Therefore, introduce:

* Search
* Filtering
* Tags
* Categories
* Tool counts
* Recently used tools
* Favorites/bookmarks
* Featured tools
* Popular tools
* Tool status
* Breadcrumb navigation

Do not show hundreds of cards simultaneously without navigation/search.

---

# 8. Global Tool Search

Add a global search mechanism that can search across:

```text
Domain
Template
Tool
Tags
Description
```

For example, searching:

```text
JWT
```

could return:

```text
Security
  → Authentication
      → JWT Decoder

Security
  → Authentication
      → JWT Generator
```

Searching:

```text
DNS
```

could return:

```text
Network
  → DNS Tools
      → DNS Lookup
      → DNS Record Checker
```

The search system should be designed so that it can scale with the number of tools.

---

# 9. Breadcrumb Navigation

Once the user enters a tool, provide clear navigation:

```text
Home / Network / Network Diagnostics / Ping
```

This allows the user to move back to:

* Domain
* Template
* Tool

without relying exclusively on browser navigation.

---

# 10. Preserve the Existing Design Language

Do NOT completely redesign OmniScript visually.

First inspect the existing project and identify:

* Existing design system
* Colors
* Typography
* Card styles
* Panels
* Animations
* Navigation
* Responsive behavior
* Existing utility template UI
* Existing tool UI

The new architecture should feel like a natural evolution of the existing OmniScript design.

Reuse existing components wherever possible.

Avoid unnecessary duplication.

---

# 11. Make the Domain Page Feel Like the Main Directory

The new domain selection page should feel like the central directory of OmniScript.

The user should immediately understand:

> "What kind of tool are you looking for?"

Possible visual structure:

```text
                    OmniScript

              What do you want to work with?

     ┌────────────┐  ┌────────────┐  ┌────────────┐
     │  Network   │  │  Security  │  │ Developer  │
     │            │  │            │  │            │
     │ 24 tools   │  │ 38 tools   │  │ 31 tools   │
     └────────────┘  └────────────┘  └────────────┘

     ┌────────────┐  ┌────────────┐  ┌────────────┐
     │    Web     │  │  Database  │  │   DevOps   │
     └────────────┘  └────────────┘  └────────────┘
```

The exact visual design should match the existing OmniScript aesthetic.

---

# 12. Recommended Information Architecture

Use this conceptual hierarchy:

```text
OmniScript
│
├── Home
│
├── Domains
│   │
│   ├── Network
│   │   │
│   │   ├── Network Diagnostics
│   │   │   ├── Ping
│   │   │   ├── Traceroute
│   │   │   └── ...
│   │   │
│   │   ├── DNS Tools
│   │   │   ├── DNS Lookup
│   │   │   └── ...
│   │   │
│   │   └── ...
│   │
│   ├── Security
│   │   ├── Web Security
│   │   ├── Cryptography
│   │   ├── Authentication
│   │   └── ...
│   │
│   ├── Developer
│   │   ├── JSON
│   │   ├── Code
│   │   ├── Regex
│   │   └── ...
│   │
│   └── ...
│
├── Search
│
├── Favorites
│
└── Recently Used
```

---

# 13. Architecture Requirements

The implementation should follow these principles:

### Data-driven UI

Do not hard-code domain/template/tool cards.

### Modular

A new domain should not require rewriting existing domain pages.

### Extensible

A new template should not require modifying the domain page.

### Pluggable tools

A new tool should be registerable without modifying unrelated tools.

### Type-safe

Use strong TypeScript types for:

* Domain
* Template
* Tool metadata
* Tool implementation
* Tool status
* Tool categories/tags

### Maintainable

Avoid giant files such as:

```text
tools.tsx
allTools.tsx
pages.tsx
```

containing hundreds of unrelated implementations.

Organize the project into logical modules.

---

# 14. Existing Utility Templates

Migrate the existing 4 utility templates into the new architecture instead of deleting or replacing them.

Determine which domain and template each existing utility belongs to.

For example:

```text
Utilities
└── Existing Template
    ├── Existing Tool 1
    ├── Existing Tool 2
    └── ...
```

Do not break the existing functionality while introducing the new hierarchy.

Existing URLs should ideally continue working where practical, or provide redirects/aliases if routes change.

---

# 15. Scalability Consideration

Design the system so that later we can potentially move the registry from static TypeScript files to an API/database without rewriting the frontend architecture.

For example, today:

```text
Static Registry
      ↓
React UI
```

Later:

```text
Database/API
      ↓
Tool Registry Service
      ↓
React UI
```

The frontend should depend on a clean domain/template/tool data interface rather than directly depending on where the data is stored.

---

# 16. Future Features to Leave Architectural Space For

Do not necessarily implement all of these now, but avoid architectural decisions that would prevent them later:

* User favorites
* Recently used tools
* Tool ratings/feedback
* Tool versioning
* Tool status (`available`, `beta`, `deprecated`)
* Tool permissions
* Authentication-required tools
* Premium tools
* Tool usage analytics
* Tool documentation
* Tool API endpoints
* Tool chaining/workflows
* Related tools
* Recommended tools
* Keyboard shortcuts
* Command palette
* Global search
* Tags
* Tool collections
* Recently updated tools

---

# 17. Important UX Principle

Do not make the hierarchy feel unnecessarily deep.

The architecture is:

**Domain → Template → Tool**

but users should still be able to reach tools quickly.

For example, global search should allow:

```text
User searches "JWT"
        ↓
JWT Decoder
        ↓
Open tool
```

without requiring:

```text
Home
→ Security
→ Authentication
→ JWT
→ JWT Decoder
```

The hierarchy is for organization and discovery, while search is for speed.

---

# 18. Implementation Process

Before modifying the code:

1. Inspect the existing OmniScript architecture.
2. Identify the current routing system.
3. Identify the existing 4 utility templates.
4. Identify how tools are currently registered/rendered.
5. Identify reusable UI components.
6. Identify existing design tokens/theme variables.
7. Identify existing state-management/data-loading patterns.
8. Propose the minimal architectural changes required.
9. Then implement the new domain → template → tool architecture.

Do not blindly rewrite the entire project.

Prefer incremental refactoring.

---

# 19. Acceptance Criteria

The implementation should satisfy these requirements:

* A user can enter OmniScript and choose a broad tool domain.
* A domain can contain many templates.
* A template can contain many tools.
* Tools can be accessed through dynamic routes.
* Existing tools continue working.
* Adding a new domain does not require rewriting the domain page.
* Adding a new template does not require rewriting the template page.
* Adding a new tool does not require rewriting navigation.
* Tool metadata and tool implementation are separated.
* Search can eventually index every tool.
* The UI remains usable with hundreds of tools.
* The architecture is TypeScript-friendly.
* Existing OmniScript visual identity is preserved.
* The solution is responsive on desktop, tablet and mobile.
* No unnecessary duplication is introduced.

## Most Important Principle

Build OmniScript as a **tool platform**, not as a collection of individual tool pages.

Think of the architecture as:

```text
                 OMNISCRIPT
                     │
          ┌──────────┴──────────┐
          │                     │
       Domains                Search
          │
     ┌────┼────┐
     │    │    │
 Network Security Developer
     │
  Templates
     │
 ┌───┼────┐
 DNS  Diagnostics  IP
 │       │          │
Tools   Tools      Tools
 │
Ping
DNS Lookup
Traceroute
...
```

The goal is that OmniScript can grow from the current 4 utility templates into **dozens of domains, hundreds of templates, and potentially hundreds or thousands of tools without requiring another architectural rewrite.**

Before coding, inspect the existing project and adapt this architecture to what is already present rather than replacing working infrastructure unnecessarily.
