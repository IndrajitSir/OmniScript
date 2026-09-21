import { dependencyInfo } from '../config/dependencies';
import { useComposer } from '../state';
import { Panel, Pill } from './ui';

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
  const commandNameTouched = settings.commandName !== activeTemplate.defaultCommandName;

  return (
    <Panel
      step="01"
      title="Base Architecture"
      subtitle="Pick a foundational utility layout, rename the executable, then toggle the sub-commands you want compiled in."
    >
      {/* Template picker */}
      <label className="block">
        <span className="mb-1.5 block text-[11px] font-semibold tracking-wider text-[var(--os-muted)] uppercase">
          Utility template
        </span>
        <div className="relative">
          <select
            value={activeTemplate.id}
            onChange={(event) => selectTemplate(event.target.value)}
            className="w-full appearance-none rounded-lg border border-[var(--os-border)] bg-[var(--os-bg)] px-3 py-2.5 pr-9 text-sm text-[var(--os-text)] transition outline-none focus:border-[var(--os-accent)] focus:ring-2 focus:ring-[var(--os-accent)]/25"
          >
            {templates.map((template) => (
              <option key={template.id} value={template.id} className="bg-[var(--os-surface)]">
                {template.icon ? `${template.icon}  ` : ''}
                {template.name}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-[var(--os-muted)]">
            ▾
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[var(--os-muted)]">
          {activeTemplate.shortDescription}
        </p>
      </label>

      {/* Command name */}
      <label className="block">
        <span className="mb-1.5 flex items-center justify-between text-[11px] font-semibold tracking-wider text-[var(--os-muted)] uppercase">
          Executable trigger name
          {commandNameTouched ? (
            <button
              type="button"
              onClick={() => setCommandName('')}
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
          Sanitised to <code className="font-mono text-[var(--os-accent-alt)]">[A-Za-z0-9._-]</code> at compile time.
        </p>
      </label>

      {/* Module checklist */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-[var(--os-muted)] uppercase">
            Modules ({enabledCount}/{availableModules.length})
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setAllModules(true)}
              className="rounded-md border border-[var(--os-border)] px-2 py-0.5 font-mono text-[10px] text-[var(--os-muted)] transition hover:border-[var(--os-accent)] hover:text-[var(--os-accent)]"
            >
              all
            </button>
            <button
              type="button"
              onClick={() => setAllModules(false)}
              className="rounded-md border border-[var(--os-border)] px-2 py-0.5 font-mono text-[10px] text-[var(--os-muted)] transition hover:border-[var(--os-err)] hover:text-[var(--os-err)]"
            >
              none
            </button>
          </div>
        </div>

        <ul className="os-scroll -mr-1 flex max-h-[22rem] min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1">
          {availableModules.map((module) => {
            const enabled = enabledModuleIds.has(module.id);
            return (
              <li key={module.id}>
                <label
                  title={module.details ?? module.summary}
                  className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-2.5 py-2 transition ${
                    enabled
                      ? 'border-[var(--os-accent)]/50 bg-[var(--os-accent)]/10'
                      : 'border-[var(--os-border)] bg-[var(--os-bg)]/40 hover:border-[var(--os-muted)]'
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
                          enabled ? 'text-[var(--os-accent)]' : 'text-[var(--os-muted)]'
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
