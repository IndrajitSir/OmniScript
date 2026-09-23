import { useComposer } from "../state";
// import type { ThemeId } from "../types/script";
import { Panel, StatChip, Switch } from "./ui";

const OPTION_LABELS: Array<{
  key:
    | "includeColor"
    | "failFastOnErrors"
    | "verifyDependencies"
    | "includeClipboard"
    | "includeTrace";
  label: string;
  hint: string;
}> = [
  {
    key: "includeColor",
    label: "ANSI color mapping",
    hint: "Emit theme-derived color variables; degrade to plain text when stdout is not a tty.",
  },
  {
    key: "failFastOnErrors",
    label: "strict error handling",
    hint: "Prefix the wrapper with set -euo pipefail and a hardened IFS.",
  },
  {
    key: "verifyDependencies",
    label: "dependency preflight",
    hint: "Check every required package up front and print a distro-appropriate install hint.",
  },
  {
    key: "includeClipboard",
    label: "clipboard utility block",
    hint: "Compile the universal wl-copy → xclip → xsel → pbcopy helper into the script.",
  },
  {
    key: "includeTrace",
    label: "debug tracing",
    hint: "Add set -x so every executed command is echoed while you debug.",
  },
];

export function ControlMatrix() {
  const {
    settings,
    updateOptions,
    // themes,
    theme,
    // setTheme,
    resetAll,
    activeModules,
    dependencies,
    script,
  } = useComposer();

  return (
    <Panel
      step="02"
      title="Control Matrix"
      subtitle="Compile-time switches. Each toggle rewrites the emitted wrapper instantly."
      actions={
        <button
          type="button"
          onClick={resetAll}
          className="rounded-md border border-[var(--os-border)] px-2 py-1 cursor-pointer font-mono text-[10px] text-[var(--os-muted)] transition hover:border-[var(--os-err)] hover:text-[var(--os-err)]"
        >
          reset all
        </button>
      }
    >
      <div className="-mx-2 flex flex-col cursor-pointer *:cursor-pointer gap-1.5 rounded-lg border border-[var(--os-border)] bg-[var(--os-bg)]/40 p-2">
        {OPTION_LABELS.map((option) => (
          <Switch
            key={option.key}
            label={option.label}
            hint={option.hint}
            checked={settings[option.key]}
            onChange={(next) => updateOptions({ [option.key]: next })}
          />
        ))}
      </div>

      {/* <div className="-mx-2 gap-1.5 rounded-lg border border-[var(--os-border)] bg-[var(--os-bg)]/40 p-2">
        <span className="mb-1 block text-[11px] font-semibold tracking-wider text-[var(--os-muted)] uppercase">
          Palette preset
        </span>
        <div className="grid grid-cols-2 cursor-pointer *:cursor-pointer gap-1.5 rounded-lg border border-[var(--os-border)] bg-[var(--os-bg)]/40 p-2">
          {themes.map((preset) => {
            const active = preset.id === theme.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setTheme(preset.id as ThemeId)}
                aria-pressed={active}
                className={`rounded-lg border px-2.5 py-2 text-left transition ${
                  active
                    ? "border-[var(--os-accent)] bg-[var(--os-accent)]/10"
                    : "border-[var(--os-border)] bg-[var(--os-bg)]/40 hover:border-[var(--os-muted)]"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className="h-3.5 w-3.5 rounded-full border"
                    style={{
                      backgroundColor: preset.ui.accent,
                      borderColor: preset.ui.accentAlt,
                    }}
                  />
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{ backgroundColor: preset.ui.accentAlt }}
                  />
                  <span className="ml-auto font-mono text-[10px] text-[var(--os-muted)]">
                    {preset.ui.bg}
                  </span>
                </span>
                <span className="mt-1.5 block text-xs font-semibold text-[var(--os-text)]">
                  {preset.label}
                </span>
              </button>
            );
          })}
          <p className="mt-1 text-[11px] leading-snug text-[var(--os-muted)] truncate w-max">
            {theme.blurb}
          </p>
        </div>
      </div> */}

      <div className="-mx-2 grid grid-cols-1 gap-1.5 rounded-lg border border-[var(--os-border)] bg-[var(--os-bg)]/40 p-2">
        <StatChip label="Modules compiled" value={`${activeModules.length}`} />
        <StatChip label="Packages verified" value={`${dependencies.length}`} />
        {/* <StatChip label="Palette id" value={theme.id} /> */}
        <StatChip
          label="Output bytes"
          value={new TextEncoder().encode(script).length.toLocaleString()}
        />
      </div>

      <p className="-mx-2 mt-1 rounded-lg border border-dashed border-[var(--os-border)] px-3 py-2 text-[11px] leading-snug text-[var(--os-muted)]">
        The palette rewrites both the{" "}
        <code className="font-mono text-[var(--os-accent-alt)]">
          $'\033[..m'
        </code>{" "}
        declarations inside the script and the CSS tokens of this interface.
      </p>
    </Panel>
  );
}
