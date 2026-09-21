import { dependencyInfo } from "../config/dependencies";
import { useComposer } from "../state";
import { Panel, Pill } from "./ui";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function TemplateSelector() {
  const {
    templates,
    activeTemplate,
    selectTemplate,
    settings,
    setCommandName,
    availableModules,
    enabledModuleIds,
    toggleModule,
    setAllModules,
    dependencies,
  } = useComposer();

  const enabledCount = enabledModuleIds.size;
  const commandNameTouched =
    settings.commandName !== activeTemplate.defaultCommandName;
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const containerRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (textRef.current) {
      const element = textRef.current;
      // If the scroll width is greater than physical client width, it is truncated
      setIsTruncated(element.scrollWidth > element.clientWidth);
    }
  }, [activeTemplate]);

  return (
    <Panel
      step="01"
      title="Base Architecture"
      subtitle="Pick a foundational utility layout, rename the executable, then toggle the sub-commands you want compiled in."
    >
      {/* Template picker */}
      <label
        className="block gap-1.5 rounded-lg border border-[var(--os-border)] bg-[var(--os-bg)]/40 p-2" /*focus-within:border-[var(--os-accent)] focus-within:ring-2 focus-within:ring-[var(--os-accent)]/25"*/
      >
        <span className="mb-1.5 block text-[11px] font-semibold tracking-wider text-[var(--os-muted)] uppercase">
          Utility template
        </span>
        <div ref={containerRef} className="relative w-full max-w-xs">
          {/* Selector Trigger Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            onMouseEnter={() => isTruncated && setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            className="flex w-full min-w-0 cursor-pointer items-center justify-between rounded-xl border border-[var(--os-border)] bg-[var(--os-bg)] px-3.5 py-2.5 text-sm text-[var(--os-text)] transition-all outline-none hover:bg-[var(--os-muted)]/5 focus:border-[var(--os-accent)] focus:ring-2 focus:ring-[var(--os-accent)]/20 shadow-xs"
          >
            <span className="flex min-w-0 flex-1 items-center gap-2 pr-2">
              {activeTemplate.icon && (
                <span className="text-base leading-none select-none shrink-0">
                  {activeTemplate.icon}
                </span>
              )}
              <span
                ref={textRef}
                className="truncate font-medium text-left flex-1"
              >
                {activeTemplate.name}
              </span>
            </span>

            {/* Chevron Arrow Icon */}
            <motion.svg
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="h-4 w-4 shrink-0 text-[var(--os-muted)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </motion.svg>
          </button>

          {/* Floating Action Tooltip */}
          <AnimatePresence>
            {showTooltip && !isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
                className="absolute bottom-full left-0 z-50 mb-2 w-max max-w-xs rounded-lg border border-[var(--os-border)] bg-[var(--os-surface)] px-2.5 py-1.5 text-xs text-[var(--os-text)] shadow-md pointer-events-none"
              >
                {activeTemplate.name}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dropdown Flyout Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.ul
                role="listbox"
                initial={{ opacity: 0, y: -4, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.99 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
                className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-[var(--os-border)] bg-[var(--os-surface)] p-1 shadow-lg backdrop-blur-md outline-none"
              >
                {templates.map((template) => {
                  const isSelected = template.id === activeTemplate.id;
                  return (
                    <li
                      key={template.id}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        selectTemplate(template.id);
                        setIsOpen(false);
                        setShowTooltip(false);
                      }}
                      className={`relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isSelected
                          ? "bg-[var(--os-accent)]/15 text-[var(--os-accent)] font-medium"
                          : "text-[var(--os-text)] hover:bg-[var(--os-muted)]/10"
                      }`}
                    >
                      {template.icon && (
                        <span className="text-base leading-none shrink-0">
                          {template.icon}
                        </span>
                      )}
                      <span className="flex-1 truncate text-left">
                        {template.name}
                      </span>

                      {isSelected && (
                        <svg
                          className="h-4 w-4 shrink-0 text-[var(--os-accent)]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
        <p className="mt-2 text-xs cursor-pointer leading-relaxed text-[var(--os-muted)]">
          {activeTemplate.shortDescription}
        </p>
      </label>

      {/* Command name */}
      <label className="block gap-1.5 rounded-lg border border-[var(--os-border)] bg-[var(--os-bg)]/40 p-2">
        <span className="mb-1.5 flex items-center justify-between text-[11px] font-semibold tracking-wider text-[var(--os-muted)] uppercase">
          Executable trigger name
          {commandNameTouched ? (
            <button
              type="button"
              onClick={() => setCommandName("")}
              className="font-mono text-[10px] tracking-normal text-[var(--os-accent)] normal-case hover:underline"
            >
              reset to {activeTemplate.defaultCommandName}
            </button>
          ) : null}
        </span>
        <div className="flex items-center gap-2 rounded-lg border border-[var(--os-border)] bg-[var(--os-bg)] px-3 focus-within:border-[var(--os-accent)] focus-within:ring-2 focus-within:ring-[var(--os-accent)]/25">
          <span className="font-mono text-xs text-[var(--os-muted)]">$</span>
          <input
            value={settings.commandName}
            spellCheck={false}
            onChange={(event) => setCommandName(event.target.value)}
            placeholder={activeTemplate.defaultCommandName}
            className="w-full bg-transparent py-2.5 font-mono text-sm text-[var(--os-text)] outline-none placeholder:text-[var(--os-muted)]"
          />
        </div>
        <p className="mt-1.5 text-[11px] text-[var(--os-muted)]">
          Sanitised to{" "}
          <code className="font-mono text-[var(--os-accent-alt)]">
            [A-Za-z0-9._-]
          </code>{" "}
          at compile time.
        </p>
      </label>

      {/* Module checklist */}
      <div className="flex min-h-0 flex-1 flex-col gap-1.5 rounded-lg border border-[var(--os-border)] bg-[var(--os-bg)]/40 p-2">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-[var(--os-muted)] uppercase">
            Modules ({enabledCount}/{availableModules.length})
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setAllModules(true)}
              className="rounded-md border cursor-pointer border-[var(--os-border)] px-2 py-0.5 font-mono text-[10px] text-[var(--os-muted)] transition hover:border-[var(--os-accent)] hover:text-[var(--os-accent)]"
            >
              all
            </button>
            <button
              type="button"
              onClick={() => setAllModules(false)}
              className="rounded-md border cursor-pointer border-[var(--os-border)] px-2 py-0.5 font-mono text-[10px] text-[var(--os-muted)] transition hover:border-[var(--os-err)] hover:text-[var(--os-err)]"
            >
              none
            </button>
          </div>
        </div>

        <ul className="os-scroll -mr-1 flex max-h-[24.6rem] min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1 gap-1.5 rounded-lg border border-[var(--os-border)] bg-[var(--os-bg)]/40 p-2">
          {availableModules.map((module) => {
            const enabled = enabledModuleIds.has(module.id);
            return (
              <li key={module.id}>
                <label
                  title={module.details ?? module.summary}
                  className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-2.5 py-2 transition ${
                    enabled
                      ? "border-[var(--os-accent)]/50 bg-[var(--os-accent)]/10"
                      : "border-[var(--os-border)] bg-[var(--os-bg)]/40 hover:border-[var(--os-muted)]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => toggleModule(module.id)}
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-pointer accent-[var(--os-accent)]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <code
                        className={`font-mono text-[11px] font-semibold ${
                          enabled
                            ? "text-[var(--os-accent)]"
                            : "text-[var(--os-muted)]"
                        }`}
                      >
                        {module.flag}
                      </code>
                      {module.requiresRoot ? (
                        <Pill tone="err" title="Requires root elevation">
                          root
                        </Pill>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-[var(--os-muted)]">
                      {module.summary}
                    </span>
                    {module.requiredDependencies.length > 0 ? (
                      <span className="mt-1 flex flex-wrap gap-1">
                        {module.requiredDependencies.map((dep) => (
                          <Pill
                            key={dep}
                            title={`Runtime dependency: ${dep}\nprobe: command -v ${dependencyInfo(dep).probe}\ninstall hint: ${dependencyInfo(dep).package}`}
                          >
                            ⚙ {dep}
                          </Pill>
                        ))}
                      </span>
                    ) : (
                      <span className="mt-1 flex flex-wrap gap-1">
                        <Pill tone="ok" title="No external package required">
                          pure shell
                        </Pill>
                      </span>
                    )}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-lg border border-[var(--os-border)] bg-[var(--os-bg)]/50 px-3 py-2">
        <div className="text-[10px] font-semibold tracking-wider text-[var(--os-muted)] uppercase">
          Dependency manifest
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {dependencies.length === 0 ? (
            <Pill tone="ok">none — pure shell</Pill>
          ) : (
            dependencies.map((dep) => {
              const info = dependencyInfo(dep);
              return (
                <Pill
                  key={dep}
                  tone="accent"
                  title={`${info.note}\npreflight probes: command -v ${info.probe}\ninstall hint targets: ${info.package}`}
                >
                  {dep}
                </Pill>
              );
            })
          )}
        </div>
      </div>
    </Panel>
  );
}
