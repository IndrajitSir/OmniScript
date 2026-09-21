import { useMemo, useState } from "react";
import { useComposer } from "../state";
import {
  commandNameFromFileName,
  copyTextToClipboard,
  downloadScriptFile,
  permissionSteps,
} from "../utils/fileActions";
import {
  countScriptLines,
  scriptByteSize,
  tokenizeBashLine,
  type BashTokenType,
} from "../utils/highlight";
import { simulateRun } from "../utils/simulator";
import { Panel, Pill } from "./ui";
import { motion } from "framer-motion";

const TOKEN_CLASSES: Record<BashTokenType, string> = {
  shebang: "text-[var(--os-muted)] italic",
  comment: "text-[var(--os-muted)] italic",
  string: "text-[var(--os-ok)]",
  variable: "text-[var(--os-accent-alt)]",
  keyword: "text-[var(--os-accent)] font-semibold",
  flag: "text-[var(--os-warn)]",
  function: "text-[var(--os-accent-alt)]",
  operator: "text-[var(--os-muted)]",
  number: "text-[var(--os-warn)]",
  plain: "text-[var(--os-text)]",
};

type Tab = "source" | "output";
type CopyState = "idle" | "copied" | "failed";

export function CodePreview() {
  const { script, fileName, settings, activeTemplate, activeModules, theme } =
    useComposer();
  const [tab, setTab] = useState<Tab>("source");
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [downloaded, setDownloaded] = useState(false);

  const lines = useMemo(() => script.replace(/\n$/, "").split("\n"), [script]);
  const tokenized = useMemo(
    () => lines.map((line) => tokenizeBashLine(line)),
    [lines],
  );
  const simulation = useMemo(
    () => simulateRun(activeTemplate, activeModules, settings, theme),
    [activeTemplate, activeModules, settings, theme],
  );

  const bytes = scriptByteSize(script);
  const steps = permissionSteps(fileName, commandNameFromFileName(fileName));

  async function handleCopy() {
    const method = await copyTextToClipboard(script);
    setCopyState(method === "unsupported" ? "failed" : "copied");
    window.setTimeout(() => setCopyState("idle"), 2200);
  }

  function handleDownload() {
    downloadScriptFile(fileName, script);
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 6000);
  }

  return (
    <Panel
      step="03"
      title="Shell Sandbox"
      subtitle="Live compiled output. Every toggle you flip on the left is reflected here."
      className="flex h-[calc(100vh-2rem)] min-h-0 flex-col"
      actions={
        <div className="flex items-center gap-1 rounded-xl border border-[var(--os-border)] bg-[var(--os-bg)]/40 p-1 shadow-sm backdrop-blur-sm">
          {(["source", "output"] as const).map((value) => {
            const isActive = tab === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                aria-pressed={isActive}
                className={`relative rounded-lg px-3 py-1.5 cursor-pointer font-sans text-xs font-medium tracking-normal transition-colors duration-200 ${
                  isActive
                    ? "text-[var(--os-accent)]"
                    : "text-[var(--os-muted)] hover:text-[var(--os-text)]"
                }`}
              >
                {/* Animated Background Pill */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 rounded-lg bg-[var(--os-accent)]/15 border border-[var(--os-accent)]/10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Text Layer (needs relative & z-10 so it sits above the animated pill) */}
                <span className="relative z-10 capitalize">
                  {value === "source" ? "Source" : "Simulated Run"}
                </span>
              </button>
            );
          })}
        </div>
      }
    >
      {/* Terminal */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[var(--os-border)] bg-[var(--os-bg)]">
        {/* Terminal chrome */}
        <div className="flex shrink-0 items-center gap-2 border-b border-[var(--os-border)] bg-[var(--os-surface-alt)]/70 px-3 py-2">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--os-err)]/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--os-warn)]/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--os-ok)]/80" />
          </span>

          <span className="ml-2 min-w-0 truncate font-mono text-[11px] text-[var(--os-muted)]">
            {fileName} — {activeTemplate.name}
          </span>

          <span className="ml-auto hidden shrink-0 gap-1.5 sm:flex">
            <Pill tone="accent">{countScriptLines(script)} lines</Pill>
            <Pill>{(bytes / 1024).toFixed(1)} kB</Pill>
            <Pill tone={settings.failFastOnErrors ? "ok" : "warn"}>
              {settings.failFastOnErrors ? "strict" : "permissive"}
            </Pill>
          </span>
        </div>

        {/* Scrollable terminal content */}
        <div className="os-scroll min-h-0 flex-1 overflow-auto p-3">
          {tab === "source" ? (
            <pre
              data-testid="os-source"
              className="m-0 font-mono text-[11.5px] leading-[1.55]"
            >
              <code>
                {tokenized.map((tokens, index) => (
                  <div key={index} className="flex whitespace-pre">
                    <span className="mr-3 inline-block w-9 shrink-0 select-none text-right tabular-nums text-[var(--os-muted)]/60">
                      {index + 1}
                    </span>

                    <span className="min-w-0 flex-1">
                      {tokens.length === 0
                        ? " "
                        : tokens.map((token, tokenIndex) => (
                            <span
                              key={tokenIndex}
                              className={TOKEN_CLASSES[token.type]}
                            >
                              {token.value}
                            </span>
                          ))}
                    </span>
                  </div>
                ))}
              </code>
            </pre>
          ) : (
            <pre className="m-0 whitespace-pre-wrap font-mono text-[11.5px] leading-[1.55]">
              <code>
                {simulation.map((line, index) => (
                  <div
                    key={index}
                    className={
                      line.kind === "command"
                        ? "mt-1 font-semibold text-[var(--os-accent)]"
                        : line.kind === "note"
                          ? "italic text-[var(--os-muted)]"
                          : "text-[var(--os-text)]"
                    }
                  >
                    {line.text.length > 0 ? line.text : " "}
                  </div>
                ))}
              </code>
            </pre>
          )}
        </div>
      </div>

      {/* Global action strip */}
      <div className="shrink-0 flex flex-wrap items-center gap-2 pt-2">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 cursor-pointer rounded-lg border border-[var(--os-border)] bg-[var(--os-surface-alt)] px-3 py-2 font-mono text-xs font-semibold text-[var(--os-text)] transition hover:border-[var(--os-accent)] hover:text-[var(--os-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--os-accent)]"
        >
          ⧉ Copy Raw Source
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-2 cursor-pointer rounded-lg border border-[var(--os-accent)] bg-[var(--os-accent)]/15 px-3 py-2 font-mono text-xs font-semibold text-[var(--os-accent)] transition hover:bg-[var(--os-accent)]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--os-accent)]"
        >
          ⭳ Download Executable (.sh)
        </button>

        {copyState !== "idle" ? (
          <Pill tone={copyState === "copied" ? "ok" : "err"}>
            {copyState === "copied"
              ? "✔ source copied to clipboard"
              : "✖ clipboard blocked by the browser"}
          </Pill>
        ) : null}

        {downloaded ? (
          <Pill tone="ok">✔ {fileName} saved — run the chmod step below</Pill>
        ) : null}
      </div>

      {/* Permission mapping */}
      <div className="shrink-0 rounded-lg border border-dashed border-[var(--os-border)] bg-[var(--os-bg)]/50 px-3 py-2.5">
        <div className="text-[10px] font-semibold tracking-wider text-[var(--os-muted)] uppercase">
          Permissions mapping — raw blob downloads always land as 0644
        </div>

        <ol className="mt-2 flex flex-col gap-1 font-mono text-[11px] text-[var(--os-text)]">
          {steps.map((step, index) => (
            <li key={step} className="flex items-start gap-2">
              <span className="text-[var(--os-accent)]">{index + 1}.</span>

              <code className="break-all text-[var(--os-accent-alt)]">
                {step}
              </code>
            </li>
          ))}
        </ol>

        <p className="mt-2 text-[11px] leading-snug text-[var(--os-muted)]">
          Browsers cannot persist the executable bit, so the file is written
          with the raw UTF-8 shell payload and a 0644 mask. `chmod +x` (or
          `install -m 755`) restores the executable bits, and the wrapper itself
          re-derives its own name from{" "}
          <code className="font-mono text-[var(--os-accent-alt)]">
            $OMNISCRIPT_COMMAND_NAME
          </code>{" "}
          so a symlink keeps the trigger name intact.
        </p>
      </div>
    </Panel>
  );
}
