/**
 * OmniScript — core type architecture.
 *
 * Everything in the composer is registry-driven: adding a new utility or flag
 * means dropping a new `FlagModule` into a `ScriptTemplate` and (optionally)
 * registering the template in `src/config/index.ts`. No component changes.
 */

/** Canonical semantic color tokens emitted into every generated script. */
export const COLOR_TOKENS = [
  'NC',
  'BOLD',
  'MUTED',
  'OK',
  'WARN',
  'ERR',
  'INFO',
  'TITLE',
  'VALUE',
] as const;

export type ColorToken = (typeof COLOR_TOKENS)[number];

/**
 * What a `bashCaseBlock` receives as `colors`.
 *
 * Values are *shell variable references* (e.g. `"${OK}"`) rather than raw
 * escape codes, so a module never needs to know which theme is active — the
 * compiler emits the real ANSI declarations from the theme palette.
 *
 * The index signature keeps this assignable to the documented
 * `Record<string, string>` contract, while the `Record<ColorToken, string>`
 * intersection gives authors autocomplete and typo protection.
 */
export type ColorRefs = { [token: string]: string } & Record<ColorToken, string>;

/**
 * A single toggleable sub-command of a base utility architecture.
 */
export interface FlagModule {
  /** Unique identifier, e.g. `"public-ip"`. */
  id: string;
  /**
   * Case pattern as written by the user, e.g. `"-a | --active"`.
   * Also used to build the auto-generated help menu.
   */
  flag: string;
  /** One-line description for the help menu. */
  summary: string;
  /** Binaries/packages that must exist at runtime, e.g. `["iproute2", "curl"]`. */
  requiredDependencies: string[];
  /** Longer explanation rendered in the UI tooltip / dependency hint. */
  details?: string;
  /** Whether the module requires elevated privileges at runtime. */
  requiresRoot?: boolean;
  /**
   * Returns the complete `case` fragment for this module, including the
   * pattern line and the terminating `;;`.
   *
   * Runtime helpers available inside a block: `banner`, `have`,
   * `require_dependency`, `require_root`, `die`, `copy_to_clipboard`
   * (when the clipboard utility is enabled).
   */
  bashCaseBlock: (colors: ColorRefs) => string;
}

/**
 * A foundational "Base Linux Utility Architecture".
 */
export interface ScriptTemplate {
  /** Unique identifier, e.g. `"network-diagnostics"`. */
  id: string;
  /** Human readable title, e.g. `"Network Diagnostics Tool (myip)"`. */
  name: string;
  /** Default executable trigger name, e.g. `"myip"`. */
  defaultCommandName: string;
  /** One-line pitch shown in the selector. */
  shortDescription: string;
  /** Accent glyph used in the UI. */
  icon?: string;
  /**
   * Raw bash inserted verbatim into the generated script. It must define a
   * `preflight()` function (invoked by the entrypoint before dispatch) and may
   * also declare template-private helpers above it.
   */
  baseSystemChecks: string;
  /** Every sub-command this architecture offers. */
  modules: FlagModule[];
}

/** Build-time options that shape the emitted wrapper. */
export interface ScriptSettings {
  /** Base executable trigger name. */
  commandName: string;
  /** Emit ANSI color declarations derived from the active theme. */
  includeColor: boolean;
  /** Emit `set -euo pipefail` + strict IFS. */
  failFastOnErrors: boolean;
  /** Emit the universal cross-platform clipboard helper. */
  includeClipboard: boolean;
  /** Enforce `requiredDependencies` at runtime before dispatch. */
  verifyDependencies: boolean;
  /** Emit `set -x` for shell debugging. */
  includeTrace: boolean;
}

/** Supported terminal + UI palettes. */
export type ThemeId = 'dracula' | 'nord' | 'monokai' | 'cyberpunk';

/** A palette drives both the generated ANSI variables and the app chrome. */
export interface TerminalTheme {
  id: ThemeId;
  label: string;
  /** Short description of the mood of the palette. */
  blurb: string;
  /** CSS custom properties applied to the app shell. */
  ui: {
    bg: string;
    surface: string;
    surfaceAlt: string;
    border: string;
    text: string;
    muted: string;
    accent: string;
    accentAlt: string;
    ok: string;
    warn: string;
    err: string;
    glow: string;
  };
  /** Semantic token -> ANSI escape sequence used in generated bash. */
  ansi: Record<ColorToken, string>;
}
