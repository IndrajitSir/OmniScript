# OmniScript — A platform for browser-side tools

OmniScript is organised as a **Domain → Template → Tool** platform. Every card, route and
search result is derived from a central registry, so the app scales from a handful of tools
to hundreds without a navigation rewrite.

The original composer still lives here: the four legacy bash blueprints (myip, sysinfo,
snapkit, sentinel) are migrated into their natural domains as composer tools, and you can
still pick a **Base Linux Utility Architecture**, toggle modules, choose a palette and
download a complete, colour-coded, dependency-aware shell script — live in the browser.

```
┌─ 01 Base Architecture ─┐ ┌─ 02 Control Matrix ─┐ ┌─ 03 Shell Sandbox ──────────┐
│ template dropdown      │ │ compile-time toggles│ │ numbered source / live sim  │
│ executable name        │ │ palette presets     │ │ Copy Raw Source             │
│ module checklist       │ │ build statistics    │ │ Download Executable (.sh)   │
└────────────────────────┘ └─────────────────────┘ └─────────────────────────────┘
```

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build
npm test           # vitest: compiler unit tests + real bash -n checks + DOM tests
npm run lint       # oxlint
```

## Project layout

```
src/
├── types/
│   ├── catalog.ts             # Domain, ToolTemplate, ToolMeta, ToolDefinition, ResolvedRoute
│   └── script.ts              # FlagModule, ScriptTemplate, ScriptSettings, TerminalTheme
├── registry/
│   ├── domains.ts             # DOMAINS — the broad tool categories
│   ├── templates.ts           # TEMPLATES — groupings inside each domain
│   ├── catalog.ts             # assembles the tree + resolveRoute(pathname)
│   ├── search.ts              # global search over every level
│   └── index.ts               # barrel export
├── router/
│   ├── router.tsx             # tiny History-API router (provider + Link)
│   ├── routerContext.ts       # context + useRouter()
│   └── paths.ts               # canonical URL builders
├── tools/
│   ├── <domain>/<template>/<tool>/
│   │   ├── metadata.ts        # pure ToolMeta (no React)
│   │   └── <Tool>.tsx         # the implementation
│   ├── shared/                # implementations reused across metadata entries
│   └── index.ts               # TOOL_DEFINITIONS — where metadata meets code
├── components/
│   ├── platform/              # AppShell, breadcrumbs, cards, search palette
│   ├── pages/                 # home / domain / template / tool / search / …
│   ├── toolkit.tsx            # shared tool UI primitives
│   └── ui.tsx                 # Panel, Pill, Switch, StatChip
├── config/
│   ├── networkTemplate.ts     # "myip"      — 11 network diagnostic modules
│   ├── sysMonTemplate.ts      # "sysinfo"   — 10 system metric modules
│   ├── backupTemplate.ts      # "snapkit"   — 8 backup/restore modules
│   ├── securityTemplate.ts    # "sentinel"  — 8 hardening/audit modules
│   ├── dependencies.ts        # package -> probed binary -> install hint
│   ├── themes.ts              # palettes: ANSI codes + UI tokens
│   └── index.ts               # TEMPLATE_REGISTRY (the extension point)
├── utils/
│   ├── scriptCompiler.ts      # compileBashScript(): the pure generator
│   ├── builder.ts             # frag(), colorize() (@{TOKEN} placeholders)
│   ├── highlight.ts           # tiny bash tokenizer for the preview
│   ├── simulator.ts           # representative transcript per module
│   └── fileActions.ts         # clipboard + blob download + permission steps
├── hooks/
│   └── useScriptComposer.ts   # all composer state, memoised derivation
├── state/
│   ├── composerContext.ts     # React context + useComposer()
│   ├── ComposerProvider.tsx   # provider component
│   └── index.ts               # barrel export
└── components/
    ├── TemplateSelector.tsx   # column 1 — template, name, module checklist
    ├── ControlMatrix.tsx      # column 2 — toggles, palettes, statistics
    ├── CodePreview.tsx        # column 3 — terminal sandbox + action strip
    └── MainDashboard.tsx      # three-column orchestration + theme CSS vars
```

## The compiler pipeline

`compileBashScript(template, activeModuleIds, settings, theme)` is a **pure function** —
identical inputs always produce byte-identical output, which is what makes it snapshot
testable. It emits seven sections:

| # | Section | Notes |
|---|---------|-------|
| 1 | Shebang + option headers | `set -euo pipefail` and a hardened `IFS` only when `failFastOnErrors` is on |
| 2 | Colour mapping | theme → `NC/BOLD/MUTED/OK/WARN/ERR/INFO/TITLE/VALUE`, auto-degraded when `stdout` is not a tty, declared-but-empty when colour is compiled out (so `set -u` never trips) |
| 3 | Runtime helpers + preflight | `have`, `die`, `require_root`, `require_dependency`, dependency translation tables, then the template's own `preflight()` |
| 4 | Auto-documenting help | rebuilt from the enabled modules — it can only ever document what is compiled in |
| 5 | Clipboard utility | opt-in `wl-copy → xclip → xsel → pbcopy` wrapper that never breaks a pipeline |
| 6 | Input argument evaluator | `case "$1" in` assembled from each active module's `bashCaseBlock`, plus `-h/--help`, empty input and a `*` error catch that exits `64` |
| 7 | Entrypoint | `main "$@"` — help is never gated behind a dependency check |

## Adding a domain, template or tool

The platform is registry-driven. Nothing in `components/pages` or `App.tsx` knows the
names of individual tools.

```ts
// 1. a domain             src/registry/domains.ts
{ id: 'image', name: 'Image', slug: 'image', description: '…', icon: '▩', tags: ['image'] }

// 2. a template           src/registry/templates.ts
{ id: 'image-convert', domainId: 'image', name: 'Image Conversion', slug: 'image-convert',
  description: '…', icon: '⇄', tags: ['image'] }

// 3. tool metadata        src/tools/image/image-convert/resize/metadata.ts
import type { ToolMeta } from '../../../../types/catalog';
export const metadata: ToolMeta = {
  id: 'image-resize', domainId: 'image', templateId: 'image-convert',
  name: 'Image Resizer', slug: 'resize', description: '…', icon: '⇱',
  status: 'available', tags: ['image', 'resize'],
};

// 4. the implementation   src/tools/image/image-convert/resize/ResizeTool.tsx
// 5. register it          src/tools/index.ts  →  { metadata, Component: ResizeTool }
```

That is the whole contract: metadata plus an implementation. The domain page, template
page, dynamic route, breadcrumb and global search all pick the tool up automatically.

## Adding a flag module

No component changes are required. Append to a template's `modules` array:

```ts
{
  id: 'latency',
  flag: '-L | --latency <host>',
  summary: 'Average ICMP round-trip time over 10 probes',
  requiredDependencies: ['iputils-ping'],
  details: 'Uses ping -c 10 and prints the rtt summary line.',
  bashCaseBlock: (colors) => colorize(`
  -L | --latency)
    target="\${2:-}"
    [ -n "$target" ] || die "usage: $SCRIPT_NAME --latency <host>"
    require_dependency iputils-ping
    banner "Latency :: $target"
    ping -c 10 "$target" | tail -n 2
    ;;
`, colors),
}
```

Notes:

* The returned block is a **complete** `case` fragment — pattern line through `;;` — so a
  module may own several patterns (e.g. `-x | --x | -X)`).
* `@{TOKEN}` placeholders are substituted with shell references (`@{OK}` → `${OK}`), so a
  module never knows which palette is active.
* Runtime helpers available inside a block: `banner`, `rule`, `have`, `die`,
  `require_root`, `require_dependency`, `copy_to_clipboard` (when compiled in).

## Adding a blueprint

```ts
// src/config/myTemplate.ts
export const myTemplate: ScriptTemplate = {
  id: 'my-utility',
  name: 'My Utility (myutil)',
  defaultCommandName: 'myutil',
  shortDescription: '…',
  baseSystemChecks: 'preflight() { : # any template-wide guarantees\n }',
  modules: [ /* … */ ],
};

// src/config/index.ts
export const TEMPLATE_REGISTRY: ScriptTemplate[] = [networkTemplate, sysMonTemplate, backupTemplate, securityTemplate, myTemplate];
```

`baseSystemChecks` is inserted verbatim and **must define `preflight()`**; it may declare
template-private helpers above it.

## Dependency registry

A declared dependency is a *package* (`iproute2`), but the wrapper has to probe a
*binary* (`ip`). `src/config/dependencies.ts` is that translation layer, and the compiler
emits matching `dependency_probe()` / `dependency_package()` shell tables:

```bash
dependency_probe() { case "$1" in iproute2) echo "ip" ;; dnsutils) echo "dig" ;; *) echo "$1" ;; esac; }
```

A missing package therefore produces an actionable message:

```
✖ missing dependency: dnsutils
  ↳ the dig command is not available
  ↳ sudo apt-get install -y dnsutils
```

The install hint is generated from the detected package manager (`apt-get`, `dnf`, `yum`,
`pacman`, `zypper`, `apk`, `brew`).

## Contract of the generated script

| Env var | Effect |
|---------|--------|
| `OMNISCRIPT_COMMAND_NAME` | Overrides the trigger name printed by help/errors — keeps symlinks honest |
| `VERIFY_DEPENDENCIES=0` | Skips package enforcement on minimal images and CI |
| `OMNISCRIPT_DEBUG=1` | Turns on `set -x` tracing at runtime |

Downloads are plain UTF-8 blobs, so browsers strip the executable bit. The UI prints the
permission mapping:

```bash
chmod +x myip.sh
sudo install -m 755 myip.sh /usr/local/bin/myip
myip --help
```

## Testing

`npm test` runs three layers:

1. **Compiler unit tests** — determinism, module filtering, help-menu completeness,
   dependency deduplication, palette switching, colour/trace/clipboard toggles,
   `printf` `%` escaping, command-name sanitisation.
2. **Real shell checks** — every blueprint is compiled in four configurations (all
   modules, all modules + clipboard + trace, no modules without colour, single module
   permissive) and validated with `bash -n`; the generated scripts are then executed to
   prove `--help` works without any dependency installed, that a bare invocation prints
   help, and that unknown flags exit `64`.
3. **DOM tests** — the three columns render, toggling a module rewrites the preview,
   palette presets swap both the CSS variables and the emitted ANSI codes, per-template
   selections survive template switching, and the dependency manifest tracks the
   enabled modules.
